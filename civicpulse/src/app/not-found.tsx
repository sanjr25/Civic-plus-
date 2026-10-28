'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FileQuestion, 
  Bot, 
  Home, 
  MapPin, 
  ArrowLeft, 
  Search,
  AlertCircle
} from 'lucide-react';

export default function NotFound() {
  const handleAskAssistant = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-civic-chat', {
          detail: {
            query: 'I encountered a 404 Page Not Found error at an invalid address. Can you help me locate the page, explain Error 404, or file a support ticket?',
          },
        })
      );
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 text-center shadow-lg">
        {/* Error Code Pill */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 mb-6">
          <FileQuestion className="h-8 w-8" />
        </div>

        <span className="rounded-full bg-slate-100 px-3.5 py-1 text-xs font-mono font-bold text-slate-700 uppercase tracking-widest border border-slate-200">
          HTTP Error 404 • Resource Not Found
        </span>

        <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Municipal Route Not Found
        </h1>

        <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-md mx-auto">
          The requested page, ticket dossier, or URL endpoint does not exist in our public city records. It may have been archived or entered incorrectly.
        </p>

        {/* Ask the Assistant Option (Required) */}
        <div className="mt-8 rounded-2xl border border-teal-200 bg-teal-50/60 p-5 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
              <Bot className="h-4 w-4 text-teal-700" />
              Need Assistance Finding Something?
            </h4>
            <p className="text-xs text-teal-800 mt-1">
              Ask our AI Assistant to lookup the correct case number, explain Error 404, or open an official support ticket.
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
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-slate-800 transition"
          >
            <Home className="h-4 w-4" />
            Return to Home
          </Link>

          <Link
            href="/map"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <MapPin className="h-4 w-4 text-teal-600" />
            Explore Incident Map
          </Link>

          <Link
            href="/faq"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Browse FAQs
          </Link>
        </div>
      </div>
    </div>
  );
}
