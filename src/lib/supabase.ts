import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { Category, Expense, Budget } from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_EXPENSES, DEFAULT_BUDGETS } from '../data/defaultData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 20
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// Local storage storage keys
const STORAGE_KEYS = {
  EXPENSES: 'ai_expense_tracker_expenses_v1',
  CATEGORIES: 'ai_expense_tracker_categories_v1',
  BUDGETS: 'ai_expense_tracker_budgets_v1',
  GUEST_USER: 'ai_expense_tracker_guest_user_v1',
  CURRENCY: 'ai_expense_tracker_currency_v1',
  THEME: 'ai_expense_tracker_theme_v1',
};

// Database Service Layer abstraction that transparently switches between Supabase and LocalStorage
export class DataService {
  // Get current user
  static async getCurrentUser(): Promise<User | { id: string; email: string; user_metadata: { name: string } } | null> {
    if (isSupabaseConfigured && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
    // Guest user from local storage
    const stored = localStorage.getItem(STORAGE_KEYS.GUEST_USER);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        // ignore
      }
    }
    return {
      id: 'guest-user-123',
      email: 'demo@expensetracker.ai',
      user_metadata: { name: 'Demo Explorer' }
    };
  }

  // Set guest user profile
  static setGuestUser(name: string, email: string) {
    const user = {
      id: 'guest-user-123',
      email: email || 'demo@expensetracker.ai',
      user_metadata: { name: name || 'Demo Explorer' }
    };
    localStorage.setItem(STORAGE_KEYS.GUEST_USER, JSON.stringify(user));
    return user;
  }

  // CATEGORIES
  static async getCategories(userId?: string): Promise<Category[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });
      if (!error && data && data.length > 0) {
        return data as Category[];
      }
    }

    // Local storage fallback
    const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        // ignore
      }
    }

    // Default initialization
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
  }

  static async saveCategory(category: Omit<Category, 'id'> & { id?: string }, userId?: string): Promise<Category> {
    const newCategory: Category = {
      id: category.id || `cat-${Date.now()}`,
      user_id: userId || null,
      name: category.name,
      icon: category.icon,
      color: category.color,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      if (category.id && !category.id.startsWith('cat-')) {
        const { data, error } = await supabase
          .from('categories')
          .update({ name: category.name, icon: category.icon, color: category.color })
          .eq('id', category.id)
          .select()
          .single();
        if (!error && data) return data as Category;
      } else {
        const { data, error } = await supabase
          .from('categories')
          .insert([{ name: category.name, icon: category.icon, color: category.color, user_id: userId }])
          .select()
          .single();
        if (!error && data) return data as Category;
      }
    }

    // Local storage fallback
    const categories = await this.getCategories(userId);
    const existingIndex = categories.findIndex(c => c.id === category.id);
    let updated: Category[];
    if (existingIndex >= 0) {
      updated = categories.map((c, i) => i === existingIndex ? { ...c, ...newCategory } : c);
    } else {
      updated = [...categories, newCategory];
    }
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
    return newCategory;
  }

  // EXPENSES
  static async getExpenses(userId?: string): Promise<Expense[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          id,
          user_id,
          category_id,
          amount,
          note,
          date,
          created_at,
          category:categories(id, name, icon, color)
        `)
        .order('date', { ascending: false });
      
      if (!error && data) {
        return data.map((d: any) => ({
          ...d,
          amount: Number(d.amount),
          category: Array.isArray(d.category) ? d.category[0] : d.category
        }));
      }
    }

    // Local storage fallback
    const stored = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        // ignore
      }
    }

    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(DEFAULT_EXPENSES));
    return DEFAULT_EXPENSES;
  }

  static async addExpense(expense: Omit<Expense, 'id' | 'created_at'>, userId?: string): Promise<Expense> {
    const newExpense: Expense = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      user_id: userId || null,
      category_id: expense.category_id,
      amount: Number(expense.amount),
      note: expense.note || '',
      date: expense.date,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('expenses')
        .insert([{
          user_id: userId,
          category_id: expense.category_id,
          amount: Number(expense.amount),
          note: expense.note,
          date: expense.date
        }])
        .select(`
          id,
          user_id,
          category_id,
          amount,
          note,
          date,
          created_at,
          category:categories(id, name, icon, color)
        `)
        .single();
      
      if (!error && data) {
        return {
          ...data,
          amount: Number(data.amount),
          category: Array.isArray(data.category) ? data.category[0] : data.category
        };
      }
    }

    // Local fallback
    const expenses = await this.getExpenses(userId);
    const updated = [newExpense, ...expenses];
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated));
    return newExpense;
  }

  static async updateExpense(id: string, expense: Partial<Expense>, userId?: string): Promise<Expense> {
    if (isSupabaseConfigured && supabase && !id.startsWith('exp-')) {
      const { data, error } = await supabase
        .from('expenses')
        .update({
          category_id: expense.category_id,
          amount: expense.amount !== undefined ? Number(expense.amount) : undefined,
          note: expense.note,
          date: expense.date
        })
        .eq('id', id)
        .select(`
          id,
          user_id,
          category_id,
          amount,
          note,
          date,
          created_at,
          category:categories(id, name, icon, color)
        `)
        .single();
      
      if (!error && data) {
        return {
          ...data,
          amount: Number(data.amount),
          category: Array.isArray(data.category) ? data.category[0] : data.category
        };
      }
    }

    const expenses = await this.getExpenses(userId);
    let updatedItem: Expense | null = null;
    const updated = expenses.map(e => {
      if (e.id === id) {
        updatedItem = { ...e, ...expense, amount: expense.amount !== undefined ? Number(expense.amount) : e.amount };
        return updatedItem;
      }
      return e;
    });
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated));
    return updatedItem || { id, ...expense } as Expense;
  }

  static async deleteExpense(id: string, userId?: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase && !id.startsWith('exp-')) {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      if (!error) return true;
    }

    const expenses = await this.getExpenses(userId);
    const updated = expenses.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated));
    return true;
  }

  // BUDGETS
  static async getBudgets(userId?: string): Promise<Budget[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('budgets')
        .select('*');
      if (!error && data && data.length > 0) {
        return data.map((b: any) => ({ ...b, monthly_limit: Number(b.monthly_limit) }));
      }
    }

    const stored = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        // ignore
      }
    }

    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(DEFAULT_BUDGETS));
    return DEFAULT_BUDGETS;
  }

  static async setBudget(categoryId: string, monthlyLimit: number, userId?: string): Promise<Budget> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('budgets')
        .upsert(
          { category_id: categoryId, monthly_limit: monthlyLimit, user_id: userId },
          { onConflict: 'user_id,category_id' }
        )
        .select()
        .single();
      if (!error && data) return { ...data, monthly_limit: Number(data.monthly_limit) };
    }

    const budgets = await this.getBudgets(userId);
    const index = budgets.findIndex(b => b.category_id === categoryId);
    let updated: Budget[];
    const budgetObj: Budget = {
      id: `b-${categoryId}`,
      user_id: userId || null,
      category_id: categoryId,
      monthly_limit: Number(monthlyLimit),
    };
    if (index >= 0) {
      updated = budgets.map((b, i) => i === index ? budgetObj : b);
    } else {
      updated = [...budgets, budgetObj];
    }
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(updated));
    return budgetObj;
  }

  static clearDemoDataIfPresent() {
    const storedExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (storedExpenses) {
      try {
        const parsed = JSON.parse(storedExpenses);
        if (Array.isArray(parsed) && parsed.some((item: any) => String(item.id || '').startsWith('exp-'))) {
          localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
        }
      } catch (e) {
        // ignore
      }
    }

    const storedBudgets = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    if (storedBudgets) {
      try {
        const parsed = JSON.parse(storedBudgets);
        if (Array.isArray(parsed) && parsed.some((item: any) => String(item.id || '').startsWith('b-'))) {
          localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify([]));
        }
      } catch (e) {
        // ignore
      }
    }
  }

  // RESET ALL DATA TO DEMO PRESETS
  static resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(DEFAULT_EXPENSES));
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(DEFAULT_BUDGETS));
    localStorage.setItem(STORAGE_KEYS.THEME, 'light');
  }
}
