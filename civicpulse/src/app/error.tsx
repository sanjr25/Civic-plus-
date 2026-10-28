'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { 
  AlertTriangle, 
  Bot, 
  RefreshCw, 
  Home, 
  Ticket,
  LifeBuoy
} from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled CivicPulse Application Exception:', error);
  }, [error]);

  const handleAskAssistant = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-civic-chat', {
          detail: {
            query: `I encountered an internal Error 500 on CivicPulse ("${error.message || 'System Exception'}"). Please explain Error 500 and create an urgent support ticket for engineering.`,
          },
        })
      );
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full max-w-xl rounded-3xl border border-rose-200 bg-white p-8 sm:p-12 text-center shadow-lg">
        {/* Error Code Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 mb-6">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <span className="rounded-full bg-rose-100 px-3.5 py-1 text-xs font-mono font-bold text-rose-800 uppercase tracking-widest border border-rose-200">
          HTTP Error 500 • Internal System Exception
        </span>

        <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Municipal Dispatch Interruption
        </h1>

        <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-md mx-auto">
          An unexpected server error occurred while processing your municipal request. Our site operations center has logged the incident digest.
        </p>

        {error.digest && (
          <div className="mt-3 inline-block rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-500">
            Digest: {error.digest}
          </div>
        )}

        {/* Ask the Assistant Option (Required) */}
        <div className="mt-8 rounded-2xl border border-teal-200 bg-teal-50/60 p-5 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
              <Bot className="h-4 w-4 text-teal-700" />
              Automated Support Ticket Escalation
            </h4>
            <p className="text-xs text-teal-800 mt-1">
              Ask the assistant to log this Error 500 directly into our SQL Support Ticket queue so engineers can review it.
            </p>
          </div>

          <button
            onClick={handleAskAssistant}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 active:scale-98 transition whitespace-nowrap"
          >
            <Bot className="h-4 w-4" />
            Ask the assistant
          </button>
        </div>

        {/* Navigation Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-slate-800 transition"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <Home className="h-4 w-4" />
            Return to Safety
          </Link>
        </div>
      </div>
    </div>
  );
}
