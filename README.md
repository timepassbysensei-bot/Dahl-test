# Manju Sensei — Teacher's Resource Hub

An editorial-grade resource vault for a Class VII–X Hindi and Sanskrit teacher, with an all-subject tuition track, a WhatsApp-first contact channel, and a three-screen admin console.

Built with **Vite + React + Tailwind CSS + Supabase + Google AI Studio**, deployable to Netlify as a static site.

---

## What is inside

- **Editorial hero** — interactive highlight words, colour bursts, accent cycling, grain and mesh backgrounds.
- **Two academic tracks** — School Curriculum (Hindi & Sanskrit) and Complete Tuition Hub, as colour-morphing bento cards.
- **Resource vault** — live Supabase data, search, seven filters, card morphing, in-browser image/PDF preview, direct downloads.
- **Contact** — prefilled WhatsApp CTA plus a validated message form with 7-day automatic retention.
- **Sleep Sensei** — a floating Gemini-powered study assistant with a strict identity lock and model fallback.
- **Teacher's console** — Supabase email/password auth (case-insensitive) with upload, manage/delete, and message inbox screens.

No timetables, results, or testimonials — by design.

---

## Quick start

```bash
npm install
cp .env.example .env      # fill in the three keys
npm run dev
```

Open the URL Vite prints (defaults to `http://localhost:3000`).

```bash
npm run build             # production bundle in dist/
npm run preview           # serve the production build
```

### Environment variables

| Key | Where to get it |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon/public |
| `VITE_GEMINI_API_KEY` | https://aistudio.google.com/apikey |
| `VITE_GEMINI_MODEL` | Optional; defaults to `gemini-2.5-flash` with automatic fallback |

The anon key is safe in the browser. Never place a `service_role` key in this project.

---

## Database setup

Run the single migration file in the Supabase SQL Editor:

```text
supabase/migrations/20261101000000_init_schema_storage_and_admin.sql
```

It creates the tables, indexes, retention trigger, cleanup RPC, optional `pg_cron` job, the `resources` storage bucket, all RLS policies, and the confirmed admin account.

**Admin sign-in**

- Email: `viewpointpublicschoolofficial@gmail.com`
- Password: `manjusensei`

Both inputs are lowercased before authentication, so `ManjuSensei`, `MANJUSENSEI`, and `manjusensei` all work. The stored password must stay lowercase — see the setup guide before changing it.

---

## Project structure

```text
├── netlify.toml
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
├── index.html
├── supabase/
│   └── migrations/
│       └── 20261101000000_init_schema_storage_and_admin.sql
├── MOBILE_SETUP_GUIDE.md
├── TECHNICAL_REPORT.md
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── config/siteConfig.js
    ├── lib/
    │   ├── supabaseClient.js
    │   └── sleepSenseiAI.js
    └── components/
        ├── Navbar.jsx
        ├── HeroEditorial.jsx
        ├── AcademicTracksBento.jsx
        ├── ResourceVault.jsx
        ├── ContactSection.jsx
        ├── SleepSenseiChat.jsx
        ├── FooterEditorial.jsx
        └── admin/
            ├── AdminLoginModal.jsx
            ├── AdminDashboard.jsx
            ├── UploadResourceScreen.jsx
            ├── ManageResourcesScreen.jsx
            └── MessagesInboxScreen.jsx
```

All teacher-facing content — name, pincode badge, WhatsApp number, email, tracks, subjects, AI suggestions — lives in [`src/config/siteConfig.js`](src/config/siteConfig.js).

---

## Documentation

- **[MOBILE_SETUP_GUIDE.md](MOBILE_SETUP_GUIDE.md)** — deploy the whole project from a phone: Supabase, migration, Gemini key, Netlify, editing placeholders.
- **[TECHNICAL_REPORT.md](TECHNICAL_REPORT.md)** — architecture, design system, RLS matrix, retention pipeline, AI guardrails, limitations.

---

## Deployment (Netlify)

1. Import the repository.
2. Build command `npm run build`, publish directory `dist`.
3. Add the three environment variables.
4. Deploy.

`netlify.toml` already pins Node 20, the SPA fallback, asset caching, and baseline security headers.

---

## Security notes

- RLS protects every table and storage object; the anon key only grants public reads and message inserts.
- Resource writes and message reads require an authenticated session.
- Messages older than 7 days are deleted by a trigger, a daily cron job (when available), and a client-side purge on page load.
- No password is stored in the repository or in environment variables.

See the technical report for the full threat model and known limitations.
