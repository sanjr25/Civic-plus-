export type IssueStatus = 'reported' | 'under_review' | 'in_progress' | 'resolved' | 'closed';

export type IssuePriority = 'low' | 'medium' | 'high' | 'urgent';

export type IssueCategory =
  | 'pothole'
  | 'streetlight'
  | 'water_leak'
  | 'sidewalk'
  | 'waste'
  | 'traffic_signal'
  | 'parks'
  | 'other';

export type Department =
  | 'public_works'
  | 'transportation'
  | 'water_sewage'
  | 'sanitation'
  | 'parks_rec'
  | 'unassigned';

export type UserRole = 'citizen' | 'staff' | 'admin';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'reporting' | 'tracking' | 'sla' | 'privacy' | 'staff' | 'general';
  display_order: number;
  keywords?: string[];
  created_at: string;
}

export interface SupportTicket {
  id: string;
  user_id?: string;
  user_email: string;
  user_name?: string;
  subject: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'unresolved_inquiry' | 'system_error' | 'infrastructure_escalation';
  source: 'ai_assistant' | 'citizen_portal' | 'error_page';
  chat_session_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ErrorCodeInfo {
  code: number;
  name: string;
  title: string;
  description: string;
  cause: string;
  solution: string;
  isSiteSpecific?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department?: Department;
  phone?: string;
  avatar_url?: string;
  notification_email: boolean;
  notification_sms: boolean;
  created_at: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  latitude: number;
  longitude: number;
  address: string;
  postal_code?: string;
  image_url?: string;
  resolution_image_url?: string;
  resolution_notes?: string;
  submitted_by: string;
  submitted_by_name: string;
  submitted_by_email?: string;
  is_anonymous?: boolean;
  assigned_to?: string;
  assigned_department?: Department;
  upvotes_count: number;
  has_upvoted?: boolean;
  estimated_days_to_resolve?: number;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface IssueTimelineEvent {
  id: string;
  issue_id: string;
  actor_name: string;
  actor_role: UserRole;
  action: string;
  old_status?: IssueStatus;
  new_status?: IssueStatus;
  comment?: string;
  is_internal?: boolean;
  created_at: string;
}

export interface IssueFilter {
  category?: IssueCategory | 'all';
  status?: IssueStatus | 'all';
  priority?: IssuePriority | 'all';
  department?: Department | 'all';
  searchQuery?: string;
  sortBy?: 'newest' | 'oldest' | 'priority' | 'upvotes';
}

export interface IssueStats {
  totalIssues: number;
  reported: number;
  underReview: number;
  inProgress: number;
  resolved: number;
  closed: number;
  urgentIssues: number;
  avgResolutionDays: number;
  resolutionRatePercent: number;
  categoryDistribution: { category: IssueCategory; count: number; label: string }[];
  statusDistribution: { status: IssueStatus; count: number; label: string; color: string }[];
  weeklyTrend: { week: string; reported: number; resolved: number }[];
  departmentPerformance: { department: string; open: number; resolved: number; avgDays: number }[];
}

export const CATEGORY_METADATA: Record<IssueCategory, { label: string; icon: string; defaultDepartment: Department; color: string }> = {
  pothole: {
    label: 'Roads & Potholes',
    icon: 'Hammer',
    defaultDepartment: 'public_works',
    color: '#F59E0B',
  },
  streetlight: {
    label: 'Streetlight Outage',
    icon: 'Lightbulb',
    defaultDepartment: 'transportation',
    color: '#EAB308',
  },
  water_leak: {
    label: 'Water & Drainage',
    icon: 'Droplets',
    defaultDepartment: 'water_sewage',
    color: '#0EA5E9',
  },
  sidewalk: {
    label: 'Sidewalk & Walkway',
    icon: 'Footprints',
    defaultDepartment: 'public_works',
    color: '#8B5CF6',
  },
  waste: {
    label: 'Waste & Illegal Dumping',
    icon: 'Trash2',
    defaultDepartment: 'sanitation',
    color: '#EF4444',
  },
  traffic_signal: {
    label: 'Traffic Signals & Signs',
    icon: 'AlertTriangle',
    defaultDepartment: 'transportation',
    color: '#F97316',
  },
  parks: {
    label: 'Parks & Public Grounds',
    icon: 'Trees',
    defaultDepartment: 'parks_rec',
    color: '#10B981',
  },
  other: {
    label: 'Other Infrastructure',
    icon: 'HelpCircle',
    defaultDepartment: 'public_works',
    color: '#64748B',
  },
};

export const STATUS_METADATA: Record<IssueStatus, { label: string; description: string; badgeClass: string; hex: string }> = {
  reported: {
    label: 'Reported',
    description: 'Submitted by citizen; queued for review',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    hex: '#D97706',
  },
  under_review: {
    label: 'Under Review',
    description: 'Reviewed by triage staff; assessing feasibility & scope',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
    hex: '#0284C7',
  },
  in_progress: {
    label: 'In Progress',
    description: 'Assigned to field crew and active work underway',
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
    hex: '#0D9488',
  },
  resolved: {
    label: 'Resolved',
    description: 'Repairs completed and validated by supervisor',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    hex: '#059669',
  },
  closed: {
    label: 'Closed',
    description: 'Issue concluded, duplicate merged, or archived',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    hex: '#64748B',
  },
};

export const PRIORITY_METADATA: Record<IssuePriority, { label: string; badgeClass: string; hex: string }> = {
  low: {
    label: 'Low Priority',
    badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
    hex: '#64748B',
  },
  medium: {
    label: 'Medium Priority',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    hex: '#2563EB',
  },
  high: {
    label: 'High Priority',
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
    hex: '#EA580C',
  },
  urgent: {
    label: 'Urgent Hazard',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
    hex: '#E11D48',
  },
};

export const DEPARTMENT_METADATA: Record<Department, { label: string; contactEmail: string }> = {
  public_works: { label: 'Department of Public Works', contactEmail: 'publicworks@city.civicpulse.gov' },
  transportation: { label: 'Department of Transportation', contactEmail: 'transit@city.civicpulse.gov' },
  water_sewage: { label: 'Water & Sewer Authority', contactEmail: 'waterworks@city.civicpulse.gov' },
  sanitation: { label: 'Sanitation & Resource Recovery', contactEmail: 'sanitation@city.civicpulse.gov' },
  parks_rec: { label: 'Parks, Forestry & Recreation', contactEmail: 'parks@city.civicpulse.gov' },
  unassigned: { label: 'Unassigned / Intake Queue', contactEmail: 'intake@city.civicpulse.gov' },
};
