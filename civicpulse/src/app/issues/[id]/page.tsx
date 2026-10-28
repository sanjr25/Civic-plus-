'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Building2, 
  ShieldCheck, 
  ThumbsUp, 
  CheckCircle2, 
  AlertTriangle, 
  Share2, 
  Calendar,
  FileCheck,
  User,
  ExternalLink
} from 'lucide-react';
import { getIssueById, getIssueTimeline, toggleUpvote } from '@/lib/data';
import { Issue, IssueTimelineEvent, CATEGORY_METADATA, DEPARTMENT_METADATA } from '@/types/database';
import { StatusBadge, PriorityBadge } from '@/components/ui/StatusBadge';
import { TimelineView } from '@/components/issues/TimelineView';
import { StaffActionDrawer } from '@/components/issues/StaffActionDrawer';
import { LoadingSpinner, ErrorState } from '@/components/ui/States';
import { useAuth } from '@/lib/auth-context';

export default function IssueDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const router = useRouter();
  const { user, isStaff } = useAuth();

  const [issue, setIssue] = useState<Issue | null>(null);
  const [timeline, setTimeline] = useState<IssueTimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Upvotes
  const [upvotes, setUpvotes] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(false);

  // Staff Drawer Modal
  const [isStaffDrawerOpen, setIsStaffDrawerOpen] = useState(false);

  useEffect(() => {
    async function fetchIssue() {
      setLoading(true);
      try {
        const found = await getIssueById(id);
        if (!found) {
          setError(true);
        } else {
          setIssue(found);
          setUpvotes(found.upvotes_count);
          setHasUpvoted(found.has_upvoted || false);
          const tl = await getIssueTimeline(id);
          setTimeline(tl);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchIssue();
  }, [id]);

  const handleUpvote = async () => {
    if (!issue || isUpvoting) return;
    setIsUpvoting(true);
    try {
      const res = await toggleUpvote(issue.id, user?.id || 'guest');
      setUpvotes(res.count);
      setHasUpvoted(res.hasUpvoted);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleIssueUpdated = (updated: Issue) => {
    setIssue(updated);
    // Reload timeline
    getIssueTimeline(updated.id).then((tl) => setTimeline(tl));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-16">
        <LoadingSpinner message="Retrieving official municipal record..." />
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="mx-auto max-w-lg">
          <ErrorState
            title="Issue Record Not Found"
            message={`No public infrastructure ticket matches identifier #${id}. It may have been archived or removed.`}
            onRetry={() => router.push('/map')}
          />
        </div>
      </div>
    );
  }

  const catMeta = CATEGORY_METADATA[issue.category] || CATEGORY_METADATA.other;
  const deptMeta = issue.assigned_department
    ? DEPARTMENT_METADATA[issue.assigned_department]
    : undefined;

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>

          <div className="flex items-center gap-2">
            {/* Share / Copy link */}
            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Direct link to case copied to clipboard!');
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition"
            >
              <Share2 className="h-3.5 w-3.5 text-slate-500" />
              Share Case
            </button>

            {/* Staff Action Drawer Trigger */}
            <button
              onClick={() => setIsStaffDrawerOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 active:scale-[0.98] transition"
            >
              <ShieldCheck className="h-4 w-4 text-teal-400" />
              <span>{isStaff ? 'Staff Operations Desk' : 'Staff Actions (Reviewer Demo)'}</span>
            </button>
          </div>
        </div>

        {/* Case Banner */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider">
              #{issue.id.toUpperCase()}
            </span>
            <span className="text-slate-300">•</span>
            <StatusBadge status={issue.status} size="md" />
            <PriorityBadge priority={issue.priority} size="md" />
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
              {catMeta.label}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {issue.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500 border-t border-slate-100 pt-4">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-teal-600 flex-shrink-0" />
              <strong>{issue.address}</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              Reported on {new Date(issue.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-slate-400" />
              By {issue.submitted_by_name}
            </span>
          </div>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main 2-Span Column: Photo, Description, Resolution, Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Primary Evidence Photo */}
            {issue.image_url && (
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-xs max-h-[420px]">
                <img
                  src={issue.image_url}
                  alt={issue.title}
                  className="w-full h-full object-cover max-h-[420px]"
                />
              </div>
            )}

            {/* Description Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 mb-3">
                Citizen Incident Summary
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {issue.description}
              </p>

              {/* Upvote & Endorsement Box */}
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-slate-50 border border-slate-200/80 p-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Are you affected by this defect as well?
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Community upvotes help city triage prioritize high-traffic hazards.
                  </p>
                </div>
                <button
                  onClick={handleUpvote}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-2xs transition ${
                    hasUpvoted
                      ? 'bg-teal-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <ThumbsUp className={`h-4 w-4 ${hasUpvoted ? 'fill-white' : 'text-slate-500'}`} />
                  <span>{hasUpvoted ? 'Upvoted' : 'I am affected too'}</span>
                  <span className="ml-1 rounded-full bg-black/10 px-1.5 py-0.2 text-[10px]">
                    {upvotes}
                  </span>
                </button>
              </div>
            </div>

            {/* Verified Official Resolution (When Resolved) */}
            {issue.status === 'resolved' && (
              <div className="rounded-2xl border border-emerald-300 bg-emerald-50/50 p-6 shadow-xs">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-base mb-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  Official Repair & Verification Record
                </div>
                <p className="text-xs text-emerald-800 mb-4">
                  Completed on {issue.resolved_at ? new Date(issue.resolved_at).toLocaleString() : 'Recent'}. Validated by municipal supervisor.
                </p>

                {issue.resolution_notes && (
                  <div className="rounded-xl bg-white p-4 border border-emerald-200 text-xs sm:text-sm text-slate-800 leading-relaxed mb-4">
                    <strong className="block text-emerald-950 font-semibold mb-1">
                      Maintenance Summary:
                    </strong>
                    {issue.resolution_notes}
                  </div>
                )}

                {issue.resolution_image_url && (
                  <div>
                    <span className="block text-xs font-semibold text-emerald-950 mb-2">
                      After-Repair Photo Evidence:
                    </span>
                    <div className="rounded-xl overflow-hidden border border-emerald-200 h-52 max-w-md">
                      <img
                        src={issue.resolution_image_url}
                        alt="Completed repair verification"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Location Map Preview */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-teal-600" />
                Geospatial Coordinates
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Exact GIS location for field repair vehicles: {issue.latitude.toFixed(6)}, {issue.longitude.toFixed(6)}
              </p>

              {/* Static OSM map embed or link */}
              <div className="relative rounded-xl overflow-hidden border border-slate-200 h-56 bg-slate-100 flex items-center justify-center">
                <iframe
                  title="OpenStreetMap Location"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${issue.longitude - 0.005}%2C${issue.latitude - 0.003}%2C${issue.longitude + 0.005}%2C${issue.latitude + 0.003}&layer=mapnik&marker=${issue.latitude}%2C${issue.longitude}`}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>Address: <strong>{issue.address}</strong></span>
                <Link
                  href={`/map`}
                  className="font-semibold text-teal-700 hover:text-teal-900"
                >
                  View on Master Map →
                </Link>
              </div>
            </div>

            {/* Complete Resolution & Audit History Timeline */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <TimelineView
                issueId={issue.id}
                initialEvents={timeline}
                onEventAdded={(ev) => setTimeline((prev) => [...prev, ev])}
              />
            </div>
          </div>

          {/* Right 1-Span Column: Municipal Work Order & Department Info */}
          <div className="space-y-6">
            {/* Work Order Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-500">
                Work Order Dispatch
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Responsible Department</span>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                    <Building2 className="h-4 w-4 text-teal-600" />
                    <span>{deptMeta?.label || 'Department of Public Works'}</span>
                  </div>
                  {deptMeta?.contactEmail && (
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {deptMeta.contactEmail}
                    </span>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <span className="text-slate-400 block mb-0.5">Assigned Field Unit</span>
                  <span className="font-semibold text-slate-900 block">
                    {issue.assigned_to || 'Pending Crew Triage'}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <span className="text-slate-400 block mb-0.5">Target Resolution SLA</span>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                    <Clock className="h-3.5 w-3.5 text-sky-600" />
                    <span>Within {issue.estimated_days_to_resolve || 3} business days</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <span className="text-slate-400 block mb-0.5">Last Status Revision</span>
                  <span className="text-slate-700">
                    {new Date(issue.updated_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Staff Drawer Quick Trigger */}
              <button
                onClick={() => setIsStaffDrawerOpen(true)}
                className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-50 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition"
              >
                <ShieldCheck className="h-4 w-4 text-teal-600" />
                Manage Case & Assignments
              </button>
            </div>

            {/* Transparency Note */}
            <div className="rounded-2xl border border-teal-200 bg-teal-50/40 p-5 text-xs text-teal-950 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-teal-900">
                <FileCheck className="h-4 w-4 text-teal-700" />
                Municipal Transparency Promise
              </div>
              <p className="leading-relaxed text-teal-800">
                All records published on CivicPulse adhere to open city governance guidelines. Official resolution changes are protected by Row-Level Security policies.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Action Drawer Modal */}
      <StaffActionDrawer
        issue={issue}
        isOpen={isStaffDrawerOpen}
        onClose={() => setIsStaffDrawerOpen(false)}
        onIssueUpdated={handleIssueUpdated}
      />
    </div>
  );
}
