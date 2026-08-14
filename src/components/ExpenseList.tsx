import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  Download, 
  Calendar, 
  DollarSign, 
  Tag, 
  ArrowUpDown,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { Expense, Category, FilterState } from '../types';
import { IconRenderer } from './IconRenderer';

interface ExpenseListProps {
  expenses: Expense[];
  categories: Category[];
  currencySymbol: string;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  categories,
  currencySymbol,
  onEditExpense,
  onDeleteExpense,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    categoryId: 'all',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    sortBy: 'date-desc',
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Category lookup map
  const categoryMap = React.useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach(c => map.set(c.id, c));
    return map;
  }, [categories]);

  // Filtered & Sorted Expenses
  const filteredExpenses = React.useMemo(() => {
    return expenses.filter(exp => {
      // Search note or category
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const cat = categoryMap.get(exp.category_id);
        const matchNote = exp.note?.toLowerCase().includes(query);
        const matchCat = cat?.name.toLowerCase().includes(query);
        if (!matchNote && !matchCat) return false;
      }

      // Category filter
      if (filters.categoryId !== 'all' && exp.category_id !== filters.categoryId) {
        return false;
      }

      // Date range filter
      if (filters.startDate && exp.date < filters.startDate) return false;
      if (filters.endDate && exp.date > filters.endDate) return false;

      // Amount filter
      const amt = Number(exp.amount);
      if (filters.minAmount && amt < parseFloat(filters.minAmount)) return false;
      if (filters.maxAmount && amt > parseFloat(filters.maxAmount)) return false;

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'date-desc') return b.date.localeCompare(a.date);
      if (filters.sortBy === 'date-asc') return a.date.localeCompare(b.date);
      if (filters.sortBy === 'amount-desc') return Number(b.amount) - Number(a.amount);
      if (filters.sortBy === 'amount-asc') return Number(a.amount) - Number(b.amount);
      return 0;
    });
  }, [expenses, filters, categoryMap]);

  // Export to CSV
  const handleExportCsv = () => {
    if (filteredExpenses.length === 0) return;
    const headers = ['Date', 'Category', 'Note/Merchant', 'Amount', 'Currency'];
    const rows = filteredExpenses.map(exp => {
      const cat = categoryMap.get(exp.category_id)?.name || 'Uncategorized';
      return [
        `"${exp.date}"`,
        `"${cat}"`,
        `"${(exp.note || '').replace(/"/g, '""')}"`,
        exp.amount,
        `"${currencySymbol}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `expenses_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      categoryId: 'all',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      sortBy: 'date-desc',
    });
  };

  const hasActiveFilters = Boolean(
    filters.search ||
    filters.categoryId !== 'all' ||
    filters.startDate ||
    filters.endDate ||
    filters.minAmount ||
    filters.maxAmount
  );

  return (
    <div className="rounded-3xl border border-[#E5E0D8] dark:border-[#38332F] bg-white dark:bg-[#23211F] shadow-xs p-6 space-y-4">
      
      {/* Header with Title & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#E5E0D8] dark:border-[#38332F] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-serif-natural font-bold text-[#2D2D2A] dark:text-[#F3EFEA]">
              Transactions & Expenditures
            </h3>
            <span className="text-xs font-sans-natural font-semibold px-2.5 py-0.5 rounded-full bg-[#F7F3F0] dark:bg-[#2A2724] text-[#5A5A54] dark:text-[#D4CFCA] border border-[#E5E0D8] dark:border-[#38332F]">
              {filteredExpenses.length} total
            </span>
          </div>
          <p className="text-xs text-[#8A8A82] dark:text-[#9E9E96]">
            Search, filter, update or export your logged expenses
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition ${
              hasActiveFilters || showAdvancedFilters
                ? 'border-[#7A8471] bg-[#7A8471]/15 text-[#5C6B50] dark:text-[#A4B399]'
                : 'border-[#E5E0D8] dark:border-[#38332F] bg-[#FDFCFB] dark:bg-[#2A2724] text-[#5A5A54] dark:text-[#D4CFCA] hover:bg-[#F7F3F0] dark:hover:bg-[#332F2B]'
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-[#7A8471]" />
            <span>Filters {hasActiveFilters && '•'}</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={filteredExpenses.length === 0}
            className="px-3.5 py-1.5 rounded-xl border border-[#E5E0D8] dark:border-[#38332F] bg-[#FDFCFB] dark:bg-[#2A2724] hover:bg-[#F7F3F0] dark:hover:bg-[#332F2B] text-[#5A5A54] dark:text-[#D4CFCA] disabled:opacity-50 text-xs font-medium flex items-center gap-1.5 transition"
            title="Export filtered records to CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#7A8471]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-[#9E9E96]" />
            <input
              type="text"
              placeholder="Search merchant, note, or category..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-[#E5E0D8] dark:border-[#38332F] bg-[#FDFCFB] dark:bg-[#1E1C1A] text-[#2D2D2A] dark:text-[#F3EFEA] placeholder-[#9E9E96] focus:outline-none focus:ring-1 focus:ring-[#7A8471]"
            />
            {filters.search && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                className="absolute right-3.5 top-2.5 text-[#9E9E96] hover:text-[#2D2D2A]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Category Filter */}
          <div className="sm:w-48">
            <select
              value={filters.categoryId}
              onChange={(e) => setFilters(prev => ({ ...prev, categoryId: e.target.value }))}
              aria-label="Filter transactions by category"
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E0D8] dark:border-[#38332F] bg-[#FDFCFB] dark:bg-[#1E1C1A] text-[#2D2D2A] dark:text-[#F3EFEA] font-medium focus:ring-1 focus:ring-[#7A8471]"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="sm:w-44">
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              aria-label="Sort transactions"
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E0D8] dark:border-[#38332F] bg-[#FDFCFB] dark:bg-[#1E1C1A] text-[#2D2D2A] dark:text-[#F3EFEA] font-medium focus:ring-1 focus:ring-[#7A8471]"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>

        </div>

        {/* Advanced Filters Expandable Drawer */}
        {showAdvancedFilters && (
          <div className="p-4 rounded-2xl bg-[#F7F3F0] dark:bg-[#1E1C1A] border border-[#E5E0D8] dark:border-[#38332F] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs animate-in fade-in duration-100">
            <div>
              <label className="block text-[11px] font-medium text-[#6D6D66] dark:text-[#A8A49E] mb-1">From Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-2.5 py-1.5 rounded-xl border border-[#E5E0D8] dark:border-[#38332F] bg-white dark:bg-[#262421] text-[#2D2D2A] dark:text-[#F3EFEA]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#6D6D66] dark:text-[#A8A49E] mb-1">To Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-2.5 py-1.5 rounded-xl border border-[#E5E0D8] dark:border-[#38332F] bg-white dark:bg-[#262421] text-[#2D2D2A] dark:text-[#F3EFEA]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#6D6D66] dark:text-[#A8A49E] mb-1">Min Amount ({currencySymbol})</label>
              <input
                type="number"
                placeholder="0.00"
                value={filters.minAmount}
                onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                className="w-full px-2.5 py-1.5 rounded-xl border border-[#E5E0D8] dark:border-[#38332F] bg-white dark:bg-[#262421] text-[#2D2D2A] dark:text-[#F3EFEA]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#6D6D66] dark:text-[#A8A49E] mb-1">Max Amount ({currencySymbol})</label>
              <input
                type="number"
                placeholder="9999.00"
                value={filters.maxAmount}
                onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                className="w-full px-2.5 py-1.5 rounded-xl border border-[#E5E0D8] dark:border-[#38332F] bg-white dark:bg-[#262421] text-[#2D2D2A] dark:text-[#F3EFEA]"
              />
            </div>

            {hasActiveFilters && (
              <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-[#7A8471] hover:underline font-semibold"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expenses Table (Desktop) / Cards (Mobile) */}
      <div className="overflow-hidden rounded-2xl border border-[#E5E0D8] dark:border-[#38332F]">
        {filteredExpenses.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#8A8A82] space-y-2">
            <p>No expenses found matching your active criteria.</p>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-[#7A8471] font-semibold hover:underline"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F3F0] dark:bg-[#1E1C1A] text-[#6D6D66] dark:text-[#A8A49E] uppercase tracking-wider font-semibold border-b border-[#E5E0D8] dark:border-[#38332F]">
                <tr>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Note / Merchant</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5 text-right">Amount</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E0D8] dark:divide-[#38332F] text-[#3C3C3C] dark:text-[#E8E4DF]">
                {filteredExpenses.map((expense) => {
                  const cat = categoryMap.get(expense.category_id);
                  const isDeleting = deleteConfirmId === expense.id;

                  return (
                    <tr 
                      key={expense.id}
                      className="hover:bg-[#F7F3F0]/60 dark:hover:bg-[#2A2724]/40 transition group"
                    >
                      {/* Category */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <span 
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
                            style={{ backgroundColor: cat?.color || '#7A8471' }}
                          >
                            <IconRenderer name={cat?.icon || 'Tag'} size={14} className="w-3.5 h-3.5 text-white" />
                          </span>
                          <span className="font-semibold text-[#2D2D2A] dark:text-[#F3EFEA]">
                            {cat?.name || 'Uncategorized'}
                          </span>
                        </div>
                      </td>

                      {/* Note / Merchant */}
                      <td className="px-4 py-3.5">
                        <span className="font-medium text-[#3C3C3C] dark:text-[#E8E4DF] line-clamp-1">
                          {expense.note || 'Expense'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-[#8A8A82] dark:text-[#9E9E96]">
                        {new Date(expense.date + 'T00:00:00').toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-right font-serif-natural font-bold text-[#2D2D2A] dark:text-[#F3EFEA] text-sm">
                        {currencySymbol}{Number(expense.amount).toFixed(2)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-right">
                        {isDeleting ? (
                          <div className="flex items-center justify-end gap-1.5 animate-in fade-in duration-100">
                            <span className="text-[11px] text-[#B55D42] font-medium mr-1">Delete?</span>
                            <button
                              onClick={() => {
                                onDeleteExpense(expense.id);
                                setDeleteConfirmId(null);
                              }}
                              className="px-2.5 py-1 bg-[#B55D42] hover:bg-[#9B4E36] text-white rounded-lg text-[11px] font-semibold"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2.5 py-1 bg-[#EBE7E4] dark:bg-[#38332F] text-[#5A5A54] dark:text-[#D4CFCA] rounded-lg text-[11px]"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition">
                            <button
                              onClick={() => onEditExpense(expense)}
                              className="p-1.5 rounded-lg hover:bg-[#EBE7E4] dark:hover:bg-[#332F2B] text-[#6D6D66] hover:text-[#7A8471] dark:hover:text-[#A4B399] transition"
                              title="Edit Expense"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(expense.id)}
                              className="p-1.5 rounded-lg hover:bg-[#D68C70]/15 text-[#6D6D66] hover:text-[#B55D42] transition"
                              title="Delete Expense"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
