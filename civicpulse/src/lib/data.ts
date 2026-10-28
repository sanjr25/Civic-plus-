import { 
  Issue, 
  IssueCategory, 
  IssueFilter, 
  IssuePriority, 
  IssueStatus, 
  IssueStats, 
  IssueTimelineEvent, 
  Department, 
  UserRole,
  FAQItem,
  SupportTicket,
  CATEGORY_METADATA,
  STATUS_METADATA
} from '@/types/database';
import { supabase, isSupabaseConfigured } from './supabase';
import { INITIAL_FAQS } from './faq-data';

const STORAGE_KEY_ISSUES = 'civicpulse_issues_v1';
const STORAGE_KEY_TIMELINE = 'civicpulse_timeline_v1';
const STORAGE_KEY_UPVOTES = 'civicpulse_upvotes_v1';

// Initial realistic municipal dataset
export const INITIAL_ISSUES: Issue[] = [
  {
    id: 'iss-001',
    title: 'Deep crater pothole in eastbound transit lane',
    description: 'Severe pothole approximately 8 inches deep forming right next to the curbside bus stop. Vehicles are swerving abruptly into incoming traffic to avoid rim damage.',
    category: 'pothole',
    priority: 'urgent',
    status: 'in_progress',
    latitude: 47.6101,
    longitude: -122.3365,
    address: '1420 4th Ave & Pike St, Downtown',
    postal_code: '98101',
    image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    submitted_by: 'usr-cit-101',
    submitted_by_name: 'Elena Rostova',
    submitted_by_email: 'elena.rostova@example.com',
    is_anonymous: false,
    assigned_to: 'Marcus Vance (Crew 4)',
    assigned_department: 'public_works',
    upvotes_count: 24,
    estimated_days_to_resolve: 2,
    created_at: '2026-10-24T08:30:00Z',
    updated_at: '2026-10-26T14:15:00Z',
  },
  {
    id: 'iss-002',
    title: 'Continuous water main leak bubbling through asphalt',
    description: 'Clean drinking water is steadily bubbling up through the road surface and pooling across the bicycle lane. Stream has been running for 48 hours and flow is increasing.',
    category: 'water_leak',
    priority: 'high',
    status: 'in_progress',
    latitude: 47.6185,
    longitude: -122.3214,
    address: '815 E Pine St & Broadway, Capitol Hill',
    postal_code: '98122',
    image_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?auto=format&fit=crop&w=800&q=80',
    submitted_by: 'usr-cit-102',
    submitted_by_name: 'David Chen',
    submitted_by_email: 'd.chen@example.com',
    is_anonymous: false,
    assigned_to: 'Sarah Jenkins (Hydraulics)',
    assigned_department: 'water_sewage',
    upvotes_count: 19,
    estimated_days_to_resolve: 1,
    created_at: '2026-10-25T11:20:00Z',
    updated_at: '2026-10-26T16:40:00Z',
  },
  {
    id: 'iss-003',
    title: 'Cluster of 3 streetlights dark along pedestrian corridor',
    description: 'Three consecutive high-pressure sodium streetlights are completely out near the elementary school crosswalk. The area is pitch black after 6:30 PM, raising serious pedestrian safety concerns.',
    category: 'streetlight',
    priority: 'high',
    status: 'under_review',
    latitude: 47.6253,
    longitude: -122.3551,
    address: '320 Queen Anne Ave N, Lower Queen Anne',
    postal_code: '98109',
    image_url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
    submitted_by: 'usr-cit-103',
    submitted_by_name: 'Maya Lin',
    submitted_by_email: 'maya.lin@example.com',
    is_anonymous: false,
    assigned_department: 'transportation',
    upvotes_count: 31,
    estimated_days_to_resolve: 3,
    created_at: '2026-10-25T19:45:00Z',
    updated_at: '2026-10-26T09:10:00Z',
  },
  {
    id: 'iss-004',
    title: 'Dislodged storm drain grate trapping wheelchair wheels',
    description: 'Cast iron storm drain grate has shifted diagonally off its frame, leaving a 4-inch open gap. Multiple cyclists and a resident using a powered wheelchair have caught wheels.',
    category: 'water_leak',
    priority: 'urgent',
    status: 'resolved',
    latitude: 47.6032,
    longitude: -122.3325,
    address: '210 S Washington St, Pioneer Square',
    postal_code: '98104',
    image_url: 'https://images.unsplash.com/photo-1584463699059-a54823862215?auto=format&fit=crop&w=800&q=80',
    resolution_image_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?auto=format&fit=crop&w=800&q=80',
    resolution_notes: 'Crew 2 re-seated and welded a reinforced locking bracket to prevent future displacement. Verified flush alignment with road grade.',
    submitted_by: 'usr-cit-104',
    submitted_by_name: 'Arthur Pendelton',
    submitted_by_email: 'arthur.p@example.com',
    is_anonymous: false,
    assigned_to: 'Crew 2 (Rapid Response)',
    assigned_department: 'public_works',
    upvotes_count: 42,
    estimated_days_to_resolve: 1,
    created_at: '2026-10-22T07:15:00Z',
    updated_at: '2026-10-23T15:00:00Z',
    resolved_at: '2026-10-23T15:00:00Z',
  },
  {
    id: 'iss-005',
    title: 'Tree root heave created 3-inch sidewalk vertical lip',
    description: 'Mature London Plane tree root has forced the concrete slab upward. Severe trip hazard right outside the senior community center entrance. An elderly pedestrian fell yesterday.',
    category: 'sidewalk',
    priority: 'high',
    status: 'reported',
    latitude: 47.6625,
    longitude: -122.3812,
    address: '2215 NW Market St, Ballard',
    postal_code: '98107',
    image_url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80',
    submitted_by: 'usr-cit-105',
    submitted_by_name: 'Robert Sterling',
    submitted_by_email: 'robert.s@example.com',
    is_anonymous: false,
    assigned_department: 'public_works',
    upvotes_count: 15,
    estimated_days_to_resolve: 5,
    created_at: '2026-10-26T10:05:00Z',
    updated_at: '2026-10-26T10:05:00Z',
  },
  {
    id: 'iss-006',
    title: 'Illegal construction debris and hazardous chemicals dumped',
    description: 'Drywall scraps, paint buckets, and commercial solvent cans abandoned in public alleyway obstructing emergency vehicle access and smelling strongly of chemical fumes.',
    category: 'waste',
    priority: 'urgent',
    status: 'in_progress',
    latitude: 47.6152,
    longitude: -122.3421,
    address: 'Alley between 2nd & 3rd Ave at Virginia St, Belltown',
    postal_code: '98121',
    image_url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
    submitted_by: 'usr-cit-106',
    submitted_by_name: 'Rachel Greene',
    submitted_by_email: 'rachel.g@example.com',
    is_anonymous: false,
    assigned_to: 'HazMat & Cleanup Team C',
    assigned_department: 'sanitation',
    upvotes_count: 27,
    estimated_days_to_resolve: 1,
    created_at: '2026-10-26T06:50:00Z',
    updated_at: '2026-10-26T13:20:00Z',
  },
  {
    id: 'iss-007',
    title: 'Traffic signal flashing uncoordinated red on major arterial',
    description: 'The intersection signal controller appears damaged by power surge. Main arterial light is stuck flashing red in all 4 directions, causing massive gridlock back to freeway ramps.',
    category: 'traffic_signal',
    priority: 'urgent',
    status: 'in_progress',
    latitude: 47.6208,
    longitude: -122.3382,
    address: 'Mercer St & Westlake Ave, South Lake Union',
    postal_code: '98109',
    image_url: 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=800&q=80',
    submitted_by: 'usr-cit-107',
    submitted_by_name: 'Kenji Takahashi',
    submitted_by_email: 'kenji.t@example.com',
    is_anonymous: false,
    assigned_to: 'Signal Operations Center (Dispatch 12)',
    assigned_department: 'transportation',
    upvotes_count: 53,
    estimated_days_to_resolve: 1,
    created_at: '2026-10-26T12:15:00Z',
    updated_at: '2026-10-26T13:00:00Z',
  },
  {
    id: 'iss-008',
    title: 'Broken toddler swing bracket with sharp jagged metal',
    description: 'Heavy duty steel swing hanger has sheared off. Sharp metal edge hanging at child eye level. Playground cordoned off with caution tape by visiting parents.',
    category: 'parks',
    priority: 'high',
    status: 'resolved',
    latitude: 47.6278,
    longitude: -122.3162,
    address: 'Volunteer Park Playground, Capitol Hill',
    postal_code: '98112',
    image_url: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=800&q=80',
    resolution_image_url: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=800&q=80',
    resolution_notes: 'Replaced hardware with commercial grade tamper-resistant stainless steel carabiner and bracket. Full playground equipment safety inspection passed.',
    submitted_by: 'usr-cit-108',
    submitted_by_name: 'Jessica Adams',
    submitted_by_email: 'j.adams@example.com',
    is_anonymous: false,
    assigned_to: 'Parks Maintenance Division',
    assigned_department: 'parks_rec',
    upvotes_count: 38,
    estimated_days_to_resolve: 2,
    created_at: '2026-10-20T14:10:00Z',
    updated_at: '2026-10-22T11:30:00Z',
    resolved_at: '2026-10-22T11:30:00Z',
  },
];

export const INITIAL_TIMELINE: Record<string, IssueTimelineEvent[]> = {
  'iss-001': [
    {
      id: 'tl-101',
      issue_id: 'iss-001',
      actor_name: 'Elena Rostova',
      actor_role: 'citizen',
      action: 'Report Submitted',
      new_status: 'reported',
      comment: 'Citizen reported hazardous pothole via mobile portal.',
      is_internal: false,
      created_at: '2026-10-24T08:30:00Z',
    },
    {
      id: 'tl-102',
      issue_id: 'iss-001',
      actor_name: 'Triage Supervisor (Ops)',
      actor_role: 'staff',
      action: 'Prioritized & Reviewed',
      old_status: 'reported',
      new_status: 'under_review',
      comment: 'Assessed as high-impact arterial pothole. Upgraded priority to Urgent due to transit bus axle safety.',
      is_internal: false,
      created_at: '2026-10-24T10:45:00Z',
    },
    {
      id: 'tl-103',
      issue_id: 'iss-001',
      actor_name: 'Public Works Dispatch',
      actor_role: 'staff',
      action: 'Assigned to Field Crew',
      old_status: 'under_review',
      new_status: 'in_progress',
      comment: 'Work order #PW-2026-9921 issued. Asphalt patch crew scheduled for morning deployment.',
      is_internal: false,
      created_at: '2026-10-25T08:00:00Z',
    },
  ],
  'iss-004': [
    {
      id: 'tl-401',
      issue_id: 'iss-004',
      actor_name: 'Arthur Pendelton',
      actor_role: 'citizen',
      action: 'Report Submitted',
      new_status: 'reported',
      comment: 'Report submitted with safety concern for disabled community.',
      is_internal: false,
      created_at: '2026-10-22T07:15:00Z',
    },
    {
      id: 'tl-402',
      issue_id: 'iss-004',
      actor_name: 'Dispatch Center',
      actor_role: 'staff',
      action: 'Rapid Response Dispatched',
      old_status: 'reported',
      new_status: 'in_progress',
      comment: 'Crew 2 dispatched with heavy machinery and welding unit.',
      is_internal: false,
      created_at: '2026-10-22T09:00:00Z',
    },
    {
      id: 'tl-403',
      issue_id: 'iss-004',
      actor_name: 'Crew Chief Harris',
      actor_role: 'staff',
      action: 'Issue Resolved & Sealed',
      old_status: 'in_progress',
      new_status: 'resolved',
      comment: 'Locking bracket fabricated and welded. Area clear and safe for pedestrian flow.',
      is_internal: false,
      created_at: '2026-10-23T15:00:00Z',
    },
  ],
};

// Helper: load from localStorage or initialize with seed data
function getLocalIssues(): Issue[] {
  if (typeof window === 'undefined') return INITIAL_ISSUES;
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ISSUES);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY_ISSUES, JSON.stringify(INITIAL_ISSUES));
      return INITIAL_ISSUES;
    }
    return JSON.parse(stored);
  } catch {
    return INITIAL_ISSUES;
  }
}

function saveLocalIssues(issues: Issue[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_ISSUES, JSON.stringify(issues));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

function getLocalTimeline(): Record<string, IssueTimelineEvent[]> {
  if (typeof window === 'undefined') return INITIAL_TIMELINE;
  try {
    const stored = localStorage.getItem(STORAGE_KEY_TIMELINE);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY_TIMELINE, JSON.stringify(INITIAL_TIMELINE));
      return INITIAL_TIMELINE;
    }
    return JSON.parse(stored);
  } catch {
    return INITIAL_TIMELINE;
  }
}

function saveLocalTimeline(timeline: Record<string, IssueTimelineEvent[]>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_TIMELINE, JSON.stringify(timeline));
  } catch (e) {
    console.error('Failed to save timeline to localStorage:', e);
  }
}

function getLocalUpvotes(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY_UPVOTES);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveLocalUpvotes(upvotes: Record<string, boolean>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_UPVOTES, JSON.stringify(upvotes));
  } catch (e) {
    console.error('Failed to save upvotes:', e);
  }
}

// ============================================================================
// DATA ACCESS LAYER (Supabase with Local/Mock Fallback)
// ============================================================================

export async function getIssues(filter?: IssueFilter): Promise<Issue[]> {
  // Try Supabase if configured
  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase.from('issues').select('*');

      if (filter?.category && filter.category !== 'all') {
        query = query.eq('category', filter.category);
      }
      if (filter?.status && filter.status !== 'all') {
        query = query.eq('status', filter.status);
      }
      if (filter?.priority && filter.priority !== 'all') {
        query = query.eq('priority', filter.priority);
      }
      if (filter?.department && filter.department !== 'all') {
        query = query.eq('assigned_department', filter.department);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        let results = data as Issue[];
        if (filter?.searchQuery) {
          const q = filter.searchQuery.toLowerCase();
          results = results.filter(
            (i) => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.address.toLowerCase().includes(q)
          );
        }
        return results;
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local store:', err);
    }
  }

  // Fallback to local store
  let issues = getLocalIssues();
  const upvoteMap = getLocalUpvotes();

  // Attach upvoted status
  issues = issues.map((iss) => ({
    ...iss,
    has_upvoted: !!upvoteMap[iss.id],
  }));

  if (!filter) return issues;

  return issues.filter((issue) => {
    if (filter.category && filter.category !== 'all' && issue.category !== filter.category) return false;
    if (filter.status && filter.status !== 'all' && issue.status !== filter.status) return false;
    if (filter.priority && filter.priority !== 'all' && issue.priority !== filter.priority) return false;
    if (filter.department && filter.department !== 'all' && issue.assigned_department !== filter.department) return false;
    if (filter.searchQuery) {
      const q = filter.searchQuery.toLowerCase();
      const match =
        issue.title.toLowerCase().includes(q) ||
        issue.description.toLowerCase().includes(q) ||
        issue.address.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  }).sort((a, b) => {
    if (filter.sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (filter.sortBy === 'upvotes') return b.upvotes_count - a.upvotes_count;
    if (filter.sortBy === 'priority') {
      const pMap: Record<IssuePriority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
      return pMap[b.priority] - pMap[a.priority];
    }
    // Default newest
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export async function getIssueById(id: string): Promise<Issue | null> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('issues').select('*').eq('id', id).single();
      if (!error && data) {
        return data as Issue;
      }
    } catch (e) {
      console.warn('Supabase getIssueById error:', e);
    }
  }

  const issues = getLocalIssues();
  const upvoteMap = getLocalUpvotes();
  const found = issues.find((i) => i.id === id);
  if (!found) return null;
  return {
    ...found,
    has_upvoted: !!upvoteMap[found.id],
  };
}

export async function createIssue(data: {
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  latitude: number;
  longitude: number;
  address: string;
  postal_code?: string;
  image_url?: string;
  submitted_by?: string;
  submitted_by_name: string;
  submitted_by_email?: string;
  is_anonymous?: boolean;
}): Promise<Issue> {
  const newId = `iss-${Date.now().toString(36)}`;
  const now = new Date().toISOString();

  const newIssue: Issue = {
    id: newId,
    title: data.title,
    description: data.description,
    category: data.category,
    priority: data.priority,
    status: 'reported',
    latitude: data.latitude,
    longitude: data.longitude,
    address: data.address,
    postal_code: data.postal_code || '98101',
    image_url: data.image_url || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    submitted_by: data.submitted_by || 'usr-guest',
    submitted_by_name: data.is_anonymous ? 'Anonymous Citizen' : data.submitted_by_name,
    submitted_by_email: data.is_anonymous ? undefined : data.submitted_by_email,
    is_anonymous: data.is_anonymous || false,
    assigned_department: CATEGORY_METADATA[data.category].defaultDepartment,
    upvotes_count: 1,
    has_upvoted: true,
    estimated_days_to_resolve: data.priority === 'urgent' ? 1 : data.priority === 'high' ? 2 : 5,
    created_at: now,
    updated_at: now,
  };

  // If Supabase is connected
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: inserted, error } = await supabase.from('issues').insert([newIssue]).select().single();
      if (!error && inserted) {
        return inserted as Issue;
      }
    } catch (e) {
      console.warn('Supabase createIssue error:', e);
    }
  }

  // Local storage fallback
  const issues = getLocalIssues();
  issues.unshift(newIssue);
  saveLocalIssues(issues);

  // Mark as upvoted by submitter
  const upvotes = getLocalUpvotes();
  upvotes[newIssue.id] = true;
  saveLocalUpvotes(upvotes);

  // Initialize timeline
  const timelines = getLocalTimeline();
  timelines[newIssue.id] = [
    {
      id: `tl-${Date.now()}`,
      issue_id: newIssue.id,
      actor_name: newIssue.submitted_by_name,
      actor_role: 'citizen',
      action: 'Report Submitted',
      new_status: 'reported',
      comment: 'Initial infrastructure issue logged into public record.',
      is_internal: false,
      created_at: now,
    },
  ];
  saveLocalTimeline(timelines);

  return newIssue;
}

export async function updateIssueStatus(
  id: string,
  newStatus: IssueStatus,
  comment: string,
  actor: { name: string; role: UserRole },
  resolutionImage?: string,
  resolutionNotes?: string
): Promise<Issue> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured() && supabase) {
    try {
      const updates: Partial<Issue> = {
        status: newStatus,
        updated_at: now,
      };
      if (newStatus === 'resolved') {
        updates.resolved_at = now;
        if (resolutionNotes) updates.resolution_notes = resolutionNotes;
        if (resolutionImage) updates.resolution_image_url = resolutionImage;
      }

      const { data, error } = await supabase.from('issues').update(updates).eq('id', id).select().single();
      if (!error && data) {
        await addTimelineComment(id, comment, actor, false, newStatus);
        return data as Issue;
      }
    } catch (e) {
      console.warn('Supabase updateIssueStatus error:', e);
    }
  }

  // Local store
  const issues = getLocalIssues();
  const index = issues.findIndex((i) => i.id === id);
  if (index === -1) throw new Error(`Issue not found: ${id}`);

  const oldStatus = issues[index].status;
  issues[index].status = newStatus;
  issues[index].updated_at = now;
  if (newStatus === 'resolved') {
    issues[index].resolved_at = now;
    if (resolutionNotes) issues[index].resolution_notes = resolutionNotes;
    if (resolutionImage) issues[index].resolution_image_url = resolutionImage;
  }
  saveLocalIssues(issues);

  // Add timeline entry
  const timelines = getLocalTimeline();
  if (!timelines[id]) timelines[id] = [];
  timelines[id].push({
    id: `tl-${Date.now()}`,
    issue_id: id,
    actor_name: actor.name,
    actor_role: actor.role,
    action: `Status updated to ${STATUS_METADATA[newStatus].label}`,
    old_status: oldStatus,
    new_status: newStatus,
    comment: comment || `Status transitioned from ${STATUS_METADATA[oldStatus].label} to ${STATUS_METADATA[newStatus].label}`,
    is_internal: false,
    created_at: now,
  });
  saveLocalTimeline(timelines);

  return issues[index];
}

export async function assignIssue(
  id: string,
  department: Department,
  assigneeName: string,
  actor: { name: string; role: UserRole }
): Promise<Issue> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('issues')
        .update({
          assigned_department: department,
          assigned_to: assigneeName,
          status: 'in_progress',
          updated_at: now,
        })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) {
        await addTimelineComment(
          id,
          `Assigned to ${department.replace('_', ' ')} (${assigneeName})`,
          actor,
          false,
          'in_progress'
        );
        return data as Issue;
      }
    } catch (e) {
      console.warn('Supabase assignIssue error:', e);
    }
  }

  const issues = getLocalIssues();
  const index = issues.findIndex((i) => i.id === id);
  if (index === -1) throw new Error('Issue not found');

  issues[index].assigned_department = department;
  issues[index].assigned_to = assigneeName;
  if (issues[index].status === 'reported' || issues[index].status === 'under_review') {
    issues[index].status = 'in_progress';
  }
  issues[index].updated_at = now;
  saveLocalIssues(issues);

  const timelines = getLocalTimeline();
  if (!timelines[id]) timelines[id] = [];
  timelines[id].push({
    id: `tl-${Date.now()}`,
    issue_id: id,
    actor_name: actor.name,
    actor_role: actor.role,
    action: 'Case Assigned',
    new_status: issues[index].status,
    comment: `Assigned case to ${department.replace('_', ' ')} team. Personnel lead: ${assigneeName}.`,
    is_internal: false,
    created_at: now,
  });
  saveLocalTimeline(timelines);

  return issues[index];
}

export async function updateIssuePriority(
  id: string,
  priority: IssuePriority,
  actor: { name: string; role: UserRole },
  reason?: string
): Promise<Issue> {
  const now = new Date().toISOString();

  const issues = getLocalIssues();
  const index = issues.findIndex((i) => i.id === id);
  if (index === -1) throw new Error('Issue not found');

  const oldPriority = issues[index].priority;
  issues[index].priority = priority;
  issues[index].updated_at = now;
  saveLocalIssues(issues);

  const timelines = getLocalTimeline();
  if (!timelines[id]) timelines[id] = [];
  timelines[id].push({
    id: `tl-${Date.now()}`,
    issue_id: id,
    actor_name: actor.name,
    actor_role: actor.role,
    action: `Priority Adjusted: ${priority.toUpperCase()}`,
    comment: reason || `Priority changed from ${oldPriority} to ${priority} following hazard reassessment.`,
    is_internal: false,
    created_at: now,
  });
  saveLocalTimeline(timelines);

  return issues[index];
}

export async function toggleUpvote(
  id: string,
  userId: string
): Promise<{ count: number; hasUpvoted: boolean }> {
  const upvotes = getLocalUpvotes();
  const alreadyUpvoted = !!upvotes[id];

  const issues = getLocalIssues();
  const index = issues.findIndex((i) => i.id === id);
  if (index === -1) throw new Error('Issue not found');

  if (alreadyUpvoted) {
    issues[index].upvotes_count = Math.max(0, issues[index].upvotes_count - 1);
    delete upvotes[id];
  } else {
    issues[index].upvotes_count += 1;
    upvotes[id] = true;
  }

  saveLocalIssues(issues);
  saveLocalUpvotes(upvotes);

  return {
    count: issues[index].upvotes_count,
    hasUpvoted: !alreadyUpvoted,
  };
}

export async function getIssueTimeline(issueId: string): Promise<IssueTimelineEvent[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('issue_timeline')
        .select('*')
        .eq('issue_id', issueId)
        .order('created_at', { ascending: true });
      if (!error && data && data.length > 0) {
        return data as IssueTimelineEvent[];
      }
    } catch (e) {
      console.warn('Supabase getIssueTimeline error:', e);
    }
  }

  const timelines = getLocalTimeline();
  return timelines[issueId] || [];
}

export async function addTimelineComment(
  issueId: string,
  comment: string,
  actor: { name: string; role: UserRole },
  isInternal: boolean = false,
  newStatus?: IssueStatus
): Promise<IssueTimelineEvent> {
  const now = new Date().toISOString();
  const event: IssueTimelineEvent = {
    id: `tl-${Date.now()}`,
    issue_id: issueId,
    actor_name: actor.name,
    actor_role: actor.role,
    action: isInternal ? 'Internal Staff Note' : 'Public Official Update',
    comment,
    new_status: newStatus,
    is_internal: isInternal,
    created_at: now,
  };

  const timelines = getLocalTimeline();
  if (!timelines[issueId]) timelines[issueId] = [];
  timelines[issueId].push(event);
  saveLocalTimeline(timelines);

  return event;
}

export async function getDashboardStats(): Promise<IssueStats> {
  const issues = await getIssues();

  const totalIssues = issues.length;
  const reported = issues.filter((i) => i.status === 'reported').length;
  const underReview = issues.filter((i) => i.status === 'under_review').length;
  const inProgress = issues.filter((i) => i.status === 'in_progress').length;
  const resolved = issues.filter((i) => i.status === 'resolved').length;
  const closed = issues.filter((i) => i.status === 'closed').length;
  const urgentIssues = issues.filter((i) => i.priority === 'urgent' && i.status !== 'resolved').length;

  const resolutionRatePercent = totalIssues > 0 ? Math.round((resolved / totalIssues) * 100) : 0;

  // Category counts
  const catCounts: Record<IssueCategory, number> = {
    pothole: 0,
    streetlight: 0,
    water_leak: 0,
    sidewalk: 0,
    waste: 0,
    traffic_signal: 0,
    parks: 0,
    other: 0,
  };

  issues.forEach((i) => {
    if (catCounts[i.category] !== undefined) {
      catCounts[i.category]++;
    }
  });

  const categoryDistribution = Object.entries(catCounts).map(([cat, count]) => ({
    category: cat as IssueCategory,
    count,
    label: CATEGORY_METADATA[cat as IssueCategory].label,
  }));

  const statusDistribution = [
    { status: 'reported' as IssueStatus, count: reported, label: 'Reported', color: '#D97706' },
    { status: 'under_review' as IssueStatus, count: underReview, label: 'Under Review', color: '#0284C7' },
    { status: 'in_progress' as IssueStatus, count: inProgress, label: 'In Progress', color: '#0D9488' },
    { status: 'resolved' as IssueStatus, count: resolved, label: 'Resolved', color: '#059669' },
    { status: 'closed' as IssueStatus, count: closed, label: 'Closed', color: '#64748B' },
  ];

  const weeklyTrend = [
    { week: 'Week 1', reported: 12, resolved: 9 },
    { week: 'Week 2', reported: 18, resolved: 14 },
    { week: 'Week 3', reported: 22, resolved: 19 },
    { week: 'Week 4', reported: 29, resolved: 25 },
    { week: 'This Week', reported: totalIssues, resolved: resolved },
  ];

  const departmentPerformance = [
    { department: 'Public Works', open: issues.filter((i) => i.assigned_department === 'public_works' && i.status !== 'resolved').length, resolved: issues.filter((i) => i.assigned_department === 'public_works' && i.status === 'resolved').length, avgDays: 2.4 },
    { department: 'Transportation', open: issues.filter((i) => i.assigned_department === 'transportation' && i.status !== 'resolved').length, resolved: issues.filter((i) => i.assigned_department === 'transportation' && i.status === 'resolved').length, avgDays: 1.8 },
    { department: 'Water & Sewer', open: issues.filter((i) => i.assigned_department === 'water_sewage' && i.status !== 'resolved').length, resolved: issues.filter((i) => i.assigned_department === 'water_sewage' && i.status === 'resolved').length, avgDays: 1.2 },
    { department: 'Sanitation', open: issues.filter((i) => i.assigned_department === 'sanitation' && i.status !== 'resolved').length, resolved: issues.filter((i) => i.assigned_department === 'sanitation' && i.status === 'resolved').length, avgDays: 0.9 },
    { department: 'Parks & Rec', open: issues.filter((i) => i.assigned_department === 'parks_rec' && i.status !== 'resolved').length, resolved: issues.filter((i) => i.assigned_department === 'parks_rec' && i.status === 'resolved').length, avgDays: 3.1 },
  ];

  return {
    totalIssues,
    reported,
    underReview,
    inProgress,
    resolved,
    closed,
    urgentIssues,
    avgResolutionDays: 1.9,
    resolutionRatePercent,
    categoryDistribution,
    statusDistribution,
    weeklyTrend,
    departmentPerformance,
  };
}

export async function uploadImage(file: File): Promise<string> {
  // Try Supabase Storage first if available
  if (isSupabaseConfigured() && supabase) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `reports/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('issue-photos')
        .upload(filePath, file);

      if (!uploadError) {
        const { data } = supabase.storage.from('issue-photos').getPublicUrl(filePath);
        return data.publicUrl;
      }
    } catch (e) {
      console.warn('Supabase storage upload error:', e);
    }
  }

  // Fallback to base64 Data URL so local demo works without network requirements
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ============================================================================
// FAQS & SUPPORT TICKETS (SQL with Local Fallback)
// ============================================================================

const STORAGE_KEY_FAQS = 'civicpulse_faqs_v1';
const STORAGE_KEY_TICKETS = 'civicpulse_tickets_v1';

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-8821',
    user_id: 'usr-cit-101',
    user_email: 'elena.rostova@civicpulse.org',
    user_name: 'Elena Rostova',
    subject: 'Assistance with asphalt patch inspection timeline',
    description: 'Citizen inquired via AI Assistant about expected re-inspection dates for case #ISS-001.',
    status: 'investigating',
    priority: 'medium',
    category: 'unresolved_inquiry',
    source: 'ai_assistant',
    chat_session_id: 'sess-991',
    created_at: '2026-10-25T14:30:00Z',
    updated_at: '2026-10-25T15:00:00Z',
  },
  {
    id: 'tkt-8822',
    user_id: 'usr-cit-103',
    user_email: 'maya.lin@example.com',
    user_name: 'Maya Lin',
    subject: 'Escalation for elementary crosswalk illumination',
    description: 'High-priority escalation filed after dark pedestrian corridor report #ISS-003.',
    status: 'open',
    priority: 'urgent',
    category: 'infrastructure_escalation',
    source: 'ai_assistant',
    chat_session_id: 'sess-992',
    created_at: '2026-10-26T19:00:00Z',
    updated_at: '2026-10-26T19:00:00Z',
  },
];

function getLocalFAQs(): FAQItem[] {
  if (typeof window === 'undefined') return INITIAL_FAQS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY_FAQS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY_FAQS, JSON.stringify(INITIAL_FAQS));
      return INITIAL_FAQS;
    }
    return JSON.parse(stored);
  } catch {
    return INITIAL_FAQS;
  }
}

function getLocalTickets(): SupportTicket[] {
  if (typeof window === 'undefined') return INITIAL_TICKETS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY_TICKETS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(INITIAL_TICKETS));
      return INITIAL_TICKETS;
    }
    return JSON.parse(stored);
  } catch {
    return INITIAL_TICKETS;
  }
}

function saveLocalTickets(tickets: SupportTicket[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(tickets));
  } catch (e) {
    console.error('Failed to save support tickets:', e);
  }
}

export async function getFAQs(category?: string, query?: string): Promise<FAQItem[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      let q = supabase.from('faqs').select('*').order('display_order', { ascending: true });
      if (category && category !== 'all') {
        q = q.eq('category', category);
      }
      const { data, error } = await q;
      if (!error && data && data.length > 0) {
        let results = data as FAQItem[];
        if (query) {
          const lower = query.toLowerCase();
          results = results.filter(
            (f) => f.question.toLowerCase().includes(lower) || f.answer.toLowerCase().includes(lower)
          );
        }
        return results;
      }
    } catch (e) {
      console.warn('Supabase getFAQs error:', e);
    }
  }

  let faqs = getLocalFAQs();
  if (category && category !== 'all') {
    faqs = faqs.filter((f) => f.category === category);
  }
  if (query) {
    const lower = query.toLowerCase();
    faqs = faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(lower) ||
        f.answer.toLowerCase().includes(lower) ||
        (f.keywords && f.keywords.some((k) => k.toLowerCase().includes(lower)))
    );
  }
  return faqs;
}

export async function getFAQById(id: string): Promise<FAQItem | null> {
  const faqs = await getFAQs();
  return faqs.find((f) => f.id === id) || null;
}

export async function getSupportTickets(): Promise<SupportTicket[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as SupportTicket[];
      }
    } catch (e) {
      console.warn('Supabase getSupportTickets error:', e);
    }
  }
  return getLocalTickets();
}

export async function createSupportTicket(data: {
  user_email: string;
  user_name?: string;
  subject: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: 'unresolved_inquiry' | 'system_error' | 'infrastructure_escalation';
  source?: 'ai_assistant' | 'citizen_portal' | 'error_page';
  chat_session_id?: string;
}): Promise<SupportTicket> {
  const newTicket: SupportTicket = {
    id: `tkt-${Date.now().toString(36).substring(2, 8).toUpperCase()}`,
    user_email: data.user_email,
    user_name: data.user_name || 'Citizen User',
    subject: data.subject,
    description: data.description,
    status: 'open',
    priority: data.priority || 'medium',
    category: data.category || 'unresolved_inquiry',
    source: data.source || 'ai_assistant',
    chat_session_id: data.chat_session_id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: inserted, error } = await supabase
        .from('support_tickets')
        .insert([newTicket])
        .select()
        .single();
      if (!error && inserted) {
        return inserted as SupportTicket;
      }
    } catch (e) {
      console.warn('Supabase createSupportTicket error:', e);
    }
  }

  const tickets = getLocalTickets();
  tickets.unshift(newTicket);
  saveLocalTickets(tickets);
  return newTicket;
}

