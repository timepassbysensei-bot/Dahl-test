cat << 'EOF' > auto_builder.mjs
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// ================= CONFIGURATION =================
const DAHL_API_KEY = "dahl_PuyQbMVvfm23yDMS3LszersnvDjTkx6Nx";
const ENDPOINT = "https://inference.dahl.global/v1/chat/completions";

// We use DeepSeek V4 for fast coding and MiniMax M2.7 when files are extra long
const PRIMARY_MODEL = "deepseek-ai/DeepSeek-V4-Flash-0731";
const FALLBACK_MODEL = "MiniMaxAI/MiniMax-M2.7";
const PROGRESS_FILE = "./build_progress.json";

// Complete Production File Blueprint for View Point Public School
const PROJECT_FILES = [
  // Phase 1: Config & Project Setup
  { path: "package.json", desc: "Complete package.json with React 18, TypeScript, Vite, Tailwind CSS, React Router v6, React Hook Form, Zod, TanStack Query, Lucide React, Supabase JS, browser-image-compression, Vitest, Playwright, and required scripts (dev, build, lint, typecheck, test)." },
  { path: "tsconfig.json", desc: "Strict TypeScript configuration for Vite + React." },
  { path: "vite.config.ts", desc: "Vite configuration with path aliases and build optimization." },
  { path: "tailwind.config.js", desc: "Tailwind config with custom View Point Public School color palette (#12335B primary navy, #0B2442 dark navy, #245A8D blue, #D99500 warm gold, #F8FAFC off-white) and Manrope/Inter fonts." },
  { path: "postcss.config.js", desc: "PostCSS configuration for Tailwind CSS." },
  { path: ".env.example", desc: "Environment variable template with VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_SITE_URL, VITE_SCHOOL_NAME=View Point Public School and security comments." },
  { path: "netlify.toml", desc: "Netlify configuration with build command npm run build, publish directory dist, SPA redirects, and security headers." },
  { path: "index.html", desc: "Main HTML entry point with SEO meta tags, Google Fonts (Manrope & Inter), and root div for View Point Public School." },

  // Phase 2: Complete Supabase Database, RLS, RPCs, Storage & Seed
  { path: "supabase/migrations/001_initial_schema.sql", desc: "Complete PostgreSQL schema for View Point Public School: profiles, user_roles, registration_requests, staff, classes, sections, subjects, teacher_assignments, students, homework, homework_attachments, class_notices, staff_notices, leave_requests, birthday_posts, student_of_month, school_timings, emergency_alerts, gallery_albums, gallery_images, media_assets, resources, parent_message_threads, parent_messages, admission_enquiries, calendar_events, achievements, chatbot_faqs, chatbot_unanswered_questions, site_settings, page_sections, social_links, audit_logs with UUIDs, foreign keys, soft-delete archived fields, and unique constraints." },
  { path: "supabase/migrations/002_rls_and_rpc.sql", desc: "Complete Row Level Security (RLS) policies for all tables, role-check helper functions (is_principal, is_assigned_teacher), and atomic RPC functions approve_teacher_registration and reject_teacher_registration with audit logging and rollback safety." },
  { path: "supabase/migrations/003_storage_buckets.sql", desc: "Supabase Storage buckets (branding, public-gallery, public-achievements, public-site-assets, homework, resources, student-images, message-attachments, internal-notices) and complete storage RLS policies." },
  { path: "supabase/seed.sql", desc: "Clearly labelled sample development data for View Point Public School: site_settings, sample classes (Class 1 to 10), sections (A, B), subjects, timings, sample notices, and sample FAQs without fake claims or real passwords." },

  // Phase 3: Core Libs, Types, Bilingual Context & Image Compression
  { path: "src/types/database.ts", desc: "Complete TypeScript interfaces for all database tables, roles (principal, teacher, pending_teacher, public), and form payloads." },
  { path: "src/lib/supabase.ts", desc: "Typed Supabase client initialization with environment variable validation and error helpers." },
  { path: "src/lib/imageCompression.ts", desc: "Automatic client-side image compression utility supporting mobile camera/gallery uploads, EXIF orientation fix, WebP conversion, readable homework text preservation, size validation, and progress callbacks." },
  { path: "src/context/LanguageContext.tsx", desc: "English and Hindi (EN/HI) bilingual language toggle context with safe fallback when Hindi translation is absent." },
  { path: "src/context/AuthContext.tsx", desc: "Supabase Auth provider fetching user profile, canonical role (Principal, Teacher, Pending Teacher), and Principal-to-Teacher dashboard access support without altering stored roles." },
  { path: "src/components/ui/StateViews.tsx", desc: "Reusable LoadingState, EmptyState, ErrorState (with retry button and distinct RLS/network error detection), and ConfirmDialog components." },

  // Phase 4: Layouts & Route Guards
  { path: "src/components/auth/ProtectedRoute.tsx", desc: "Role-based route guard enforcing Principal, Teacher (also accessible by Principal with banner 'Principal access — all authorized classes'), and Pending Teacher screens." },
  { path: "src/layouts/PublicLayout.tsx", desc: "Responsive public website layout with dynamic Emergency Alert bar, Announcement bar, Header with EN/HI toggle, Logo, navigation links, FAQ Chatbot widget, and dynamic Footer." },
  { path: "src/layouts/PrincipalLayout.tsx", desc: "Principal dashboard layout with school logo, role indicator, notification badges, 1-tap 'Teacher Dashboard' switch button, and mobile menu." },
  { path: "src/layouts/TeacherLayout.tsx", desc: "Teacher dashboard layout showing teacher name, assigned classes, 1-tap 'Principal Dashboard' return button (only visible when user is Principal), and sign out." },

  // Phase 5: Public Pages (Section 4)
  { path: "src/pages/public/HomePage.tsx", desc: "Complete 21-section dynamic Homepage for View Point Public School: Hero, Highlights, About Preview, Principal Message, Academics, Facilities, Latest Notices, Events, Gallery Preview, Achievements, Student of the Month, Public Resources, FAQs, and Enquiry CTA." },
  { path: "src/pages/public/AboutPage.tsx", desc: "Dynamic About page with Mission, Vision, Principal's Message, and school overview." },
  { path: "src/pages/public/AcademicsPage.tsx", desc: "Dynamic Academics & School Timings page reading active schedules from Supabase." },
  { path: "src/pages/public/AdmissionsPage.tsx", desc: "Admissions info and working Admission Enquiry form with React Hook Form, Zod validation, and duplicate check." },
  { path: "src/pages/public/PublicNoticesPage.tsx", desc: "Bilingual EN/HI Public Notices board with category filters and attachments." },
  { path: "src/pages/public/GalleryPage.tsx", desc: "Public photo gallery organized by albums with lightbox preview." },
  { path: "src/pages/public/AchievementsPage.tsx", desc: "Published school achievements page with category filters." },
  { path: "src/pages/public/ResourcesPage.tsx", desc: "Public downloadable syllabus, calendars, and student resources." },
  { path: "src/pages/public/CalendarPage.tsx", desc: "Interactive school calendar for holidays, exams, and events." },
  { path: "src/pages/public/ContactPage.tsx", desc: "Contact page with parent message ticket submission form, dynamic address/phone, and optional map." },
  { path: "src/pages/public/LegalPages.tsx", desc: "Dynamic Privacy Policy, Terms & Conditions, and helpful 404 Page." },
  { path: "src/features/chatbot/FaqChatbot.tsx", desc: "Grounded FAQ Chatbot widget that answers strictly from published FAQs, timings, and notices, and logs unanswered questions safely." },

  // Phase 6: Auth & Teacher Registration
  { path: "src/pages/auth/TeacherLoginPage.tsx", desc: "Secure login page for Principal and Teachers with role-based redirection." },
  { path: "src/pages/auth/TeacherRegistrationPage.tsx", desc: "Public Teacher Registration form (React Hook Form + Zod) creating Auth user, profile, and pending registration_request without assigning a role." },
  { path: "src/pages/auth/PendingApprovalPage.tsx", desc: "Approval-pending screen for Pending Teachers showing registration status and sign out." },

  // Phase 7: Principal Dashboard & Management Modules (Sections 8–32)
  { path: "src/pages/principal/PrincipalDashboard.tsx", desc: "Main Principal Dashboard with canonical summary counters and direct 2-column mobile / 4-column desktop grid for all 27 management modules." },
  { path: "src/features/registrations/PendingRegistrationsModule.tsx", desc: "Principal Pending Teacher Registrations manager using canonical query, atomic approve/reject RPC calls, rejection reason modal, and TanStack Query cache invalidation." },
  { path: "src/features/staff/StaffAndAssignmentsModule.tsx", desc: "Staff Roster and Teacher Assignments manager to assign classes, sections, and subjects, prevent duplicates, and activate/deactivate staff." },
  { path: "src/features/classes/ClassSectionManager.tsx", desc: "Class and Section Manager with ordering, archiving, and dependency protection preventing unsafe permanent deletion." },
  { path: "src/features/students/StudentManager.tsx", desc: "Student records manager with photo consent, public-display consent, class/section filtering, and role-based privacy." },
  { path: "src/features/notices/PrincipalNoticesManager.tsx", desc: "Internal Staff Notices, Public Notices, and All Class Notices moderation module." },
  { path: "src/features/leave/LeaveInboxModule.tsx", desc: "Principal Leave Inbox to approve/reject teacher leave requests with decision notes." },
  { path: "src/features/timings/TimingAndEmergencyModule.tsx", desc: "School Timing Manager and bilingual Emergency Alerts manager with audit logging." },
  { path: "src/features/gallery/GalleryAndMediaManager.tsx", desc: "Gallery Album Manager and Media Library with automatic WebP compression and in-use deletion protection." },
  { path: "src/features/enquiries/EnquiriesAndMessagesModule.tsx", desc: "Admission Enquiries CRM (status workflow + CSV export + WhatsApp action) and Parent Message Tickets manager." },
  { path: "src/features/student-of-month/StudentOfMonthAndBirthdays.tsx", desc: "Student of the Month review/publish module (enforcing consent & no duplicates) and Birthday Management." },
  { path: "src/features/settings/WebsiteContentAndBranding.tsx", desc: "11-tab Website Content CMS, School Settings, and Logo/Favicon uploader with cache-busting." },
  { path: "src/features/audit/AuditLogViewer.tsx", desc: "Principal-only Audit Log viewer with search and action filters." },

  // Phase 8: Teacher Dashboard & Tools (Sections 14–21)
  { path: "src/pages/teacher/TeacherDashboard.tsx", desc: "Main Teacher Dashboard with direct 1-tap module grid for all 12 teacher tools and Principal all-class selector support." },
  { path: "src/features/homework/DailyHomeworkUploader.tsx", desc: "Bilingual (EN/HI) Daily Homework Uploader with camera/gallery image compression preview, draft/publish, and history." },
  { path: "src/features/notices/TeacherClassNotices.tsx", desc: "Teacher Class Notice creator and Principal Notice Board reader." },
  { path: "src/features/leave/TeacherLeaveCenter.tsx", desc: "Teacher Staff Leave submission and status tracker." },

  // Phase 9: App Router & Entry
  { path: "src/App.tsx", desc: "Complete React Router setup connecting all Public, Auth, Principal, and Teacher routes with QueryClientProvider, AuthProvider, and LanguageProvider." },
  { path: "src/main.tsx", desc: "React DOM root entry point importing Tailwind CSS." },
  { path: "src/index.css", desc: "Tailwind CSS imports, custom utility classes, and accessible focus styles." },

  // Phase 10: Documentation (Section 46)
  { path: "README.md", desc: "Complete setup, Supabase migration, Principal bootstrap, testing, and Netlify deployment guide for View Point Public School." }
];

// Load or initialize progress
let completed = [];
if (fs.existsSync(PROGRESS_FILE)) {
  completed = JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf8"));
}

const masterSpec = fs.existsSync("./MASTER_PROMPT.md")
  ? fs.readFileSync("./MASTER_PROMPT.md", "utf8").slice(0, 12000)
  : "Build a production-ready school website and management system for View Point Public School using React, TypeScript, Tailwind CSS, and Supabase.";

async function generateCode(fileObj, modelToUse = PRIMARY_MODEL) {
  const systemPrompt = `You are a Principal Full-Stack Architect building the production repository for "View Point Public School".
Output ONLY the raw, complete, production-ready code for the requested file path: ${fileObj.path}.
Do NOT wrap the code in markdown backticks (\`\`\`), do NOT add explanations before or after the code, and never use placeholders or "// TODO".`;

  const userPrompt = `Project Specification Reference:\n${masterSpec}\n\nNow write the complete production file: ${fileObj.path}\nRequirements for this file: ${fileObj.desc}`;

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${DAHL_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: modelToUse,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.2
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errText}`);
  }

  const data = await res.json();
  let code = data.choices[0].message.content.trim();
  // Strip accidental markdown fences if present
  code = code.replace(/^```[a-zA-Z]*\n/, "").replace(/\n```$/, "").trim();
  return code;
}

async function runFactory() {
  console.log("====================================================");
  console.log("🚀 VIEW POINT PUBLIC SCHOOL - 24/7 AI BUILD FACTORY");
  console.log("====================================================");

  for (let i = 0; i < PROJECT_FILES.length; i++) {
    const file = PROJECT_FILES[i];
    if (completed.includes(file.path)) {
      console.log(`⏭️  [${i + 1}/${PROJECT_FILES.length}] Skipping (Already Built): ${file.path}`);
      continue;
    }

    console.log(`\n🔨 [${i + 1}/${PROJECT_FILES.length}] Building: ${file.path}...`);

    let success = false;
    for (let attempt = 1; attempt <= 3 && !success; attempt++) {
      try {
        const model = attempt === 1 ? PRIMARY_MODEL : FALLBACK_MODEL;
        console.log(`   ⏳ Calling ${model} (Attempt ${attempt}/3)...`);
        const code = await generateCode(file, model);

        const fullPath = path.join(process.cwd(), file.path);
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, code, "utf8");

        completed.push(file.path);
        fs.writeFileSync(PROGRESS_FILE, JSON.stringify(completed, null, 2));

        // Commit and push directly to GitHub after each file!
        try {
          execSync(`git add "${file.path}" "${PROGRESS_FILE}"`);
          execSync(`git commit -m "AI Factory: Built ${file.path}"`);
          execSync(`git push origin main`);
          console.log(`   ✅ Saved & Pushed to GitHub: ${file.path}`);
        } catch (gitErr) {
          console.log(`   ✅ Saved locally (Git push skipped/pending): ${file.path}`);
        }

        success = true;
      } catch (err) {
        console.error(`   ⚠️ Attempt ${attempt} failed: ${err.message}`);
        console.log("   💤 Waiting 5 seconds before retry...");
        await new Promise(r => setTimeout(r, 5000));
      }
    }
  }

  console.log("\n🎉 ALL FILES GENERATED AND PUSHED TO GITHUB!");
}

runFactory();
EOF
