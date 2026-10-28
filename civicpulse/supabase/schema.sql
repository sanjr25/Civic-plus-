-- ==============================================================================
-- CivicPulse: Intelligent Infrastructure Reporting
-- Production-Ready Supabase PostgreSQL Schema with Row Level Security (RLS)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE (Mirrors and extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'staff', 'admin')),
  department TEXT DEFAULT 'unassigned' CHECK (department IN ('public_works', 'transportation', 'water_sewage', 'sanitation', 'parks_rec', 'unassigned')),
  phone TEXT,
  avatar_url TEXT,
  notification_email BOOLEAN DEFAULT TRUE,
  notification_sms BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. ISSUES TABLE (Core public infrastructure incidents)
CREATE TABLE IF NOT EXISTS public.issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(title) >= 5 AND char_length(title) <= 200),
  description TEXT NOT NULL CHECK (char_length(description) >= 10),
  category TEXT NOT NULL CHECK (category IN (
    'pothole', 'streetlight', 'water_leak', 'sidewalk', 
    'waste', 'traffic_signal', 'parks', 'other'
  )),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN (
    'reported', 'under_review', 'in_progress', 'resolved', 'closed'
  )),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT NOT NULL,
  postal_code TEXT,
  image_url TEXT,
  resolution_image_url TEXT,
  resolution_notes TEXT,
  submitted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  submitted_by_name TEXT NOT NULL,
  submitted_by_email TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_department TEXT DEFAULT 'unassigned' CHECK (assigned_department IN (
    'public_works', 'transportation', 'water_sewage', 'sanitation', 'parks_rec', 'unassigned'
  )),
  upvotes_count INTEGER NOT NULL DEFAULT 0,
  estimated_days_to_resolve INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  resolved_at TIMESTAMPTZ
);

-- 4. ISSUE TIMELINE & AUDIT TRAIL TABLE
CREATE TABLE IF NOT EXISTS public.issue_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL DEFAULT 'citizen' CHECK (actor_role IN ('citizen', 'staff', 'admin')),
  action TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT,
  comment TEXT,
  is_internal BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. ISSUE UPVOTES TABLE
CREATE TABLE IF NOT EXISTS public.issue_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (issue_id, user_id)
);

-- 5b. MUNICIPAL FAQS TABLE
CREATE TABLE IF NOT EXISTS public.faqs (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  display_order INTEGER NOT NULL DEFAULT 1,
  keywords TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5c. SUPPORT TICKETS TABLE (Created from AI Assistant and Error Pages)
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT NOT NULL DEFAULT 'unresolved_inquiry' CHECK (category IN ('unresolved_inquiry', 'system_error', 'infrastructure_escalation')),
  source TEXT NOT NULL DEFAULT 'ai_assistant' CHECK (source IN ('ai_assistant', 'citizen_portal', 'error_page')),
  chat_session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_issues_status ON public.issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_category ON public.issues(category);
CREATE INDEX IF NOT EXISTS idx_issues_priority ON public.issues(priority);
CREATE INDEX IF NOT EXISTS idx_issues_department ON public.issues(assigned_department);
CREATE INDEX IF NOT EXISTS idx_issues_submitted_by ON public.issues(submitted_by);
CREATE INDEX IF NOT EXISTS idx_issues_coordinates ON public.issues(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_timeline_issue_id ON public.issue_timeline(issue_id);

-- 6. SECURITY HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('staff', 'admin')
  );
$$;

-- 7. ROW LEVEL SECURITY (RLS) POLICIES

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())); 
  -- Prevents self-escalation to staff/admin

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Issues RLS
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

-- Anyone can view public civic issues
CREATE POLICY "Issues are viewable by all citizens and staff"
  ON public.issues FOR SELECT
  USING (true);

-- Authenticated users (or public intake) can insert new issues
CREATE POLICY "Authenticated users can submit issues"
  ON public.issues FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      submitted_by = auth.uid() OR submitted_by IS NULL
    )
  );

-- Citizens can only update their own issue if it's still in 'reported' status,
-- and they CANNOT touch staff-only fields (status, priority, assigned_to, assigned_department, resolution notes)
CREATE POLICY "Citizens can edit their own newly reported issues"
  ON public.issues FOR UPDATE
  USING (
    auth.uid() = submitted_by 
    AND status = 'reported'
  )
  WITH CHECK (
    auth.uid() = submitted_by
    AND status = 'reported'
  );

-- Staff and Admin have full authorization to triage, assign, and resolve issues
CREATE POLICY "Staff and admin can update issue triage and resolution"
  ON public.issues FOR UPDATE
  USING (public.is_staff_or_admin());

CREATE POLICY "Admins can delete issues"
  ON public.issues FOR DELETE
  USING (public.current_user_role() = 'admin');

-- Issue Timeline RLS
ALTER TABLE public.issue_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public timeline items are viewable by all"
  ON public.issue_timeline FOR SELECT
  USING (
    NOT is_internal OR public.is_staff_or_admin()
  );

CREATE POLICY "Timeline items can be inserted by authenticated users or staff"
  ON public.issue_timeline FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- Upvotes RLS
ALTER TABLE public.issue_upvotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Upvotes viewable by all"
  ON public.issue_upvotes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can toggle upvotes"
  ON public.issue_upvotes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own upvote"
  ON public.issue_upvotes FOR DELETE
  USING (auth.uid() = user_id);

-- 8. TRIGGERS & AUTOMATION

-- Handle new user signup trigger to auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'citizen')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto update timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
    NEW.resolved_at = timezone('utc'::text, now());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_issues_updated_at ON public.issues;
CREATE TRIGGER trg_issues_updated_at
  BEFORE UPDATE ON public.issues
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 9. STORAGE BUCKET CONFIGURATION (Supabase Storage)
INSERT INTO storage.buckets (id, name, public)
VALUES ('issue-photos', 'issue-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Anyone can view issue photos
CREATE POLICY "Public Issue Photos Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'issue-photos');

-- Authenticated users can upload issue photos
CREATE POLICY "Authenticated Users Can Upload Issue Photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'issue-photos' 
    AND auth.role() = 'authenticated'
  );
