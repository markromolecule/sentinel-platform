-- =========================
-- ENUMS
-- =========================
CREATE TYPE public.exam_difficulty AS ENUM ('EASY', 'MEDIUM', 'HARD');
CREATE TYPE public.exam_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED', 'AVAILABLE', 'COMPLETED', 'IN_PROGRESS', 'UPCOMING', 'ACTIVE');
CREATE TYPE public.proctor_assignment_status AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'ACTIVE', 'COMPLETED', 'SCHEDULED');
CREATE TYPE public.announcement_status AS ENUM ('DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED');
CREATE TYPE public.message_status AS ENUM ('SENT', 'DELIVERED', 'READ');
CREATE TYPE public.action_type AS ENUM ('INFO', 'WARNING', 'ERROR', 'SUCCESS');
CREATE TYPE public.incident_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE public.incident_type AS ENUM ('FACE_NOT_VISIBLE', 'MULTIPLE_FACES', 'TAB_SWITCH', 'AUDIO_DETECTED', 'SUSPICIOUS_MOVEMENT', 'SCREENSHOT', 'SCREEN_RECORD', 'GAZE');
CREATE TYPE public.trend_direction AS ENUM ('UP', 'DOWN', 'NEUTRAL');

-- =========================
-- ACADEMIC STRUCTURE (Continued)
-- =========================

-- Courses (Degree Programs)
CREATE TABLE public.courses (
  course_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL, -- e.g., "BSIT-MWA"
  title VARCHAR(255) NOT NULL, -- e.g., "Bachelor of Science in Information Technology..."
  department_id UUID REFERENCES public.departments(department_id),
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Associate Subjects with Courses (Optional, for curriculum mapping)
CREATE TABLE public.course_subjects (
  course_id UUID REFERENCES public.courses(course_id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(subject_id) ON DELETE CASCADE,
  year_level SMALLINT,
  semester VARCHAR(20),
  PRIMARY KEY (course_id, subject_id)
);

ALTER TABLE public.course_subjects ENABLE ROW LEVEL SECURITY;

-- =========================
-- EXAM SYSTEM
-- =========================

CREATE TABLE public.exams (
  exam_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  subject_id UUID REFERENCES public.subjects(subject_id),
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  question_count INTEGER DEFAULT 0,
  passing_score INTEGER DEFAULT 0,
  difficulty public.exam_difficulty DEFAULT 'MEDIUM',
  scheduled_date TIMESTAMP WITH TIME ZONE,
  status public.exam_status DEFAULT 'DRAFT',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.exam_configurations (
  config_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID UNIQUE REFERENCES public.exams(exam_id) ON DELETE CASCADE,
  max_reconnect_attempts INTEGER DEFAULT 3,
  strict_mode BOOLEAN DEFAULT TRUE,
  camera_required BOOLEAN DEFAULT TRUE,
  mic_required BOOLEAN DEFAULT TRUE,
  screen_lock BOOLEAN DEFAULT TRUE,
  auto_submit_timeout_minutes INTEGER DEFAULT 5,
  allowed_devices TEXT[], -- Array of strings e.g. ['desktop', 'laptop']
  ai_rules JSONB DEFAULT '{
    "face_detection": true,
    "tab_switching": true,
    "gaze_tracking": true,
    "audio_detection": true
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.exam_configurations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.proctor_assignments (
  assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES public.exams(exam_id) ON DELETE CASCADE,
  instructor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  status public.proctor_assignment_status DEFAULT 'SCHEDULED',
  assigned_students_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(exam_id, instructor_id)
);

ALTER TABLE public.proctor_assignments ENABLE ROW LEVEL SECURITY;

-- Exam Taking History / Attempts
CREATE TABLE public.exam_attempts (
  attempt_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES public.exams(exam_id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(student_id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  score INTEGER,
  total_score INTEGER,
  status public.exam_status DEFAULT 'IN_PROGRESS',
  time_spent_minutes INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;

-- Flagged Incidents during exams
CREATE TABLE public.flagged_incidents (
  incident_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES public.exam_attempts(attempt_id) ON DELETE CASCADE,
  incident_type public.incident_type NOT NULL,
  severity public.incident_severity DEFAULT 'MEDIUM',
  details TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  evidence_url TEXT, -- Link to screenshot or clip
  status VARCHAR(20) DEFAULT 'PENDING' -- pending, reviewed, resolved
);

ALTER TABLE public.flagged_incidents ENABLE ROW LEVEL SECURITY;


-- =========================
-- COMMUNICATION
-- =========================

CREATE TABLE public.announcements (
  announcement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  target_audience TEXT[], -- Array of strings: ['all', 'students', 'proctors']
  status public.announcement_status DEFAULT 'DRAFT',
  published_at TIMESTAMP WITH TIME ZONE,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Messaging System
CREATE TABLE public.conversations (
  conversation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) DEFAULT 'DIRECT', -- DIRECT, GROUP
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.conversation_participants (
  conversation_id UUID REFERENCES public.conversations(conversation_id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (conversation_id, user_id)
);

ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.messages (
  message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(conversation_id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT,
  status public.message_status DEFAULT 'SENT',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;


-- =========================
-- SYSTEM & LOGS
-- =========================

CREATE TABLE public.audit_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(100),
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Analytic Reports Metadata
CREATE TABLE public.analytics_reports (
  report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- completion, incident, performance
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  format VARCHAR(10) DEFAULT 'pdf',
  status VARCHAR(20) DEFAULT 'READY',
  file_url TEXT,
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.analytics_reports ENABLE ROW LEVEL SECURITY;


-- =========================
-- RLS POLICIES (DEV MODE - PERMISSIVE)
-- =========================
-- Ideally, we'd have stricter policies. For now, authenticated users can read.

CREATE POLICY "Authenticated users can view courses" ON public.courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view exams" ON public.exams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view announcements" ON public.announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view messages involved in" ON public.conversations 
FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.conversation_participants cp WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid()));

-- Insert triggers for updated_at timestamps on applicable tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON public.exams FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
