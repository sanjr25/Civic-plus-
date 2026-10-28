'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Building2, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Filter, 
  ArrowRight,
  UserCheck,
  Search,
  SlidersHorizontal,
  ChevronRight,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { getIssues } from '@/lib/data';
import { 
  Issue, 
  IssuePriority, 
  IssueStatus, 
  Department, 
  DEPARTMENT_METADATA, 
  CATEGORY_METADATA 
} from '@/types/database';
import { StatusBadge, PriorityBadge } from '@/components/ui/StatusBadge';
import { StaffActionDrawer } from '@/components/issues/StaffActionDrawer';
import { LoadingSpinner, EmptyState } from '@/components/ui/States';
import { useAuth } from '@/lib/auth-context';

export default function StaffOperationsDashboard() {
  const { user, role, isStaff, switchRole } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [activeTab, setActiveTab] = useState<'intake' | 'dispatch' | 'resolved'>('dispatch');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected issue for StaffActionDrawer
  const [drawerIssue, setDrawerIssue] = useState<Issue | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getIssues();
      setIssues(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleIssueUpdated = (updated: Issue) => {
    setIssues((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  };

  // Queue categorization
  const intakeQueue = issues.filter((i) => i.status === 'reported');
  const dispatchQueue = issues.filter((i) => i.status === 'in_progress' || i.status === 'under_review');
  const resolvedQueue = issues.filter((i) => i.status === 'resolved' || i.status === 'closed');

  // Filter current queue by department & search
  const currentQueue =
    activeTab === 'intake'
      ? intakeQueue
      : activeTab === 'dispatch'
      ? dispatchQueue
      : resolvedQueue;

  const filteredQueue = currentQueue.filter((item) => {
    if (selectedDepartment !== 'all' && item.assigned_department !== selectedDepartment) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.address.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        (item.assigned_to && item.assigned_to.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Reviewer Note if in Citizen role */}
        {!isStaff && (
          <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-teal-900 shadow-2xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-teal-700 flex-shrink-0" />
              <span>
                You are currently previewing as <strong>Citizen ({user?.full_name})</strong>. Switch to Staff mode to test official municipal triage and assignment capabilities.
              </span>
            </div>
            <button
              onClick={() => switchRole('staff')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-1.5 font-semibold text-white hover:bg-teal-800 transition whitespace-nowrap"
            >
              <UserCheck className="h-3.5 w-3.5" />
              Switch to Staff Inspector Mode
            </button>
          </div>
        )}

        {/* Operational Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-md bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white">
                Municipal Operations Center
              </span>
              <span className="text-xs text-slate-400">• Role-Based Access Control Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Field Work Orders & Triage Desk
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Review citizen reports, calibrate priority, assign crews, and record verified resolutions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
            >
              <RefreshCw className="h-4 w-4 text-slate-500" />
              Refresh Queues
            </button>

            <Link
              href="/analytics"
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition"
            >
              SLA Analytics →
            </Link>
          </div>
        </div>

        {/* Operational Metric Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-2xs">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Intake Awaiting Triage
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-amber-900">{intakeQueue.length}</span>
              <span className="text-xs text-amber-700 font-medium">New tickets</span>
            </div>
          </div>

          <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4 shadow-2xs">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
              Active In-Field Deployments
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-teal-900">{dispatchQueue.length}</span>
              <span className="text-xs text-teal-700 font-medium">In progress</span>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-2xs">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Resolved & QA Verified
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-emerald-900">{resolvedQueue.length}</span>
              <span className="text-xs text-emerald-700 font-medium">Closed records</span>
            </div>
          </div>
        </div>

        {/* Queue Tabs & Department Filter Bar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            {/* Queue Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('dispatch')}
                className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition ${
                  activeTab === 'dispatch'
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Active Dispatch ({dispatchQueue.length})
              </button>
              <button
                onClick={() => setActiveTab('intake')}
                className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition ${
                  activeTab === 'intake'
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Intake / Unassigned ({intakeQueue.length})
              </button>
              <button
                onClick={() => setActiveTab('resolved')}
                className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition ${
                  activeTab === 'resolved'
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Resolved Archive ({resolvedQueue.length})
              </button>
            </div>

            {/* Department Filter */}
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-400" />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value as any)}
                aria-label="Filter by department"
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-teal-600 focus:outline-none"
              >
                <option value="all">All City Departments</option>
                {Object.entries(DEPARTMENT_METADATA).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search inside queue */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter current queue by case ID, title, street, or assigned technician..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Queue Table */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          {loading ? (
            <LoadingSpinner message="Querying staff work order database..." />
          ) : filteredQueue.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <FolderOpen className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <h3 className="font-semibold text-slate-800 text-sm">No cases in this queue</h3>
              <p className="text-xs text-slate-400 mt-1">
                There are no open tickets matching your selected department filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3.5">Ref / Title</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Priority</th>
                    <th className="px-4 py-3.5">Assigned Department & Crew</th>
                    <th className="px-4 py-3.5">Location</th>
                    <th className="px-4 py-3.5 text-right">Staff Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredQueue.map((item) => {
                    const catMeta = CATEGORY_METADATA[item.category] || CATEGORY_METADATA.other;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition">
                        {/* Ref / Title */}
                        <td className="px-4 py-3.5 max-w-xs">
                          <span className="font-mono text-[10px] font-bold text-slate-400 block">
                            #{item.id.toUpperCase()}
                          </span>
                          <Link
                            href={`/issues/${item.id}`}
                            className="font-semibold text-slate-900 hover:text-teal-700 transition line-clamp-1"
                          >
                            {item.title}
                          </Link>
                          <span className="text-[11px] text-slate-400">{catMeta.label}</span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <StatusBadge status={item.status} size="sm" />
                        </td>

                        {/* Priority */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <PriorityBadge priority={item.priority} size="sm" />
                        </td>

                        {/* Department & Crew */}
                        <td className="px-4 py-3.5">
                          <div className="font-medium text-slate-800">
                            {item.assigned_department ? item.assigned_department.replace('_', ' ') : 'Unassigned'}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {item.assigned_to || 'Awaiting dispatch'}
                          </div>
                        </td>

                        {/* Location */}
                        <td className="px-4 py-3.5 max-w-[200px] text-slate-600 truncate">
                          📍 {item.address}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => setDrawerIssue(item)}
                              className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800 border border-teal-200 hover:bg-teal-100 transition"
                            >
                              <ShieldCheck className="h-3 w-3" />
                              Manage
                            </button>

                            <Link
                              href={`/issues/${item.id}`}
                              className="inline-flex items-center rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                            >
                              Inspect
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Staff Action Drawer */}
      {drawerIssue && (
        <StaffActionDrawer
          issue={drawerIssue}
          isOpen={!!drawerIssue}
          onClose={() => setDrawerIssue(null)}
          onIssueUpdated={handleIssueUpdated}
        />
      )}
    </div>
  );
}
