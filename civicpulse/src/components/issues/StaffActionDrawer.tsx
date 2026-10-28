'use client';

import React, { useState } from 'react';
import { 
  Issue, 
  IssuePriority, 
  IssueStatus, 
  Department, 
  DEPARTMENT_METADATA, 
  STATUS_METADATA, 
  PRIORITY_METADATA 
} from '@/types/database';
import { useAuth } from '@/lib/auth-context';
import { updateIssueStatus, assignIssue, updateIssuePriority } from '@/lib/data';
import { 
  ShieldCheck, 
  X, 
  Check, 
  Building2, 
  AlertTriangle, 
  CheckCircle2, 
  FileCheck,
  UserCheck
} from 'lucide-react';

interface StaffActionDrawerProps {
  issue: Issue;
  isOpen: boolean;
  onClose: () => void;
  onIssueUpdated: (updatedIssue: Issue) => void;
}

export function StaffActionDrawer({
  issue,
  isOpen,
  onClose,
  onIssueUpdated,
}: StaffActionDrawerProps) {
  const { user, role, isStaff } = useAuth();

  const [status, setStatus] = useState<IssueStatus>(issue.status);
  const [priority, setPriority] = useState<IssuePriority>(issue.priority);
  const [department, setDepartment] = useState<Department>(
    issue.assigned_department || 'public_works'
  );
  const [assigneeName, setAssigneeName] = useState(
    issue.assigned_to || (user?.role === 'staff' ? user.full_name : 'Crew 3 (Maintenance)')
  );
  const [comment, setComment] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState(issue.resolution_notes || '');
  const [resolutionImageUrl, setResolutionImageUrl] = useState(issue.resolution_image_url || '');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    setSuccessMessage('');

    try {
      let current = issue;
      const actor = {
        name: user?.full_name || 'Staff Inspector',
        role: role,
      };

      // 1. Update priority if changed
      if (priority !== issue.priority) {
        current = await updateIssuePriority(
          issue.id,
          priority,
          actor,
          comment || `Priority modified to ${priority.toUpperCase()}`
        );
      }

      // 2. Assign department/crew if changed or unassigned
      if (department !== issue.assigned_department || assigneeName !== issue.assigned_to) {
        current = await assignIssue(issue.id, department, assigneeName, actor);
      }

      // 3. Update status if changed or resolution entered
      if (status !== issue.status || (status === 'resolved' && resolutionNotes)) {
        current = await updateIssueStatus(
          issue.id,
          status,
          comment || `Official staff action executed by ${user?.full_name}`,
          actor,
          status === 'resolved' ? resolutionImageUrl : undefined,
          status === 'resolved' ? resolutionNotes : undefined
        );
      }

      setSuccessMessage('Case updated successfully!');
      onIssueUpdated(current);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
      alert('Failed to update case. Check console for details.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Authorized Staff Operations
              </h2>
              <p className="text-xs text-slate-500">
                Official Case Management & Work Order Dispatch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="mt-5 space-y-4 text-xs sm:text-sm">
          {successMessage && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="h-4 w-4" />
              {successMessage}
            </div>
          )}

          {/* Workflow Status */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1.5">
              Case Status Transition
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(['reported', 'under_review', 'in_progress', 'resolved', 'closed'] as IssueStatus[]).map((st) => {
                const meta = STATUS_METADATA[st];
                const active = status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`flex items-center justify-between rounded-lg border p-2.5 text-left transition ${
                      active
                        ? 'border-teal-600 bg-teal-50/50 text-teal-900 font-semibold ring-1 ring-teal-600'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{meta.label}</span>
                    {active && <Check className="h-4 w-4 text-teal-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1.5">
              Hazard & Priority Triage
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['low', 'medium', 'high', 'urgent'] as IssuePriority[]).map((pr) => {
                const meta = PRIORITY_METADATA[pr];
                const active = priority === pr;
                return (
                  <button
                    key={pr}
                    type="button"
                    onClick={() => setPriority(pr)}
                    className={`rounded-lg border p-2 text-center text-xs font-medium transition ${
                      active
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Department Assignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Assigned Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs sm:text-sm text-slate-800 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
              >
                {Object.entries(DEPARTMENT_METADATA).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Lead Inspector / Crew
              </label>
              <input
                type="text"
                value={assigneeName}
                onChange={(e) => setAssigneeName(e.target.value)}
                placeholder="e.g. Field Unit 7, Specialist Ramos"
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs sm:text-sm text-slate-800 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>
          </div>

          {/* Resolution Details (Visible when resolved) */}
          {status === 'resolved' && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 space-y-3">
              <div className="flex items-center gap-1.5 text-emerald-900 font-semibold text-xs">
                <FileCheck className="h-4 w-4 text-emerald-600" />
                Official Resolution Verification
              </div>
              <div>
                <label className="block text-[11px] font-medium text-emerald-900 mb-1">
                  Resolution Summary & Work Performed
                </label>
                <textarea
                  rows={2}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Describe repair methods, materials used, inspection results, and date of completion..."
                  className="w-full rounded-lg border border-emerald-300 bg-white p-2 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-emerald-900 mb-1">
                  Verification Photo URL (After Repair)
                </label>
                <input
                  type="text"
                  value={resolutionImageUrl}
                  onChange={(e) => setResolutionImageUrl(e.target.value)}
                  placeholder="https://... photo of completed repair"
                  className="w-full rounded-lg border border-emerald-300 bg-white p-2 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Audit Trail Note */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Dispatch & Audit Log Comment
            </label>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add justification or dispatch instructions for this update..."
              className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800 placeholder-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 disabled:opacity-50 transition"
            >
              <Check className="h-4 w-4" />
              {isSaving ? 'Saving Case...' : 'Apply Official Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
