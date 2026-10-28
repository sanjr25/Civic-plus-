'use client';

import React, { useState } from 'react';
import { IssueTimelineEvent, UserRole } from '@/types/database';
import { useAuth } from '@/lib/auth-context';
import { addTimelineComment } from '@/lib/data';
import { 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Lock, 
  Send, 
  UserCheck, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface TimelineViewProps {
  issueId: string;
  initialEvents: IssueTimelineEvent[];
  onEventAdded?: (newEvent: IssueTimelineEvent) => void;
}

export function TimelineView({ issueId, initialEvents, onEventAdded }: TimelineViewProps) {
  const { user, role, isStaff } = useAuth();
  const [events, setEvents] = useState<IssueTimelineEvent[]>(initialEvents);
  const [commentText, setCommentText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newEv = await addTimelineComment(
        issueId,
        commentText.trim(),
        {
          name: user?.full_name || 'Citizen Contributor',
          role: role,
        },
        isInternal && isStaff
      );
      setEvents((prev) => [...prev, newEv]);
      if (onEventAdded) onEventAdded(newEv);
      setCommentText('');
      setIsInternal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Clock className="h-4 w-4 text-teal-600" />
          Resolution & Audit History
        </h3>
        <span className="text-xs font-medium text-slate-500">
          {events.length} event{events.length === 1 ? '' : 's'} logged
        </span>
      </div>

      {/* Timeline List */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {events.map((ev, idx) => {
          const isLatest = idx === events.length - 1;
          return (
            <div key={ev.id || idx} className="relative group">
              {/* Dot */}
              <div
                className={`absolute -left-[19px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 bg-white ${
                  isLatest
                    ? 'border-teal-600 ring-4 ring-teal-50'
                    : 'border-slate-400'
                }`}
              >
                <div
                  className={`h-1.5 w-1.5 rounded-full ${
                    isLatest ? 'bg-teal-600' : 'bg-slate-400'
                  }`}
                />
              </div>

              {/* Event Card */}
              <div
                className={`rounded-xl border p-4 text-sm transition ${
                  ev.is_internal
                    ? 'border-amber-200 bg-amber-50/40 text-amber-900'
                    : 'border-slate-200 bg-white shadow-xs'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">
                      {ev.action}
                    </span>
                    {ev.is_internal && (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                        <Lock className="h-2.5 w-2.5" />
                        Staff Internal Note
                      </span>
                    )}
                  </div>
                  <time className="text-[11px] text-slate-400 font-medium">
                    {formatTimestamp(ev.created_at)}
                  </time>
                </div>

                {/* Transition Pill */}
                {ev.new_status && (
                  <div className="mb-2 flex items-center gap-1.5 text-xs text-slate-500">
                    {ev.old_status && (
                      <>
                        <span className="capitalize text-slate-600 font-medium">{ev.old_status.replace('_', ' ')}</span>
                        <ArrowRight className="h-3 w-3 text-slate-400" />
                      </>
                    )}
                    <span className="capitalize font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60">
                      {ev.new_status.replace('_', ' ')}
                    </span>
                  </div>
                )}

                {/* Comment Body */}
                {ev.comment && (
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-2 whitespace-pre-wrap">
                    {ev.comment}
                  </p>
                )}

                {/* Actor Footer */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1 border-t border-slate-100">
                  <span className="font-medium text-slate-700">{ev.actor_name}</span>
                  <span>•</span>
                  <span className="capitalize text-slate-500 font-medium">{ev.actor_role}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Public Comment or Staff Note Form */}
      <form onSubmit={handleAddComment} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <label htmlFor="timeline-comment" className="block text-xs font-semibold text-slate-700 mb-2">
          {isStaff ? 'Add Official Update or Public Note' : 'Add Community Comment / Witness Update'}
        </label>
        <textarea
          id="timeline-comment"
          rows={3}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={
            isStaff
              ? 'Enter official inspection note, dispatch order, or public status update...'
              : 'Add an update, e.g. "I witnessed city survey crew inspecting the site at 10 AM"...'
          }
          className="w-full rounded-lg border border-slate-300 p-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          {isStaff && (
            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="flex items-center gap-1 font-medium">
                <Lock className="h-3 w-3 text-amber-600" />
                Staff-only internal note (hidden from public)
              </span>
            </label>
          )}

          <button
            type="submit"
            disabled={!commentText.trim() || isSubmitting}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 disabled:opacity-50 transition"
          >
            <Send className="h-3.5 w-3.5" />
            {isSubmitting ? 'Posting...' : 'Post Update'}
          </button>
        </div>
      </form>
    </div>
  );
}
