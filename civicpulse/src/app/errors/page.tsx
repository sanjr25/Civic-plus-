'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  AlertTriangle, 
  Bot, 
  Play, 
  CheckCircle2, 
  HelpCircle, 
  ExternalLink,
  Code2,
  Terminal
} from 'lucide-react';
import { ERROR_CODES } from '@/lib/error-data';

export default function ErrorCodesPage() {
  const [testedCode, setTestedCode] = useState<number | null>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const runErrorTest = async (code: number) => {
    setTesting(true);
    setTestedCode(code);
    setTestResult(null);
    try {
      const res = await fetch(`/api/errors/${code}`);
      const json = await res.json();
      setTestResult({
        httpStatus: res.status,
        statusText: res.statusText,
        body: json,
      });
    } catch (err: any) {
      setTestResult({ error: err.message });
    } finally {
      setTesting(false);
    }
  };

  const handleAskAssistant = (code: number, title: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-civic-chat', {
          detail: { query: `Explain Error Code ${code} (${title}) in CivicPulse and what steps I should take.` },
        })
      );
    }
  };

  const codeList = Object.values(ERROR_CODES);

  return (
    <div className="min-h-screen bg-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1 text-xs font-semibold text-amber-800 mb-4">
            <Code2 className="h-3.5 w-3.5 text-amber-600" />
            <span>Civic-Tech Exception Protocols</span>
            <span className="text-amber-400">•</span>
            <span>8 Coded Scenarios</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Municipal Error Codes Catalog
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
            Comprehensive diagnostics guide for all 8 standard and site-specific HTTP error codes in CivicPulse. Test responses live or ask the assistant for explanation.
          </p>
        </div>

        {/* Live Test Output Console (if tested) */}
        {testedCode && testResult && (
          <div className="rounded-2xl border border-slate-900 bg-slate-900 p-5 text-white shadow-lg space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2 font-mono text-xs">
                <Terminal className="h-4 w-4 text-teal-400" />
                <span>Live HTTP Response Test: <strong>GET /api/errors/{testedCode}</strong></span>
              </div>
              <span className="rounded bg-rose-500/20 text-rose-300 font-mono text-xs px-2 py-0.5 border border-rose-500/40">
                HTTP {testResult.httpStatus}
              </span>
            </div>
            <pre className="text-xs font-mono text-teal-300 overflow-x-auto p-2 bg-slate-950 rounded-lg">
              {JSON.stringify(testResult.body, null, 2)}
            </pre>
          </div>
        )}

        {/* Error Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {codeList.map((err) => (
            <div
              key={err.code}
              className={`rounded-2xl border bg-white p-6 shadow-xs flex flex-col justify-between transition hover:shadow-md ${
                err.isSiteSpecific
                  ? 'border-purple-300 ring-1 ring-purple-100'
                  : 'border-slate-200'
              }`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-mono font-bold text-white shadow-2xs">
                    HTTP {err.code}
                  </span>
                  {err.isSiteSpecific ? (
                    <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-bold text-purple-800 border border-purple-200">
                      ★ Site-Specific Protocol
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-400">
                      Standard RFC
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {err.name} — {err.title}
                </h3>

                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  {err.description}
                </p>

                <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-3 space-y-1.5 text-xs text-slate-700">
                  <p>
                    <strong className="text-slate-900">Cause:</strong> {err.cause}
                  </p>
                  <p>
                    <strong className="text-slate-900">Solution:</strong> {err.solution}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => runErrorTest(err.code)}
                  disabled={testing}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Play className="h-3 w-3 text-teal-600" />
                  Test API Response
                </button>

                <button
                  onClick={() => handleAskAssistant(err.code, err.title)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900"
                >
                  <Bot className="h-3.5 w-3.5" />
                  Ask Assistant →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Error Pages Link Box */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Interactive Custom Error Pages
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              CivicPulse includes custom-designed 404 Not Found and 500 Server Error pages equipped with an &quot;Ask the assistant&quot; option.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/non-existent-page-demo-404"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Trigger 404 Page →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
