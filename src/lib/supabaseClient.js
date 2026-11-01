/**
 * supabaseClient.js
 * ---------------------------------------------------------------------------
 * One Supabase client for the whole app, plus the small data utilities the
 * vault, contact form and admin console share.
 *
 * The anon key is safe in the browser: every table and bucket is protected by
 * Row Level Security in the migration file. The service_role key must never
 * appear in this project.
 * ---------------------------------------------------------------------------
 */
import { createClient } from '@supabase/supabase-js'

const url = (import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '')
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

// Treat the shipped .env.example values as "not configured" so the UI can show
// friendly setup instructions instead of throwing network errors.
const looksLikePlaceholder = /your-project|your-anon|example\.com|changeme/i.test(`${url}${anonKey}`)

export const isSupabaseConfigured = Boolean(url && anonKey && !looksLikePlaceholder)

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'manju-sensei-auth',
      },
    })
  : null

export const RESOURCE_BUCKET = 'resources'
export const MESSAGE_RETENTION_DAYS = 7
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024 // 25 MB — matches the bucket policy

const DAY_MS = 24 * 60 * 60 * 1000

/* -------------------------------------------------------------------------- */
/*  Retention                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Deletes messages older than seven days.
 *
 * Preferred path is the SECURITY DEFINER RPC created by the migration, which
 * works even for anonymous visitors. If the function is missing (for example a
 * partially applied migration) it falls back to the documented client delete.
 */
export async function purgeExpiredMessages() {
  if (!supabase) return { ok: false, reason: 'not-configured' }

  const cutoff = new Date(Date.now() - MESSAGE_RETENTION_DAYS * DAY_MS).toISOString()

  try {
    const { error: rpcError } = await supabase.rpc('purge_expired_messages')
    if (!rpcError) return { ok: true, method: 'rpc' }
  } catch {
    // Fall through to the direct delete below.
  }

  try {
    const { error } = await supabase.from('messages').delete().lt('created_at', cutoff)
    if (error) return { ok: false, reason: error.message }
    return { ok: true, method: 'client' }
  } catch (error) {
    return { ok: false, reason: error?.message || 'Unknown cleanup error' }
  }
}

/* -------------------------------------------------------------------------- */
/*  Formatting                                                                 */
/* -------------------------------------------------------------------------- */

export function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

export function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

/** Whole days remaining before a message expires (7-day retention window). */
export function daysUntilExpiry(createdAt) {
  if (!createdAt) return 0
  const created = new Date(createdAt).getTime()
  if (Number.isNaN(created)) return 0
  const remaining = created + MESSAGE_RETENTION_DAYS * DAY_MS - Date.now()
  return Math.max(0, Math.ceil(remaining / DAY_MS))
}

export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '—'
  const value = Number(bytes)
  if (!Number.isFinite(value) || value <= 0) return '—'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1)
  const sized = value / 1024 ** index
  return `${sized >= 10 || index === 0 ? Math.round(sized) : sized.toFixed(1)} ${units[index]}`
}

/* -------------------------------------------------------------------------- */
/*  Files                                                                      */
/* -------------------------------------------------------------------------- */

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'heic']
const DOC_EXTENSIONS = ['doc', 'docx', 'odt', 'rtf', 'txt', 'ppt', 'pptx', 'xls', 'xlsx']

export function extensionOf(name = '') {
  const parts = String(name).split('.')
  return parts.length > 1 ? parts.pop().toLowerCase() : ''
}

/** Normalises a browser File into the three badge types the UI understands. */
export function detectFileType(file) {
  if (!file) return 'doc'
  const mime = (file.type || '').toLowerCase()
  const ext = extensionOf(file.name)
  if (mime.startsWith('image/') || IMAGE_EXTENSIONS.includes(ext)) return 'image'
  if (mime === 'application/pdf' || ext === 'pdf') return 'pdf'
  if (DOC_EXTENSIONS.includes(ext)) return 'doc'
  return 'doc'
}

export function fileTypeLabel(type) {
  if (type === 'pdf') return 'PDF'
  if (type === 'image') return 'IMAGE'
  return 'DOC'
}

/** Safe, unique storage path: 1720000000000-class-10-notes.pdf */
export function buildStoragePath(file) {
  const original = String(file.name || 'resource')
  const extension = extensionOf(original)
  const stem = original
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
  const safeName = `${stem || 'resource'}${extension ? `.${extension}` : ''}`
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return `${unique}-${safeName}`
}

/**
 * Supabase public URLs accept ?download=<filename> to force a download instead
 * of opening the file in a tab. Harmless for other hosts.
 */
export function buildDownloadUrl(fileUrl, filename = 'resource') {
  if (!fileUrl) return '#'
  try {
    const target = new URL(fileUrl)
    target.searchParams.set('download', filename)
    return target.toString()
  } catch {
    return fileUrl
  }
}

export function friendlyAuthError(message = '') {
  const text = String(message).toLowerCase()
  if (text.includes('invalid login credentials')) return 'That email and password combination did not match. Check both and try again.'
  if (text.includes('email not confirmed')) return 'This account is not confirmed yet. Confirm it in Supabase → Authentication → Users.'
  if (text.includes('rate limit') || text.includes('too many')) return 'Too many attempts. Please wait a minute and try again.'
  if (text.includes('failed to fetch') || text.includes('network')) return 'Could not reach Supabase. Check your connection and the project URL.'
  return message || 'Sign-in failed. Please try again.'
}

export function friendlyDataError(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback
  const message = typeof error === 'string' ? error : error.message
  if (!message) return fallback
  const text = message.toLowerCase()
  if (text.includes('relation') && text.includes('does not exist')) return 'The database tables are missing. Run the migration file in Supabase.'
  if (text.includes('row-level security') || text.includes('permission denied')) return 'This action is not permitted by the database policies. Sign in as the admin account.'
  if (text.includes('bucket not found')) return 'The "resources" storage bucket is missing. Run the migration file in Supabase.'
  if (text.includes('payload too large') || text.includes('too large')) return 'That file is too large. Please keep uploads under 25 MB.'
  if (text.includes('failed to fetch')) return 'Network error. Check your connection and try again.'
  return message
}
