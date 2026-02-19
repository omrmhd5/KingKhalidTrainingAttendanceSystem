
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'operator', 'viewer');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Groups table
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Shifts table
CREATE TABLE public.shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  grace_minutes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

-- Trainees table
CREATE TABLE public.trainees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  civil_id TEXT NOT NULL UNIQUE,
  military_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  rank TEXT,
  specialty TEXT,
  barcode_value TEXT NOT NULL UNIQUE,
  group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.trainees ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_trainees_barcode ON public.trainees(barcode_value);
CREATE INDEX idx_trainees_group ON public.trainees(group_id);

-- Group schedules
CREATE TABLE public.group_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  shift_id UUID NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE,
  day_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, shift_id, day_date)
);
ALTER TABLE public.group_schedules ENABLE ROW LEVEL SECURITY;

-- Attendance sessions
CREATE TABLE public.attendance_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id UUID NOT NULL REFERENCES public.trainees(id) ON DELETE CASCADE,
  day_date DATE NOT NULL,
  shift_id UUID NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE,
  check_in_at TIMESTAMPTZ,
  check_out_at TIMESTAMPTZ,
  late_minutes INTEGER NOT NULL DEFAULT 0,
  early_leave_minutes INTEGER NOT NULL DEFAULT 0,
  scheduled_minutes INTEGER NOT NULL DEFAULT 0,
  actual_minutes INTEGER NOT NULL DEFAULT 0,
  lost_minutes INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'absent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(trainee_id, day_date, shift_id)
);
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_attendance_trainee ON public.attendance_sessions(trainee_id);
CREATE INDEX idx_attendance_date ON public.attendance_sessions(day_date);

-- Permission requests
CREATE TABLE public.permission_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id UUID NOT NULL REFERENCES public.trainees(id) ON DELETE CASCADE,
  from_time TIMESTAMPTZ NOT NULL,
  to_time TIMESTAMPTZ NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.permission_requests ENABLE ROW LEVEL SECURITY;

-- Escape events
CREATE TABLE public.escape_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id UUID NOT NULL REFERENCES public.trainees(id) ON DELETE CASCADE,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  type TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.escape_events ENABLE ROW LEVEL SECURITY;

-- Violations
CREATE TABLE public.violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id UUID NOT NULL REFERENCES public.trainees(id) ON DELETE CASCADE,
  violation_type TEXT NOT NULL,
  details TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.violations ENABLE ROW LEVEL SECURITY;

-- Helper function: has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper: is any authorized role
CREATE OR REPLACE FUNCTION public.is_authorized(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id
  )
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_trainees_updated_at BEFORE UPDATE ON public.trainees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON public.attendance_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS Policies

-- profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- user_roles
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (user_id = auth.uid());

-- All data tables: authorized users can read
CREATE POLICY "Authorized can read groups" ON public.groups FOR SELECT USING (public.is_authorized(auth.uid()));
CREATE POLICY "Admins can manage groups" ON public.groups FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authorized can read shifts" ON public.shifts FOR SELECT USING (public.is_authorized(auth.uid()));
CREATE POLICY "Admins can manage shifts" ON public.shifts FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authorized can read trainees" ON public.trainees FOR SELECT USING (public.is_authorized(auth.uid()));
CREATE POLICY "Admins can manage trainees" ON public.trainees FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authorized can read schedules" ON public.group_schedules FOR SELECT USING (public.is_authorized(auth.uid()));
CREATE POLICY "Admins can manage schedules" ON public.group_schedules FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authorized can read attendance" ON public.attendance_sessions FOR SELECT USING (public.is_authorized(auth.uid()));
CREATE POLICY "Admin/operator can manage attendance" ON public.attendance_sessions FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operator'));

CREATE POLICY "Authorized can read permissions" ON public.permission_requests FOR SELECT USING (public.is_authorized(auth.uid()));
CREATE POLICY "Admin/operator can manage permissions" ON public.permission_requests FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operator'));

CREATE POLICY "Authorized can read escapes" ON public.escape_events FOR SELECT USING (public.is_authorized(auth.uid()));
CREATE POLICY "Admin/operator can manage escapes" ON public.escape_events FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operator'));

CREATE POLICY "Authorized can read violations" ON public.violations FOR SELECT USING (public.is_authorized(auth.uid()));
CREATE POLICY "Admin/operator can manage violations" ON public.violations FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operator'));
