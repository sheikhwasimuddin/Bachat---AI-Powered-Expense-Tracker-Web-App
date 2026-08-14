import React from 'react';

interface HomePageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="min-h-screen bg-[#f4f1ee] text-[#1f1d1a]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#a9b79f] text-[#1f1a17] shadow-lg shadow-[#a9b79f]/20">
              <span className="text-lg font-bold">B</span>
            </div>
            <div>
              <div className="text-2xl font-serif font-semibold">Bachat AI</div>
              <div className="text-xs uppercase tracking-[0.22em] text-[#6f6761]">Expense Tracker</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogin}
            className="rounded-full border border-[#d6cfc9] bg-white px-4 py-2 text-sm font-semibold text-[#2b2522] transition hover:bg-[#f8f4f1]"
          >
            Login
          </button>
        </header>

        <main className="flex flex-1 items-center py-10">
          <div className="grid w-full gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
            <section className="rounded-[28px] border border-[#dfd7d0] bg-white p-7 shadow-[0_30px_70px_rgba(43,35,31,0.08)] sm:p-9">
              <div className="inline-flex rounded-full border border-[#e8dfd8] bg-[#f9f5f1] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7a6f67]">
                AI-powered financial clarity
              </div>

              <h1 className="mt-5 text-4xl font-semibold leading-tight text-[#1f1a17] sm:text-5xl lg:text-6xl">
                Home for smarter expense tracking.
              </h1>

              <p className="mt-5 max-w-2xl text-base text-[#59524d] sm:text-lg">
                Track spending, set category budgets, and get practical AI insights that help you save more each month.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onGetStarted}
                  className="rounded-2xl bg-[#1f1a17] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#312b28]"
                >
                  Sign up free
                </button>
                <button
                  type="button"
                  onClick={onLogin}
                  className="rounded-2xl border border-[#d7cfc8] bg-[#faf7f4] px-5 py-3 text-sm font-semibold text-[#2f2926] transition hover:bg-[#f1ebe6]"
                >
                  I already have an account
                </button>
              </div>
            </section>

            <section className="grid gap-4">
              {[
                ['Live budget pulse', 'Instantly see if your category spending is within limit.'],
                ['AI spending coach', 'Get personalized monthly insights and saving opportunities.'],
                ['Fast expense capture', 'Add expenses in seconds and keep your records clean.'],
              ].map(([title, description]) => (
                <div key={title} className="rounded-3xl border border-[#ded5ce] bg-[#fdfbf9] p-5 shadow-[0_14px_35px_rgba(43,35,31,0.06)]">
                  <h2 className="text-lg font-semibold text-[#27211d]">{title}</h2>
                  <p className="mt-2 text-sm text-[#625b56]">{description}</p>
                </div>
              ))}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};