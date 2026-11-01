import { useState } from 'react'
import { ArrowUp, ArrowUpRight, Lock, Mail, MapPin, MessageCircle } from 'lucide-react'
import { siteConfig, whatsappLink } from '../config/siteConfig'

function LearningWord() {
  const [on, setOn] = useState(false)
  const [token, setToken] = useState(0)

  const toggle = () => {
    setOn((value) => !value)
    setToken(Date.now())
    window.dispatchEvent(new CustomEvent('accent:cycle'))
  }

  return (
    <span className="word-burst">
      <span
        role="button"
        tabIndex={0}
        aria-pressed={on}
        onClick={toggle}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            toggle()
          }
        }}
        className={`word-tap italic ${on ? 'is-on' : ''}`}
      >
        {siteConfig.footer.headlineAccent}
      </span>
      {token > 0 && (
        <span className="pointer-events-none absolute inset-0" aria-hidden="true">
          {['var(--purple)', '#7C4DFF', '#0E0C15', '#A98BFF'].map((color, index) => (
            <span
              key={`${token}-${index}`}
              className="burst-particle"
              style={{
                '--dx': `${[26, -24, 12, -14][index]}px`,
                '--dy': `${[-24, -18, 22, 18][index]}px`,
                background: color,
                animationDelay: `${index * 30}ms`,
              }}
            />
          ))}
        </span>
      )}
    </span>
  )
}

export default function FooterEditorial({ onOpenAdmin }) {
  const { teacher, contact, location, footer } = siteConfig

  return (
    <footer className="relative z-10 mt-8 overflow-hidden border-t border-line bg-canvas">
      <div className="mx-auto max-w-editorial px-5 pb-8 pt-14 md:px-8 md:pt-20">
        <div className="flex flex-wrap items-start justify-between gap-6" data-reveal>
          <div>
            <span className="mono-tag">04 — The last word</span>
            <h2 className="mt-5 font-display text-[clamp(3.4rem,13vw,9rem)] leading-[0.82] tracking-tightest text-ink">
              {footer.headline} <LearningWord />
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/60">{footer.note}</p>
          </div>

          <span className="star-spin hidden text-6xl text-[var(--purple)] md:block" aria-hidden="true">
            ✦
          </span>
        </div>

        <div className="mt-12 grid gap-8 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="eyebrow">Teacher</p>
            <p className="mt-3 font-display text-2xl leading-none text-ink">{teacher.name}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              {teacher.formalName} · {teacher.role}
              <br />
              {siteConfig.school.name}
            </p>
          </div>

          <div>
            <p className="eyebrow">Direct line</p>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-3 flex items-center gap-2 text-sm font-medium text-ink transition-colors hover:text-[var(--purple)]"
            >
              <MessageCircle size={14} strokeWidth={1.8} />
              {contact.whatsappDisplay}
            </a>
            <a
              href={`mailto:${contact.email}`}
              className="mt-2 flex items-start gap-2 break-all text-sm text-ink/70 transition-colors hover:text-[var(--purple)]"
            >
              <Mail size={14} strokeWidth={1.8} className="mt-0.5 shrink-0" />
              {contact.email}
            </a>
          </div>

          <div>
            <p className="eyebrow">Where</p>
            <p className="mt-3 flex items-start gap-2 text-sm text-ink/70">
              <MapPin size={14} strokeWidth={1.8} className="mt-0.5 shrink-0" />
              <span>
                {location.city}
                <br />
                {location.region} · {location.badge}
              </span>
            </p>
            <p className="mt-2 text-xs text-muted">{location.note}</p>
          </div>

          <div>
            <p className="eyebrow">Quick links</p>
            <div className="mt-3 flex flex-col items-start gap-2">
              {siteConfig.nav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="group inline-flex items-center gap-1.5 text-sm text-ink/70 transition-colors hover:text-[var(--purple)]"
                >
                  {item.label}
                  <ArrowUpRight
                    size={12}
                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </a>
              ))}
              <button
                type="button"
                onClick={onOpenAdmin}
                className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 font-mono text-[0.55rem] uppercase tracking-editorial text-muted transition-colors hover:border-[var(--purple)] hover:text-ink"
              >
                <Lock size={10} strokeWidth={2} />
                Teacher's console
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-line pt-5 sm:flex-row sm:items-center">
          <p className="font-mono text-[0.53rem] uppercase leading-relaxed tracking-editorial text-muted">
            © {new Date().getFullYear()} {teacher.name} · {siteConfig.meta.edition}
            <span className="hidden sm:inline"> · {footer.credit}</span>
          </p>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[0.53rem] uppercase tracking-editorial text-muted">
              Made for students
            </span>
            <a
              href="#top"
              className="group flex items-center gap-2 rounded-full border border-line px-3 py-1.5 font-mono text-[0.53rem] uppercase tracking-editorial text-ink transition-colors hover:border-ink hover:bg-ink hover:text-canvas"
            >
              Back to top
              <ArrowUp size={11} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
