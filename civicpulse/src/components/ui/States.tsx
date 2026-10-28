import React from 'react';
import Link from 'next/link';
import { AlertCircle, FileSearch, RefreshCw, Plus } from 'lucide-react';

export function LoadingSpinner({ message = 'Loading infrastructure records...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" />
      <p className="mt-4 text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
}

export function EmptyState({
  title = 'No infrastructure reports found',
  description = 'No issues match your current filter criteria or location search.',
  actionHref,
  actionLabel,
  onReset,
}: {
  title?: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  onReset?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <FileSearch className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500">{description}</p>
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        {onReset && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Reset Filters
          </button>
        )}
        {actionHref && (
          <Link
            href={actionHref}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700"
          >
            <Plus className="h-4 w-4" />
            {actionLabel || 'Report an Issue'}
          </Link>
        )}
      </div>
    </div>
  );
}

export function ErrorState({
  title = 'Unable to load records',
  message = 'An unexpected network error occurred while connecting to the civic database.',
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          <RefreshCw className="h-4 w-4" />
          Retry Request
        </button>
      )}
    </div>
  );
}
