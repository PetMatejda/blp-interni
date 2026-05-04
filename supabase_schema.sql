-- Supabase Database Schema for BLP Interni System

-- 1. Attendance Table
CREATE TYPE attendance_type AS ENUM ('Travel', 'Točba', 'Rigg', 'Sklad', 'Volno M', 'Dovolená', 'Nemoc');

CREATE TABLE attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  check_in TIMESTAMP WITH TIME ZONE,
  check_out TIMESTAMP WITH TIME ZONE,
  type attendance_type DEFAULT 'Sklad',
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Monthly Norms (for reports)
CREATE TABLE monthly_norms (
  id SERIAL PRIMARY KEY,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  hours_norm INTEGER NOT NULL,
  UNIQUE(month, year)
);

-- 3. Projects Table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  client TEXT,
  location TEXT,
  material_list TEXT,
  status TEXT DEFAULT 'pending',
  color_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Project Events (Dates for projects)
CREATE TYPE event_type AS ENUM ('Rigging', 'Shooting', 'Travel', 'Derigging', 'Preparation');

CREATE TABLE project_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  type event_type NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  note TEXT
);

-- 5. Assignments Table (People to projects)
CREATE TABLE assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  event_id UUID REFERENCES project_events(id) ON DELETE SET NULL,
  note TEXT
);

-- 6. Receipts Table
CREATE TABLE receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'CZK',
  date DATE NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'BLP',
  payment_type TEXT CHECK (payment_type IN ('company', 'personal')),
  image_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Row Level Security (RLS) Policies
-- (Basic setup: users can see their own data, admins can see everything)

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- Users can see their own attendance
CREATE POLICY "Users can view their own attendance" ON attendance
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own attendance
CREATE POLICY "Users can insert their own attendance" ON attendance
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can see their own receipts
CREATE POLICY "Users can view their own receipts" ON receipts
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own receipts
CREATE POLICY "Users can insert their own receipts" ON receipts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Projects and Events are public (or shared within firm)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Projects are visible to all employees" ON projects
  FOR SELECT USING (true);

ALTER TABLE project_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events are visible to all employees" ON project_events
  FOR SELECT USING (true);

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Assignments are visible to all employees" ON assignments
  FOR SELECT USING (true);
