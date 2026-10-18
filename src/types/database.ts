// ============================================================================
// View Point Public School - Database Types
// Complete TypeScript interfaces for all database tables, roles, and payloads
// ============================================================================

// ----------------------------------------------------------------------------
// Enums and Constants
// ----------------------------------------------------------------------------

export type UserRole = 'principal' | 'teacher' | 'pending_teacher' | 'public';

export type RegistrationStatus = 'pending' | 'approved' | 'rejected';

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export type NoticeType = 'internal' | 'public' | 'all';

export type NoticePriority = 'low' | 'medium' | 'high' | 'urgent';

export type StudentOfMonthStatus = 'pending' | 'approved' | 'rejected';

export type AlertStatus = 'active' | 'resolved';

export type MediaType = 'image' | 'video' | 'document';

export type ContentSection = 
  | 'homepage'
  | 'about'
  | 'academics'
  | 'admissions'
  | 'contact'
  | 'footer'
  | 'hero'
  | 'principal_message'
  | 'facilities'
  | 'why_choose_us';

export type AuditAction = 
  | 'create'
  | 'update'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'login'
  | 'logout'
  | 'view';

export type AuditEntity =
  | 'profile'
  | 'teacher_registration'
  | 'staff'
  | 'class'
  | 'section'
  | 'subject'
  | 'teacher_assignment'
  | 'student'
  | 'homework'
  | 'notice'
  | 'leave_request'
  | 'birthday'
  | 'student_of_month'
  | 'gallery'
  | 'achievement'
  | 'resource'
  | 'enquiry'
  | 'message'
  | 'timing'
  | 'alert'
  | 'calendar_event'
  | 'website_content'
  | 'settings'
  | 'chatbot_faq'
  | 'media';

// ----------------------------------------------------------------------------
// Base Types
// ----------------------------------------------------------------------------

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface SoftDeleteEntity extends BaseEntity {
  deleted_at: string | null;
}

export interface CreatedByEntity extends BaseEntity {
  created_by: string | null;
}

export interface SoftDeleteCreatedByEntity extends SoftDeleteEntity, CreatedByEntity {}

// ----------------------------------------------------------------------------
// Profile & Authentication Types
// ----------------------------------------------------------------------------

export interface Profile extends BaseEntity {
  user_id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  last_login: string | null;
}

export interface ProfileUpdatePayload {
  full_name?: string;
  phone?: string | null;
  avatar_url?: string | null;
}

export interface ProfileWithStats extends Profile {
  registration_count?: number;
  assignment_count?: number;
  homework_count?: number;
}

// ----------------------------------------------------------------------------
// Teacher Registration Types
// ----------------------------------------------------------------------------

export interface TeacherRegistration extends SoftDeleteCreatedByEntity {
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  qualification: string;
  experience_years: number | null;
  subjects_specialization: string[];
  address: string | null;
  aadhaar_number: string | null;
  date_of_birth: string | null;
  status: RegistrationStatus;
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  profile_id: string | null;
}

export interface TeacherRegistrationPayload {
  full_name: string;
  email: string;
  phone: string;
  qualification: string;
  experience_years?: number | null;
  subjects_specialization: string[];
  address?: string | null;
  aadhaar_number?: string | null;
  date_of_birth?: string | null;
}

export interface TeacherRegistrationReviewPayload {
  status: RegistrationStatus;
  rejection_reason?: string | null;
}

// ----------------------------------------------------------------------------
// Staff Types
// ----------------------------------------------------------------------------

export interface Staff extends SoftDeleteCreatedByEntity {
  profile_id: string;
  employee_id: string | null;
  designation: string | null;
  department: string | null;
  date_of_joining: string | null;
  qualification: string | null;
  experience_years: number | null;
  is_class_teacher: boolean;
  is_active: boolean;
  profile?: Profile;
}

export interface StaffCreatePayload {
  profile_id: string;
  employee_id?: string | null;
  designation?: string | null;
  department?: string | null;
  date_of_joining?: string | null;
  qualification?: string | null;
  experience_years?: number | null;
  is_class_teacher?: boolean;
}

export interface StaffUpdatePayload extends Partial<StaffCreatePayload> {
  is_active?: boolean;
}

// ----------------------------------------------------------------------------
// Class Types
// ----------------------------------------------------------------------------

export interface Class extends SoftDeleteCreatedByEntity {
  name: string;
  numeric_value: number | null;
  description: string | null;
  is_active: boolean;
  sections?: Section[];
}

export interface ClassCreatePayload {
  name: string;
  numeric_value?: number | null;
  description?: string | null;
}

export interface ClassUpdatePayload extends Partial<ClassCreatePayload> {
  is_active?: boolean;
}

// ----------------------------------------------------------------------------
// Section Types
// ----------------------------------------------------------------------------

export interface Section extends SoftDeleteCreatedByEntity {
  class_id: string;
  name: string;
  capacity: number | null;
  class_teacher_id: string | null;
  is_active: boolean;
  class?: Class;
  class_teacher?: Staff;
  students?: Student[];
}

export interface SectionCreatePayload {
  class_id: string;
  name: string;
  capacity?: number | null;
  class_teacher_id?: string | null;
}

export interface SectionUpdatePayload extends Partial<SectionCreatePayload> {
  is_active?: boolean;
}

// ----------------------------------------------------------------------------
// Subject Types
// ----------------------------------------------------------------------------

export interface Subject extends SoftDeleteCreatedByEntity {
  name: string;
  code: string | null;
  description: string | null;
  is_active: boolean;
}

export interface SubjectCreatePayload {
  name: string;
  code?: string | null;
  description?: string | null;
}

export interface SubjectUpdatePayload extends Partial<SubjectCreatePayload> {
  is_active?: boolean;
}

// ----------------------------------------------------------------------------
// Teacher Assignment Types
// ----------------------------------------------------------------------------

export interface TeacherAssignment extends SoftDeleteCreatedByEntity {
  staff_id: string;
  class_id: string;
  section_id: string;
  subject_id: string;
  is_primary: boolean;
  academic_year: string;
  staff?: Staff;
  class?: Class;
  section?: Section;
  subject?: Subject;
}

export interface TeacherAssignmentCreatePayload {
  staff_id: string;
  class_id: string;
  section_id: string;
  subject_id: string;
  is_primary?: boolean;
  academic_year: string;
}

export interface TeacherAssignmentUpdatePayload extends Partial<TeacherAssignmentCreatePayload> {
  is_active?: boolean;
}

export interface TeacherAssignmentBulkPayload {
  assignments: TeacherAssignmentCreatePayload[];
}

// ----------------------------------------------------------------------------
// Student Types
// ----------------------------------------------------------------------------

export interface Student extends SoftDeleteCreatedByEntity {
  admission_number: string;
  roll_number: string | null;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | null;
  blood_group: string | null;
  aadhaar_number: string | null;
  address: string | null;
  father_name: string | null;
  mother_name: string | null;
  guardian_phone: string | null;
  guardian_email: string | null;
  class_id: string;
  section_id: string;
  admission_date: string | null;
  previous_school: string | null;
  is_active: boolean;
  class?: Class;
  section?: Section;
}

export interface StudentCreatePayload {
  admission_number: string;
  roll_number?: string | null;
  first_name: string;
  last_name: string;
  date_of_birth?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  blood_group?: string | null;
  aadhaar_number?: string | null;
  address?: string | null;
  father_name?: string | null;
  mother_name?: string | null;
  guardian_phone?: string | null;
  guardian_email?: string | null;
  class_id: string;
  section_id: string;
  admission_date?: string | null;
  previous_school?: string | null;
}

export interface StudentUpdatePayload extends Partial<StudentCreatePayload> {
  is_active?: boolean;
}

export interface StudentWithDetails extends Student {
  class_name: string;
  section_name: string;
  class_teacher?: Staff;
}

// ----------------------------------------------------------------------------
// Homework Types
// ----------------------------------------------------------------------------

export interface Homework extends SoftDeleteCreatedByEntity {
  title: string;
  title_hi: string | null;
  description: string | null;
  description_hi: string | null;
  class_id: string;
  section_id: string;
  subject_id: string;
  due_date: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  is_published: boolean;
  published_at: string | null;
  class?: Class;
  section?: Section;
  subject?: Subject;
  staff?: Staff;
}

export interface HomeworkCreatePayload {
  title: string;
  title_hi?: string | null;
  description?: string | null;
  description_hi?: string | null;
  class_id: string;
  section_id: string;
  subject_id: string;
  due_date?: string | null;
  attachment_url?: string | null;
  attachment_name?: string | null;
}

export interface HomeworkUpdatePayload extends Partial<HomeworkCreatePayload> {
  is_published?: boolean;
  published_at?: string | null;
}

export interface HomeworkFilters {
  class_id?: string;
  section_id?: string;
  subject_id?: string;
  is_published?: boolean;
  date_from?: string;
  date_to?: string;
}

// ----------------------------------------------------------------------------
// Notice Types
// ----------------------------------------------------------------------------

export interface Notice extends SoftDeleteCreatedByEntity {
  title: string;
  title_hi: string | null;
  content: string;
  content_hi: string | null;
  type: NoticeType;
  priority: NoticePriority;
  class_ids: string[] | null;
  section_ids: string[] | null;
  attachment_url: string | null;
  attachment_name: string | null;
  valid_from: string | null;
  valid_until: string | null;
  is_pinned: boolean;
  is_published: boolean;
  published_at: string | null;
  view_count: number;
}

export interface NoticeCreatePayload {
  title: string;
  title_hi?: string | null;
  content: string;
  content_hi?: string | null;
  type: NoticeType;
  priority?: NoticePriority;
  class_ids?: string[] | null;
  section_ids?: string[] | null;
  attachment_url?: string | null;
  attachment_name?: string | null;
  valid_from?: string | null;
  valid_until?: string | null;
  is_pinned?: boolean;
}

export interface NoticeUpdatePayload extends Partial<NoticeCreatePayload> {
  is_published?: boolean;
  published_at?: string | null;
}

export interface NoticeFilters {
  type?: NoticeType;
  priority?: NoticePriority;
  class_id?: string;
  section_id?: string;
  is_published?: boolean;
  date_from?: string;
  date_to?: string;
}

// ----------------------------------------------------------------------------
// Leave Request Types
// ----------------------------------------------------------------------------

export interface LeaveRequest extends BaseEntity {
  staff_id: string;
  leave_type: 'sick' | 'casual' | 'emergency' | 'personal' | 'other';
  subject: string;
  message: string;
  start_date: string;
  end_date: string;
  total_days: number;
  status: LeaveStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  staff?: Staff & { profile?: Profile };
}

export interface LeaveRequestCreatePayload {
  leave_type: 'sick' | 'casual' | 'emergency' | 'personal' | 'other';
  subject: string;
  message: string;
  start_date: string;
  end_date: string;
}

export interface LeaveRequestReviewPayload {
  status: LeaveStatus;
  review_notes?: string | null;
}

export interface LeaveRequestFilters {
  staff_id?: string;
  status?: LeaveStatus;
  leave_type?: string;
  date_from?: string;
  date_to?: string;
}

// ----------------------------------------------------------------------------
// Birthday Types
// ----------------------------------------------------------------------------

export interface Birthday extends BaseEntity {
  student_id: string | null;
  staff_id: string | null;
  name: string;
  date_of_birth: string;
  type: 'student' | 'staff' | 'teacher';
  is_wished: boolean;
  wished_at: string | null;
  student?: Student;
  staff?: Staff;
}

export interface BirthdayCreatePayload {
  student_id?: string | null;
  staff_id?: string | null;
  name: string;
  date_of_birth: string;
  type: 'student' | 'staff' | 'teacher';
}

export interface BirthdayFilters {
  month?: number;
  type?: 'student' | 'staff' | 'teacher';
  upcoming_days?: number;
}

// ----------------------------------------------------------------------------
// Student of the Month Types
// ----------------------------------------------------------------------------

export interface StudentOfMonth extends SoftDeleteCreatedByEntity {
  student_id: string;
  class_id: string;
  section_id: string;
  month: number;
  year: number;
  achievement: string;
  achievement_hi: string | null;
  nominated_by: string;
  status: StudentOfMonthStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  is_featured: boolean;
  featured_at: string | null;
  student?: Student;
  class?: Class;
  section?: Section;
  nominator?: Staff & { profile?: Profile };
}

export interface StudentOfMonthCreatePayload {
  student_id: string;
  class_id: string;
  section_id: string;
  month: number;
  year: number;
  achievement: string;
  achievement_hi?: string | null;
}

export interface StudentOfMonthReviewPayload {
  status: StudentOfMonthStatus;
  rejection_reason?: string | null;
  is_featured?: boolean;
}

export interface StudentOfMonthFilters {
  class_id?: string;
  section_id?: string;
  month?: number;
  year?: number;
  status?: StudentOfMonthStatus;
  is_featured?: boolean;
}

// ----------------------------------------------------------------------------
// Gallery Types
// ----------------------------------------------------------------------------

export interface Gallery extends SoftDeleteCreatedByEntity {
  title: string;
  title_hi: string | null;
  description: string | null;
  description_hi: string | null;
  media_url: string;
  media_type: MediaType;
  thumbnail_url: string | null;
  category: string | null;
  event_date: string | null;
  is_featured: boolean;
  display_order: number;
}

export interface GalleryCreatePayload {
  title: string;
  title_hi?: string | null;
  description?: string | null;
  description_hi?: string | null;
  media_url: string;
  media_type: MediaType;
  thumbnail_url?: string | null;
  category?: string | null;
  event_date?: string | null;
  is_featured?: boolean;
  display_order?: number;
}

export interface GalleryUpdatePayload extends Partial<GalleryCreatePayload> {
  is_active?: boolean;
}

export interface GalleryFilters {
  category?: string;
  media_type?: MediaType;
  is_featured?: boolean;
  date_from?: string;
  date_to?: string;
}

// ----------------------------------------------------------------------------
// Achievement Types
// ----------------------------------------------------------------------------

export interface Achievement extends SoftDeleteCreatedByEntity {
  title: string;
  title_hi: string | null;
  description: string | null;
  description_hi: string | null;
  category: 'academic' | 'sports' | 'cultural' | 'science' | 'arts' | 'other';
  student_name: string | null;
  student_class: string | null;
  achievement_date: string | null;
  award_level: 'school' | 'district' | 'state' | 'national' | 'international' | null;
  media_url: string | null;
  is_featured: boolean;
  display_order: number;
}

export interface AchievementCreatePayload {
  title: string;
  title_hi?: string | null;
  description?: string | null;
  description_hi?: string | null;
  category: 'academic' | 'sports' | 'cultural' | 'science' | 'arts' | 'other';
  student_name?: string | null;
  student_class?: string | null;
  achievement_date?: string | null;
  award_level?: 'school' | 'district' | 'state' | 'national' | 'international' | null;
  media_url?: string | null;
  is_featured?: boolean;
  display_order?: number;
}

export interface AchievementUpdatePayload extends Partial<AchievementCreatePayload> {
  is_active?: boolean;
}

export interface AchievementFilters {
  category?: string;
  award_level?: string;
  is_featured?: boolean;
  date_from?: string;
  date_to?: string;
}

// ----------------------------------------------------------------------------
// Resource Types
// ----------------------------------------------------------------------------

export interface Resource extends SoftDelete
