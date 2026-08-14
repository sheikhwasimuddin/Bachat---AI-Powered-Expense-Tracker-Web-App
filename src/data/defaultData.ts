import { Category, Expense, Budget } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-food', name: 'Food & Dining', icon: 'Utensils', color: '#D68C70' }, // Terracotta
  { id: 'cat-groceries', name: 'Groceries', icon: 'ShoppingCart', color: '#7A8471' }, // Sage
  { id: 'cat-transport', name: 'Transportation', icon: 'Car', color: '#6A7B82' }, // Slate Mist
  { id: 'cat-housing', name: 'Housing & Rent', icon: 'Home', color: '#5C6B50' }, // Deep Olive
  { id: 'cat-utilities', name: 'Utilities & Bills', icon: 'Zap', color: '#C2955B' }, // Ochre
  { id: 'cat-entertainment', name: 'Entertainment', icon: 'Film', color: '#B19F86' }, // Warm Sand
  { id: 'cat-health', name: 'Healthcare', icon: 'HeartPulse', color: '#C47D63' }, // Warm Clay
  { id: 'cat-shopping', name: 'Shopping & Personal', icon: 'ShoppingBag', color: '#D99B5C' }, // Amber
  { id: 'cat-travel', name: 'Travel', icon: 'Plane', color: '#6E7A68' }, // Soft Moss
  { id: 'cat-education', name: 'Education', icon: 'BookOpen', color: '#8A8A82' } // Warm Taupe
];

export const DEFAULT_BUDGETS: Budget[] = [];

export const DEFAULT_EXPENSES: Expense[] = [];

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' }
];
