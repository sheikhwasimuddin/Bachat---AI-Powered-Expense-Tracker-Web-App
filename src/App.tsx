import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBento } from './components/HeroBento';
import { AiQuickAdd } from './components/AiQuickAdd';
import { AiInsightsPanel } from './components/AiInsightsPanel';
import { SpendingCharts } from './components/SpendingCharts';
import { ExpenseList } from './components/ExpenseList';
import { ExpenseModal } from './components/ExpenseModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { SupabaseModal } from './components/SupabaseModal';
import { DataService, supabase, isSupabaseConfigured } from './lib/supabase';
import { CURRENCIES } from './data/defaultData';
import { Expense, Category, Budget, AiInsightResponse } from './types';
import { Loader2 } from 'lucide-react';
import { AuthPage } from './components/AuthPage';
import { HomePage } from './components/HomePage';
import { buildApiUrl } from './lib/api';

export default function App() {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [authStep, setAuthStep] = useState<'home' | 'auth'>('home');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('ai_expense_tracker_theme_v1');
    if (saved !== null) return saved === 'dark';
    return false;
  });

  // Apply dark mode class to html element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';
    localStorage.setItem('ai_expense_tracker_theme_v1', isDark ? 'dark' : 'light');
  }, [isDark]);

  const handleLogin = ({ email, password }: { email: string; password: string }) => {
    if (!email || !password) {
      return { ok: false, message: 'Please enter both email and password.' };
    }

    const stored = localStorage.getItem('aura_auth_users_v1');
    const users = stored ? JSON.parse(stored) : [];
    const match = users.find((u: any) => u.email === email && u.password === password);

    if (!match) {
      return { ok: false, message: 'No account matches those details.' };
    }

    setUser({ id: match.id, email: match.email, user_metadata: { name: match.name } });
    setIsLoggedIn(true);
    loadInitialData();
    return { ok: true };
  };

  const handleSignup = ({ name, email, password }: { name: string; email: string; password: string }) => {
    if (!name || !email || !password) {
      return { ok: false, message: 'Please fill in all fields.' };
    }

    const stored = localStorage.getItem('aura_auth_users_v1');
    const users = stored ? JSON.parse(stored) : [];
    const exists = users.some((u: any) => u.email === email);

    if (exists) {
      return { ok: false, message: 'An account with this email already exists.' };
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      password,
    };

    localStorage.setItem('aura_auth_users_v1', JSON.stringify([...users, newUser]));
    setUser({ id: newUser.id, email: newUser.email, user_metadata: { name: newUser.name } });
    setIsLoggedIn(true);
    loadInitialData();
    return { ok: true };
  };

  // Core Data States
  const [user, setUser] = useState<any>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [currency, setCurrency] = useState<string>('USD');
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // AI Insights State
  const [insights, setInsights] = useState<AiInsightResponse | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Current currency symbol
  const currencySymbol = useMemo(() => {
    return CURRENCIES.find(c => c.code === currency)?.symbol || '$';
  }, [currency]);

  // Load initial user, categories, expenses, and budgets
  const loadInitialData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const currentUser = await DataService.getCurrentUser();
      setUser(currentUser);

      const [loadedCats, loadedExps, loadedBudgets] = await Promise.all([
        DataService.getCategories(currentUser?.id),
        DataService.getExpenses(currentUser?.id),
        DataService.getBudgets(currentUser?.id),
      ]);

      setCategories(loadedCats);
      setExpenses(loadedExps);
      setBudgets(loadedBudgets);
    } catch (err) {
      console.error('Error loading initial data:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    localStorage.removeItem('ai_expense_tracker_guest_user_v1');
    localStorage.removeItem('aura_auth_session_v1');
    loadInitialData();

    // Listen to Supabase auth state change if enabled
    if (isSupabaseConfigured && supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user);
        }
      });
      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, [loadInitialData]);

  // Filtered Expenses by selected month
  const monthlyExpenses = useMemo(() => {
    if (currentMonth === 'all') return expenses;
    return expenses.filter(e => e.date.startsWith(currentMonth));
  }, [expenses, currentMonth]);

  // Generate / Fetch AI Insights from Gemini 3.7 Flash
  const fetchAiInsights = useCallback(async (customExpenses?: Expense[]) => {
    const targetExpenses = customExpenses || monthlyExpenses;
    if (targetExpenses.length === 0) {
      setInsights({
        summary: 'No expenses recorded for this time range yet. Add a few expenses to generate AI analysis.',
        topSpendingTakeaway: 'Start by tracking your daily expenses using the AI Quick-Add input.',
        budgetWarnings: [],
        savingOpportunities: ['Log recurring subscriptions to analyze budget utilization.'],
        projectedMonthlySpend: 0,
        healthScore: 100,
        keyRecommendations: ['Set category budgets to maintain financial discipline.']
      });
      return;
    }

    setIsLoadingInsights(true);
    try {
      const response = await fetch(buildApiUrl('/api/gemini/insights'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expenses: targetExpenses,
          budgets,
          categories,
          currencySymbol,
        }),
      });

      if (response.ok) {
        const data: AiInsightResponse = await response.json();
        setInsights(data);
      }
    } catch (err) {
      console.error('Failed to fetch AI insights:', err);
    } finally {
      setIsLoadingInsights(false);
    }
  }, [monthlyExpenses, budgets, categories, currencySymbol]);

  // Trigger AI insights on month change or after initial data load
  useEffect(() => {
    if (!isLoadingData && expenses.length > 0) {
      fetchAiInsights();
    }
  }, [currentMonth, isLoadingData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handlers for Expense CRUD
  const handleSaveExpense = async (data: { id?: string; amount: number; category_id: string; date: string; note: string }) => {
    if (data.id) {
      // Edit
      const updated = await DataService.updateExpense(data.id, data, user?.id);
      setExpenses(prev => prev.map(e => e.id === data.id ? updated : e));
    } else {
      // Create
      const created = await DataService.addExpense({
        category_id: data.category_id,
        amount: data.amount,
        date: data.date,
        note: data.note,
      }, user?.id);
      const newExpensesList = [created, ...expenses];
      setExpenses(newExpensesList);
      fetchAiInsights(newExpensesList.filter(e => currentMonth === 'all' || e.date.startsWith(currentMonth)));
    }
  };

  const handleDeleteExpense = async (id: string) => {
    await DataService.deleteExpense(id, user?.id);
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    fetchAiInsights(updated.filter(e => currentMonth === 'all' || e.date.startsWith(currentMonth)));
  };

  const handleOpenAddExpense = () => {
    setExpenseToEdit(null);
    setIsExpenseModalOpen(true);
  };

  const handleOpenEditExpense = (expense: Expense) => {
    setExpenseToEdit(expense);
    setIsExpenseModalOpen(true);
  };

  // Handlers for Category & Budget
  const handleSaveCategory = async (categoryData: Omit<Category, 'id'> & { id?: string }) => {
    const saved = await DataService.saveCategory(categoryData, user?.id);
    setCategories(prev => {
      const idx = prev.findIndex(c => c.id === saved.id);
      if (idx >= 0) {
        return prev.map((c, i) => i === idx ? saved : c);
      }
      return [...prev, saved];
    });
  };

  const handleSetBudget = async (categoryId: string, monthlyLimit: number, thresholdPercentage: number) => {
    const saved = await DataService.setBudget(categoryId, monthlyLimit, thresholdPercentage, user?.id);
    setBudgets(prev => {
      const idx = prev.findIndex(b => b.category_id === categoryId);
      if (idx >= 0) {
        return prev.map((b, i) => i === idx ? saved : b);
      }
      return [...prev, saved];
    });
  };

  const handleSignOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setIsLoggedIn(false);
    setAuthStep('home');
    setUser(null);
    setExpenses([]);
    setBudgets([]);
    setInsights(null);
  };

  if (!isLoggedIn) {
    if (authStep === 'home') {
      return (
        <HomePage
          onGetStarted={() => {
            setAuthMode('signup');
            setAuthStep('auth');
          }}
          onLogin={() => {
            setAuthMode('login');
            setAuthStep('auth');
          }}
        />
      );
    }

    return (
      <AuthPage
        mode={authMode}
        onModeChange={setAuthMode}
        onLogin={handleLogin}
        onSignup={handleSignup}
        onBackToHome={() => setAuthStep('home')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#191715] text-[#2D2D2A] dark:text-[#F3EFEA] transition-colors duration-200 flex flex-col font-sans antialiased selection:bg-[#7A8471] selection:text-white">
      
      {/* Top Navigation Bar */}
      <Navbar
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        currency={currency}
        onCurrencyChange={setCurrency}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onOpenAddExpense={handleOpenAddExpense}
          onOpenCategoryManager={() => setIsCategoryModalOpen(true)}
        user={user}
        onSignOut={handleSignOut}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {isLoadingData ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-[#8A8A82]">
            <Loader2 className="w-8 h-8 animate-spin text-[#7A8471]" />
            <p className="text-sm font-medium">Loading your financial dashboard...</p>
          </div>
        ) : (
          <>
            {/* 1. Hero Bento Metrics */}
            <HeroBento
              expenses={monthlyExpenses}
              budgets={budgets}
              categories={categories}
              currencySymbol={currencySymbol}
              currentMonth={currentMonth}
              aiHealthScore={insights?.healthScore}
            />

            {/* 2. AI Quick-Add Natural Language Expense Input */}
            <AiQuickAdd
              categories={categories}
              currencySymbol={currencySymbol}
              onSaveExpense={async (exp) => {
                await handleSaveExpense(exp);
              }}
            />

            {/* 3. Gemini AI Spending Insights & Financial Advisor */}
            <AiInsightsPanel
              insights={insights}
              isLoading={isLoadingInsights}
              onRefreshInsights={() => fetchAiInsights()}
              expenses={monthlyExpenses}
              budgets={budgets}
              categories={categories}
              currencySymbol={currencySymbol}
            />

            {/* 4. Spending Charts & Category Budget Progress */}
            <SpendingCharts
              expenses={monthlyExpenses}
              categories={categories}
              budgets={budgets}
              currencySymbol={currencySymbol}
            />

            {/* 5. Transactions Table & Advanced Filters */}
            <ExpenseList
              expenses={monthlyExpenses}
              categories={categories}
              currencySymbol={currencySymbol}
              onEditExpense={handleOpenEditExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#E5E0D8] dark:border-[#38332F] py-6 mt-12 bg-white/40 dark:bg-[#23211F]/40 backdrop-blur-xs text-xs text-[#8A8A82] dark:text-[#9E9E96]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif-natural font-bold text-[#2D2D2A] dark:text-[#F3EFEA]">SpendWise AI</span>
            <span>• Natural Tones Financial Ledger</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="hover:text-[#7A8471] dark:hover:text-[#A4B399] transition"
            >
              Supabase SQL & Schema
            </button>
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="hover:text-[#7A8471] dark:hover:text-[#A4B399] transition"
            >
              Budget Allocation
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSave={handleSaveExpense}
        expenseToEdit={expenseToEdit}
        categories={categories}
        currencySymbol={currencySymbol}
      />

      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        budgets={budgets}
        currencySymbol={currencySymbol}
        onSaveCategory={handleSaveCategory}
        onSetBudget={handleSetBudget}
      />

      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        user={user}
        onAuthSuccess={(u) => {
          setUser(u);
          loadInitialData();
        }}
      />

    </div>
  );
}
