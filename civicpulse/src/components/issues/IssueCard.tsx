'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Issue, CATEGORY_METADATA } from '@/types/database';
import { StatusBadge, PriorityBadge } from '@/components/ui/StatusBadge';
import { MapPin, ThumbsUp, ArrowRight, Clock, Building2 } from 'lucide-react';
import { toggleUpvote } from '@/lib/data';
import { useAuth } from '@/lib/auth-context';

interface IssueCardProps {
  issue: Issue;
  onSelect?: () => void;
  isSelected?: boolean;
}

export function IssueCard({ issue, onSelect, isSelected }: IssueCardProps) {
  const { user } = useAuth();
  const [upvotes, setUpvotes] = useState(issue.upvotes_count);
  const [hasUpvoted, setHasUpvoted] = useState(issue.has_upvoted || false);
  const [isUpvoting, setIsUpvoting] = useState(false);

  const catMeta = CATEGORY_METADATA[issue.category] || CATEGORY_METADATA.other;

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUpvoting) return;
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

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`group relative flex flex-col sm:flex-row overflow-hidden rounded-xl border bg-white transition-all duration-200 hover:shadow-md ${
        isSelected
          ? 'border-teal-600 ring-2 ring-teal-600/20 shadow-sm'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Thumbnail */}
      {issue.image_url ? (
        <div className="relative h-44 sm:h-auto sm:w-48 flex-shrink-0 bg-slate-100 overflow-hidden">
          <img
            src={issue.image_url}
            alt={issue.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-2.5 left-2.5">
            <span className="rounded-md bg-slate-900/80 backdrop-blur px-2 py-0.5 text-[11px] font-semibold text-white">
              {catMeta.label}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex h-32 sm:h-auto sm:w-44 flex-shrink-0 items-center justify-center bg-slate-50 border-r border-slate-100 text-slate-400">
          <span className="text-xs font-medium">{catMeta.label}</span>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <StatusBadge status={issue.status} size="sm" />
            <PriorityBadge priority={issue.priority} size="sm" />
            {issue.assigned_department && issue.assigned_department !== 'unassigned' && (
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                <Building2 className="h-3 w-3" />
                {issue.assigned_department.replace('_', ' ')}
              </span>
            )}
          </div>

          {/* Title */}
          <Link
            href={`/issues/${issue.id}`}
            className="text-base font-semibold text-slate-900 group-hover:text-teal-700 transition line-clamp-1"
          >
            {issue.title}
          </Link>

          {/* Description snippet */}
          <p className="mt-1 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {issue.description}
          </p>
        </div>

        {/* Footer info */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <span className="truncate max-w-[180px] sm:max-w-[240px]">{issue.address}</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>{formatDate(issue.created_at)}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleUpvote}
              title={hasUpvoted ? 'Remove upvote' : 'I am affected by this issue too'}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                hasUpvoted
                  ? 'bg-teal-50 text-teal-700 border border-teal-200'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <ThumbsUp className={`h-3.5 w-3.5 ${hasUpvoted ? 'fill-teal-600 text-teal-600' : ''}`} />
              <span>{upvotes}</span>
            </button>

            <Link
              href={`/issues/${issue.id}`}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-teal-700 transition"
            >
              Details
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
