-- View Point Public School - Seed Data
-- This file contains sample development data with clearly labelled sample information
-- Do not use real personal data, passwords, or unverified claims

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('principal', 'teacher', 'pending_teacher');
CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE registration_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE alert_level AS ENUM ('info', 'warning', 'emergency');
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE message_status AS ENUM ('unread', 'read', 'replied', 'archived');
CREATE TYPE enquiry_status AS ENUM ('new', 'contacted', 'converted', 'lost');

-- ============================================
-- PROFILES TABLE
-- ============================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'pending_teacher',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SITE SETTINGS TABLE
-- ============================================

CREATE TABLE site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type TEXT DEFAULT 'text',
    category TEXT DEFAULT 'general',
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CLASSES TABLE
-- ============================================

CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    numeric_value INTEGER NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SECTIONS TABLE
-- ============================================

CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    class_teacher_id UUID REFERENCES profiles(id),
    capacity INTEGER DEFAULT 40,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SUBJECTS TABLE
-- ============================================

CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    name_hi TEXT,
    code TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CLASS SUBJECTS (Junction Table)
-- ============================================

CREATE TABLE class_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, subject_id)
);

-- ============================================
-- TEACHER ASSIGNMENTS TABLE
-- ============================================

CREATE TABLE teacher_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    is_class_teacher BOOLEAN DEFAULT false,
    academic_year TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STUDENTS TABLE
-- ============================================

CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admission_number TEXT UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT,
    date_of_birth DATE,
    gender TEXT,
    blood_group TEXT,
    aadhar_number TEXT,
    address TEXT,
    address_hi TEXT,
    father_name TEXT,
    father_phone TEXT,
    mother_name TEXT,
    mother_phone TEXT,
    guardian_name TEXT,
    guardian_phone TEXT,
    emergency_contact TEXT,
    photo_url TEXT,
    class_id UUID REFERENCES classes(id),
    section_id UUID REFERENCES sections(id),
    roll_number TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- HOMEWORK TABLE
-- ============================================

CREATE TABLE homework (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    description_hi TEXT,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    due_date DATE,
    attachments JSONB DEFAULT '[]',
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTICES TABLE
-- ============================================

CREATE TABLE notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    content_hi TEXT,
    notice_type TEXT DEFAULT 'general',
    priority TEXT DEFAULT 'normal',
    is_public BOOLEAN DEFAULT true,
    target_audience TEXT DEFAULT 'all',
    class_id UUID REFERENCES classes(id),
    attachments JSONB DEFAULT '[]',
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LEAVE REQUESTS TABLE
-- ============================================

CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    leave_type TEXT NOT NULL,
    subject TEXT NOT NULL,
    reason TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status leave_status DEFAULT 'pending',
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BIRTHDAYS TABLE
-- ============================================

CREATE TABLE birthdays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_name TEXT NOT NULL,
    person_type TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    class_id UUID REFERENCES classes(id),
    section_id UUID REFERENCES sections(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STUDENT OF THE MONTH TABLE
-- ============================================

CREATE TABLE student_of_month (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    class_id UUID REFERENCES classes(id),
    section_id UUID REFERENCES sections(id),
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    achievement TEXT NOT NULL,
    photo_url TEXT,
    submitted_by UUID REFERENCES profiles(id),
    status TEXT DEFAULT 'pending',
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GALLERY TABLE
-- ============================================

CREATE TABLE gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    event_date DATE,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ACHIEVEMENTS TABLE
-- ============================================

CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    student_name TEXT,
    class_id UUID REFERENCES classes(id),
    date_achieved DATE,
    image_url TEXT,
    is_published BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RESOURCES TABLE
-- ============================================

CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    file_url TEXT,
    file_type TEXT,
    file_size INTEGER,
    class_id UUID REFERENCES classes(id),
    subject_id UUID REFERENCES subjects(id),
    is_public BOOLEAN DEFAULT true,
    download_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ADMISSION ENQUIRIES TABLE
-- ============================================

CREATE TABLE admission_enquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_name TEXT NOT NULL,
    student_name TEXT,
    email TEXT,
    phone TEXT NOT NULL,
    class_interested TEXT,
    message TEXT,
    status enquiry_status DEFAULT 'new',
    follow_up_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PARENT MESSAGES TABLE
-- ============================================

CREATE TABLE parent_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status message_status DEFAULT 'unread',
    assigned_to UUID REFERENCES profiles(id),
    response TEXT,
    responded_by UUID REFERENCES profiles(id),
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SCHOOL TIMINGS TABLE
-- ============================================

CREATE TABLE school_timings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_of_week INTEGER NOT NULL,
    period_number INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject_id UUID REFERENCES subjects(id),
    class_id UUID REFERENCES classes(id),
    section_id UUID REFERENCES sections(id),
    is_break BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EMERGENCY ALERTS TABLE
-- ============================================

CREATE TABLE emergency_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    message_hi TEXT,
    alert_level alert_level DEFAULT 'info',
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CALENDAR EVENTS TABLE
-- ============================================

CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_type TEXT,
    is_holiday BOOLEAN DEFAULT false,
    is_exam BOOLEAN DEFAULT false,
    class_id UUID REFERENCES classes(id),
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WEBSITE CONTENT TABLE
-- ============================================

CREATE TABLE website_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_key TEXT NOT NULL,
    section_key TEXT,
    title TEXT,
    title_hi TEXT,
    content TEXT,
    content_hi TEXT,
    image_url TEXT,
    link_url TEXT,
    link_text TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FAQS TABLE
-- ============================================

CREATE TABLE faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    question_hi TEXT,
    answer TEXT NOT NULL,
    answer_hi TEXT,
    category TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TEACHER REGISTRATIONS TABLE
-- ============================================

CREATE TABLE teacher_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    qualification TEXT,
    experience TEXT,
    address TEXT,
    id_proof_url TEXT,
    status registration_status DEFAULT 'pending',
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AUDIT LOGS TABLE
-- ============================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BRANDING TABLE
-- ============================================

CREATE TABLE branding (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    logo_url TEXT,
    favicon_url TEXT,
    primary_color TEXT DEFAULT '#12335B',
    secondary_color TEXT DEFAULT '#245A8D',
    accent_color TEXT DEFAULT '#D99500',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SOCIAL LINKS TABLE
-- ============================================

CREATE TABLE social_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform TEXT NOT NULL,
    url TEXT,
    icon TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_classes_numeric ON classes(numeric_value);
CREATE INDEX idx_sections_class ON sections(class_id);
CREATE INDEX idx_teacher_assignments_teacher ON teacher_assignments(teacher_id);
CREATE INDEX idx_teacher_assignments_class ON teacher_assignments(class_id);
CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_students_section ON students(section_id);
CREATE INDEX idx_homework_class ON homework(class_id);
CREATE INDEX idx_homework_teacher ON homework(teacher_id);
CREATE INDEX idx_notices_public ON notices(is_public);
CREATE INDEX idx_notices_created ON notices(created_at DESC);
CREATE INDEX idx_leave_requests_teacher ON leave_requests(teacher_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_birthdays_date ON birthdays(date_of_birth);
CREATE INDEX idx_student_of_month_date ON student_of_month(month, year);
CREATE INDEX idx_gallery_active ON gallery(is_active);
CREATE INDEX idx_achievements_published ON achievements(is_published);
CREATE INDEX idx_resources_public ON resources(is_public);
CREATE INDEX idx_enquiries_status ON admission_enquiries(status);
CREATE INDEX idx_messages_status ON parent_messages(status);
CREATE INDEX idx_calendar_events_date ON calendar_events(event_date);
CREATE INDEX idx_faqs_active ON faqs(is_active);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================
-- FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_sections_updated_at BEFORE UPDATE ON sections FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_homework_updated_at BEFORE UPDATE ON homework FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_notices_updated_at BEFORE UPDATE ON notices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON leave_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_achievements_updated_at BEFORE UPDATE ON achievements FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_enquiries_updated_at BEFORE UPDATE ON admission_enquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON parent_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_timings_updated_at BEFORE UPDATE ON school_timings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_alerts
