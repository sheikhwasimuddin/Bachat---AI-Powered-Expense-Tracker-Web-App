import React from 'react';
import { 
  Plus, 
  Moon, 
  Sun, 
  Calendar, 
  Settings,
  LogOut, 
  ChevronDown
} from 'lucide-react';
import { CURRENCIES } from '../data/defaultData';

interface NavbarProps {
  currentMonth: string; // YYYY-MM
  onMonthChange: (month: string) => void;
  currency: string;
  onCurrencyChange: (currency: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenAddExpense: () => void;
  onOpenCategoryManager: () => void;
  user: any;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMonth,
  onMonthChange,
  currency,
  onCurrencyChange,
  isDark,
  onToggleTheme,
  onOpenAddExpense,
  onOpenCategoryManager,
  user,
  onSignOut,
}) => {
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  // Generate list of recent months for quick selector
  const months = React.useMemo(() => {
    const list = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      list.push({ val, label });
    }
    return list;
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#E5E0D8] dark:border-[#2E2A27] bg-[#FDFCFB]/90 dark:bg-[#191817]/90 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#7A8471] flex items-center justify-center shadow-xs text-white">
            <div className="w-4 h-4 rounded-full border-2 border-white/80 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif-natural font-semibold text-lg tracking-tight text-[#2D2D2A] dark:text-[#F3EFEA]">
                Bachat <span className="font-sans-natural font-bold text-xs px-2 py-0.5 rounded-full bg-[#D68C70]/15 text-[#D68C70] border border-[#D68C70]/30">AI</span>
              </span>
            </div>
            <p className="text-[11px] text-[#8A8A82] dark:text-[#9E9E96] hidden sm:block">
              AI-Powered-Expense-Tracker
            </p>
          </div>
        </div>

        {/* Center / Controls: Month Selector */}
        <div className="flex items-center gap-2">
          <div className="relative inline-flex items-center">
            <Calendar className="w-3.5 h-3.5 absolute left-3 text-[#8A8A82] pointer-events-none" />
            <select
              value={currentMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              aria-label="Filter by month"
              className="pl-8 pr-7 py-1.5 text-xs sm:text-sm font-medium rounded-xl border border-[#E5E0D8] dark:border-[#38332F] bg-[#F7F3F0] dark:bg-[#262421] text-[#3C3C3C] dark:text-[#E8E4DF] hover:bg-[#EBE7E4] dark:hover:bg-[#2F2C28] transition cursor-pointer appearance-none focus:outline-none focus:ring-1 focus:ring-[#7A8471]"
            >
              {months.map((m) => (
                <option key={m.val} value={m.val}>
                  {m.label}
                </option>
              ))}
              <option value="all">All Time</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2 text-[#8A8A82] pointer-events-none" />
          </div>

          {/* Currency Selector */}
          <select
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value)}
            aria-label="Select currency"
            className="py-1.5 px-2.5 text-xs sm:text-sm font-medium rounded-xl border border-[#E5E0D8] dark:border-[#38332F] bg-[#F7F3F0] dark:bg-[#262421] text-[#3C3C3C] dark:text-[#E8E4DF] hover:bg-[#EBE7E4] dark:hover:bg-[#2F2C28] transition cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#7A8471]"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} ({c.symbol})
              </option>
            ))}
          </select>
        </div>

        {/* Right Actions (Desktop) */}
        <div className="hidden sm:flex items-center gap-2 sm:gap-3">

          {/* Category & Budget Manager button */}
          <button
            onClick={onOpenCategoryManager}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-[#E5E0D8] dark:border-[#38332F] bg-white dark:bg-[#262421] hover:bg-[#F7F3F0] dark:hover:bg-[#2F2C28] text-[#5A5A54] dark:text-[#D4CFCA] transition shadow-xs"
            title="Manage Categories & Budgets"
          >
            <Settings className="w-3.5 h-3.5 text-[#8A8A82]" />
            <span>Budgets & Categories</span>
          </button>

          {/* Dark/Light Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl border border-[#E5E0D8] dark:border-[#38332F] bg-white dark:bg-[#262421] text-[#6D6D66] dark:text-[#C5BFB8] hover:bg-[#F7F3F0] dark:hover:bg-[#2F2C28] transition shadow-xs"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-[#D68C70]" /> : <Moon className="w-4 h-4 text-[#7A8471]" />}
          </button>

          {/* Quick Add Button */}
          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#7A8471] hover:bg-[#687260] text-white text-xs sm:text-sm font-semibold shadow-sm active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Expense</span>
          </button>

          {/* User Account / Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1.5 p-0.5 rounded-full border border-[#E5E0D8] dark:border-[#38332F] hover:ring-2 hover:ring-[#7A8471]/30 transition"
              aria-label="User profile menu"
            >
              <div className="w-7 h-7 rounded-full bg-[#D68C70]/20 text-[#D68C70] border border-[#D68C70]/40 flex items-center justify-center text-xs font-bold font-serif-natural">
                {user?.user_metadata?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'S'}
              </div>
            </button>

            {showUserMenu && (
              <div 
                className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#E5E0D8] dark:border-[#38332F] bg-[#FDFCFB] dark:bg-[#23211F] shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setShowUserMenu(false)}
              >
                <div className="px-4 py-2 border-b border-[#E5E0D8] dark:border-[#38332F]">
                  <p className="text-xs font-semibold text-[#2D2D2A] dark:text-[#F3EFEA] truncate font-serif-natural">
                    {user?.user_metadata?.name || 'Account'}
                  </p>
                  <p className="text-[11px] text-[#8A8A82] dark:text-[#9E9E96] truncate">
                    {user?.email || ''}
                  </p>
                </div>

                <div className="my-1 border-t border-[#E5E0D8] dark:border-[#38332F]" />

                <button
                  onClick={onOpenCategoryManager}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-[#5A5A54] dark:text-[#D4CFCA] hover:bg-[#F7F3F0] dark:hover:bg-[#2B2825] flex items-center gap-2"
                >
                  <Settings className="w-3.5 h-3.5 text-[#8A8A82]" />
                  Category Limits & Setup
                </button>

                <div className="my-1 border-t border-[#E5E0D8] dark:border-[#38332F]" />

                <button
                  onClick={onSignOut}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-[#B55D42] hover:bg-[#B55D42]/10 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Right Actions (Mobile) */}
        <div className="sm:hidden flex items-center">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1.5 p-0.5 rounded-full border border-[#E5E0D8] dark:border-[#38332F] hover:ring-2 hover:ring-[#7A8471]/30 transition"
              aria-label="Mobile profile menu"
            >
              <div className="w-8 h-8 rounded-full bg-[#D68C70]/20 text-[#D68C70] border border-[#D68C70]/40 flex items-center justify-center text-xs font-bold font-serif-natural">
                {user?.user_metadata?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'S'}
              </div>
            </button>

            {showUserMenu && (
              <div 
                className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#E5E0D8] dark:border-[#38332F] bg-[#FDFCFB] dark:bg-[#23211F] shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setShowUserMenu(false)}
              >
                <div className="px-4 py-2 border-b border-[#E5E0D8] dark:border-[#38332F]">
                  <p className="text-xs font-semibold text-[#2D2D2A] dark:text-[#F3EFEA] truncate font-serif-natural">
                    {user?.user_metadata?.name || 'Account'}
                  </p>
                  <p className="text-[11px] text-[#8A8A82] dark:text-[#9E9E96] truncate">
                    {user?.email || ''}
                  </p>
                </div>

                <button
                  onClick={onOpenAddExpense}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-[#5A5A54] dark:text-[#D4CFCA] hover:bg-[#F7F3F0] dark:hover:bg-[#2B2825] flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5 text-[#7A8471]" />
                  Add Expense
                </button>

                <button
                  onClick={onOpenCategoryManager}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-[#5A5A54] dark:text-[#D4CFCA] hover:bg-[#F7F3F0] dark:hover:bg-[#2B2825] flex items-center gap-2"
                >
                  <Settings className="w-3.5 h-3.5 text-[#8A8A82]" />
                  Category Limits & Setup
                </button>

                <button
                  onClick={onToggleTheme}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-[#5A5A54] dark:text-[#D4CFCA] hover:bg-[#F7F3F0] dark:hover:bg-[#2B2825] flex items-center gap-2"
                >
                  {isDark ? <Sun className="w-3.5 h-3.5 text-[#D68C70]" /> : <Moon className="w-3.5 h-3.5 text-[#7A8471]" />}
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </button>

                <div className="my-1 border-t border-[#E5E0D8] dark:border-[#38332F]" />

                <button
                  onClick={onSignOut}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-[#B55D42] hover:bg-[#B55D42]/10 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
