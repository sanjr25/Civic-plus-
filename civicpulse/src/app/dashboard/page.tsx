'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  PlusCircle, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Filter, 
  Flame,
  ArrowRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { getIssues, getDashboardStats } from '@/lib/data';
import { Issue, IssueCategory, IssueFilter, IssueStats, IssueStatus, CATEGORY_METADATA } from '@/types/database';
import { IssueCard } from '@/components/issues/IssueCard';
import { LoadingSpinner, EmptyState } from '@/components/ui/States';
import { useAuth } from '@/lib/auth-context';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [stats, setStats] = useState<IssueStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'upvotes' | 'priority'>('newest');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [issuesData, statsData] = await Promise.all([
          getIssues({
            searchQuery,
            category: selectedCategory,
            status: selectedStatus,
            sortBy,
          }),
          getDashboardStats(),
        ]);
        setIssues(issuesData);
        setStats(statsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [searchQuery, selectedCategory, selectedStatus, sortBy]);

  const urgentIssues = issues.filter(
    (i) => i.priority === 'urgent' && i.status !== 'resolved' && i.status !== 'closed'
  );

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-900 border border-amber-200">
                Citizen Portal
              </span>
              <span className="text-xs text-slate-400">• District 7 Community</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-classic text-[#0B132B]">
              Welcome back, {user?.full_name || 'Neighbor'}
            </h1>
            <p className="mt-1 text-sm text-slate-500 max-w-xl">
              Stay informed on street repairs, traffic improvements, and safety hazards in your municipality.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/map"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
            >
              <MapPin className="h-4 w-4 text-[#C69214]" />
              Incident Map
            </Link>

            <Link
              href="/report"
              className="inline-flex items-center gap-2 rounded-xl bg-[#C69214] hover:bg-[#B8860B] px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-950 shadow-xs transition"
            >
              <PlusCircle className="h-4 w-4" />
              Report Issue
            </Link>
          </div>
        </div>

        {/* Pulse Metric Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Active Reports
              </span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">
              {(stats?.reported || 0) + (stats?.inProgress || 0) + (stats?.underReview || 0)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Pending or under repair</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Resolved Repairs
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600">
              {stats?.resolved || 0}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">{stats?.resolutionRatePercent || 94}% resolution rate</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Critical Hazards
              </span>
              <AlertTriangle className="h-4 w-4 text-rose-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-rose-600">
              {urgentIssues.length}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Priority dispatch required</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Avg Response Time
              </span>
              <TrendingUp className="h-4 w-4 text-teal-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">
              {stats?.avgResolutionDays || '1.9'} Days
            </div>
            <p className="text-[11px] text-slate-500 mt-1">SLA benchmark met</p>
          </div>
        </div>

        {/* Urgent Alert Banner (if any) */}
        {urgentIssues.length > 0 && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-rose-100 p-2 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-rose-900">
                  {urgentIssues.length} Urgent Municipal Hazard{urgentIssues.length > 1 ? 's' : ''} in Progress
                </h3>
                <p className="text-xs text-rose-700 mt-0.5">
                  High-priority safety tickets actively monitored by city operations. Exercise caution in these areas.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {urgentIssues.slice(0, 2).map((item) => (
                    <Link
                      key={item.id}
                      href={`/issues/${item.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-rose-800 shadow-2xs border border-rose-200 hover:bg-rose-50 transition"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                      {item.title} →
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search issues by title, street address, or keyword..."
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-9 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#C69214] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C69214] transition"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort issues"
                className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs sm:text-sm font-medium text-slate-700 focus:border-[#C69214] focus:outline-none"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="upvotes">Sort: Most Upvoted</option>
                <option value="priority">Sort: Highest Urgency</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                aria-label="Filter by status"
                className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs sm:text-sm font-medium text-slate-700 focus:border-[#C69214] focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="reported">Reported</option>
                <option value="under_review">Under Review</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="font-semibold text-slate-500 whitespace-nowrap mr-1">Category:</span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`rounded-lg px-3 py-1.5 font-medium whitespace-nowrap transition ${
                selectedCategory === 'all'
                  ? 'bg-[#0B132B] text-amber-300 shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Categories
            </button>
            {Object.entries(CATEGORY_METADATA).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key as IssueCategory)}
                className={`rounded-lg px-3 py-1.5 font-medium whitespace-nowrap transition ${
                  selectedCategory === key
                    ? 'bg-[#0B132B] text-amber-300 font-semibold shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Issue Feed List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-classic text-[#0B132B]">
              Community Incident Feed ({issues.length})
            </h2>
            <Link
              href="/map"
              className="text-xs font-semibold text-[#C69214] hover:text-[#B8860B] flex items-center gap-1"
            >
              View Fullscreen Map <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner message="Querying municipal reports..." />
          ) : issues.length === 0 ? (
            <EmptyState
              title="No reports match your filters"
              description="Try adjusting your search terms or clearing the status/category filters."
              onReset={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedStatus('all');
              }}
              actionHref="/report"
              actionLabel="Report a New Problem"
            />
          ) : (
            <div className="space-y-4">
              {issues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          )}
        </div>

        {/* Municipal Knowledge Base & FAQs Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C69214]">
                SQL Knowledge Base
              </span>
              <h3 className="text-base font-bold font-classic text-[#0B132B] mt-0.5">
                Frequently Asked Municipal Questions
              </h3>
            </div>
            <Link
              href="/faq"
              className="text-xs font-semibold text-[#C69214] hover:text-[#B8860B] flex items-center gap-1"
            >
              Browse all 10+ FAQs <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <h4 className="font-bold text-slate-900 mb-1">
                How are repairs triaged?
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Cases are evaluated using hazard keywords and traffic corridor impact. High risks receive rapid 24-48h dispatch.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <h4 className="font-bold text-slate-900 mb-1">
                What does Error 403 mean?
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Staff triage desks require municipal authorization. Citizens can view public incident dossiers but cannot modify records.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <h4 className="font-bold text-slate-900 mb-1">
                Need more help?
              </h4>
              <p className="text-slate-600 leading-relaxed mb-2">
                Ask our AI Assistant in the bottom right corner to explain any issue or file a direct support ticket.
              </p>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(
                      new CustomEvent('open-civic-chat', {
                        detail: { query: 'Hello! I need help understanding how CivicPulse works.' },
                      })
                    );
                  }
                }}
                className="font-semibold text-[#C69214] hover:text-[#B8860B] inline-flex items-center gap-1"
              >
                Open Assistant Chat →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
