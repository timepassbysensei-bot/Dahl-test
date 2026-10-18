<think>The user wants me to create a complete production-ready SQL file for Supabase storage buckets and RLS policies. This is migration file 003_storage_buckets.sql.

I need to create:
1. Storage buckets for:
   - branding (logo, favicon)
   - public-gallery
   - public-achievements
   - public-site-assets
   - homework
   - resources
   - student-images
   - message-attachments
   - internal-notices

2. Complete RLS policies for each bucket covering:
   - Public read access for public buckets
   - Authenticated access for certain buckets
   - Role-based access for management buckets
   - Principal full access
   - Teacher limited access
   - Proper insert/update/delete permissions

Let me write comprehensive storage bucket creation and RLS policies.
</think>

-- ============================================
-- Storage Buckets for View Point Public School
-- Migration: 003_storage_buckets.sql
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Create Storage Buckets
-- ============================================

-- Branding bucket for logo and favicon
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at)
VALUES (
  'branding',
  'branding',
  true,
  5242880, -- 5MB
  ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'],
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Public gallery bucket for school gallery images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at)
VALUES (
  'public-gallery',
  'public-gallery',
  true,
  10485760, -- 10MB
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'],
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Public achievements bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at)
VALUES (
  'public-achievements',
  'public-achievements',
  true,
  10485760, -- 10MB
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'],
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Public site assets bucket for website content
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at)
VALUES (
  'public-site-assets',
  'public-site-assets',
  true,
  5242880, -- 5MB
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'],
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Homework bucket for teacher uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at)
VALUES (
  'homework',
  'homework',
  false,
  20971520, -- 20MB
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Resources bucket for educational materials
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at)
VALUES (
  'resources',
  'resources',
  true,
  52428800, -- 50MB
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'application/pdf', 
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav'],
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Student images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at)
VALUES (
  'student-images',
  'student-images',
  false,
  5242880, -- 5MB
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Message attachments bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at)
VALUES (
  'message-attachments',
  'message-attachments',
  false,
  10485760, -- 10MB
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'application/pdf', 
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Internal notices bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at)
VALUES (
  'internal-notices',
  'internal-notices',
  false,
  10485760, -- 10MB
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'application/pdf', 
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Storage RLS Policies
-- ============================================

-- ============================================
-- Branding Bucket Policies
-- ============================================

-- Public read access for branding (logo, favicon)
CREATE POLICY "Public read access to branding"
ON storage.objects FOR SELECT
USING (bucket_id = 'branding');

-- Principal can upload branding files
CREATE POLICY "Principal can upload branding"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'branding' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'principal'
  )
);

-- Principal can update branding files
CREATE POLICY "Principal can update branding"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'branding'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'principal'
  )
);

-- Principal can delete branding files
CREATE POLICY "Principal can delete branding"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'branding'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'principal'
  )
);

-- ============================================
-- Public Gallery Bucket Policies
-- ============================================

-- Public read access for gallery
CREATE POLICY "Public read access to public gallery"
ON storage.objects FOR SELECT
USING (bucket_id = 'public-gallery');

-- Principal can upload gallery images
CREATE POLICY "Principal can upload to public gallery"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'public-gallery' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'principal'
  )
);

-- Principal can update gallery images
CREATE POLICY "Principal can update public gallery"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'public-gallery'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'principal'
  )
);

-- Principal can delete gallery images
CREATE POLICY "Principal can delete from public gallery"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'public-gallery'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'principal'
  )
);

-- ============================================
-- Public Achievements Bucket Policies
-- ============================================

-- Public read access for achievements
CREATE POLICY "Public read access to public achievements"
ON storage.objects FOR SELECT
USING (bucket_id = 'public-achievements');

-- Principal can upload achievement files
CREATE POLICY "Principal can upload to public achievements"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'public-achievements' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'principal'
  )
);

-- Principal can update achievement files
CREATE POLICY "Principal can update public achievements"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'public-achievements'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'principal'
  )
);

-- Principal can delete achievement files
CREATE POLICY "Principal can delete from public achievements"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'public-achievements'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'principal'
  )
);

-- ============================================
-- Public Site Assets Bucket Policies
-- ============================================

-- Public read access for site assets
CREATE POLICY "Public read access to public site assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'public-site-assets');

-- Principal can upload site assets
CREATE POLICY "Principal can upload to public site assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'public-site-assets' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'principal'
  )
);

-- Principal can update site assets
CREATE POLICY "Principal can update public site assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'public-site-assets'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'principal'
  )
);

-- Principal can delete site assets
CREATE POLICY "Principal can delete from public site assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'public-site-assets'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'principal'
  )
);

-- ============================================
-- Homework Bucket Policies
-- ============================================

-- Teachers and Principal can read homework files for their classes
CREATE POLICY "Teachers and Principal can read homework"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'homework'
  AND (
    -- Principal can access all
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'principal'
    )
    OR
    -- Teachers can access homework for their assigned classes
    EXISTS (
      SELECT 1 FROM teacher_assignments ta
      JOIN classes c ON c.id = ta.class_id
      JOIN homework h ON h.class_id = c.id
      WHERE ta.teacher_id = auth.uid()
      AND storage.objects.name LIKE 'homework/' || h.id || '/%'
    )
    OR
    -- Allow access if the file path contains the teacher's assigned class homework
    EXISTS (
      SELECT 1 FROM teacher_assignments ta
      WHERE ta.teacher_id = auth.uid()
      AND storage.objects.name LIKE 'homework/%/' || ta.class_id || '/%'
    )
  )
);

-- Teachers can upload homework for their assigned classes
CREATE POLICY "Teachers can upload homework"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'homework' 
  AND auth.role() = 'authenticated'
  AND (
    -- Principal can upload any homework
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'principal'
    )
    OR
    -- Teachers can upload homework for their assigned classes
    EXISTS (
      SELECT 1 FROM teacher_assignments ta
      WHERE ta.teacher_id = auth.uid()
      AND storage.objects.name LIKE 'homework/%/' || ta.class_id || '/%'
    )
  )
);

-- Teachers can update homework for their assigned classes
CREATE POLICY "Teachers can update homework"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'homework'
  AND auth.role() = 'authenticated'
  AND (
    -- Principal can update any homework
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'principal'
    )
    OR
    -- Teachers can update their own homework
    EXISTS (
      SELECT 1 FROM teacher_assignments ta
      WHERE ta.teacher_id = auth.uid()
      AND storage.objects.name LIKE 'homework/%/' || ta.class_id || '/%'
    )
  )
);

-- Teachers can delete homework for their assigned classes
CREATE POLICY "Teachers can delete homework"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'homework'
  AND auth.role() = 'authenticated'
  AND (
    -- Principal can delete any homework
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'principal'
    )
    OR
    -- Teachers can delete their own homework
    EXISTS (
      SELECT 1 FROM teacher_assignments ta
      WHERE ta.teacher_id = auth.uid()
      AND storage.objects.name LIKE 'homework/%/' || ta.class_id || '/%'
    )
  )
);

-- ============================================
-- Resources Bucket Policies
-- ============================================

-- Public read access for resources
CREATE POLICY "Public read access to resources"
ON storage.objects FOR SELECT
USING (bucket_id = 'resources');

-- Principal can upload resources
CREATE POLICY "Principal can upload resources"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'resources' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'principal'
  )
);

-- Principal can update resources
CREATE POLICY "Principal can update resources"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'resources'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'principal'
  )
);

-- Principal can delete resources
CREATE POLICY "Principal can delete resources"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'resources'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'principal'
  )
);

-- ============================================
-- Student Images Bucket Policies
-- ============================================

-- Principal can read student images
CREATE POLICY "Principal can read student images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'student-images'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'principal'
  )
);

-- Principal can upload student images
CREATE POLICY "Principal can upload student images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'student-images' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'principal'
  )
);

-- Principal can update student images
CREATE POLICY "Principal can update student images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'student-images'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'principal'
  )
);

-- Principal can delete student images
CREATE POLICY "Principal can delete student images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'student-images'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'principal'
  )
);

-- ============================================
-- Message Attachments Bucket Policies
-- ============================================

-- Authenticated users can read message attachments for their messages
CREATE POLICY "Users can read own message attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'message-attachments'
  AND auth.role() = 'authenticated'
  AND (
    -- Principal can access all attachments
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'principal'
    )
    OR
    -- Users can access their own message attachments
    storage.objects.name LIKE 'messages/' || auth.uid() || '/%'
    OR
    -- Teachers can access attachments from parent messages to them
    EXISTS (
      SELECT 1 FROM parent_messages pm
      WHERE pm.teacher_id = auth.uid()
      AND storage.objects.name LIKE 'messages/' || pm.id || '/%'
    )
  )
);

-- Principal can upload message attachments
CREATE POLICY "Principal can upload message attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'message-attachments' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'principal'
  )
);

-- Teachers can upload attachments to their messages
CREATE POLICY "Teachers can upload message attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'message-attachments' 
  AND auth.role() = 'authenticated'
  AND storage.objects.name LIKE 'messages/' || auth.uid() || '/%'
);

-- Principal can update message attachments
CREATE POLICY "Principal can update message attachments"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'message-attachments'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'principal'
  )
);

-- Principal can delete message attachments
CREATE POLICY "Principal can delete message attachments"
ON storage.objects FOR DELETE
US