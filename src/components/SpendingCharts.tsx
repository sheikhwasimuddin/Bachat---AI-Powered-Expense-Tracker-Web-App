import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import { Expense, Category, Budget } from '../types';
import { IconRenderer } from './IconRenderer';
import { PieChart as PieIcon, BarChart3, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SpendingChartsProps {
  expenses: Expense[];
  categories: Category[];
  budgets: Budget[];
  currencySymbol: string;
}

export const SpendingCharts: React.FC<SpendingChartsProps> = ({
  expenses,
  categories,
  budgets,
  currencySymbol,
}) => {
  const [chartView, setChartView] = useState<'daily' | 'category'>('daily');

  // Prepare Category totals data
  const categoryData = React.useMemo(() => {
    const map = new Map<string, { name: string; amount: number; color: string; icon: string; count: number }>();
    
    categories.forEach(cat => {
      map.set(cat.id, {
        name: cat.name,
        amount: 0,
        color: cat.color,
        icon: cat.icon,
        count: 0
      });
    });

    expenses.forEach(exp => {
      const entry = map.get(exp.category_id);
      if (entry) {
        entry.amount += Number(exp.amount) || 0;
        entry.count += 1;
      } else {
        // Unknown / fallback category
        map.set(exp.category_id, {
          name: 'Other',
          amount: Number(exp.amount) || 0,
          color: '#94a3b8',
          icon: 'Tag',
          count: 1
        });
      }
    });

    return Array.from(map.values())
      .filter(item => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [expenses, categories]);

  // Prepare Daily Trend Data
  const dailyData = React.useMemo(() => {
    const map = new Map<string, number>();
    
    // Sort expenses by date ascending
    const sorted = [...expenses].sort((a, b) => a.date.localeCompare(b.date));
    
    sorted.forEach(exp => {
      const d = exp.date;
      map.set(d, (map.get(d) || 0) + Number(exp.amount));
    });

    const result = Array.from(map.entries()).map(([date, amount]) => {
      const d = new Date(date + 'T00:00:00');
      const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        date: formattedDate,
        rawDate: date,
        amount: Math.round(amount * 100) / 100,
      };
    });

    return result;
  }, [expenses]);

  // Category Budget Comparison Data
  const budgetComparison = React.useMemo(() => {
    return categories.map(cat => {
      const spent = expenses
        .filter(e => e.category_id === cat.id)
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      
      const budgetObj = budgets.find(b => b.category_id === cat.id);
      const limit = budgetObj ? Number(budgetObj.monthly_limit) : 0;
      const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;

      return {
        id: cat.id,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        spent,
        limit,
        percentage,
        isOver: limit > 0 && spent > limit,
        isWarning: limit > 0 && spent >= limit * 0.8 && spent <= limit
      };
    }).filter(item => item.spent > 0 || item.limit > 0);
  }, [categories, expenses, budgets]);

  const totalSpent = categoryData.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left 2 Cols: Main Interactive Chart (Daily Trend / Category Donut) */}
      <div className="lg:col-span-2 rounded-3xl border border-[#E5E0D8] dark:border-[#38332F] bg-white dark:bg-[#23211F] p-6 shadow-xs space-y-4">
        
        {/* Header with Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E0D8] dark:border-[#38332F] pb-4">
          <div>
            <h3 className="text-base font-serif-natural font-bold text-[#2D2D2A] dark:text-[#F3EFEA]">
              Spending Analytics
            </h3>
            <p className="text-xs text-[#8A8A82] dark:text-[#9E9E96]">
              Visual breakdown of your expenditure and timeline
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F7F3F0] dark:bg-[#2A2724] border border-[#E5E0D8] dark:border-[#38332F] self-start sm:self-auto">
            <button
              onClick={() => setChartView('daily')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                chartView === 'daily'
                  ? 'bg-white dark:bg-[#1E1C1A] text-[#2D2D2A] dark:text-[#F3EFEA] shadow-xs'
                  : 'text-[#8A8A82] dark:text-[#9E9E96] hover:text-[#2D2D2A]'
              }`}
            >
              Timeline Trend
            </button>
            <button
              onClick={() => setChartView('category')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                chartView === 'category'
                  ? 'bg-white dark:bg-[#1E1C1A] text-[#2D2D2A] dark:text-[#F3EFEA] shadow-xs'
                  : 'text-[#8A8A82] dark:text-[#9E9E96] hover:text-[#2D2D2A]'
              }`}
            >
              Category Distribution
            </button>
          </div>
        </div>

        {/* Chart Render Area */}
        <div className="h-64 sm:h-72 w-full pt-2">
          {expenses.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-[#8A8A82]">
              No transactions recorded for this period.
            </div>
          ) : chartView === 'daily' ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7A8471" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7A8471" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  stroke="#8A8A82" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#8A8A82" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `${currencySymbol}${val}`} 
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 rounded-2xl bg-[#2D2D2A] text-white text-xs shadow-xl border border-[#3E3E3A]">
                          <p className="font-medium text-[#C5BFB8]">{data.rawDate}</p>
                          <p className="text-sm font-serif-natural font-bold text-[#D68C70] mt-0.5">
                            {currencySymbol}{data.amount.toFixed(2)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#7A8471" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#spendGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 h-full items-center">
              <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="amount"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const pct = totalSpent > 0 ? ((data.amount / totalSpent) * 100).toFixed(1) : 0;
                          return (
                            <div className="p-3 rounded-2xl bg-[#2D2D2A] text-white text-xs shadow-xl border border-[#3E3E3A]">
                              <p className="font-serif-natural font-semibold text-[#F3EFEA]">{data.name}</p>
                              <p className="text-sm font-bold text-[#D68C70] mt-0.5">
                                {currencySymbol}{data.amount.toFixed(2)} ({pct}%)
                              </p>
                              <p className="text-[11px] text-[#A8A49E] mt-0.5">{data.count} transactions</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category Legend List */}
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-2 text-xs">
                {categoryData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1.5 border-b border-[#E5E0D8] dark:border-[#38332F]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-medium text-[#3C3C3C] dark:text-[#E8E4DF]">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-[#2D2D2A] dark:text-[#F3EFEA]">
                        {currencySymbol}{item.amount.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-[#8A8A82] ml-1">
                        ({totalSpent > 0 ? Math.round((item.amount / totalSpent) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Right 1 Col: Category Budget Limits & Progress Bars */}
      <div className="rounded-3xl border border-[#E5E0D8] dark:border-[#38332F] bg-white dark:bg-[#23211F] p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#E5E0D8] dark:border-[#38332F] pb-4">
          <div>
            <h3 className="text-base font-serif-natural font-bold text-[#2D2D2A] dark:text-[#F3EFEA]">
              Category Budgets
            </h3>
            <p className="text-xs text-[#8A8A82] dark:text-[#9E9E96]">
              Monthly limits vs actual spending
            </p>
          </div>
        </div>

        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {budgetComparison.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8A8A82]">
              No budgets configured. Click 'Budgets & Categories' to set monthly targets.
            </div>
          ) : (
            budgetComparison.map((item) => (
              <div key={item.id} className="space-y-1.5 p-3 rounded-2xl bg-[#F7F3F0] dark:bg-[#1E1C1A] border border-[#E5E0D8] dark:border-[#38332F]">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-medium text-[#3C3C3C] dark:text-[#E8E4DF]">
                    <span 
                      className="w-5 h-5 rounded-lg flex items-center justify-center text-white text-[10px]"
                      style={{ backgroundColor: item.color }}
                    >
                      <IconRenderer name={item.icon} size={12} className="w-3 h-3 text-white" />
                    </span>
                    <span className="font-semibold">{item.name}</span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="font-bold text-[#2D2D2A] dark:text-[#F3EFEA]">
                      {currencySymbol}{item.spent.toFixed(0)}
                    </span>
                    <span className="text-[#8A8A82]">/</span>
                    <span className="text-[#8A8A82]">
                      {item.limit > 0 ? `${currencySymbol}${item.limit.toFixed(0)}` : 'No limit'}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                {item.limit > 0 && (
                  <div>
                    <div className="h-1.5 w-full rounded-full bg-[#EBE7E4] dark:bg-[#38332F] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          item.isOver 
                            ? 'bg-[#B55D42]' 
                            : item.isWarning 
                            ? 'bg-[#D68C70]' 
                            : 'bg-[#7A8471]'
                        }`}
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[10px]">
                      <span className={item.isOver ? 'text-[#B55D42] font-semibold' : item.isWarning ? 'text-[#D68C70] font-semibold' : 'text-[#8A8A82]'}>
                        {item.percentage}% consumed
                      </span>
                      {item.isOver ? (
                        <span className="text-[#B55D42] flex items-center gap-0.5 font-medium">
                          <AlertTriangle className="w-2.5 h-2.5" /> Exceeded
                        </span>
                      ) : (
                        <span className="text-[#8A8A82]">
                          {currencySymbol}{(item.limit - item.spent).toFixed(0)} left
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
};
