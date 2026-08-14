export interface Category {
  id: string;
  user_id?: string | null;
  name: string;
  icon: string;
  color: string;
  created_at?: string;
}

export interface Expense {
  id: string;
  user_id?: string | null;
  category_id: string;
  amount: number;
  note: string;
  date: string; // YYYY-MM-DD
  created_at?: string;
  category?: Category;
}

export interface Budget {
  id: string;
  user_id?: string | null;
  category_id: string;
  monthly_limit: number;
  threshold_percentage?: number;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  currency?: string;
  created_at?: string;
}

export interface AiParsedExpense {
  amount: number;
  categoryName: string;
  date: string; // YYYY-MM-DD
  note: string;
  confidence: number;
  reasoning?: string;
}

export interface AiInsightResponse {
  summary: string;
  topSpendingTakeaway: string;
  budgetWarnings: string[];
  savingOpportunities: string[];
  projectedMonthlySpend: number;
  healthScore: number; // 1-100
  keyRecommendations: string[];
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
}

export interface FilterState {
  search: string;
  categoryId: string;
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  sortBy: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
}
