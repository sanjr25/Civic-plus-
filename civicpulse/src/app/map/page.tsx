'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { 
  Filter, 
  Search, 
  Layers, 
  MapPin, 
  PlusCircle, 
  SlidersHorizontal,
  ChevronRight,
  RefreshCw,
  X,
  List
} from 'lucide-react';
import Link from 'next/link';
import { getIssues } from '@/lib/data';
import { 
  Issue, 
  IssueCategory, 
  IssuePriority, 
  IssueStatus, 
  CATEGORY_METADATA, 
  STATUS_METADATA 
} from '@/types/database';
import { StatusBadge, PriorityBadge } from '@/components/ui/StatusBadge';
import { LoadingSpinner } from '@/components/ui/States';

// Dynamic import with SSR disabled to prevent Leaflet window reference errors
const LeafletIssueMap = dynamic(
  () => import('@/components/map/LeafletIssueMap'),
  {
    ssr: false,
    loading: () => <LoadingSpinner message="Rendering municipal geospatial layers..." />,
  }
);

export default function InteractiveMapPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<IssuePriority | 'all'>('all');

  // Map state
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getIssues({
        searchQuery,
        category: selectedCategory,
        status: selectedStatus,
        priority: selectedPriority,
      });
      setIssues(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, selectedCategory, selectedStatus, selectedPriority]);

  const handleSelectIssue = (issue: Issue) => {
    setSelectedIssueId(issue.id);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 overflow-hidden">
      {/* Top Filter Bar */}
      <div className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6 shadow-2xs z-30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search & Counter */}
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by street, landmark, or keyword..."
                className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap hidden sm:inline">
              Showing <strong>{issues.length}</strong> active pins
            </span>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {/* Category */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-teal-600 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_METADATA).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-teal-600 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="reported">Reported</option>
              <option value="under_review">Under Review</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            {/* Priority */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as any)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-teal-600 focus:outline-none"
            >
              <option value="all">All Urgencies</option>
              <option value="urgent">Urgent Only</option>
              <option value="high">High & Urgent</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Toggle Sidebar */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium flex items-center gap-1.5 transition ${
                sidebarOpen
                  ? 'border-teal-600 bg-teal-50 text-teal-800'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sidebar</span>
            </button>

            {/* Submit Action */}
            <Link
              href="/report"
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-teal-700 transition"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Report</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Map View & Synced Sidebar */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Leaflet Map Full View */}
        <div className="flex-1 relative h-full w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center bg-slate-100">
              <LoadingSpinner message="Initializing OpenStreetMap tiles and incidents..." />
            </div>
          ) : (
            <LeafletIssueMap
              issues={issues}
              selectedIssueId={selectedIssueId}
              onSelectIssue={handleSelectIssue}
              heightClass="h-full"
            />
          )}
        </div>

        {/* Synced Incident Drawer / Sidebar */}
        {sidebarOpen && (
          <div className="w-80 md:w-96 border-l border-slate-200 bg-white flex flex-col z-20 shadow-md">
            <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-teal-600" />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Incident Index ({issues.length})
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-2">
              {issues.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No issues found matching your current filter criteria.
                </div>
              ) : (
                issues.map((issue) => {
                  const isSelected = issue.id === selectedIssueId;
                  const catMeta = CATEGORY_METADATA[issue.category] || CATEGORY_METADATA.other;

                  return (
                    <div
                      key={issue.id}
                      onClick={() => handleSelectIssue(issue)}
                      className={`p-3 rounded-xl cursor-pointer transition text-left border ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/50 shadow-2xs'
                          : 'border-transparent hover:bg-slate-50 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <StatusBadge status={issue.status} size="sm" />
                        <PriorityBadge priority={issue.priority} size="sm" />
                      </div>

                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-1">
                        {issue.title}
                      </h4>

                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                        📍 {issue.address}
                      </p>

                      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                        <span>▲ {issue.upvotes_count} upvotes</span>
                        <Link
                          href={`/issues/${issue.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-0.5"
                        >
                          Details <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
