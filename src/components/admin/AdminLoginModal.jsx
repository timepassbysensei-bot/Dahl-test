import { useEffect, useRef, useState } from 'react'
import { Eye, EyeOff, Loader2, Lock, ShieldCheck, X } from 'lucide-react'
import { siteConfig } from '../../config/siteConfig'
import { friendlyAuthError, isSupabaseConfigured, supabase } from '../../lib/supabaseClient'

export default function AdminLoginModal({ onClose, onSignedIn }) {
  const [email, setEmail] = useState(siteConfig.admin.email)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const passwordRef = useRef(null)

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    const timer = window.setTimeout(() => passwordRef.current?.focus(), 280)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(timer)
    }
  }, [onClose])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (status === 'submitting') return

    if (!isSupabaseConfigured) {
      setStatus('error')
      setError('Supabase is not connected yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then redeploy.')
      return
    }

    // CRITICAL: both inputs are normalised before the auth call.
    // The admin account is created with the lowercase password `manjusensei`,
    // so this makes "ManjuSensei", "MANJUSENSEI" and "Manjusensei" all work.
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedPassword = password.trim().toLowerCase()

    if (!normalizedEmail || !normalizedPassword) {
      setStatus('error')
      setError('Enter both the admin email and password.')
      return
    }

    setStatus('submitting')
    setError('')

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: normalizedPassword,
    })

    if (authError) {
      setStatus('error')
      setError(friendlyAuthError(authError.message))
      return
    }

    setStatus('idle')
    onSignedIn(data.session)
  }

  return (
    <div
      className="scrim"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-login-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="sheet max-w-[27rem] overflow-hidden">
        <div className="dark-panel relative overflow-hidden px-6 pb-6 pt-6">
          <div
            className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full opacity-70 blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(109,61,242,.9), transparent 70%)' }}
            aria-hidden="true"
          />

          <div className="relative flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-canvas/20 text-canvas">
                <Lock size={15} strokeWidth={1.8} />
              </span>
              <div>
                <p className="font-mono text-[0.48rem] uppercase tracking-editorial text-canvas/45">
                  {siteConfig.school.name}
                </p>
                <h2 id="admin-login-title" className="font-display text-[1.75rem] leading-none text-canvas">
                  {siteConfig.admin.consoleLabel}
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full border border-canvas/15 text-canvas/60 transition-colors hover:border-canvas/40 hover:text-canvas"
              aria-label="Close the console"
            >
              <X size={14} />
            </button>
          </div>

          <p className="relative mt-4 max-w-xs text-[0.8rem] leading-relaxed text-canvas/55">
            Upload material, manage the vault and read student messages. Secured by Supabase Auth.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6">
          <div>
            <label className="field-label" htmlFor="admin-email">
              Admin email
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              className="field-input"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                if (status === 'error') setStatus('idle')
              }}
              placeholder="teacher@example.com"
              disabled={status === 'submitting'}
            />
          </div>

          <div className="mt-5">
            <label className="field-label" htmlFor="admin-password">
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                ref={passwordRef}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className="field-input pr-10"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  if (status === 'error') setStatus('idle')
                }}
                placeholder="Your admin password"
                disabled={status === 'submitting'}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-0 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted transition-colors hover:text-ink"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-xl border border-red-300/60 bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-800">
              {error}
            </p>
          )}

          <button type="submit" disabled={status === 'submitting'} className="pill-cta mt-6 w-full justify-between disabled:opacity-60">
            {status === 'submitting' ? 'Checking credentials…' : 'Enter console'}
            <span className="pill-cta__orb">
              {status === 'submitting' ? <Loader2 size={14} className="animate-spin" /> : <Lock size={13} />}
            </span>
          </button>

          <div className="mt-5 flex items-start gap-2 border-t border-line pt-4">
            <ShieldCheck size={13} className="mt-0.5 shrink-0 text-[var(--purple)]" />
            <p className="font-mono text-[0.52rem] uppercase leading-relaxed tracking-editorial text-muted">
              {siteConfig.admin.sessionNote}
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
