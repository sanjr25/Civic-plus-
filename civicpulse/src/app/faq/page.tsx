'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Database, 
  Bot, 
  FileText, 
  ArrowRight,
  Sparkles,
  Ticket
} from 'lucide-react';
import { getFAQs } from '@/lib/data';
import { FAQItem } from '@/types/database';
import { LoadingSpinner } from '@/components/ui/States';

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>('faq-01');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getFAQs(selectedCategory, searchQuery);
        setFaqs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedCategory, searchQuery]);

  const toggleAccordion = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleAskAssistant = (question: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-civic-chat', {
          detail: { query: question },
        })
      );
    }
  };

  const categories = [
    { key: 'all', label: 'All FAQs' },
    { key: 'reporting', label: 'Reporting & Defect Intake' },
    { key: 'sla', label: 'Priority & Resolution SLAs' },
    { key: 'tracking', label: 'Status & Case Tracking' },
    { key: 'privacy', label: 'Privacy & Security' },
    { key: 'staff', label: 'Staff Operations' },
    { key: 'general', label: 'General & Emergency' },
  ];

  return (
    <div className="min-h-screen bg-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1 text-xs font-semibold text-amber-900 mb-4">
            <Database className="h-3.5 w-3.5 text-[#C69214]" />
            <span>SQL Database Grounded</span>
            <span className="text-amber-400">•</span>
            <span>{faqs.length} Official Municipal Answers</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold font-classic text-[#0B132B] tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
            Everything you need to know about reporting road defects, tracking field work orders, and municipal SLA timelines.
          </p>

          {/* Search bar */}
          <div className="mt-6 relative max-w-lg mx-auto">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords (e.g. pothole, SLA, anonymous, 911)..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#C69214] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C69214] shadow-2xs transition"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setSelectedCategory(c.key)}
              className={`rounded-xl px-3.5 py-2 font-medium whitespace-nowrap transition ${
                selectedCategory === c.key
                  ? 'bg-[#0B132B] text-amber-300 shadow-2xs font-semibold'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs divide-y divide-slate-100">
          {loading ? (
            <div className="p-12">
              <LoadingSpinner message="Querying PostgreSQL FAQ knowledge base..." />
            </div>
          ) : faqs.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <HelpCircle className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <h3 className="font-semibold text-slate-800 text-sm">No FAQs matched your query</h3>
              <p className="text-xs text-slate-400 mt-1">
                Try searching for broader terms or ask our AI assistant to look it up.
              </p>
            </div>
          ) : (
            faqs.map((faq) => {
              const isExpanded = expandedId === faq.id;
              return (
                <div key={faq.id} className="transition">
                  <button
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full text-left p-5 flex items-start justify-between gap-4 hover:bg-slate-50/70 transition"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200">
                        {faq.display_order}
                      </span>
                      <span className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                        {faq.question}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 text-slate-400">
                      {isExpanded ? <ChevronUp className="h-5 w-5 text-[#C69214]" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed pl-14 animate-in fade-in duration-150">
                      <p className="whitespace-pre-wrap">{faq.answer}</p>

                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                        <span className="text-[11px] text-slate-400 capitalize">
                          Category: {faq.category}
                        </span>
                        <button
                          onClick={() => handleAskAssistant(`Tell me more about: "${faq.question}"`)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#C69214] hover:text-[#B8860B]"
                        >
                          <Bot className="h-3.5 w-3.5" />
                          Ask Assistant about this →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Support Ticket Escalation Banner */}
        <div className="rounded-2xl border border-slate-800 bg-[#0B132B] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-white shadow-lg">
          <div>
            <h3 className="text-base font-bold font-classic text-amber-400 flex items-center gap-2">
              <Ticket className="h-4 w-4 text-[#C69214]" />
              Can&apos;t find what you&apos;re looking for?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Open the AI Assistant in the bottom right corner to get an instant answer, or file an official Support Ticket for city staff review.
            </p>
          </div>

          <button
            onClick={() => handleAskAssistant('I need help that is not answered in the FAQs. Please file a support ticket for me.')}
            className="inline-flex items-center gap-2 rounded-xl bg-[#C69214] hover:bg-[#B8860B] px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-950 shadow-xs transition whitespace-nowrap"
          >
            <Bot className="h-4 w-4" />
            Ask Assistant & Open Ticket
          </button>
        </div>
      </div>
    </div>
  );
}
