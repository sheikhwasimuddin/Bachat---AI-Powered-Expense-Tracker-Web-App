import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Loader2, 
  Check, 
  Edit3, 
  X, 
  Calendar, 
  Tag, 
  DollarSign, 
  FileText,
  Lightbulb
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Category, AiParsedExpense } from '../types';
import { IconRenderer } from './IconRenderer';
import { buildApiUrl } from '../lib/api';

interface AiQuickAddProps {
  categories: Category[];
  currencySymbol: string;
  onSaveExpense: (expense: { amount: number; category_id: string; date: string; note: string }) => Promise<void>;
}

const SAMPLE_PROMPTS = [
  'Spent $45 on groceries yesterday',
  'Dinner with team $62.50 at Italian Bistro',
  'Uber ride $18.25 this morning',
  'Electricity & Wifi bill $120 on 1st of month',
  'Coffee $5.75 at Starbucks'
];

export const AiQuickAdd: React.FC<AiQuickAddProps> = ({
  categories,
  currencySymbol,
  onSaveExpense,
}) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parsedData, setParsedData] = useState<AiParsedExpense | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [customDate, setCustomDate] = useState<string>('');
  const [customNote, setCustomNote] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleParsePrompt = async (textToParse?: string) => {
    const text = textToParse || inputPrompt;
    if (!text.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(buildApiUrl('/api/gemini/parse-expense'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          categories: categories.map(c => ({ id: c.id, name: c.name })),
          currentDate: new Date().toISOString().split('T')[0]
        }),
      });

      if (!response.ok) {
        throw new Error(`AI parse request failed (${response.status})`);
      }

      const data: AiParsedExpense = await response.json();
      setParsedData(data);

      // Find matching category ID
      const matchedCat = categories.find(c => 
        c.name.toLowerCase().includes(data.categoryName.toLowerCase()) ||
        data.categoryName.toLowerCase().includes(c.name.toLowerCase())
      ) || categories[0];

      setSelectedCategoryId(matchedCat?.id || categories[0]?.id || '');
      setCustomAmount(String(data.amount || ''));
      setCustomDate(data.date || new Date().toISOString().split('T')[0]);
      setCustomNote(data.note || text);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Unable to parse. Please try again or enter details manually.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSave = async () => {
    const amountNum = parseFloat(customAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setErrorMessage('Please enter a valid positive amount.');
      return;
    }

    if (!selectedCategoryId) {
      setErrorMessage('Please select a category.');
      return;
    }

    setIsSaving(true);
    try {
      await onSaveExpense({
        amount: amountNum,
        category_id: selectedCategoryId,
        date: customDate || new Date().toISOString().split('T')[0],
        note: customNote.trim() || 'AI Parsed Expense'
      });

      // Trigger celebratory micro-interaction
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899']
        });
      } catch (e) {
        // ignore if canvas is blocked
      }

      // Reset state
      setParsedData(null);
      setInputPrompt('');
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save expense');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setParsedData(null);
    setErrorMessage(null);
  };

  return (
    <div className="rounded-3xl border border-[#E5E0D8] dark:border-[#38332F] bg-white dark:bg-[#23211F] p-6 shadow-xs transition-all">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#7A8471] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-serif-natural font-bold text-[#2D2D2A] dark:text-[#F3EFEA] flex items-center gap-2">
              Natural Language Ledger
              <span className="text-[10px] font-sans-natural font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#7A8471]/15 text-[#5C6B50] dark:text-[#A4B399] border border-[#7A8471]/30">
                Gemini 3.7 Flash
              </span>
            </h2>
            <p className="text-xs text-[#8A8A82] dark:text-[#9E9E96]">
              Type or paste any natural sentence to auto-extract amount, category, date & note
            </p>
          </div>
        </div>
      </div>

      {/* Main Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleParsePrompt();
        }}
        className="relative"
      >
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder='e.g., "Paid 45 for groceries yesterday at Trader Joes" or "Sushi lunch $28.50"'
            disabled={isLoading || parsedData !== null}
            className="w-full pl-4 pr-28 py-3 text-sm rounded-2xl border border-[#E5E0D8] dark:border-[#38332F] bg-[#FDFCFB] dark:bg-[#1C1A18] text-[#2D2D2A] dark:text-[#F3EFEA] placeholder-[#9E9E96] focus:outline-none focus:ring-1 focus:ring-[#7A8471] focus:border-[#7A8471] transition"
          />

          <button
            type="submit"
            disabled={isLoading || !inputPrompt.trim() || parsedData !== null}
            className="absolute right-1.5 px-4 py-2 rounded-xl bg-[#7A8471] hover:bg-[#687260] disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs active:scale-95 transition"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Thinking...</span>
              </>
            ) : (
              <>
                <span>Parse</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Sample Quick Prompt Chips */}
      {!parsedData && (
        <div className="mt-3.5 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="flex items-center gap-1 text-[#8A8A82] dark:text-[#9E9E96] font-medium shrink-0">
            <Lightbulb className="w-3 h-3 text-[#D68C70]" />
            Try:
          </span>
          {SAMPLE_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInputPrompt(prompt);
                handleParsePrompt(prompt);
              }}
              className="shrink-0 px-3 py-1 rounded-full border border-[#E5E0D8] dark:border-[#38332F] bg-[#F7F3F0] dark:bg-[#282522] text-[#5A5A54] dark:text-[#D4CFCA] hover:border-[#7A8471] dark:hover:border-[#7A8471] hover:text-[#2D2D2A] dark:hover:text-white transition"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-3 p-3 rounded-2xl border border-[#B55D42]/30 bg-[#B55D42]/10 text-[#B55D42] text-xs flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Confirmation Step (Strict Rule: Do not auto-save AI-parsed data without confirmation) */}
      {parsedData && (
        <div className="mt-4 p-5 rounded-2xl border border-[#E5E0D8] dark:border-[#38332F] bg-[#F7F3F0] dark:bg-[#1E1C1A] shadow-xs animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-[#E5E0D8] dark:border-[#38332F] pb-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#7A8471]/20 text-[#7A8471] flex items-center justify-center">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-serif-natural font-semibold text-[#2D2D2A] dark:text-[#F3EFEA]">
                Review & Confirm Parsed Expense
              </span>
            </div>
            {parsedData.confidence && (
              <span className="text-[11px] font-medium text-[#5C6B50] dark:text-[#A4B399] bg-[#7A8471]/15 px-2.5 py-0.5 rounded-full border border-[#7A8471]/30">
                {Math.round(parsedData.confidence * 100)}% AI Confidence
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            
            {/* Amount Field */}
            <div>
              <label className="block text-[11px] font-medium text-[#8A8A82] dark:text-[#9E9E96] mb-1 flex items-center gap-1">
                <DollarSign className="w-3 h-3" /> Amount
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-[#8A8A82] font-semibold">{currencySymbol}</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full pl-6 pr-2 py-1.5 rounded-xl border border-[#E5E0D8] dark:border-[#38332F] bg-white dark:bg-[#262421] text-[#2D2D2A] dark:text-[#F3EFEA] font-semibold focus:ring-1 focus:ring-[#7A8471]"
                />
              </div>
            </div>

            {/* Category Field */}
            <div>
              <label className="block text-[11px] font-medium text-[#8A8A82] dark:text-[#9E9E96] mb-1 flex items-center gap-1">
                <Tag className="w-3 h-3" /> Category
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-[#E5E0D8] dark:border-[#38332F] bg-white dark:bg-[#262421] text-[#2D2D2A] dark:text-[#F3EFEA] font-medium focus:ring-1 focus:ring-[#7A8471]"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Field */}
            <div>
              <label className="block text-[11px] font-medium text-[#8A8A82] dark:text-[#9E9E96] mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Date
              </label>
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-[#E5E0D8] dark:border-[#38332F] bg-white dark:bg-[#262421] text-[#2D2D2A] dark:text-[#F3EFEA] font-medium focus:ring-1 focus:ring-[#7A8471]"
              />
            </div>

            {/* Note / Merchant */}
            <div>
              <label className="block text-[11px] font-medium text-[#8A8A82] dark:text-[#9E9E96] mb-1 flex items-center gap-1">
                <FileText className="w-3 h-3" /> Note / Merchant
              </label>
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-[#E5E0D8] dark:border-[#38332F] bg-white dark:bg-[#262421] text-[#2D2D2A] dark:text-[#F3EFEA] font-medium focus:ring-1 focus:ring-[#7A8471]"
              />
            </div>

          </div>

          {parsedData.reasoning && (
            <p className="mt-2.5 text-[11px] text-[#8A8A82] dark:text-[#9E9E96] italic">
              AI Note: {parsedData.reasoning}
            </p>
          )}

          {/* Actions */}
          <div className="mt-4 flex items-center justify-end gap-2 pt-3 border-t border-[#E5E0D8] dark:border-[#38332F]">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1.5 text-xs font-medium text-[#6D6D66] dark:text-[#B5B0AA] hover:bg-[#EBE7E4] dark:hover:bg-[#2B2825] rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmSave}
              disabled={isSaving}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#7A8471] hover:bg-[#687260] rounded-xl shadow-xs flex items-center gap-1.5 transition active:scale-95"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm & Save Expense</span>
                </>
              )}
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
