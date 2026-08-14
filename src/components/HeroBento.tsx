import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Target, 
  CalendarClock, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';
import { Expense, Budget, Category } from '../types';

interface HeroBentoProps {
  expenses: Expense[];
  budgets: Budget[];
  categories: Category[];
  currencySymbol: string;
  currentMonth: string;
  aiHealthScore?: number;
}

export const HeroBento: React.FC<HeroBentoProps> = ({
  expenses,
  budgets,
  currencySymbol,
  currentMonth,
  aiHealthScore = 84,
}) => {
  // Compute monthly calculations
  const totalSpend = React.useMemo(() => {
    return expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [expenses]);

  const totalBudget = React.useMemo(() => {
    return budgets.reduce((sum, b) => sum + (Number(b.monthly_limit) || 0), 0);
  }, [budgets]);

  const remainingBudget = totalBudget > 0 ? totalBudget - totalSpend : 0;
  const budgetPercentage = totalBudget > 0 ? Math.min(Math.round((totalSpend / totalBudget) * 100), 200) : 0;

  // Days in month calculations
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = Math.min(now.getDate(), daysInMonth);
  const dailyAverage = currentDay > 0 ? totalSpend / currentDay : 0;
  const projectedSpend = currentDay > 0 ? dailyAverage * daysInMonth : totalSpend;

  // Health Score status
  const getHealthBadge = (score: number) => {
    if (score >= 80) return { label: 'Optimal', color: 'text-[#5C6B50] dark:text-[#A4B399] bg-[#7A8471]/15 border-[#7A8471]/30' };
    if (score >= 60) return { label: 'Stable', color: 'text-[#8A8A82] dark:text-[#D4CFCA] bg-[#F7F3F0] dark:bg-[#2F2C28] border-[#D6CEC7]' };
    if (score >= 40) return { label: 'Caution', color: 'text-[#C2955B] dark:text-[#E8BD87] bg-[#C2955B]/15 border-[#C2955B]/30' };
    return { label: 'Over Budget', color: 'text-[#B55D42] dark:text-[#EAA18E] bg-[#B55D42]/15 border-[#B55D42]/30' };
  };

  const healthBadge = getHealthBadge(aiHealthScore);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* 1. Total Spent */}
      <div className="p-6 rounded-3xl border border-[#E5E0D8] dark:border-[#38332F] bg-white dark:bg-[#23211F] shadow-xs relative overflow-hidden transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#8A8A82] dark:text-[#9E9E96] uppercase tracking-wider">
            Total Spent
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#7A8471]/15 text-[#7A8471] dark:text-[#A4B399] flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold font-serif-natural text-[#2D2D2A] dark:text-[#F3EFEA] tracking-tight">
            {currencySymbol}{totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-[#8A8A82] dark:text-[#9E9E96]">
            <span className="font-semibold text-[#5A5A54] dark:text-[#D4CFCA]">
              {expenses.length}
            </span>
            <span>transactions recorded</span>
          </div>
        </div>
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#7A8471]/5 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* 2. Monthly Budget & Remaining */}
      <div className="p-6 rounded-3xl border border-[#E5E0D8] dark:border-[#38332F] bg-white dark:bg-[#23211F] shadow-xs relative overflow-hidden transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#8A8A82] dark:text-[#9E9E96] uppercase tracking-wider">
            Budget Balance
          </span>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            remainingBudget >= 0 
              ? 'bg-[#7A8471]/15 text-[#5C6B50] dark:text-[#A4B399]' 
              : 'bg-[#B55D42]/15 text-[#B55D42] dark:text-[#EAA18E]'
          }`}>
            <Target className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold font-serif-natural text-[#2D2D2A] dark:text-[#F3EFEA] tracking-tight flex items-baseline gap-2">
            <span>{currencySymbol}{Math.abs(remainingBudget).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="text-xs font-normal text-[#8A8A82]">
              {remainingBudget >= 0 ? 'left' : 'over limit'}
            </span>
          </div>

          {/* Linear Progress Bar */}
          <div className="mt-3 space-y-1.5">
            <div className="h-2 w-full rounded-full bg-[#EBE7E4] dark:bg-[#38332F] overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetPercentage > 100 
                    ? 'bg-[#B55D42]' 
                    : budgetPercentage > 80 
                    ? 'bg-[#D68C70]' 
                    : 'bg-[#7A8471]'
                }`}
                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-[#8A8A82] dark:text-[#9E9E96]">
              <span>{budgetPercentage}% used</span>
              <span>Cap: {currencySymbol}{totalBudget.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Daily Velocity & Projected Month End */}
      <div className="p-6 rounded-3xl border border-[#E5E0D8] dark:border-[#38332F] bg-white dark:bg-[#23211F] shadow-xs relative overflow-hidden transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#8A8A82] dark:text-[#9E9E96] uppercase tracking-wider">
            Daily Pace & Forecast
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#B19F86]/15 text-[#B19F86] dark:text-[#D4C8B8] flex items-center justify-center">
            <CalendarClock className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold font-serif-natural text-[#2D2D2A] dark:text-[#F3EFEA] tracking-tight">
            {currencySymbol}{dailyAverage.toFixed(2)}
            <span className="text-xs font-normal text-[#8A8A82]"> /day</span>
          </div>

          <div className="mt-2 flex items-center gap-1.5 text-xs text-[#6D6D66] dark:text-[#B5B0AA]">
            <span>Projected:</span>
            <span className="font-semibold text-[#2D2D2A] dark:text-[#F3EFEA]">
              {currencySymbol}{projectedSpend.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <span className="text-[10px] text-[#8A8A82]">by day {daysInMonth}</span>
          </div>
        </div>
      </div>

      {/* 4. Financial Health Score */}
      <div className="p-6 rounded-3xl border border-[#E5E0D8] dark:border-[#38332F] bg-white dark:bg-[#23211F] shadow-xs relative overflow-hidden transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#8A8A82] dark:text-[#9E9E96] uppercase tracking-wider">
            Financial Health
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#5C6B50]/15 text-[#5C6B50] dark:text-[#A4B399] flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-serif-natural text-[#2D2D2A] dark:text-[#F3EFEA] tracking-tight">
              {aiHealthScore}
              <span className="text-sm font-normal text-[#8A8A82]">/100</span>
            </div>
            <div className="mt-2">
              <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border ${healthBadge.color}`}>
                {healthBadge.label}
              </span>
            </div>
          </div>

          {/* Mini circular dial visual */}
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#EBE7E4] dark:text-[#38332F]"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={aiHealthScore >= 75 ? 'text-[#7A8471]' : aiHealthScore >= 50 ? 'text-[#D68C70]' : 'text-[#B55D42]'}
                strokeDasharray={`${aiHealthScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-xs font-bold text-[#2D2D2A] dark:text-[#F3EFEA]">
              {aiHealthScore}%
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
