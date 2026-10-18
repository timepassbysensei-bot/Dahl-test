
# View Point Public School

This is a new project. Do not assume that another agent has created any part of it.

Build the complete application, including:

- Professional public school website
- Principal dashboard
- Teacher dashboard
- Secure Teacher registration and approval
- Classes and sections
- Teacher assignments
- Students
- Homework
- Notices
- Leave requests
- Birthdays
- Student of the Month
- Gallery
- Achievements
- Resources
- Admission enquiries
- Parent messages
- School timings
- Emergency alerts
- Calendar
- Website content management
- Logo and favicon management
- FAQ chatbot
- Audit logs
- Supabase database
- Supabase authentication
- Row Level Security
- Supabase Storage
- Netlify deployment
- Tests and documentation

Do not create only a design, static landing page, mockup, or incomplete demonstration.

Every important feature and button must work.

Do not stop after planning. Continue through implementation, testing, visual QA, documentation, and production build verification.

---

# 1. Non-negotiable rules

- Do not fabricate the school’s address, phone number, results, awards, teachers, facilities, affiliations, reviews, fees, or achievements.
- Use clearly labelled sample data when real information is unavailable.
- Make unknown information editable through the Principal dashboard.
- Do not present stock photographs as actual school students, staff, or campus facilities.
- Do not publish sample achievements or student information as genuine claims.
- Use secure production practices.
- Never expose the Supabase service-role key to the browser.
- Never let a user assign their own role.
- Never let a Teacher approve their own registration.
- Enforce permissions with Supabase Row Level Security, not only frontend route guards.
- Use soft deletion or archiving for important records.
- Never treat a failed query as an empty result.
- Do not show “No records” if the real cause is a network, RLS, or server error.
- Do not create non-functional buttons.
- Do not use “Coming soon” to hide missing functionality.
- Ensure every workflow works on mobile.
- Add loading, error, empty, success, permission-denied, and confirmation states.
- Do not claim the application is complete until the workflows have been tested with real test accounts.
- Do not declare success only because the production build passes.

---

# 2. Required technology

Use:

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- React Hook Form
- Zod
- TanStack Query
- Lucide icons
- Supabase PostgreSQL
- Supabase email/password authentication
- Supabase Storage
- Supabase Row Level Security
- Supabase Edge Functions or secure database RPC functions for privileged operations
- Vitest and React Testing Library
- Playwright for end-to-end testing where practical
- Netlify hosting

Use a lightweight toast library if necessary.

Avoid unnecessary dependencies.

Use a maintainable feature-based structure such as:

```text
/
  src/
    components/
    layouts/
    pages/
      public/
      auth/
      principal/
      teacher/
    features/
      auth/
      registrations/
      staff/
      classes/
      students/
      homework/
      notices/
      leave/
      birthdays/
      student-of-month/
      timings/
      gallery/
      achievements/
      resources/
      messages/
      enquiries/
      calendar/
      settings/
      audit/
      chatbot/
    hooks/
    lib/
    services/
    types/
    validation/
  public/
  supabase/
    migrations/
    functions/
    seed.sql
    config.toml
  docs/
  tests/
  .env.example
  netlify.toml
  README.md
  package.json
```

---

# 3. Design requirements

The application must look like a professionally designed school website, not a generic generated template.

The design should feel:

- Trustworthy
- Educational
- Modern
- Friendly
- Organized
- Premium
- Easy for non-technical staff
- Comfortable on mobile

Use a professional visual system similar to:

```text
Primary navy: #12335B
Dark navy: #0B2442
Professional blue: #245A8D
Warm gold: #D99500
Off-white: #F8FAFC
Light gray: #E5E7EB
Main text: #172033
Muted text: #64748B
Success: #15803D
Warning: #B45309
Error: #B91C1C
```

Use warm gold as an accent, not as the background of every section.

Use:

- Strong typography hierarchy
- Consistent spacing
- Moderate border radii
- Subtle shadows
- Clear buttons
- Responsive grids
- Meaningful icons
- Visible focus states
- Accessible contrast
- Restrained animation
- Professional imagery
- Useful empty states

Avoid:

- Huge empty areas
- Excessively large cards
- Overly long mobile pages with one giant card per option
- Neon colors
- Excessive gradients
- Constant animation
- Glassmorphism everywhere
- Generic placeholder text
- Blank image boxes
- Technical setup messages on public pages
- Crowded navigation
- Essential options hidden inside a long menu

Use system-font fallbacks and efficiently loaded fonts such as:

- Headings: Manrope, Poppins, or Montserrat
- Body: Inter or Source Sans 3

---

# 4. Public website

Create these public pages:

- Home
- About
- Academics
- Admissions
- Notices
- Gallery
- Achievements
- Resources
- Calendar
- Contact
- Teacher Registration
- Teacher Login
- Privacy Policy
- Terms and Conditions
- Useful 404 page

All important public content must be editable through the Principal dashboard.

## Homepage structure

Create a complete, content-rich homepage with:

1. Optional announcement bar
2. Professional header
3. Hero section
4. Admission and contact actions
5. School highlights
6. About preview
7. Principal’s message
8. Academics or classes overview
9. Why Choose Our School
10. Facilities or learning environment
11. Latest notices
12. Upcoming events
13. Gallery preview
14. Achievements
15. Student of the Month, only when approved and published
16. Public resources
17. FAQs
18. Admission enquiry CTA
19. Contact information
20. Map, only when properly configured
21. Footer

Required homepage actions:

- Admission Enquiry
- Contact School
- View Notices
- View Gallery
- View Achievements
- View Calendar
- Teacher Login
- Teacher Registration

Every button must lead to a working route, form, file, or action.

If content is unavailable:

- Hide optional sections where appropriate.
- Use compact polished empty states.
- Do not leave giant blank sections.
- Do not use fake statistics.

## Header

Include:

- School logo
- School name
- Home
- About
- Academics
- Admissions
- Notices
- Gallery
- Achievements
- Contact
- Teacher Login
- Responsive mobile menu

## Footer

Include:

- School logo
- School description
- Contact information
- Quick links
- Admission links
- Teacher Login
- Legal links
- Configured social links
- Automatic current year

Hide unconfigured social links. Never display empty or `#` links.

---

# 5. English and Hindi support

The old school interface included a Hindi option.

Build the content architecture so important public information and homework can support:

- English
- Hindi

At minimum, support bilingual fields for:

- Homework
- Important notices
- Homepage content where configured
- Emergency alerts where configured

The language toggle must:

- Be accessible
- Preserve the current route
- Not break the page layout
- Fall back to the available language when a translation is missing

Do not automatically translate private or official content without review.

---

# 6. User roles

Implement:

1. Principal
2. Teacher
3. Pending Teacher
4. Public visitor

If Parent or Student accounts are added later, design the schema so they can be added safely, but do not create unnecessary incomplete dashboards.

## Principal

The Principal can:

- Access all management modules
- Approve and reject Teacher registrations
- Manage staff
- Manage classes and sections
- Assign Teachers
- Open and use the Teacher dashboard
- Manage the public website
- Manage school settings
- Manage timings
- Manage notices
- Manage gallery
- Manage resources
- Review homework
- Review leave requests
- Review Student of the Month submissions
- Manage achievements
- Manage enquiries and parent messages
- View audit logs

## Teacher

A Teacher can:

- Access assigned classes, sections, and subjects
- Upload homework
- Create class notices
- Read Principal notices
- Submit leave requests
- Access birthday tools where permitted
- Submit Student of the Month candidates
- View and manage only their own permitted content
- Never access unrelated classes or Principal-only settings

## Pending Teacher

A pending Teacher can:

- View an approval-pending page
- View their basic registration status
- Sign out

A pending Teacher cannot:

- Access the Teacher dashboard
- Access the Principal dashboard
- Assign their own role
- Approve their account
- Access school records

---

# 7. Dashboard navigation

The Principal and Teacher dashboards must use an easy one-tap interaction model.

Do not make a long drawer the only way to access important features.

The mobile drawer may exist as secondary navigation, but all important modules must also appear directly on the dashboard.

Use:

- Compact module buttons
- Two-column mobile grid where appropriate
- Larger desktop grid
- Clear icons
- Readable labels
- Notification badges
- Visible active state
- Touch-friendly controls

Avoid:

- Excessively large cards
- Huge vertical gaps
- Essential tools hidden in a long menu
- Text wrapping into unreadable layouts
- Horizontal overflow

---

# 8. Principal dashboard

At the top, include:

- School logo
- Principal role indicator
- Dashboard title
- Notification summary
- **Teacher Dashboard** button
- Sign out
- Mobile menu

Display direct buttons for:

1. Pending Registrations
2. Staff Roster
3. Internal Notices
4. Public Notices
5. All Class Notices
6. All Homework
7. Leave Inbox
8. Timing Manager
9. Emergency Alert
10. School Settings
11. Class and Section Manager
12. Teacher Assignments
13. Gallery Manager
14. Media Library
15. Resources Manager
16. Parent Messages
17. Admission Enquiries
18. Calendar
19. Achievements
20. Student of the Month Reviews
21. Birthday Management
22. Chatbot FAQs
23. Website Content
24. Branding
25. Change Logo
26. Change Favicon
27. Audit Log

Summary cards may include:

- Pending Teacher registrations
- Unread parent messages
- Pending leave requests
- Student of the Month submissions
- New enquiries

The summary count must link to the corresponding list.

A badge and its list must always use the same canonical query and filters.

---

# 9. Principal access to Teacher dashboard

The Principal must be able to enter and use the Teacher dashboard.

Requirements:

- Add a visible Teacher Dashboard button.
- Allow Principal access through the route guard.
- Allow Principal access through RLS where appropriate.
- Do not change the Principal’s stored role.
- Do not use Local Storage to create a fake Teacher role.
- Do not require another login.
- Do not use a query parameter to bypass authorization.
- Show:
  - `Principal access — all authorized classes`
- Allow the Principal to select any active class and section when using Teacher tools.
- Audit important content changes made through Teacher tools.

The Teacher dashboard must include a Principal Dashboard button when the current user is the Principal.

Normal Teachers must never receive Principal access.

---

# 10. Teacher registration and approval

Teacher registration and approval must work correctly from the beginning.

## Registration process

1. A Teacher opens the public Teacher Registration page.
2. The Teacher enters the required information.
3. Supabase Auth creates the account.
4. A profile is created.
5. A registration request is created with `pending` status.
6. No Teacher role is assigned yet.
7. The Principal sees the registration.
8. The Principal approves or rejects it.
9. Approval assigns the Teacher role through trusted server-side logic.
10. The approved Teacher appears in Staff Roster.
11. The Principal assigns classes, sections, and subjects.
12. The Teacher can access the Teacher dashboard.

## Registration form

Include:

- Full name
- Email
- Phone
- Optional staff ID or qualification fields if genuinely needed
- Password
- Confirm password
- Consent checkbox

Use:

- React Hook Form
- Zod validation
- Safe error messages
- Rate limiting
- Duplicate-account handling
- Email verification if enabled

Do not allow users to request the Principal role.

## Pending Registrations

The Principal must see:

- Applicant name
- Email
- Phone
- Registration date
- Requested role
- Email-verification status where appropriate
- Current status
- View details
- Approve
- Reject
- Rejection reason
- Recently decided requests

Use separate states for:

- Loading
- Empty
- Error
- Success

Do not display “No pending registrations” when the query failed.

## Canonical query requirement

The following must use the same canonical source:

- Principal dashboard pending count
- Navigation badge
- Pending Registrations page

If the count shows one, the list must contain one.

After approval or rejection:

- Refresh the count
- Refresh the list
- Refresh Staff Roster
- Invalidate TanStack Query caches
- Do not require a page reload

## Secure approval

Approval must happen through a secure database function or Supabase Edge Function.

It must atomically:

1. Verify the caller is the Principal.
2. Verify the request is pending.
3. Assign the Teacher role.
4. Mark the request approved.
5. Activate the profile.
6. Record the approver.
7. Record the timestamp.
8. Create an audit log.

If one step fails, roll back everything.

Never allow the frontend to assign roles directly.

---

# 11. Staff Roster and Teacher Assignments

The Principal must be able to:

- View staff
- Search staff
- Filter by role and status
- View profiles
- Activate or deactivate accounts
- Assign classes
- Assign sections
- Assign subjects
- Remove assignments
- View assignment history
- Revoke access securely

Prevent duplicate Teacher assignments.

Teachers must see:

- Assigned classes
- Assigned sections
- Assigned subjects
- Relevant quick actions

If no assignment exists, show:

> No class has been assigned yet. Please contact the Principal.

Disable class-specific tools without exposing other classes.

---

# 12. Class and Section Manager

The Principal must be able to:

- Add a class
- Rename a class
- Set display order
- Activate or archive a class
- Add sections under a class
- Rename sections
- Reorder sections
- Activate or archive sections
- Assign class Teachers
- Assign subject Teachers
- View linked students
- View linked homework and notices

## Safe deletion

Do not permanently delete a class or section with linked:

- Students
- Teacher assignments
- Homework
- Notices
- Attendance
- Student of the Month records
- Messages
- Other academic records

Instead:

- Archive it
- Require reassignment
- Or display a dependency warning

Only unused classes or sections may be permanently deleted after explicit confirmation.

---

# 13. Student records

Create a lightweight student-management module needed for class tools.

Support:

- Student name
- Student ID
- Class
- Section
- Date of birth
- Guardian name
- Guardian contact
- Active/inactive status
- Joining date
- Photograph
- Photograph consent
- Public-display consent
- Administrative notes
- Archived status

The Principal can manage all students.

Teachers may view only students in assigned classes and only the fields necessary for their work.

Do not expose guardian details or private notes to unauthorized Teachers or the public.

---

# 14. Teacher dashboard

Display direct buttons for:

1. Daily Homework Uploader
2. Class Notices
3. Principal Notice Board
4. Staff Leave Center
5. Birthday Management
6. Student of the Month
7. Assigned Classes
8. Assigned Sections
9. Assigned Subjects
10. Previous Homework
11. My Notices
12. My Submissions

At the top, show:

- Teacher name
- Role
- Assigned classes
- Principal Dashboard button only when the user is the Principal
- Sign out

Teachers should not need to open a long drawer to reach common tools.

---

# 15. Daily Homework Uploader

Teachers must be able to:

- Select an assigned class
- Select an assigned section
- Select an assigned subject
- Select a date
- Enter homework in English
- Enter homework in Hindi where needed
- Upload one or multiple images
- Upload permitted document attachments
- Preview attachments
- Remove files before submission
- Save draft
- Publish
- Edit their own homework
- Archive their own homework
- View previous homework
- Filter by class, section, subject, and date

The Principal can view and moderate all homework.

Prevent duplicate homework records where inappropriate.

Teachers may edit or archive only their own homework unless granted broader permission.

---

# 16. Automatic image compression

Implement automatic image compression for:

- Homework images
- Gallery images
- Achievement images
- Student of the Month images
- Birthday images
- Student photographs
- Other large content images

Requirements:

- Support mobile camera uploads.
- Support mobile gallery uploads.
- Correct EXIF orientation.
- Resize oversized images.
- Preserve readable notebook and worksheet text.
- Use WebP where practical.
- Preserve PNG when transparency is required.
- Display image preview.
- Display original and compressed file size.
- Show compression progress.
- Show upload progress.
- Allow removal before upload.
- Use safe generated filenames.
- Validate MIME type.
- Validate extension.
- Validate dimensions.
- Validate final file size.
- Fail gracefully if compression fails.
- Validate again before or during trusted Storage handling.

Use configurable compression limits.

Do not compress homework so aggressively that written text becomes unreadable.

---

# 17. Class Notices

Teachers can:

- Select assigned class and section
- Create notice
- Add title and description
- Add permitted attachment
- Save draft
- Publish
- Set expiration
- Edit their own notice
- Archive their own notice
- View their notice history

The Principal can:

- View all class notices
- Filter by class, section, Teacher, date, and status
- Moderate notices
- Archive and restore
- See the original creator

---

# 18. Principal Notice Board

The Principal can:

- Create internal notices
- Select audience
- Pin important notices
- Add attachments
- Save drafts
- Publish
- Unpublish
- Set expiration
- Archive and restore

Teachers can:

- Read relevant Principal notices
- Open attachments
- See pinned notices first
- See publish and expiration dates
- Mark read where supported

Teachers cannot edit Principal notices.

---

# 19. Leave system

Teachers can:

- Select start date
- Select end date
- Enter private reason
- Submit request
- View pending requests
- View approved requests
- View rejected requests
- View decision note
- Cancel pending request where permitted

The Principal can:

- View Leave Inbox
- Search and filter
- Approve
- Reject
- Add decision note
- View Teacher details
- Record decision-maker and timestamp

Private reasons must be visible only to authorized users.

---

# 20. Birthday Management

Teachers can:

- View upcoming birthdays for assigned classes
- View only the student information necessary for the birthday feature
- Create birthday content when permitted
- Upload compressed birthday image where allowed
- Submit content for review if public display is involved

The Principal can:

- View all upcoming birthdays
- Manage birthday content
- Approve public birthday posts
- Hide student names or photographs when consent is absent

Do not publicly expose birth years or unnecessary personal information.

---

# 21. Student of the Month

Teachers can:

- Select assigned class
- Select assigned section
- Select student
- Select month
- Select academic year
- Add reason or achievement summary
- Upload compressed photograph
- Save draft
- Submit for Principal approval
- Edit or withdraw before approval
- View previous submissions

The Principal can:

- Review submissions
- Approve
- Reject
- Add decision note
- Publish
- Unpublish
- Archive
- View history

Requirements:

- Prevent duplicate selection for the same class, section, month, and year unless explicitly allowed.
- Require consent before publishing a full name or photograph.
- Record submitting Teacher.
- Record reviewing Principal.
- Audit publication changes.

---

# 22. Timing Manager

The Principal can manage:

- Opening time
- Closing time
- Assembly time
- Period timings
- Break times
- Class-specific timing
- Special-day timing
- Effective dates
- Active/inactive schedules

The public and internal website must read active timing information dynamically.

---

# 23. Emergency Alerts

The Principal can:

- Create alert
- Select audience
- Set severity
- Write English and optional Hindi content
- Publish immediately
- Set expiration
- Deactivate alert
- View alert history

Use confirmation before publication.

Audit every emergency-alert change.

---

# 24. Gallery and Media Library

## Gallery Manager

The Principal can:

- Create albums
- Upload multiple images
- Automatically compress images
- Preview images
- Add captions
- Add event date
- Select album cover
- Reorder photographs
- Publish and unpublish
- Archive and restore
- Delete unused images safely
- Search and filter
- View uploader and upload date

Prevent deletion when an image is still in use.

## Media Library

Create a reusable Media Library with:

- Upload
- Preview
- Search
- Filter by category
- Alt text
- Caption
- File size
- Dimensions
- Focal point
- Usage information
- Replace
- Archive
- Safe delete

Categories:

- Branding
- Homepage
- Gallery
- Achievements
- Students
- Homework
- Notices
- Resources

---

# 25. Resources

The Principal can:

- Upload resources
- Add external links
- Add title and description
- Select class and section
- Select public, staff, or class visibility
- Save draft
- Publish
- Archive
- Restore
- Search and filter
- Safely delete unused files

Teachers may upload resources only if explicitly permitted.

---

# 26. Parent Messages

Use a thread or ticket-style system rather than expensive real-time chat.

Support:

- Parent/public contact form
- Name
- Phone
- Email
- Student/class reference where appropriate
- Category
- Subject
- Message
- Permitted attachment
- Open/closed status
- Assigned staff
- Internal notes
- Replies
- Unread status

The Principal can:

- View threads
- Search and filter
- Reply
- Assign
- Add internal note
- Close and reopen
- Mark spam

Private internal notes must never be visible publicly.

Add rate limiting and spam protection.

---

# 27. Admission Enquiries

Store:

- Applicant name
- Guardian name
- Phone
- WhatsApp
- Email
- Interested class
- Message
- Source page
- UTM data where available
- Status
- Assigned staff
- Follow-up date
- Internal notes
- Creation date

Statuses:

- New
- Contacted
- Interested
- Follow-up
- Admitted
- Closed
- Spam

The Principal can:

- Search
- Filter
- Change status
- Add notes
- Assign staff
- Set follow-up
- Export CSV
- Open phone, email, and WhatsApp actions
- Detect likely duplicates

---

# 28. Calendar

The Principal can manage:

- Holidays
- Exams
- School events
- Admission dates
- Parent meetings
- Class-specific events
- Public/private visibility
- Event attachments
- Start and end dates

Show applicable events on the public website and dashboards.

---

# 29. Achievements

The Principal can:

- Add achievement
- Select category
- Add title and description
- Add student only when consent exists
- Add date
- Upload compressed image
- Save draft
- Publish
- Unpublish
- Archive and restore
- Reorder featured achievements

Do not invent or automatically publish achievements.

---

# 30. Website Content and School Settings

The Principal must be able to update the website without editing code.

Create tabs for:

1. Branding
2. Homepage
3. About
4. Academics
5. Admissions
6. Contact
7. Social Media
8. Footer
9. SEO
10. Legal
11. Feature Settings

Editable fields include:

- School name
- Logo
- Favicon
- Tagline
- Hero title
- Hero description
- Hero image
- Hero buttons
- Announcement bar
- About content
- Mission
- Vision
- Principal’s message
- Principal photograph
- Academic information
- Admission information
- Contact information
- Address
- Phone
- WhatsApp
- Email
- Business hours
- Map URL
- Social links
- Footer text
- SEO title
- SEO description
- Social-sharing image
- Privacy Policy
- Terms and Conditions

Provide:

- Draft
- Preview
- Publish
- Cancel
- Validation
- Success messages
- Error messages
- Image preview
- Revision history where practical

The public website must read this information dynamically.

---

# 31. Logo and favicon

The Principal can:

- Upload logo
- Replace logo
- Preview logo
- Upload favicon
- Replace favicon
- Preview favicon
- Validate type and size
- Restore previous image where practical

After changing branding:

- Public website updates
- Dashboard updates where appropriate
- Browser favicon updates
- Cache-busting prevents stale branding
- Success or error message appears

---

# 32. FAQ chatbot

Create a lightweight FAQ chatbot grounded only in:

- Published FAQs
- Public notices
- Public school information
- Admission information
- Timings
- Contact information

The chatbot must:

- Not invent answers
- Say when information is unavailable
- Offer Contact and Admission Enquiry actions
- Never access private Teacher, student, message, or leave information
- Store unanswered questions without unnecessary personal data

The Principal can:

- Add FAQ
- Edit FAQ
- Add category
- Publish/unpublish
- Archive
- Review unanswered questions
- Convert an unanswered question into an FAQ

---

# 33. Suggested Supabase schema

Create SQL migrations for tables such as:

- profiles
- user_roles
- registration_requests
- staff
- classes
- sections
- subjects
- teacher_assignments
- students
- homework
- homework_attachments
- class_notices
- staff_notices
- leave_requests
- birthday_posts
- student_of_month
- school_timings
- emergency_alerts
- gallery_albums
- gallery_images
- media_assets
- resources
- parent_message_threads
- parent_messages
- admission_enquiries
- calendar_events
- achievements
- chatbot_faqs
- chatbot_unanswered_questions
- site_settings
- page_sections
- social_links
- audit_logs

Use:

- UUID primary keys
- Foreign keys
- Appropriate delete behavior
- `created_at`
- `updated_at`
- `created_by`
- `updated_by`
- Indexes
- Unique constraints
- Updated-at triggers
- Soft-delete or archive fields
- Status constraints
- Secure role-check helper functions
- Complete RLS policies
- Comments for complex policies

Prevent duplicate:

- Role assignments
- Teacher assignments
- Student of the Month records
- Registration requests
- Other records where duplication would be invalid

---

# 34. Supabase Storage

Create documented Storage buckets.

Possible public buckets:

- branding
- public-gallery
- public-achievements
- public-site-assets

Private or permission-controlled buckets:

- homework
- resources
- student-images
- message-attachments
- internal-notices

Add complete Storage policies.

Requirements:

- Teachers access only authorized files.
- Public users access only published public files.
- Pending users cannot browse school files.
- Private URLs must not become permanently public.
- Upload ownership must be recorded.
- Unsafe file types must be rejected.

---

# 35. Audit logging

Audit important actions:

- Teacher registration
- Approval
- Rejection
- Role assignment
- Account activation/deactivation
- Teacher assignments
- Class and section changes
- Homework publication and deletion
- Notice publication
- Leave decisions
- Timing changes
- Emergency alerts
- Gallery deletion
- Achievement publication
- Student of the Month decisions
- Website settings changes
- Logo and favicon changes

Do not log:

- Passwords
- Tokens
- Secrets
- Full private leave reasons where unnecessary
- Sensitive personal data not required for auditing

Only the Principal can view audit logs.

---

# 36. Loading, empty, error, and success states

Every database screen must distinguish:

## Loading

Example:

> Loading pending registrations…

## Genuine empty state

Example:

> No pending registrations.

## Error

Example:

> We could not load pending registrations.

Include:

- Retry button
- Safe error message
- Developer logging in development mode

Never display an empty state when:

- RLS denied access
- Network failed
- Session expired
- Query failed
- Table is missing
- Edge Function failed

---

# 37. Accessibility

Implement:

- Semantic HTML
- Accessible labels
- Keyboard navigation
- Visible focus
- Sufficient contrast
- Accessible dialogs
- Accessible navigation
- Touch-friendly targets
- Reduced-motion support
- Descriptive validation errors
- Screen-reader-friendly status updates
- Alt text
- Accessible tables or mobile card alternatives

---

# 38. Performance and SEO

Implement:

- Unique titles
- Meta descriptions
- Open Graph metadata
- Sitemap
- `robots.txt`
- Semantic HTML
- Image optimization
- Lazy loading
- Route-level code splitting
- Proper caching
- Responsive image sizes
- Useful 404 page
- Strong mobile performance

Do not keyword-stuff or fabricate local claims.

---

# 39. Mandatory responsive testing

Test at:

- 360px
- 375px
- 390px
- 768px
- 1024px
- 1440px

Verify:

- No horizontal overflow
- Header works
- Mobile menu works
- Dashboard buttons are directly accessible
- Forms work with mobile keyboard
- Buttons are easy to tap
- Text does not clip
- Principal can approve a Teacher on mobile
- Principal can access Teacher dashboard
- Teacher can upload homework from mobile camera
- Image compression works
- Gallery upload works
- Long tables become cards or scroll safely
- Drawer does not trap the user
- Floating elements do not overlap
- Public pages do not contain large blank sections

Render and inspect screenshots with Playwright or browser tooling.

Do not rely only on automated tests for visual QA.

---

# 40. Mandatory end-to-end tests

## Teacher registration test

1. Register a Teacher with a unique email.
2. Confirm Auth user creation.
3. Confirm pending registration creation.
4. Confirm no Teacher role exists yet.
5. Sign in as Principal.
6. Confirm pending count is one.
7. Open Pending Registrations.
8. Confirm the same account appears.
9. Approve the account.
10. Confirm count becomes zero.
11. Confirm account disappears from pending.
12. Confirm Teacher appears in Staff Roster.
13. Assign class, section, and subject.
14. Sign in as Teacher.
15. Confirm assignments appear.
16. Confirm Teacher tools work.
17. Confirm unrelated classes are inaccessible.

## Registration error test

Simulate a failed registration query.

Verify:

- Error message appears
- Retry button appears
- “No pending registrations” does not appear

## Principal access test

1. Sign in as Principal.
2. Confirm all Principal modules are directly visible.
3. Open Teacher Dashboard.
4. Use an authorized Teacher tool.
5. Return to Principal Dashboard in one tap.

## Homework test

1. Sign in as assigned Teacher.
2. Select class, section, subject, and date.
3. Add English and optional Hindi homework.
4. Upload a large camera image.
5. Confirm compression.
6. Confirm written text remains readable.
7. Publish.
8. Confirm Principal can view it.
9. Confirm unrelated Teacher cannot edit it.

## Class deletion test

1. Create class and section.
2. Add linked assignment or student.
3. Attempt permanent deletion.
4. Confirm deletion is prevented.
5. Confirm archive or reassignment is offered.

## Leave test

1. Teacher submits leave.
2. Principal sees it.
3. Principal approves or rejects.
4. Teacher sees decision and note.

## Student of the Month test

1. Teacher submits candidate.
2. Principal sees the submission.
3. Principal approves.
4. Consent rules are checked.
5. Duplicate submission is prevented.
6. Publication is audited.

## Branding test

1. Replace logo.
2. Replace favicon.
3. Confirm public website updates.
4. Confirm dashboard updates where appropriate.
5. Confirm stale cached image is not retained.

---

# 41. Automated tests

Add tests for:

- Route guards
- Principal permissions
- Teacher restrictions
- Pending-user restrictions
- Principal Teacher-dashboard access
- Registration request creation
- Registration count/list consistency
- Atomic approval
- Rejection
- Staff activation/deactivation
- Teacher assignments
- Class and section archiving
- Homework validation
- Homework ownership
- Image compression
- Notice ownership
- Leave workflow
- Student of the Month duplicates
- Consent behavior
- Gallery deletion protection
- Branding updates
- Parent-message privacy
- RLS behavior
- Storage policies
- Audit logs

Create scripts:

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm run preview
```

Run all validation commands and fix every error.

---

# 42. Seed data

Create safe sample data for development:

- Sample school settings
- Sample classes
- Sample sections
- Sample subjects
- Sample notices
- Sample gallery album
- Sample FAQ
- Sample event

Clearly label sample content.

Do not include:

- Real passwords
- Real secrets
- Private student data
- Fake achievements presented as real
- Fake reviews presented as genuine
- Real-looking public student profiles without consent

---

# 43. Environment variables

Create `.env.example`.

Frontend variables may include:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SITE_URL=
VITE_SCHOOL_NAME=View Point Public School
```

Explain that variables beginning with `VITE_` are visible in the browser.

Do not put these in frontend variables:

- Service-role key
- Administrative secrets
- Private API keys

Use trusted server-side secrets for privileged functions.

---

# 44. Netlify deployment

Create:

- `netlify.toml`
- SPA redirect configuration
- Build documentation

Recommended:

```text
Build command: npm run build
Publish directory: dist
```

Document:

1. Install dependencies
2. Create Supabase project
3. Configure environment variables
4. Apply migrations
5. Configure Storage
6. Configure Auth redirect URLs
7. Create the first Principal securely
8. Run tests
9. Push to GitHub
10. Import into Netlify
11. Configure variables
12. Deploy
13. Test registration and approval in production

---

# 45. First Principal account

Create and document a secure process for creating the first Principal.

The Principal role must not be assignable through:

- Public registration
- URL parameter
- Browser console
- Local Storage
- Editable frontend request
- Direct unrestricted client update

Use a trusted migration, server-side function, CLI process, or manually documented secure Supabase process.

Do not include a real password in seed data.

---

# 46. Documentation

Create:

- `README.md`
- `docs/database-schema.md`
- `docs/permissions.md`
- `docs/feature-checklist.md`
- `docs/testing-checklist.md`
- `docs/deployment-checklist.md`
- `docs/principal-mobile-guide.md`
- `docs/teacher-mobile-guide.md`
- `docs/known-limitations.md`

The Principal guide must explain:

- Approve Teacher
- Reject Teacher
- Assign classes and subjects
- Add class and section
- Archive class and section
- Change logo and favicon
- Edit website
- Update timings
- Publish notice
- Review homework
- Review leave
- Add gallery photos
- Add achievement
- Review Student of the Month
- Reply to parent message
- Review admission enquiry
- View audit log

The Teacher guide must explain:

- View assignments
- Upload homework
- Use camera upload
- Check compressed image
- Create notice
- Read Principal notice
- Submit leave
- Use Birthday Management
- Submit Student of the Month

---

# 47. Implementation workflow

Follow this order:

1. Create project and install dependencies.
2. Create design system.
3. Design database schema.
4. Create migrations.
5. Add RLS.
6. Add Storage buckets and policies.
7. Implement authentication.
8. Implement secure Principal bootstrap.
9. Implement Teacher registration.
10. Implement Teacher approval.
11. Test registration immediately.
12. Build public website.
13. Build Principal dashboard with direct module grid.
14. Build Principal access to Teacher dashboard.
15. Build Teacher dashboard with direct module grid.
16. Build classes and sections.
17. Build staff and Teacher assignments.
18. Build student records.
19. Build homework and image compression.
20. Build notices.
21. Build leave.
22. Build birthdays.
23. Build Student of the Month.
24. Build timings and emergency alerts.
25. Build gallery and Media Library.
26. Build resources.
27. Build parent messages.
28. Build admission enquiries.
29. Build calendar and achievements.
30. Build website content management.
31. Build branding.
32. Build FAQ chatbot.
33. Build audit log.
34. Add all states and validation.
35. Run accessibility checks.
36. Run responsive visual QA.
37. Run end-to-end tests.
38. Run automated tests.
39. Run production build.
40. Fix every discovered issue.
41. Complete documentation.
42. Provide an honest final report.

Do not postpone security, RLS, or registration testing until the end.

---

# 48. Completion criteria

The application is complete only when:

- Public website looks professional on mobile and desktop.
- Public content is editable by the Principal.
- Important dashboard modules are directly accessible.
- The drawer is not the only navigation.
- Principal can access Teacher dashboard.
- Teacher cannot access Principal dashboard.
- Pending user cannot access either dashboard.
- New Teacher registration creates a pending request.
- Dashboard count and registration list always agree.
- Principal can approve and reject Teachers.
- Approved Teachers appear in Staff Roster.
- Principal can assign class, section, and subject.
- Teachers see only assigned data.
- Class and section management works.
- Unsafe deletion is prevented.
- Homework upload works.
- Automatic image compression works.
- Homework remains readable after compression.
- Notices work.
- Leave workflow works.
- Birthday Management works.
- Student of the Month works.
- Timings work.
- Emergency alerts work.
- Gallery management works.
- Logo and favicon changes work.
- Parent messages work.
- Admission enquiries work.
- Calendar works.
- Achievements work.
- Chatbot FAQs work.
- Audit logs work.
- Loading, empty, and error states are correct.
- RLS prevents unauthorized access.
- Mobile QA passes.
- End-to-end registration test passes.
- Lint passes.
- Type checking passes.
- Automated tests pass.
- Production build passes.
- No important button is non-functional.
- No real secrets are committed.

At the end, report:

- Features implemented
- Database migrations
- RLS policies
- Storage policies
- Test accounts and scenarios used without revealing passwords
- End-to-end results
- Mobile sizes tested
- Accessibility checks
- Lint result
- Type-check result
- Test result
- Production build result
- Known limitations

Do not claim completion until you have successfully registered a new Teacher, approved that Teacher as the Principal, assigned a class, and verified that the Teacher can upload compressed homework only for the assigned class.

---
