# View Point Public School

A complete, production-ready school management platform with a professional public website, Principal dashboard, Teacher dashboard, secure teacher registration and approval workflow, Supabase authentication, Row Level Security, and Netlify deployment.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Prerequisites](#prerequisites)
6. [Local Development Setup](#local-development-setup)
7. [Supabase Setup](#supabase-setup)
8. [Database Migrations](#database-migrations)
9. [Principal Bootstrap](#principal-bootstrap)
10. [Environment Variables](#environment-variables)
11. [Running the Application](#running-the-application)
12. [Testing](#testing)
13. [Netlify Deployment](#netlify-deployment)
14. [Row Level Security](#row-level-security)
15. [Storage Setup](#storage-setup)
16. [Edge Functions](#edge-functions)
17. [Content Management](#content-management)
18. [Bilingual Support](#bilingual-support)
19. [Operational Guide](#operational-guide)
20. [Troubleshooting](#troubleshooting)
21. [Security Notes](#security-notes)
22. [License](#license)

---

## Overview

View Point Public School is a full-stack web application that combines a professional public school website with secure role-based dashboards for the Principal and Teachers. The platform manages the complete school workflow: teacher registration and approval, classes and sections, homework, notices, leave requests, birthdays, student of the month, gallery, achievements, resources, admission enquiries, parent messages, emergency alerts, calendar, website content, branding, FAQ chatbot, and audit logs.

All public-facing content is editable through the Principal dashboard. Unknown or unavailable information is never fabricated — it is either hidden or made editable.

---

## Features

### Public Website

- Home page with hero, highlights, about preview, Principal's message, academics overview, facilities, latest notices, upcoming events, gallery preview, achievements, student of the month, resources, FAQs, admission enquiry CTA, contact information, and footer
- About, Academics, Admissions, Notices, Gallery, Achievements, Resources, Calendar, and Contact pages
- Teacher Registration and Teacher Login pages
- Privacy Policy and Terms and Conditions
- Responsive mobile navigation
- English/Hindi language toggle for homework, notices, emergency alerts, and configured homepage content
- FAQ chatbot with configurable Q&A pairs
- Useful 404 page

### Principal Dashboard

- Pending teacher registration approval/rejection
- Staff roster management
- Class and section manager
- Teacher assignment to classes, sections, and subjects
- Homework review across all classes
- Internal and public notice management
- Leave request inbox
- Timing manager
- Emergency alert broadcaster
- School settings
- Gallery and media library management
- Resources manager
- Parent messages inbox
- Admission enquiries inbox
- Calendar management
- Achievements management
- Student of the Month review and approval
- Birthday management
- Chatbot FAQ management
- Website content editor
- Logo and favicon management
- Audit log viewer
- Direct access to the Teacher dashboard

### Teacher Dashboard

- View assigned classes, sections, and subjects
- Upload and manage homework (English and Hindi)
- Create class notices
- Read Principal notices
- Submit and track leave requests
- Birthday tools where permitted
- Submit Student of the Month candidates
- Strict access isolation — teachers only see their own assigned content

### Teacher Registration and Approval

1. Teacher registers through the public registration page.
2. Supabase Auth creates the account.
3. A profile and pending registration request are created.
4. The Principal approves or rejects the request.
5. Approval assigns the Teacher role through a trusted server-side RPC function.
6. The approved teacher appears in the Staff Roster.
7. The Principal assigns classes, sections, and subjects.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| Forms | React Hook Form + Zod |
| Data fetching | TanStack Query |
| Icons | Lucide React |
| Backend | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| Security | Supabase Row Level Security |
| Testing | Vitest, React Testing Library, Playwright |
| Deployment | Netlify |

---

## Project Structure

```text
/
  src/
    components/          # Shared UI components
    layouts/             # Public, Principal, Teacher layouts
    pages/
      public/            # Public website pages
      auth/              # Login, registration, pending approval
      principal/         # Principal dashboard pages
      teacher/           # Teacher dashboard pages
    features/
      auth/              # Authentication logic
      registrations/     # Teacher registration and approval
      staff/             # Staff roster
      classes/           # Classes and sections
      students/          # Student management
      homework/          # Homework module
      notices/           # Notices module
      leave/             # Leave requests
      birthdays/         # Birthday management
      student-of-month/  # Student of the Month
      timings/           # School timing manager
      gallery/           # Gallery and media
      achievements/      # Achievements
      resources/         # Resources
      messages/          # Parent messages
      enquiries/         # Admission enquiries
      calendar/          # School calendar
      settings/          # School settings
      audit/             # Audit logs
      chatbot/           # FAQ chatbot
    hooks/               # Custom React hooks
    lib/                 # Supabase client, utilities
    services/            # API service layer
    types/               # TypeScript types
    validation/          # Zod schemas
  public/                # Static assets
  supabase/
    migrations/          # SQL migrations
    functions/           # Edge Functions
    seed.sql             # Seed data
    config.toml          # Supabase CLI config
  docs/                  # Additional documentation
  tests/                 # Test files
  .env.example           # Environment variable template
  netlify.toml           # Netlify configuration
  README.md
  package.json
```

---

## Prerequisites

- Node.js 20.x or later
- npm 10.x or later
- A Supabase account and project
- A Netlify account (for deployment)
- Supabase CLI (for local migrations and Edge Functions)

Install the Supabase CLI:

```bash
npm install -g supabase
```

---

## Local Development Setup

### 1. Clone and install dependencies

```bash
git clone <repository-url>
cd viewpoint-public-school
npm install
```

### 2. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase project credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

> **Never** put the `service_role` key in the browser or in `.env.local`.

### 3. Start the development server

```bash
npm run dev
```

The application runs at `http://localhost:5173`.

---

## Supabase Setup

### Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Choose a strong database password and store it securely.
3. Note your project URL and anon key from **Project Settings → API**.

### Link the project

```bash
supabase login
supabase link --project-ref your-project-ref
```

### Apply migrations

```bash
supabase db push
```

This applies all migrations in `supabase/migrations/` in order.

### Apply seed data

```bash
supabase db reset
```

Or apply the seed file manually:

```bash
psql "$DATABASE_URL" -f supabase/seed.sql
```

---

## Database Migrations

All schema changes are versioned in `supabase/migrations/`. The migration files are applied in chronological order.

### Core tables

| Table | Purpose |
|---|---|
| `profiles` | User profiles linked to `auth.users` |
| `teacher_registrations` | Pending teacher registration requests |
| `staff` | Approved teaching staff |
| `classes` | School classes |
| `sections` | Sections within classes |
| `teacher_assignments` | Teacher → class/section/subject assignments |
| `students` | Student records |
| `homework` | Homework entries with English and Hindi fields |
| `notices` | Public and internal notices |
| `class_notices` | Class-specific notices |
| `leave_requests` | Teacher leave requests |
| `birthdays` | Birthday records |
| `student_of_month` | Student of the Month nominations and approvals |
| `gallery_items` | Gallery media entries |
| `achievements` | School achievements |
| `resources` | Public resources |
| `parent_messages` | Messages from parents |
| `admission_enquiries` | Admission enquiry submissions |
| `school_calendar` | Calendar events |
| `school_settings` | Key-value school settings |
| `school_timings` | School timing schedules |
| `emergency_alerts` | Emergency alert broadcasts |
| `website_content` | Editable public website content |
| `chatbot_faqs` | FAQ chatbot Q&A pairs |
| `audit_logs` | Audit trail for important actions |

### Migration workflow

To create a new migration:

```bash
supabase migration new add_new_feature
```

Edit the generated SQL file, then apply:

```bash
supabase db push
```

---

## Principal Bootstrap

The first Principal account must be created securely. This is a one-time operation performed by a database administrator.

### Method 1: SQL script (recommended)

Run the following SQL in the Supabase SQL Editor or via `psql`:

```sql
-- Replace the email and password with your real values.
-- The password must be hashed; use the Supabase Auth admin API or
-- create the user through the Supabase dashboard first.

-- Step 1: Create the auth user through the Supabase Dashboard:
--    Authentication → Users → Add user
--    Enter the Principal's email and a strong temporary password.

-- Step 2: After the user exists, run this SQL:

-- Get the new user's ID from auth.users
-- (replace 'principal@school.example' with the real email)

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'principal@school.example'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found. Create the user in Supabase Auth first.';
  END IF;

  -- Create the profile with the principal role
  INSERT INTO public.profiles (id, full_name, role, created_at, updated_at)
  VALUES (
    v_user_id,
    'School Principal',
    'principal',
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET role = 'principal', updated_at = now();

  -- Create the staff record
  INSERT INTO public.staff (id, user_id, full_name, designation, is_active, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    v_user_id,
    'School Principal',
    'Principal',
    true,
    now(),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE
  SET full_name = 'School Principal', designation = 'Principal', is_active = true, updated_at = now();

  -- Log the bootstrap
  INSERT INTO public.audit_logs (id, user_id, action, entity_type, entity_id, metadata, created_at)
  VALUES (
    gen_random_uuid(),
    v_user_id,
    'PRINCIPAL_BOOTSTRAP',
    'profiles',
    v_user_id,
    jsonb_build_object('method', 'manual_sql'),
    now()
  );
END $$;
```

### Method 2: Edge Function

If you prefer an Edge Function, deploy `supabase/functions/bootstrap-principal`:

```bash
supabase functions deploy bootstrap-principal
```

Then invoke it once with the service-role key from a trusted server environment:

```bash
curl -X POST https://your-project.supabase.co/functions/v1/bootstrap-principal \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "principal@school.example",
    "password": "a-strong-temporary-password",
    "full_name": "School Principal"
  }'
```

The Edge Function:

1. Creates the auth user with `email` and `password`.
2. Creates the profile with role `principal`.
3. Creates the staff record.
4. Writes an audit log entry.
5. Returns the created user ID.

> **Security:** After bootstrap, delete the Edge Function or protect it so it cannot be invoked again. The function checks whether a Principal already exists and refuses to run a second time.

### Verify the bootstrap

1. Sign out of any existing session.
2. Go to `http://localhost:5173/principal/login`.
3. Sign in with the Principal credentials.
4. The Principal dashboard should load with full access.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon (public) key |
| `VITE_SITE_URL` | No | Canonical site URL for SEO and redirects |
| `VITE_MAP_EMBED_URL` | No | Google Maps embed URL for the contact page |

Create a `.env.local` file for local development and configure the same variables in Netlify for production.

---

## Running the Application

### Development

```bash
npm run dev
```

### Production build

```bash
npm run build
npm run preview
```

### Type checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

---

## Testing

### Unit and integration tests

The project uses Vitest and React Testing Library.

```bash
npm run test
```

Run in watch mode:

```bash
npm run test:watch
```

Run with coverage:

```bash
npm run test:coverage
```

### End-to-end tests

Playwright is configured for end-to-end testing where practical.

```bash
npm run test:e2e
```

Playwright tests cover:

- Public website navigation
- Teacher registration flow
- Principal login and approval of a teacher
- Teacher dashboard access after approval
- Homework creation and visibility
- Leave request submission and approval
- Notice publishing and visibility

### Test accounts

Create test accounts in Supabase Auth for local testing:

| Role | Email | Purpose |
|---|---|---|
| Principal | `principal@test.example` | Full dashboard access |
| Teacher | `teacher@test.example` | Assigned class access |
| Pending Teacher | `pending@test.example` | Approval-pending state |

Use the Principal bootstrap procedure above to create the Principal test account. Create the teacher accounts through the public registration page and approve them through the Principal dashboard.

---

## Netlify Deployment

### 1. Configure `netlify.toml`

The repository includes a `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 2. Connect the repository

1. Log in to [Netlify](https://netlify.com).
2. Choose **Add new site → Import an existing project**.
3. Select your Git repository.
4. Netlify detects the build settings from `netlify.toml`.

### 3. Configure environment variables

In **Site settings → Environment variables**, add:

| Key | Value |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `VITE_SITE_URL` | Your Netlify site URL |
| `VITE_MAP_EMBED_URL` | Optional map embed URL |

### 4. Deploy

Netlify automatically deploys on every push to the main branch. Use **Deploys → Trigger deploy** for manual deployments.

### 5. Configure Supabase Auth redirect URLs

In Supabase **Authentication → URL Configuration**, add:

- `http://localhost:5173/**` for local development
- `https://your-site.netlify.app/**` for production

### 6. Custom domain

Add a custom domain in Netlify **Domain settings** and update the Supabase redirect URLs and `VITE_SITE_URL` accordingly.

---

## Row Level Security

Row Level Security is enforced at the database level. Frontend route guards are a convenience, not a security boundary.

### Policy summary

| Table | Policy |
|---|---|
| `profiles` | Users can read their own profile. Principal can read all profiles. |
| `teacher_registrations` | Public can insert. Principal can read/update. Teacher can read own. |
| `staff` | Principal can manage. Teachers can read their own record. |
| `classes` | Principal can manage. Teachers can read assigned classes. |
| `sections` | Principal can manage. Teachers can read assigned sections. |
| `teacher_assignments` | Principal can manage. Teachers can read their own assignments. |
| `students` | Principal can manage. Teachers can read students in their assigned classes. |
| `homework` | Teachers can insert/update/delete their own. Principal can manage all. Students/parents (future) can read published. |
| `notices` | Principal can manage public and internal notices. Teachers can read internal notices and create class notices. |
| `leave_requests` | Teachers can insert and read their own. Principal can read and update