import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  AlertCircle, 
  Lightbulb, 
  RefreshCw, 
  MessageSquare, 
  Send, 
  Loader2, 
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AiInsightResponse, Expense, Budget, Category } from '../types';
import { buildApiUrl } from '../lib/api';

interface AiInsightsPanelProps {
  insights: AiInsightResponse | null;
  isLoading: boolean;
  onRefreshInsights: () => void;
  expenses: Expense[];
  budgets: Budget[];
  categories: Category[];
  currencySymbol: string;
}

export const AiInsightsPanel: React.FC<AiInsightsPanelProps> = ({
  insights,
  isLoading,
  onRefreshInsights,
  expenses,
  budgets,
  categories,
  currencySymbol,
}) => {
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [advisorQuestion, setAdvisorQuestion] = useState('');
  const [advisorAnswer, setAdvisorAnswer] = useState<string | null>(null);
  const [isAskingAdvisor, setIsAskingAdvisor] = useState(false);

  const handleAskAdvisor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advisorQuestion.trim() || isAskingAdvisor) return;

    setIsAskingAdvisor(true);
    setAdvisorAnswer(null);

    try {
      const response = await fetch(buildApiUrl('/api/gemini/advisor'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: advisorQuestion,
          expenses,
          budgets,
          categories,
          currencySymbol,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response from Gemini Advisor');
      }

      const data = await response.json();
      setAdvisorAnswer(data.answer || 'No response returned.');
    } catch (err: any) {
      setAdvisorAnswer(`Error: ${err.message || 'Unable to connect to AI Advisor'}`);
    } finally {
      setIsAskingAdvisor(false);
    }
  };

  return (
    <div className="rounded-3xl border border-[#E5E0D8] dark:border-[#38332F] bg-white dark:bg-[#23211F] shadow-xs p-6 space-y-4">
      
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E0D8] dark:border-[#38332F] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#7A8471] flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-serif-natural font-bold text-[#2D2D2A] dark:text-[#F3EFEA] flex items-center gap-2">
              Gemini Financial Intelligence
              <span className="text-[10px] font-sans-natural font-semibold uppercase px-2 py-0.5 rounded-full bg-[#7A8471]/15 text-[#5C6B50] dark:text-[#A4B399] border border-[#7A8471]/30">
                Live Insights
              </span>
            </h2>
            <p className="text-xs text-[#8A8A82] dark:text-[#9E9E96]">
              Autonomous spending analysis, anomaly detection & natural wealth advisory
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdvisorOpen(!isAdvisorOpen)}
            className="px-3.5 py-1.5 rounded-xl border border-[#E5E0D8] dark:border-[#38332F] bg-[#F7F3F0] dark:bg-[#2A2724] text-[#5A5A54] dark:text-[#D4CFCA] hover:bg-[#EBE7E4] dark:hover:bg-[#332F2B] text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#7A8471]" />
            <span>{isAdvisorOpen ? 'Hide Advisor' : 'Ask AI Advisor'}</span>
            {isAdvisorOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            onClick={onRefreshInsights}
            disabled={isLoading}
            className="p-2 rounded-xl border border-[#E5E0D8] dark:border-[#38332F] bg-[#FDFCFB] dark:bg-[#2A2724] text-[#6D6D66] dark:text-[#B5B0AA] hover:bg-[#F7F3F0] dark:hover:bg-[#332F2B] disabled:opacity-50 transition"
            title="Refresh Insights"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#7A8471]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-8 flex flex-col items-center justify-center gap-2 text-[#8A8A82]">
          <Loader2 className="w-6 h-6 animate-spin text-[#7A8471]" />
          <p className="text-xs">Analyzing transaction patterns & evaluating budget pacing...</p>
        </div>
      )}

      {/* Insights Content Grid */}
      {!isLoading && insights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          {/* 1. Monthly Summary & Takeaways */}
          <div className="p-4 rounded-2xl bg-[#F7F3F0] dark:bg-[#1E1C1A] border border-[#E5E0D8] dark:border-[#38332F] space-y-2.5">
            <div className="flex items-center gap-1.5 font-serif-natural font-semibold text-[#2D2D2A] dark:text-[#F3EFEA]">
              <TrendingUp className="w-4 h-4 text-[#7A8471]" />
              <span>Spending Dynamics</span>
            </div>
            <p className="text-[#5A5A54] dark:text-[#D4CFCA] leading-relaxed">
              {insights.summary}
            </p>
            {insights.topSpendingTakeaway && (
              <div className="pt-2 border-t border-[#E5E0D8] dark:border-[#38332F] text-[#6D6D66] dark:text-[#B5B0AA]">
                <span className="font-semibold text-[#2D2D2A] dark:text-[#F3EFEA]">Highlight: </span>
                {insights.topSpendingTakeaway}
              </div>
            )}
          </div>

          {/* 2. Budget Alerts & Warnings */}
          <div className="p-4 rounded-2xl bg-[#D68C70]/10 dark:bg-[#D68C70]/15 border border-[#D68C70]/30 space-y-2.5">
            <div className="flex items-center gap-1.5 font-serif-natural font-semibold text-[#C47D63] dark:text-[#E0A48E]">
              <AlertCircle className="w-4 h-4 text-[#D68C70]" />
              <span>Budget Thresholds</span>
            </div>
            {insights.budgetWarnings && insights.budgetWarnings.length > 0 ? (
              <ul className="space-y-1.5 text-[#5A5A54] dark:text-[#E8E4DF] list-disc list-inside">
                {insights.budgetWarnings.map((warn, i) => (
                  <li key={i} className="leading-snug">{warn}</li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center gap-2 text-[#5C6B50] dark:text-[#A4B399] font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>All categorized expenses are within allocated limits.</span>
              </div>
            )}
          </div>

          {/* 3. Savings Opportunities & Recommendations */}
          <div className="p-4 rounded-2xl bg-[#7A8471]/10 dark:bg-[#7A8471]/15 border border-[#7A8471]/30 space-y-2.5">
            <div className="flex items-center gap-1.5 font-serif-natural font-semibold text-[#5C6B50] dark:text-[#A4B399]">
              <Lightbulb className="w-4 h-4 text-[#7A8471]" />
              <span>Actionable Savings</span>
            </div>
            <ul className="space-y-1.5 text-[#5A5A54] dark:text-[#D4CFCA]">
              {insights.savingOpportunities?.map((opp, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-[#7A8471] font-bold">•</span>
                  <span>{opp}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      )}

      {/* Interactive AI Advisor Drawer */}
      {isAdvisorOpen && (
        <div className="mt-4 p-4 rounded-2xl border border-[#E5E0D8] dark:border-[#38332F] bg-[#F7F3F0] dark:bg-[#1E1C1A] space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-xs font-serif-natural font-semibold text-[#2D2D2A] dark:text-[#F3EFEA]">
            <MessageSquare className="w-4 h-4 text-[#7A8471]" />
            <span>Consult Gemini Financial Advisor</span>
          </div>

          <form onSubmit={handleAskAdvisor} className="flex gap-2">
            <input
              type="text"
              value={advisorQuestion}
              onChange={(e) => setAdvisorQuestion(e.target.value)}
              placeholder='e.g., "How much did I spend on food this month?" or "How can I save $150 next month?"'
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D8] dark:border-[#38332F] bg-white dark:bg-[#262421] text-[#2D2D2A] dark:text-[#F3EFEA] placeholder-[#9E9E96] focus:outline-none focus:ring-1 focus:ring-[#7A8471]"
            />
            <button
              type="submit"
              disabled={isAskingAdvisor || !advisorQuestion.trim()}
              className="px-4 py-2 bg-[#7A8471] hover:bg-[#687260] disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition active:scale-95"
            >
              {isAskingAdvisor ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Ask</span>
            </button>
          </form>

          {advisorAnswer && (
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#262421] border border-[#E5E0D8] dark:border-[#38332F] text-xs text-[#3C3C3C] dark:text-[#E8E4DF] whitespace-pre-wrap leading-relaxed shadow-xs">
              {advisorAnswer}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
