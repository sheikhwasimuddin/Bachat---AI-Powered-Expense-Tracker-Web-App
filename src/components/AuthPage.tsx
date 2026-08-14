import React, { useState } from 'react';

interface AuthPageProps {
  mode: 'login' | 'signup';
  onModeChange: (mode: 'login' | 'signup') => void;
  onLogin: (payload: { email: string; password: string }) => { ok: boolean; message?: string };
  onSignup: (payload: { name: string; email: string; password: string }) => { ok: boolean; message?: string };
}

export const AuthPage: React.FC<AuthPageProps> = ({ mode, onModeChange, onLogin, onSignup }) => {
  const [formMode, setFormMode] = useState<'login' | 'signup'>(mode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  React.useEffect(() => {
    setFormMode(mode);
  }, [mode]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (formMode === 'signup') {
      const result = onSignup({ name, email, password });
      if (!result.ok) {
        setError(result.message || 'Unable to create account.');
      }
    } else {
      const result = onLogin({ email, password });
      if (!result.ok) {
        setError(result.message || 'Invalid email or password.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f1ee] text-[#1f1d1a]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <section className="flex flex-1 items-center justify-center bg-[#1f1a17] px-6 py-12 text-[#f5efe8] lg:px-12">
          <div className="max-w-xl space-y-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#a9b79f] text-[#1f1a17] shadow-lg shadow-[#a9b79f]/20">
                <span className="text-lg font-bold">A</span>
              </div>
              <div>
                <div className="text-2xl font-serif font-semibold">Aura AI</div>
                <div className="text-xs uppercase tracking-[0.22em] text-[#d5cfc8]">Expense Tracker</div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d8d0ca]">
                Smart money habits
              </div>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                Track spending smarter with AI-powered insight.
              </h1>
              <p className="max-w-lg text-base text-[#d7d0ca]">
                Organize your budget, set category goals, and turn everyday purchases into useful financial guidance.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ['12K+', 'Transactions tracked'],
                ['87%', 'Budget health score'],
                ['24/7', 'AI financial guidance'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-semibold text-[#f4efe9]">{value}</div>
                  <div className="mt-1 text-xs text-[#d5cfc8]">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex flex-1 items-center justify-center px-6 py-10 sm:px-8">
          <div className="w-full max-w-md rounded-[28px] border border-[#e3ddd7] bg-white p-7 shadow-[0_30px_80px_rgba(32,24,20,0.08)]">
            <div className="mb-6 flex rounded-full bg-[#f4efe8] p-1">
              {(['login', 'signup'] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => onModeChange(item)}
                  className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    formMode === item ? 'bg-[#1f1a17] text-white shadow-sm' : 'text-[#534d49]'
                  }`}
                >
                  {item === 'login' ? 'Login' : 'Sign up'}
                </button>
              ))}
            </div>

            <div className="mb-5">
              <h2 className="text-2xl font-semibold text-[#1c1917]">
                {formMode === 'login' ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="mt-2 text-sm text-[#675f5a]">
                {formMode === 'login'
                  ? 'Sign in to continue your money journey.'
                  : 'Start tracking your spending with AI-powered insights.'}
              </p>
            </div>

            <form className="space-y-4" onSubmit={submit}>
              {formMode === 'signup' && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#4f4a47]">Full name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border border-[#e4ddd8] bg-[#faf7f5] px-4 py-3 text-sm outline-none transition focus:border-[#8fa288] focus:ring-2 focus:ring-[#a9b79f]/30"
                    placeholder="Jane Smith"
                    required
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#4f4a47]">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-[#e4ddd8] bg-[#faf7f5] px-4 py-3 text-sm outline-none transition focus:border-[#8fa288] focus:ring-2 focus:ring-[#a9b79f]/30"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#4f4a47]">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-[#e4ddd8] bg-[#faf7f5] px-4 py-3 text-sm outline-none transition focus:border-[#8fa288] focus:ring-2 focus:ring-[#a9b79f]/30"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-[#f3d6d1] bg-[#fff1ef] px-3 py-2 text-sm text-[#8d4239]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-2xl bg-[#1f1a17] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#312b28]"
              >
                {formMode === 'login' ? 'Login' : 'Create account'}
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-[#7d7671]">
              {formMode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => onModeChange(formMode === 'login' ? 'signup' : 'login')}
                className="font-semibold text-[#24483c] underline underline-offset-2"
              >
                {formMode === 'login' ? 'Create account' : 'Login'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
