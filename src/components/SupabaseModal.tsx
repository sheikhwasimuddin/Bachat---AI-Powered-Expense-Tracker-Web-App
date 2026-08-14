import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Key, 
  Check, 
  Copy, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Loader2, 
  AlertCircle,
  ExternalLink,
  Code,
  LogIn,
  UserPlus
} from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onAuthSuccess: (user: any) => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  user,
  onAuthSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'auth' | 'sql' | 'env'>('auth');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMsg(null);
    setIsLoadingAuth(true);

    try {
      if (!isSupabaseConfigured || !supabase) {
        // Fallback for guest mode: set local guest user
        const guestUser = {
          id: `user-${Date.now()}`,
          email,
          user_metadata: { name: name || email.split('@')[0] }
        };
        localStorage.setItem('ai_expense_tracker_guest_user_v1', JSON.stringify(guestUser));
        onAuthSuccess(guestUser);
        setAuthSuccessMsg(`Signed in as ${guestUser.user_metadata.name} (Local Storage Session).`);
        setTimeout(() => onClose(), 800);
        return;
      }

      if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name: name || email.split('@')[0] }
          }
        });
        if (error) throw error;
        if (data.user) {
          onAuthSuccess(data.user);
          setAuthSuccessMsg('Account created successfully! Check your email if confirmation is required.');
          setTimeout(() => onClose(), 1200);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          onAuthSuccess(data.user);
          setAuthSuccessMsg('Welcome back! Signed in to Supabase.');
          setTimeout(() => onClose(), 800);
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleOAuthGoogle = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setAuthError('To use Google OAuth, configure your Supabase URL & Anon Key in .env first.');
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setAuthError(err.message || 'OAuth initialization failed');
    }
  };

  const SQL_SCHEMA_SNIPPET = `-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (user_id)
);

-- Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Tag',
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  note TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Budgets Table
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  monthly_limit NUMERIC(12, 2) NOT NULL CHECK (monthly_limit > 0),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, category_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can access own profile" ON public.profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own categories" ON public.categories FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can access own expenses" ON public.expenses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own budgets" ON public.budgets FOR ALL USING (auth.uid() = user_id);`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_SNIPPET);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl border border-[#E5E0D8] dark:border-[#38332F] bg-white dark:bg-[#23211F] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E5E0D8] dark:border-[#38332F] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-xs ${
              isSupabaseConfigured
                ? 'bg-[#7A8471] text-white'
                : 'bg-[#D68C70]/20 text-[#B55D42] dark:text-[#E0A48E]'
            }`}>
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-serif-natural font-bold text-[#2D2D2A] dark:text-[#F3EFEA]">
                  Supabase Backend & Auth
                </h3>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                  isSupabaseConfigured
                    ? 'bg-[#7A8471]/15 text-[#5C6B50] dark:text-[#A4B399] border-[#7A8471]/30'
                    : 'bg-[#D68C70]/15 text-[#B55D42] dark:text-[#E0A48E] border-[#D68C70]/30'
                }`}>
                  {isSupabaseConfigured ? 'Connected' : 'Local Fallback'}
                </span>
              </div>
              <p className="text-xs text-[#8A8A82] dark:text-[#9E9E96]">
                PostgreSQL database, Row Level Security & Authentication
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

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E5E0D8] dark:border-[#38332F] px-6 pt-3 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('auth')}
            className={`pb-2.5 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'auth'
                ? 'border-[#7A8471] text-[#7A8471] dark:text-[#A4B399]'
                : 'border-transparent text-[#8A8A82] hover:text-[#2D2D2A] dark:hover:text-[#F3EFEA]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Supabase Auth
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-2.5 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'border-[#7A8471] text-[#7A8471] dark:text-[#A4B399]'
                : 'border-transparent text-[#8A8A82] hover:text-[#2D2D2A] dark:hover:text-[#F3EFEA]'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            SQL Schema & RLS
          </button>
          <button
            onClick={() => setActiveTab('env')}
            className={`pb-2.5 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'env'
                ? 'border-[#7A8471] text-[#7A8471] dark:text-[#A4B399]'
                : 'border-transparent text-[#8A8A82] hover:text-[#2D2D2A] dark:hover:text-[#F3EFEA]'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            Config & Secrets
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          
          {activeTab === 'auth' && (
            <div className="space-y-4">
              
              {/* Active user status */}
              <div className="p-3.5 rounded-2xl bg-[#F7F3F0] dark:bg-[#1E1C1A] border border-[#E5E0D8] dark:border-[#38332F] flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-[#8A8A82]">Current Session:</p>
                  <p className="font-semibold text-[#2D2D2A] dark:text-[#F3EFEA]">{user?.email || 'demo@expensetracker.ai'}</p>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-lg bg-[#E5E0D8] dark:bg-[#2A2724] text-[#5A5A54] dark:text-[#D4CFCA] font-medium">
                  {isSupabaseConfigured ? 'Supabase User' : 'Local Guest'}
                </span>
              </div>

              {authError && (
                <div className="p-3.5 rounded-2xl bg-[#D68C70]/15 text-[#B55D42] dark:text-[#E0A48E] border border-[#D68C70]/40 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {authSuccessMsg && (
                <div className="p-3.5 rounded-2xl bg-[#7A8471]/15 text-[#5C6B50] dark:text-[#A4B399] border border-[#7A8471]/40 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{authSuccessMsg}</span>
                </div>
              )}

              {/* Mode switch */}
              <div className="flex rounded-xl bg-[#F7F3F0] dark:bg-[#1E1C1A] p-1 border border-[#E5E0D8] dark:border-[#38332F]">
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold text-center transition ${
                    authMode === 'signin'
                      ? 'bg-white dark:bg-[#2A2724] text-[#2D2D2A] dark:text-[#F3EFEA] shadow-xs'
                      : 'text-[#8A8A82]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold text-center transition ${
                    authMode === 'signup'
                      ? 'bg-white dark:bg-[#2A2724] text-[#2D2D2A] dark:text-[#F3EFEA] shadow-xs'
                      : 'text-[#8A8A82]'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailAuth} className="space-y-3">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6D6D66] dark:text-[#A8A49E] mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E5E0D8] dark:border-[#38332F] bg-[#FDFCFB] dark:bg-[#1E1C1A] text-[#2D2D2A] dark:text-[#F3EFEA] focus:outline-none focus:ring-1 focus:ring-[#7A8471]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-[#6D6D66] dark:text-[#A8A49E] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E5E0D8] dark:border-[#38332F] bg-[#FDFCFB] dark:bg-[#1E1C1A] text-[#2D2D2A] dark:text-[#F3EFEA] focus:outline-none focus:ring-1 focus:ring-[#7A8471]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#6D6D66] dark:text-[#A8A49E] mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E5E0D8] dark:border-[#38332F] bg-[#FDFCFB] dark:bg-[#1E1C1A] text-[#2D2D2A] dark:text-[#F3EFEA] focus:outline-none focus:ring-1 focus:ring-[#7A8471]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoadingAuth}
                  className="w-full py-2.5 rounded-xl bg-[#7A8471] hover:bg-[#687260] disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95"
                >
                  {isLoadingAuth ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : authMode === 'signup' ? (
                    <UserPlus className="w-4 h-4" />
                  ) : (
                    <LogIn className="w-4 h-4" />
                  )}
                  <span>{authMode === 'signup' ? 'Sign Up with Supabase' : 'Sign In'}</span>
                </button>
              </form>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-[#E5E0D8] dark:border-[#38332F] w-full" />
                <span className="bg-white dark:bg-[#23211F] px-2 text-[10px] text-[#8A8A82] uppercase font-bold absolute">
                  or
                </span>
              </div>

              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleOAuthGoogle}
                className="w-full py-2.5 rounded-xl border border-[#E5E0D8] dark:border-[#38332F] bg-[#FDFCFB] dark:bg-[#1E1C1A] text-[#2D2D2A] dark:text-[#F3EFEA] hover:bg-[#F7F3F0] dark:hover:bg-[#2A2724] font-semibold flex items-center justify-center gap-2 transition"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z" />
                </svg>
                <span>Continue with Google OAuth</span>
              </button>

            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#6D6D66] dark:text-[#A8A49E]">
                  Run this SQL in your Supabase SQL Editor to initialize all 4 tables & RLS security rules:
                </p>
                <button
                  onClick={copySqlToClipboard}
                  className="px-3 py-1.5 rounded-xl bg-[#7A8471] text-white font-semibold flex items-center gap-1 hover:bg-[#687260] transition shadow-xs"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
                </button>
              </div>

              <div className="relative rounded-2xl bg-[#1E1C1A] p-4 text-[#E5E0D8] font-mono text-[11px] overflow-x-auto max-h-64 border border-[#38332F]">
                <pre>{SQL_SCHEMA_SNIPPET}</pre>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#7A8471]/15 border border-[#7A8471]/30 text-[#5C6B50] dark:text-[#A4B399] text-[11px]">
                <span className="font-bold">Row Level Security Included: </span>
                Every policy ensures users can only read and modify their own financial logs.
              </div>
            </div>
          )}

          {activeTab === 'env' && (
            <div className="space-y-3">
              <p className="text-xs text-[#6D6D66] dark:text-[#A8A49E]">
                To connect your live Supabase project, provide these in your project's <code className="font-mono bg-[#F7F3F0] dark:bg-[#2A2724] px-1.5 py-0.5 rounded-lg border border-[#E5E0D8] dark:border-[#38332F]">.env</code> file:
              </p>

              <div className="p-4 rounded-2xl bg-[#1E1C1A] text-[#A4B399] font-mono text-[11px] space-y-1.5 border border-[#38332F]">
                <p className="text-[#8A8A82]"># Supabase Project URL</p>
                <p className="text-[#F3EFEA]">VITE_SUPABASE_URL="https://your-project.supabase.co"</p>
                <p className="pt-2 text-[#8A8A82]"># Supabase Public Anon Key</p>
                <p className="text-[#F3EFEA]">VITE_SUPABASE_ANON_KEY="eyJhbGciOi..."</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F7F3F0] dark:bg-[#1E1C1A] border border-[#E5E0D8] dark:border-[#38332F] text-[11px] text-[#6D6D66] dark:text-[#A8A49E]">
                <p className="font-serif-natural font-bold text-[#2D2D2A] dark:text-[#F3EFEA] mb-1">Offline-Ready Architecture:</p>
                <p>When Supabase credentials are not yet set up, the app operates seamlessly in Local Storage mode with instant local persistence and zero setup friction.</p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
