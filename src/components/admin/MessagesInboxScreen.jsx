import { useCallback, useEffect, useState } from 'react'
import { Clock, Loader2, Mail, MessageCircle, Phone, RefreshCw, Trash2 } from 'lucide-react'
import { whatsappReplyLink } from '../../config/siteConfig'
import {
  daysUntilExpiry,
  formatDateTime,
  friendlyDataError,
  MESSAGE_RETENTION_DAYS,
  purgeExpiredMessages,
  supabase,
} from '../../lib/supabaseClient'

const DAY_MS = 24 * 60 * 60 * 1000

export default function MessagesInboxScreen({ onChanged }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [confirmId, setConfirmId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [purging, setPurging] = useState(false)

  const load = useCallback(async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')

    // Client-side pruning on inbox load, in addition to the SQL trigger and cron.
    await purgeExpiredMessages()

    const { data, error: loadError } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })

    if (loadError) {
      setError(friendlyDataError(loadError, 'Could not load the message inbox.'))
      setMessages([])
    } else {
      // Never display a message that has outlived the retention window, even if
      // a background cleanup has not run yet.
      const cutoff = Date.now() - MESSAGE_RETENTION_DAYS * DAY_MS
      const fresh = (data || []).filter((message) => new Date(message.created_at).getTime() >= cutoff)
      setMessages(fresh)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const purgeNow = async () => {
    setPurging(true)
    setNotice('')
    setError('')
    const result = await purgeExpiredMessages()
    setPurging(false)

    if (!result.ok) {
      setError('Could not purge expired messages. Check the database permissions and try again.')
      return
    }

    setNotice('Expired messages purged.')
    await load()
    onChanged?.()
  }

  const handleDelete = async (message) => {
    if (!supabase || deletingId) return
    setDeletingId(message.id)
    setError('')
    setNotice('')

    const { error: deleteError } = await supabase.from('messages').delete().eq('id', message.id)

    if (deleteError) {
      setError(friendlyDataError(deleteError, 'The message could not be deleted.'))
      setDeletingId(null)
      return
    }

    setMessages((current) => current.filter((item) => item.id !== message.id))
    setConfirmId(null)
    setDeletingId(null)
    setNotice('Message deleted immediately.')
    onChanged?.()
  }

  const expiringSoon = messages.filter((message) => daysUntilExpiry(message.created_at) <= 2).length

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="mono-tag">Screen 03</span>
          <h2 className="mt-2 font-display text-[clamp(1.8rem,3.2vw,2.4rem)] leading-none text-ink">
            Student messages
          </h2>
          <p className="mt-2 max-w-lg text-sm text-ink/60">
            Every message is deleted automatically seven days after it arrives. Nothing lingers, nothing piles up.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={purgeNow} disabled={purging} className="chip">
            {purging ? <Loader2 size={12} className="animate-spin" /> : <Clock size={12} />}
            Purge expired
          </button>
          <button type="button" onClick={load} className="icon-btn" aria-label="Refresh messages" disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-line px-3 py-1 font-mono text-[0.5rem] uppercase tracking-editorial text-muted">
          {messages.length} active
        </span>
        <span className="rounded-full border border-amber-300/60 bg-amber-50 px-3 py-1 font-mono text-[0.5rem] uppercase tracking-editorial text-amber-900">
          {expiringSoon} expiring within 2 days
        </span>
        <span className="rounded-full border border-line px-3 py-1 font-mono text-[0.5rem] uppercase tracking-editorial text-muted">
          Retention {MESSAGE_RETENTION_DAYS} days
        </span>
      </div>

      {notice && (
        <p className="mt-4 rounded-xl border border-[var(--purple)]/25 bg-[var(--purple)]/[0.06] px-3 py-2 text-xs text-ink/80">
          {notice}
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-xl border border-red-300/60 bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-800">
          {error}
        </p>
      )}

      {loading ? (
        <div className="mt-4 space-y-3">
          {[0, 1].map((item) => (
            <div key={item} className="admin-card p-5">
              <div className="skeleton h-5 w-40 rounded-md" />
              <div className="skeleton mt-3 h-3 w-24 rounded-md" />
              <div className="skeleton mt-4 h-12 w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="mt-4 rounded-[1.5rem] border border-dashed border-line px-6 py-14 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-ink/[0.04] text-[var(--purple)]">
            ✦
          </span>
          <h3 className="mt-4 font-display text-2xl text-ink">The inbox is clear</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            New questions from the contact form appear here. Messages older than seven days are removed automatically.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3">
          {messages.map((message) => {
            const days = daysUntilExpiry(message.created_at)
            const urgent = days <= 2
            const confirming = confirmId === message.id
            const deleting = deletingId === message.id

            return (
              <article key={message.id} className="admin-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-display text-2xl leading-none text-ink">{message.sender_name}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <a
                        href={`tel:${message.sender_phone}`}
                        className="inline-flex items-center gap-1.5 font-mono text-[0.58rem] uppercase tracking-editorial text-muted transition-colors hover:text-ink"
                      >
                        <Phone size={11} />
                        {message.sender_phone}
                      </a>
                      {message.sender_email && (
                        <a
                          href={`mailto:${message.sender_email}`}
                          className="inline-flex items-center gap-1.5 break-all font-mono text-[0.58rem] uppercase tracking-editorial text-muted transition-colors hover:text-ink"
                        >
                          <Mail size={11} />
                          {message.sender_email}
                        </a>
                      )}
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 font-mono text-[0.48rem] uppercase tracking-editorial ${
                      urgent
                        ? 'border-amber-300/70 bg-amber-50 text-amber-900'
                        : 'border-line bg-canvas text-muted'
                    }`}
                  >
                    {days === 0 ? 'Expires today' : `Expires in ${days} day${days === 1 ? '' : 's'}`}
                  </span>
                </div>

                <p className="mt-4 whitespace-pre-wrap text-[0.88rem] leading-relaxed text-ink/80">
                  {message.message_text}
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[0.5rem] uppercase tracking-editorial text-muted">
                    <Clock size={11} />
                    {formatDateTime(message.created_at)}
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={whatsappReplyLink(message.sender_phone, message.sender_name)}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[0.7rem] font-semibold text-canvas transition-transform hover:-translate-y-0.5"
                    >
                      <MessageCircle size={12} />
                      Reply on WhatsApp
                    </a>

                    {confirming ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleDelete(message)}
                          disabled={deleting}
                          className="inline-flex items-center gap-1.5 rounded-full bg-red-700 px-3 py-1.5 text-[0.7rem] font-semibold text-white transition-colors hover:bg-red-800 disabled:opacity-60"
                        >
                          {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                          Confirm
                        </button>
                        <button type="button" onClick={() => setConfirmId(null)} className="chip" disabled={deleting}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmId(message.id)
                          setNotice('')
                          setError('')
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-[0.7rem] font-semibold text-red-700 transition-colors hover:border-red-300 hover:bg-red-50"
                      >
                        <Trash2 size={12} />
                        Delete now
                      </button>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
