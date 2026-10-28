'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  ThumbsUp, 
  ArrowRight,
  Filter,
  Search
} from 'lucide-react';
import { getIssues } from '@/lib/data';
import { Issue, IssueStatus } from '@/types/database';
import { IssueCard } from '@/components/issues/IssueCard';
import { LoadingSpinner, EmptyState } from '@/components/ui/States';
import { useAuth } from '@/lib/auth-context';

export default function MyReportsPage() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'submitted' | 'upvoted'>('submitted');
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'all'>('all');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const all = await getIssues();
        setIssues(all);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter based on submitted or upvoted
  const mySubmittedIssues = issues.filter((i) => {
    // If matching user ID or submitted by name Elena Rostova (our demo persona)
    const isOwner =
      i.submitted_by === user?.id ||
      i.submitted_by_name.toLowerCase() === (user?.full_name || '').toLowerCase() ||
      i.id === 'iss-001'; // Default initial persona report
    if (!isOwner) return false;
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;
    return true;
  });

  const myUpvotedIssues = issues.filter((i) => {
    if (!i.has_upvoted) return false;
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;
    return true;
  });

  const displayList = tab === 'submitted' ? mySubmittedIssues : myUpvotedIssues;

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-md bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-800 border border-teal-200">
                Citizen Activity Tracker
              </span>
              <span className="text-xs text-slate-400">• Authenticated as {user?.full_name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              My Civic Reports & Endorsements
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Track the live resolution status, crew assignments, and supervisor sign-offs for issues you filed.
            </p>
          </div>

          <Link
            href="/report"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-teal-700 transition"
          >
            <PlusCircle className="h-4 w-4" />
            File New Report
          </Link>
        </div>

        {/* Tab Switcher & Status Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab('submitted')}
              className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition ${
                tab === 'submitted'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Reports I Filed ({mySubmittedIssues.length})
            </button>
            <button
              onClick={() => setTab('upvoted')}
              className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition ${
                tab === 'upvoted'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Reports I Upvoted ({myUpvotedIssues.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-teal-600 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="reported">Reported</option>
              <option value="under_review">Under Review</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Content Feed */}
        {loading ? (
          <LoadingSpinner message="Fetching your personal reports..." />
        ) : displayList.length === 0 ? (
          <EmptyState
            title={tab === 'submitted' ? 'No reports filed yet' : 'No upvoted reports'}
            description={
              tab === 'submitted'
                ? 'You have not submitted any infrastructure tickets yet. Spot a defect in your neighborhood to get started.'
                : 'Browse the incident map and upvote issues in your area that need city attention.'
            }
            actionHref="/report"
            actionLabel="Submit an Issue"
          />
        ) : (
          <div className="space-y-4">
            {displayList.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
