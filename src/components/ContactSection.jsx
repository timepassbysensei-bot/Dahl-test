import { useEffect, useState } from 'react'
import { ArrowUpRight, Check, Loader2, Lock, Mail, MapPin, MessageCircle, Send } from 'lucide-react'
import { siteConfig, whatsappLink } from '../config/siteConfig'
import { friendlyDataError, isSupabaseConfigured, purgeExpiredMessages, supabase } from '../lib/supabaseClient'

const EMPTY_FORM = { name: '', phone: '', email: '', message: '' }

function validate(form) {
  const errors = {}
  const name = form.name.trim()
  const phoneDigits = form.phone.replace(/\D/g, '')
  const email = form.email.trim()

  if (name.length < 2) errors.name = 'Please share your name.'
  if (phoneDigits.length < 10) errors.phone = 'Enter a valid phone number with at least 10 digits.'
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = 'That email address looks incomplete.'
  if (form.message.trim().length < 5) errors.message = 'Add a little more detail (5 characters or more).'

  return errors
}

function TapWord({ children }) {
  const [on, setOn] = useState(false)
  return (
    <span className="word-burst">
      <span
        role="button"
        tabIndex={0}
        aria-pressed={on}
        onClick={() => setOn((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setOn((value) => !value)
          }
        }}
        className={`word-tap ${on ? 'is-on' : ''}`}
      >
        {children}
      </span>
    </span>
  )
}

export default function ContactSection() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [error, setError] = useState('')

  useEffect(() => {
    // Client-side pruning runs on first load, alongside the SQL trigger and cron.
    purgeExpiredMessages()
  }, [])

  const update = (field) => (event) => {
    const { value } = event.target
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    if (status === 'error') setStatus('idle')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (status === 'submitting') return

    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    if (!isSupabaseConfigured) {
      setStatus('error')
      setError('Messaging is not connected yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then redeploy.')
      return
    }

    setStatus('submitting')
    setError('')

    const { error: insertError } = await supabase.from('messages').insert({
      sender_name: form.name.trim(),
      sender_phone: form.phone.trim(),
      sender_email: form.email.trim() || null,
      message_text: form.message.trim(),
    })

    if (insertError) {
      setStatus('error')
      setError(friendlyDataError(insertError, 'Your message could not be saved. Please use WhatsApp instead.'))
      return
    }

    // Best-effort prune after a successful insert (the DB trigger also runs).
    purgeExpiredMessages()
    setForm(EMPTY_FORM)
    setStatus('success')
  }

  const { contactSection, contact, location } = siteConfig

  return (
    <section id="contact" className="relative z-10 scroll-mt-20 py-16 sm:py-20 md:py-28">
      <div className="mx-auto max-w-editorial px-5 md:px-8">
        <div className="grid gap-4 lg:grid-cols-12">
          {/* ------------------------------------------------------ dark card */}
          <div className="dark-panel relative overflow-hidden rounded-[2rem] p-6 sm:p-9 lg:col-span-5" data-reveal>
            <div
              className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full opacity-70 blur-3xl"
              style={{ background: 'radial-gradient(circle, rgba(109,61,242,.9), transparent 70%)' }}
              aria-hidden="true"
            />

            <div className="relative flex items-center justify-between">
              <span className="font-mono text-[0.56rem] uppercase tracking-editorial text-canvas/50">
                {contactSection.eyebrow}
              </span>
              <span className="star-pulse text-lg text-[var(--purple-light)]" aria-hidden="true">
                ✦
              </span>
            </div>

            <h2 className="relative mt-6 font-display text-[clamp(2.9rem,6vw,4.2rem)] leading-[0.9] tracking-tight text-canvas">
              Let’s <span className="italic text-[var(--purple-light)]">talk.</span>
            </h2>

            <p className="relative mt-4 max-w-sm text-sm leading-relaxed text-canvas/60">{contactSection.description}</p>

            <div className="relative mt-8 rounded-2xl border border-canvas/12 bg-canvas/[0.04] p-5">
              <span className="font-mono text-[0.52rem] uppercase tracking-editorial text-canvas/40">
                Fastest route · WhatsApp
              </span>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-1 block font-display text-[2rem] leading-none text-canvas transition-colors hover:text-[var(--purple-light)]"
              >
                {contact.whatsappDisplay}
              </a>
              <a href={whatsappLink()} target="_blank" rel="noreferrer noopener" className="pill-cta pill-cta--light mt-5 w-full justify-between sm:w-auto">
                Chat on WhatsApp
                <span className="pill-cta__orb">
                  <ArrowUpRight size={14} strokeWidth={2.2} />
                </span>
              </a>
            </div>

            <div className="relative mt-7 space-y-3 border-t border-canvas/12 pt-6">
              <a
                href={`mailto:${contact.email}`}
                className="flex items-start gap-2.5 text-[0.82rem] text-canvas/70 transition-colors hover:text-canvas"
              >
                <Mail size={14} strokeWidth={1.8} className="mt-0.5 shrink-0" />
                <span className="break-all">{contact.email}</span>
              </a>
              <p className="flex items-start gap-2.5 text-[0.82rem] text-canvas/70">
                <MapPin size={14} strokeWidth={1.8} className="mt-0.5 shrink-0" />
                <span>
                  {location.city} · {location.region}
                  <span className="block font-mono text-[0.52rem] uppercase tracking-editorial text-canvas/40">
                    {location.badge}
                  </span>
                </span>
              </p>
            </div>

            <p className="relative mt-7 flex items-center gap-2 font-mono text-[0.5rem] uppercase leading-relaxed tracking-editorial text-canvas/35">
              <Lock size={10} />
              Messages auto-clear after 7 days
            </p>
          </div>

          {/* ---------------------------------------------------------- form */}
          <div className="rounded-[2rem] border border-line bg-canvas p-6 sm:p-9 lg:col-span-7" data-reveal style={{ transitionDelay: '90ms' }}>
            {status === 'success' ? (
              <div className="flex min-h-[26rem] flex-col items-start justify-center">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-[var(--purple)] text-white">
                  <Check size={24} strokeWidth={2.2} />
                </span>
                <span className="mt-6 mono-tag">Message received</span>
                <h3 className="mt-2 font-display text-[clamp(2rem,4vw,3rem)] leading-none">Thank you.</h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-ink/65">
                  Your message is safely with the teacher and will be answered on WhatsApp. It will be removed from the
                  database automatically after seven days.
                </p>
                <button type="button" onClick={() => setStatus('idle')} className="pill-cta mt-7">
                  Send another message
                  <span className="pill-cta__orb">
                    <Send size={13} />
                  </span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <span className="mono-tag">Direct message</span>
                    <h3 className="mt-2 font-display text-[clamp(1.9rem,3.4vw,2.6rem)] leading-none">
                      Send a <TapWord>note.</TapWord>
                    </h3>
                  </div>
                  <span className="flex items-center gap-2 font-mono text-[0.5rem] uppercase tracking-editorial text-muted">
                    <MessageCircle size={11} />
                    No account needed
                  </span>
                </div>

                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="field-label" htmlFor="sender-name">
                      Name <span className="text-[var(--purple)]">*</span>
                    </label>
                    <input
                      id="sender-name"
                      name="name"
                      autoComplete="name"
                      className="field-input"
                      placeholder="Your full name"
                      value={form.name}
                      onChange={update('name')}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? 'sender-name-error' : undefined}
                      disabled={status === 'submitting'}
                    />
                    {errors.name && (
                      <p id="sender-name-error" className="mt-1.5 text-xs text-red-700">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="field-label" htmlFor="sender-phone">
                      Phone <span className="text-[var(--purple)]">*</span>
                    </label>
                    <input
                      id="sender-phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      className="field-input"
                      placeholder="+91 00000 00000"
                      value={form.phone}
                      onChange={update('phone')}
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? 'sender-phone-error' : undefined}
                      disabled={status === 'submitting'}
                    />
                    {errors.phone && (
                      <p id="sender-phone-error" className="mt-1.5 text-xs text-red-700">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="field-label" htmlFor="sender-email">
                      Email <span className="normal-case tracking-normal text-muted/70">(optional)</span>
                    </label>
                    <input
                      id="sender-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className="field-input"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={update('email')}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'sender-email-error' : undefined}
                      disabled={status === 'submitting'}
                    />
                    {errors.email && (
                      <p id="sender-email-error" className="mt-1.5 text-xs text-red-700">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="field-label" htmlFor="sender-message">
                      Message <span className="text-[var(--purple)]">*</span>
                    </label>
                    <textarea
                      id="sender-message"
                      name="message"
                      rows={4}
                      className="field-input"
                      placeholder="Which class, subject, or resource do you need help with?"
                      value={form.message}
                      onChange={update('message')}
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby={errors.message ? 'sender-message-error' : undefined}
                      disabled={status === 'submitting'}
                    />
                    {errors.message && (
                      <p id="sender-message-error" className="mt-1.5 text-xs text-red-700">
                        {errors.message}
                      </p>
                    )}
                  </div>
                </div>

                {status === 'error' && (
                  <p className="mt-5 rounded-xl border border-red-300/60 bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-800">
                    {error}
                  </p>
                )}

                <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-line pt-5 sm:flex-row sm:items-center">
                  <p className="max-w-[19rem] font-mono text-[0.5rem] uppercase leading-relaxed tracking-editorial text-muted">
                    {contactSection.formNote}
                  </p>
                  <button type="submit" disabled={status === 'submitting'} className="pill-cta disabled:opacity-60">
                    {status === 'submitting' ? 'Sending…' : 'Send message'}
                    <span className="pill-cta__orb">
                      {status === 'submitting' ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
