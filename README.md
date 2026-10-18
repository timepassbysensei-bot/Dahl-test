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
