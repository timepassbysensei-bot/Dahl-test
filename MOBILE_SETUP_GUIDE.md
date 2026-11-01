# Mobile Setup Guide

**Everything below can be done from a phone browser.**
No laptop, terminal, or local install is required.

This guide takes the repository from "code on GitHub" to a live site with working uploads, messages, and Sleep Sensei. Budget about **25–35 minutes**, mostly waiting for dashboards to load.

---

## What you are setting up

| Piece | What it does | Where it lives |
| --- | --- | --- |
| **Netlify** | Hosts the website and rebuilds it on every GitHub change | netlify.com |
| **Supabase** | Database, file storage, and teacher login | supabase.com |
| **Google AI Studio** | Powers Sleep Sensei | aistudio.google.com |
| **GitHub** | Stores the code and the teacher configuration | github.com |

You need three free accounts. Use the same email for all three if possible.

---

## Step 0 — Keep these four things handy

1. The GitHub repository connected to this project.
2. The teacher's WhatsApp number and pincode (already filled in as placeholders).
3. The admin email: `viewpointpublicschoolofficial@gmail.com`
4. The default admin password: `manjusensei`

> **Password rule:** the login deliberately lowercases whatever is typed, so the password must be **lowercase letters and numbers only**. `ManjuSensei` is fine to type — it is normalised to `manjusensei`. A password containing `@`, capital letters *inside* the stored value, or symbols will not authenticate. See "Change the password safely" below.

---

## Step 1 — Create the Supabase project and copy two keys

1. Open **https://supabase.com** in your phone browser and sign in.
2. Tap **New project**.
3. Fill in:
   - **Name:** `manju-sensei-hub`
   - **Database password:** let Supabase generate one and save it in your password manager. (This is the *database* password, not the teacher login.)
   - **Region:** choose the one closest to India (for example `Mumbai` / `ap-south-1`).
4. Tap **Create new project** and wait 1–2 minutes.
5. In the left menu, open **Project Settings** (gear icon) → **API**.
6. Copy these two values into a notes app:
   - **Project URL** → this becomes `VITE_SUPABASE_URL`
   - **Project API keys → anon / public** → this becomes `VITE_SUPABASE_ANON_KEY`

> The **anon** key is designed to be public. It is safe in the browser because Row Level Security controls every row. **Never** copy the `service_role` key into Netlify or into this repository.

**Mobile tip:** the dashboard menu collapses into a hamburger icon on narrow screens. Rotate the phone to landscape if a section is hard to reach.

---

## Step 2 — Run the migration (one paste, one tap)

This single file creates the tables, storage bucket, security policies, retention rules, and the teacher's login account.

1. Open the repository on GitHub and navigate to:
   `supabase/migrations/20261101000000_init_schema_storage_and_admin.sql`
2. Tap the **Raw** button, then select all and **copy** the entire file.
3. Go to Supabase → **SQL Editor** (left menu) → **New query**.
4. Paste. Tap **Run** (or press `Ctrl/Cmd + Enter`).
5. You should see **Success. No rows returned**. A few notices are normal, including:
   - `pg_cron unavailable` — harmless; the client and trigger still clean up.
   - `Admin auto-seed skipped` — rare; follow the manual fallback below.

### Verify the admin account

1. Supabase → **Authentication** → **Users**.
2. Confirm `viewpointpublicschoolofficial@gmail.com` is listed.
3. Confirm the account shows as **confirmed** (green tick / "Confirmed" label).
4. If it is missing, tap **Add user** → **Create new user**:
   - Email: `viewpointpublicschoolofficial@gmail.com`
   - Password: `manjusensei`
   - Turn **ON** "Auto Confirm User"
   - Tap **Create user**.

### Reset a password that will not work

Re-running the migration resets the account password to `manjusensei` and confirms the email. You can also run this in the SQL Editor:

```sql
update auth.users
set encrypted_password = crypt('manjusensei', gen_salt('bf')),
    email_confirmed_at = coalesce(email_confirmed_at, now()),
    updated_at = now()
where email = 'viewpointpublicschoolofficial@gmail.com';
```

If the editor says `function crypt(...) does not exist`, use the schema-qualified form:

```sql
create extension if not exists pgcrypto;
update auth.users
set encrypted_password = extensions.crypt('manjusensei', extensions.gen_salt('bf')),
    updated_at = now()
where email = 'viewpointpublicschoolofficial@gmail.com';
```

### Verify the storage bucket

Supabase → **Storage**. You should see a public bucket named **`resources`** with a **25 MB** file limit. If it is missing, re-run the migration.

---

## Step 3 — Get the free Gemini key

1. Open **https://aistudio.google.com/apikey** and sign in with Google.
2. Tap **Create API key** → choose/create a Google Cloud project.
3. Copy the key. This becomes `VITE_GEMINI_API_KEY`.

Optional: the assistant automatically tries `gemini-2.5-flash`, then falls back to `gemini-2.0-flash`. To pin a different model, add `VITE_GEMINI_MODEL` with the model id.

> Free-tier limits change over time. If Sleep Sensei replies with a quota message, wait a minute or check the AI Studio dashboard.

---

## Step 4 — Connect GitHub to Netlify and deploy

1. Open **https://app.netlify.com** and sign in with GitHub.
2. Tap **Add new site** → **Import an existing project**.
3. Choose **GitHub** → authorise → select this repository.
4. Build settings (Netlify may prefill them):
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Node version:** already pinned to 20 by `netlify.toml`
5. Before deploying, open **Add environment variables** and add all three:

   | Key | Value |
   | --- | --- |
   | `VITE_SUPABASE_URL` | `https://YOUR-PROJECT.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | your anon/public key |
   | `VITE_GEMINI_API_KEY` | your AI Studio key |

   Optional: `VITE_GEMINI_MODEL` (for example `gemini-2.5-flash`).

6. Tap **Deploy site** and wait for the build to finish.
7. Open the generated URL (something like `https://manju-sensei-hub.netlify.app`).

> **Values are baked in at build time.** Vite reads `VITE_*` variables during the build, not at runtime. Any change to an environment variable requires **Deploys → Trigger deploy → Deploy site**.

### Confirm the deployment

- The vault shows **No resources uploaded yet** (not the "needs keys" panel).
- Tap the lock icon in the header, sign in, and reach the console.
- Upload one small PDF and confirm it appears on the public page.
- Submit a test message and confirm it appears in the inbox.

---

## Step 5 — Edit the teacher details from your phone

All teacher-facing copy lives in one file: `src/config/siteConfig.js`.

1. Open the repository on **github.com** (or the GitHub mobile app).
2. Go to `src/config/siteConfig.js`.
3. Tap the **pencil** icon (Edit).
4. Change the values you need, for example:

```js
teacher: {
  name: 'Manju Sensei',
  formalName: 'Smt. Manju Madam',
  role: 'Senior Educator',
  ...
},

location: {
  badge: '827013 • IN',
  city: 'Bokaro Steel City',
  region: 'Jharkhand, India',
},

contact: {
  whatsappNumber: '+917654172754',
  whatsappDisplay: '+91 76541 72754',
  email: 'viewpointpublicschoolofficial@gmail.com',
},
```

5. Scroll down and tap **Commit changes**.
6. Netlify detects the commit and redeploys automatically (about 1–2 minutes).

### The fields you will most likely change

| Field | What it controls |
| --- | --- |
| `teacher.name` | Navbar, footer, admin header |
| `teacher.formalName` | Footer credit line |
| `location.badge` | The `827013 • IN` metadata badge |
| `contact.whatsappNumber` | The `wa.me` link (digits only) |
| `contact.whatsappDisplay` | The number visitors read |
| `contact.email` | Contact links and footer |
| `admin.email` | Prefilled login email (must match Supabase Auth) |
| `tracks` | Titles, descriptions and subject pills on the two track cards |
| `ai.suggestions` | Starter questions inside Sleep Sensei |

**Do not add class timings or student results** — this project intentionally excludes schedules and testimonials. The design is built around resources, mentorship and direct contact only.

**Editing on a phone:** GitHub's mobile web editor is fine for short text changes. If you paste Hindi or Sanskrit text, check the preview before committing — some mobile keyboards alter quotation marks.

---

## Step 6 — Running the console day to day

Tap the **lock icon** in the header (or "Teacher's console" in the footer), then sign in with the admin email and password.

### Upload a resource

1. **Upload** tab.
2. Enter a clear title students will understand.
3. Pick the subject/category (this powers the vault filters).
4. Choose a PDF, photo, or document (max 25 MB).
5. Tap **Publish to vault**.

The file goes to the `resources` storage bucket; the metadata row goes to `public.resources`.

### Manage resources

The **All resources** tab lists everything with a search box, preview link, date, and size. **Delete** asks for confirmation and removes **both** the database row and the stored file.

### Read messages

The **Messages inbox** tab shows name, phone, optional email, the message, the time received, and an **Expires in X days** badge. Use **Reply on WhatsApp** for a prefilled chat, or **Delete now** to remove a message immediately.

### Pruning messages

Three layers keep the free tier clean:

1. A database trigger purges old rows after every new message.
2. A daily `pg_cron` job (when available) deletes anything past 7 days.
3. The website and the inbox call `purge_expired_messages()` on load, with a direct delete as fallback.

You can also tap **Purge expired** in the inbox.

---

## Change the password safely

1. Supabase → **Authentication** → **Users** → tap the admin user.
2. Choose **Reset password** / **Update password**.
3. Use a **lowercase password** such as `manjusensei2026` — letters and numbers only.
4. Sign in with any capitalisation; the app normalises it.

If you need a mixed-case password, you would have to remove `.toLowerCase()` from `AdminLoginModal.jsx`. That is intentionally not the default, because the requested behaviour is case-insensitive sign-in.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Vault says "The vault is ready. It just needs keys." | `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` missing or misspelled | Re-check Netlify env vars, then trigger a fresh deploy |
| "Invalid login credentials" | Migration not run, password reset, or account unconfirmed | Re-run the migration, confirm the user, try again |
| Login works but uploads fail with a policy error | Not signed in, or storage policies missing | Sign out/in; re-run Section 5 of the migration |
| "Bucket not found" | Storage bucket missing | Re-run the migration; check Storage → `resources` |
| Message form fails but WhatsApp works | RLS/grants missing on `messages` | Re-run the migration |
| PDF preview is blank | Mobile browser blocks embedded PDFs | Tap **Open** in the preview footer |
| Sleep Sensei says it is not connected | `VITE_GEMINI_API_KEY` missing | Add it in Netlify and redeploy |
| Sleep Sensei quota message | Free-tier rate limit | Wait a minute, or check AI Studio usage |
| Photos fail to upload | File is HEIC or over 25 MB | Export as JPG/PNG and compress |
| Site works but old content persists | Browser cache / service worker | Hard refresh, or open in a private tab |
| Netlify build fails | Node version or a syntax edit | Check the deploy log; Node 20 is set in `netlify.toml` |

---

## Security checklist

- [ ] The anon key is in Netlify env vars — **not** the `service_role` key.
- [ ] `.env` is not committed to GitHub (it is gitignored).
- [ ] The admin email in `siteConfig.js` matches the Supabase Auth user.
- [ ] The admin password is lowercase and at least 12 characters.
- [ ] The Supabase project is on a plan you are comfortable with.
- [ ] Only the teacher knows the console password.
- [ ] You have tested one upload and one delete on a phone.

---

## Quick reference

| Item | Value |
| --- | --- |
| Build command | `npm run build` |
| Publish directory | `dist` |
| Node version | 20 |
| Storage bucket | `resources` (public read, authenticated write) |
| Tables | `public.resources`, `public.messages` |
| Retention | 7 days, enforced three ways |
| Admin email | `viewpointpublicschoolofficial@gmail.com` |
| Admin password | `manjusensei` (change it) |

For the deeper architecture, read [TECHNICAL_REPORT.md](TECHNICAL_REPORT.md).
