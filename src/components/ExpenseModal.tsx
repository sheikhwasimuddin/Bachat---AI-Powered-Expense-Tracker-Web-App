import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, Tag, FileText, Loader2, Check } from 'lucide-react';
import { Expense, Category } from '../types';
import { IconRenderer } from './IconRenderer';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expenseData: { id?: string; amount: number; category_id: string; date: string; note: string }) => Promise<void>;
  expenseToEdit?: Expense | null;
  categories: Category[];
  currencySymbol: string;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  expenseToEdit,
  categories,
  currencySymbol,
}) => {
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (expenseToEdit) {
      setAmount(String(expenseToEdit.amount));
      setCategoryId(expenseToEdit.category_id);
      setDate(expenseToEdit.date);
      setNote(expenseToEdit.note || '');
    } else {
      setAmount('');
      setCategoryId(categories[0]?.id || '');
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
    }
    setError(null);
  }, [expenseToEdit, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    
    // Validation
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive expense amount.');
      return;
    }

    if (!categoryId) {
      setError('Please select a valid expense category.');
      return;
    }

    if (!date) {
      setError('Please choose a valid transaction date.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onSave({
        id: expenseToEdit?.id,
        amount: parsedAmount,
        category_id: categoryId,
        date,
        note: note.trim() || 'General Expense',
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save expense');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl border border-[#E5E0D8] dark:border-[#38332F] bg-white dark:bg-[#23211F] shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E5E0D8] dark:border-[#38332F] flex items-center justify-between">
          <h3 className="text-base font-serif-natural font-bold text-[#2D2D2A] dark:text-[#F3EFEA]">
            {expenseToEdit ? 'Edit Transaction' : 'Record New Expense'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8A8A82] hover:text-[#2D2D2A] dark:hover:text-[#F3EFEA] hover:bg-[#F7F3F0] dark:hover:bg-[#2A2724] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {error && (
            <div className="p-3.5 rounded-2xl bg-[#D68C70]/15 border border-[#D68C70]/40 text-[#B55D42] dark:text-[#E0A48E] font-medium">
              {error}
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-[11px] font-semibold text-[#6D6D66] dark:text-[#A8A49E] mb-1.5 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-[#7A8471]" /> Amount ({currencySymbol}) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 font-serif-natural font-bold text-[#8A8A82] text-sm">{currencySymbol}</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-[#E5E0D8] dark:border-[#38332F] bg-[#FDFCFB] dark:bg-[#1E1C1A] text-[#2D2D2A] dark:text-[#F3EFEA] text-sm font-serif-natural font-bold focus:outline-none focus:ring-1 focus:ring-[#7A8471]"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-semibold text-[#6D6D66] dark:text-[#A8A49E] mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-[#7A8471]" /> Category *
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1.5 border border-[#E5E0D8] dark:border-[#38332F] bg-[#FDFCFB] dark:bg-[#1E1C1A] rounded-2xl">
              {categories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition ${
                      isSelected
                        ? 'border-[#7A8471] bg-[#7A8471]/15 text-[#2D2D2A] dark:text-[#F3EFEA] font-semibold'
                        : 'border-transparent hover:bg-[#F7F3F0] dark:hover:bg-[#2A2724] text-[#5A5A54] dark:text-[#D4CFCA]'
                    }`}
                  >
                    <span 
                      className="w-5 h-5 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: cat.color }}
                    >
                      <IconRenderer name={cat.icon} size={12} className="w-3 h-3 text-white" />
                    </span>
                    <span className="truncate text-xs">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-[11px] font-semibold text-[#6D6D66] dark:text-[#A8A49E] mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#7A8471]" /> Date *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0D8] dark:border-[#38332F] bg-[#FDFCFB] dark:bg-[#1E1C1A] text-[#2D2D2A] dark:text-[#F3EFEA] font-medium focus:outline-none focus:ring-1 focus:ring-[#7A8471]"
            />
          </div>

          {/* Note / Merchant */}
          <div>
            <label className="block text-[11px] font-semibold text-[#6D6D66] dark:text-[#A8A49E] mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-[#7A8471]" /> Note or Merchant Name
            </label>
            <input
              type="text"
              placeholder="e.g. Farmer's Market artisanal bread, Botanical garden pass..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0D8] dark:border-[#38332F] bg-[#FDFCFB] dark:bg-[#1E1C1A] text-[#2D2D2A] dark:text-[#F3EFEA] placeholder-[#9E9E96] focus:outline-none focus:ring-1 focus:ring-[#7A8471]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#E5E0D8] dark:border-[#38332F] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-[#5A5A54] dark:text-[#D4CFCA] hover:bg-[#F7F3F0] dark:hover:bg-[#2A2724] font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-[#7A8471] hover:bg-[#687260] disabled:opacity-50 text-white font-semibold flex items-center gap-1.5 shadow-xs transition active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{expenseToEdit ? 'Save Changes' : 'Record Expense'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
