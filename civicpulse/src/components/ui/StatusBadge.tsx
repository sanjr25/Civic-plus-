import React from 'react';
import { IssuePriority, IssueStatus, PRIORITY_METADATA, STATUS_METADATA } from '@/types/database';

interface StatusBadgeProps {
  status: IssueStatus;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export function StatusBadge({ status, size = 'md', showDot = true }: StatusBadgeProps) {
  const meta = STATUS_METADATA[status] || STATUS_METADATA.reported;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3 py-1.5 text-sm font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${meta.badgeClass} ${sizeClasses[size]} transition-colors`}
    >
      {showDot && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: meta.hex }}
        />
      )}
      {meta.label}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: IssuePriority;
  size?: 'sm' | 'md';
}

export function PriorityBadge({ priority, size = 'md' }: PriorityBadgeProps) {
  const meta = PRIORITY_METADATA[priority] || PRIORITY_METADATA.medium;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-0.5 text-xs font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border ${meta.badgeClass} ${sizeClasses[size]}`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: meta.hex }}
      />
      {meta.label}
    </span>
  );
}
