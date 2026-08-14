import React, { useState } from 'react';
import { X, Plus, Target, Tag, Palette, Check, Trash2, Loader2 } from 'lucide-react';
import { Category, Budget } from '../types';
import { IconRenderer, AVAILABLE_ICONS, AVAILABLE_COLORS } from './IconRenderer';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  budgets: Budget[];
  currencySymbol: string;
  onSaveCategory: (category: Omit<Category, 'id'> & { id?: string }) => Promise<void>;
  onSetBudget: (categoryId: string, monthlyLimit: number) => Promise<void>;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  budgets,
  currencySymbol,
  onSaveCategory,
  onSetBudget,
}) => {
  const [activeTab, setActiveTab] = useState<'budgets' | 'new-category'>('budgets');
  
  // New Category State
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Tag');
  const [newCatColor, setNewCatColor] = useState(AVAILABLE_COLORS[0]);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Budget Limits State
  const [editingBudgets, setEditingBudgets] = useState<Record<string, string>>({});
  const [savingBudgetId, setSavingBudgetId] = useState<string | null>(null);

  React.useEffect(() => {
    const initial: Record<string, string> = {};
    categories.forEach(c => {
      const b = budgets.find(item => item.category_id === c.id);
      initial[c.id] = b ? String(b.monthly_limit) : '';
    });
    setEditingBudgets(initial);
  }, [categories, budgets, isOpen]);

  if (!isOpen) return null;

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      setErrorMsg('Please enter a category name');
      return;
    }

    setIsSavingCategory(true);
    setErrorMsg(null);

    try {
      await onSaveCategory({
        name: newCatName.trim(),
        icon: newCatIcon,
        color: newCatColor,
      });
      setNewCatName('');
      setActiveTab('budgets');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save category');
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleSaveBudget = async (categoryId: string) => {
    const val = parseFloat(editingBudgets[categoryId] || '0');
    setSavingBudgetId(categoryId);
    try {
      await onSetBudget(categoryId, isNaN(val) ? 0 : val);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSavingBudgetId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl border border-[#E5E0D8] dark:border-[#38332F] bg-white dark:bg-[#23211F] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E5E0D8] dark:border-[#38332F] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#7A8471] text-white flex items-center justify-center shadow-xs">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif-natural font-bold text-[#2D2D2A] dark:text-[#F3EFEA]">
                Categories & Budget Allocation
              </h3>
              <p className="text-xs text-[#8A8A82] dark:text-[#9E9E96]">
                Configure monthly budget targets and custom spending categories
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8A8A82] hover:text-[#2D2D2A] dark:hover:text-[#F3EFEA] hover:bg-[#F7F3F0] dark:hover:bg-[#2A2724] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#E5E0D8] dark:border-[#38332F] px-6 pt-3 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('budgets')}
            className={`pb-2.5 border-b-2 transition ${
              activeTab === 'budgets'
                ? 'border-[#7A8471] text-[#7A8471] dark:text-[#A4B399]'
                : 'border-transparent text-[#8A8A82] hover:text-[#2D2D2A] dark:hover:text-[#F3EFEA]'
            }`}
          >
            Monthly Budget Limits ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('new-category')}
            className={`pb-2.5 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'new-category'
                ? 'border-[#7A8471] text-[#7A8471] dark:text-[#A4B399]'
                : 'border-transparent text-[#8A8A82] hover:text-[#2D2D2A] dark:hover:text-[#F3EFEA]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Create Category
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          
          {activeTab === 'budgets' ? (
            <div className="space-y-3">
              <p className="text-xs text-[#8A8A82] dark:text-[#9E9E96] mb-2">
                Set optional monthly spending caps for each category. Leave empty or 0 for no limit.
              </p>

              <div className="divide-y divide-[#E5E0D8] dark:divide-[#38332F]">
                {categories.map((cat) => {
                  const isSavingThis = savingBudgetId === cat.id;

                  return (
                    <div key={cat.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span 
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
                          style={{ backgroundColor: cat.color }}
                        >
                          <IconRenderer name={cat.icon} size={14} className="w-3.5 h-3.5 text-white" />
                        </span>
                        <span className="font-semibold text-[#2D2D2A] dark:text-[#F3EFEA] truncate">
                          {cat.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="relative w-28">
                          <span className="absolute left-2.5 top-2 text-[#8A8A82] font-semibold">{currencySymbol}</span>
                          <input
                            type="number"
                            placeholder="Limit"
                            value={editingBudgets[cat.id] || ''}
                            onChange={(e) => setEditingBudgets(prev => ({ ...prev, [cat.id]: e.target.value }))}
                            onBlur={() => handleSaveBudget(cat.id)}
                            className="w-full pl-6 pr-2 py-1.5 rounded-xl border border-[#E5E0D8] dark:border-[#38332F] bg-[#FDFCFB] dark:bg-[#1E1C1A] text-[#2D2D2A] dark:text-[#F3EFEA] font-medium focus:ring-1 focus:ring-[#7A8471]"
                          />
                        </div>

                        <button
                          onClick={() => handleSaveBudget(cat.id)}
                          disabled={isSavingThis}
                          className="p-2 rounded-xl bg-[#F7F3F0] dark:bg-[#2A2724] hover:bg-[#7A8471]/15 hover:text-[#7A8471] dark:hover:bg-[#332F2B] text-[#5A5A54] dark:text-[#D4CFCA] transition"
                          title="Save Budget Target"
                        >
                          {isSavingThis ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateCategory} className="space-y-4">
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-[#D68C70]/15 border border-[#D68C70]/40 text-[#B55D42] dark:text-[#E0A48E] text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-[11px] font-semibold text-[#6D6D66] dark:text-[#A8A49E] mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Artisanal Coffee, Seedlings, Botany Books..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E0D8] dark:border-[#38332F] bg-[#FDFCFB] dark:bg-[#1E1C1A] text-[#2D2D2A] dark:text-[#F3EFEA] focus:outline-none focus:ring-1 focus:ring-[#7A8471]"
                />
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-[11px] font-semibold text-[#6D6D66] dark:text-[#A8A49E] mb-1.5 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-[#7A8471]" /> Select Icon
                </label>
                <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1.5 border border-[#E5E0D8] dark:border-[#38332F] bg-[#FDFCFB] dark:bg-[#1E1C1A] rounded-2xl">
                  {AVAILABLE_ICONS.map((iconName) => {
                    const isSelected = newCatIcon === iconName;
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setNewCatIcon(iconName)}
                        className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 border transition ${
                          isSelected
                            ? 'border-[#7A8471] bg-[#7A8471]/15 text-[#5C6B50] dark:text-[#A4B399]'
                            : 'border-transparent hover:bg-[#F7F3F0] dark:hover:bg-[#2A2724] text-[#5A5A54] dark:text-[#D4CFCA]'
                        }`}
                      >
                        <IconRenderer name={iconName} size={16} />
                        <span className="text-[10px] truncate max-w-full">{iconName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Swatches */}
              <div>
                <label className="block text-[11px] font-semibold text-[#6D6D66] dark:text-[#A8A49E] mb-1.5 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-[#7A8471]" /> Palette Tone
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {AVAILABLE_COLORS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setNewCatColor(col)}
                      className={`w-7 h-7 rounded-full transition flex items-center justify-center ${
                        newCatColor === col ? 'ring-2 ring-offset-2 ring-[#7A8471] scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: col }}
                    >
                      {newCatColor === col && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="p-3.5 rounded-2xl bg-[#F7F3F0] dark:bg-[#1E1C1A] border border-[#E5E0D8] dark:border-[#38332F] flex items-center gap-3">
                <span 
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs"
                  style={{ backgroundColor: newCatColor }}
                >
                  <IconRenderer name={newCatIcon} size={16} className="w-4 h-4 text-white" />
                </span>
                <div>
                  <p className="text-xs font-serif-natural font-bold text-[#2D2D2A] dark:text-[#F3EFEA]">
                    {newCatName || 'Category Name Preview'}
                  </p>
                  <p className="text-[10px] text-[#8A8A82]">Natural aesthetic badge preview</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingCategory || !newCatName.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#7A8471] hover:bg-[#687260] disabled:opacity-50 text-white font-semibold flex items-center gap-1.5 shadow-xs transition active:scale-95"
                >
                  {isSavingCategory ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
