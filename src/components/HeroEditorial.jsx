import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { siteConfig } from '../config/siteConfig'

/* -------------------------------------------------------------------------- */
/*  Interactive atoms                                                          */
/* -------------------------------------------------------------------------- */

const BURST_COLORS = ['var(--purple)', '#7C4DFF', '#0E0C15', '#A98BFF', '#F4F1EA']

function ColorBurst({ token }) {
  if (!token) return null
  return (
    <span key={token} className="pointer-events-none absolute inset-0 z-20" aria-hidden="true">
      {BURST_COLORS.map((color, index) => {
        const angle = (Math.PI * 2 * index) / BURST_COLORS.length + token * 0.6
        const distance = 26 + (index % 3) * 12
        return (
          <span
            key={`${token}-${index}`}
            className="burst-particle"
            style={{
              '--dx': `${Math.cos(angle) * distance}px`,
              '--dy': `${Math.sin(angle) * distance}px`,
              background: color,
              animationDelay: `${index * 18}ms`,
            }}
          />
        )
      })}
    </span>
  )
}

/** A phrase that toggles a tilted electric-purple highlight block on tap. */
function TapWord({ children, className = '', initial = false }) {
  const [on, setOn] = useState(initial)
  const [token, setToken] = useState(0)

  const toggle = () => {
    setOn((value) => !value)
    setToken(Date.now())
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
        className={`word-tap ${on ? 'is-on' : ''} ${className}`}
      >
        {children}
      </span>
      <ColorBurst token={token} />
    </span>
  )
}

/** A single letter or glyph that bursts and nudges the theme accent. */
function TapGlyph({ children, className = '', label = 'Shift the accent colour' }) {
  const [token, setToken] = useState(0)
  const [popping, setPopping] = useState(false)

  const fire = () => {
    setToken(Date.now())
    setPopping(true)
    window.dispatchEvent(new CustomEvent('accent:cycle'))
    window.setTimeout(() => setPopping(false), 620)
  }

  return (
    <span className="word-burst inline-block">
      <button
        type="button"
        onClick={fire}
        aria-label={label}
        className={`relative inline-flex items-center justify-center leading-none transition-colors ${className}`}
      >
        <span className={popping ? 'letter-pop inline-block' : 'inline-block'}>{children}</span>
      </button>
      <ColorBurst token={token} />
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/*  Hero                                                                       */
/* -------------------------------------------------------------------------- */

export default function HeroEditorial({ onOpenChat }) {
  const cardRef = useRef(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setLoaded(true), 60)
    return () => window.clearTimeout(timer)
  }, [])

  const handlePointerMove = useCallback((event) => {
    // Tilt is a desktop affordance; ignore touch so scrolling never wobbles the card.
    if (event.pointerType !== 'mouse') return
    const node = cardRef.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width - 0.5
    const py = (event.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: px * 7, y: py * -7 })
  }, [])

  const resetTilt = () => setTilt({ x: 0, y: 0 })

  const { meta, hero, teacher, location } = siteConfig

  return (
    <section id="top" className="relative z-10 pt-24 md:pt-32">
      <div className="mx-auto max-w-editorial px-5 md:px-8">
        {/* metadata rail */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <span className="mono-tag">{meta.edition}</span>
            <span className="h-1 w-1 rounded-full bg-ink/20" />
            <span className="mono-tag">{meta.established}</span>
            <span className="hidden h-1 w-1 rounded-full bg-ink/20 sm:block" />
            <span className="mono-tag hidden sm:block">{location.city}</span>
          </div>
          <span className="mono-tag text-ink/70">{location.badge}</span>
        </div>

        <div className="grid items-start gap-10 pt-9 md:grid-cols-12 md:gap-7 md:pt-14">
          {/* ---------------------------------------------------------- copy */}
          <div className={`md:col-span-7 lg:col-span-7 ${loaded ? 'is-visible' : ''}`} data-reveal>
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--purple)] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--purple)]" />
              </span>
              <span className="eyebrow text-ink/70">{hero.eyebrow}</span>
            </div>

            <h1 className="mt-6 font-display text-[clamp(2.85rem,8vw,6.15rem)] leading-[0.94] tracking-tightest text-ink">
              <span className="block">
                {hero.headline.lead}{' '}
                <span className="italic text-ink/90">{hero.headline.quiet}</span>
              </span>

              <span className="mt-1 block">
                It <em className="italic">speaks</em>{' '}
                <TapWord initial className="italic">
                  {hero.headline.highlight}
                </TapWord>
                <TapGlyph className="ml-1 align-super text-[0.42em] text-[var(--purple)]" label="Cycle the accent colour">
                  ✦
                </TapGlyph>
              </span>

            </h1>

            {/* Clickable accent glyph — bursts, bounces and rotates the theme accent. */}
            <div className="mt-4 flex items-center gap-3 font-mono text-[0.6rem] uppercase tracking-editorial text-muted">
              <TapGlyph className="text-[1.65rem] not-italic text-[var(--purple)]" label="Nudge the accent colour">
                ✦
              </TapGlyph>
              <span className="h-px w-10 bg-ink/20" />
              <span>Tap the purple marks · they answer back</span>
            </div>

            <p className="mt-7 max-w-xl text-pretty text-[0.95rem] leading-relaxed text-ink/70 sm:text-base">
              {hero.description}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href={hero.primaryCta.href} className="pill-cta">
                {hero.primaryCta.label}
                <span className="pill-cta__orb">
                  <ArrowDown size={14} strokeWidth={2.2} />
                </span>
              </a>

              <button type="button" onClick={onOpenChat} className="pill-cta pill-cta--ghost">
                {hero.secondaryCta.label}
                <span className="pill-cta__orb">
                  <span className="text-[0.8rem] leading-none">✦</span>
                </span>
              </button>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-3 border-t border-line pt-5">
              {hero.meta.map((item) => (
                <div key={item}>
                  <dt className="sr-only">{item}</dt>
                  <dd className="font-mono text-[0.56rem] uppercase leading-relaxed tracking-editorial text-muted">
                    {item}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* -------------------------------------------------- studio card */}
          <div className="relative md:col-span-5 lg:col-span-5" data-reveal style={{ transitionDelay: '120ms' }}>
            <div
              ref={cardRef}
              onPointerMove={handlePointerMove}
              onPointerLeave={resetTilt}
              className="dark-panel relative overflow-hidden rounded-[2rem] p-6 shadow-float sm:p-8"
              style={{
                transform: `perspective(1200px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
                transition: 'transform 180ms ease-out',
              }}
            >
              <div
                className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full opacity-70 blur-3xl"
                style={{ background: 'radial-gradient(circle, rgba(109,61,242,.85), transparent 70%)' }}
                aria-hidden="true"
              />

              <div className="relative flex items-start justify-between">
                <div>
                  <span className="font-mono text-[0.56rem] uppercase tracking-editorial text-canvas/50">
                    Live study desk
                  </span>
                  <p className="mt-2 font-mono text-[0.56rem] uppercase tracking-editorial text-canvas/30">
                    {meta.edition} · {meta.region}
                  </p>
                </div>
                <span className="star-spin text-2xl text-[var(--purple-light)]" aria-hidden="true">
                  ✦
                </span>
              </div>

              <p className="relative mt-14 max-w-[17rem] font-display text-[clamp(1.9rem,3.4vw,2.7rem)] leading-[0.98] text-canvas">
                Every doubt has a shorter answer than it looks.
              </p>

              <div className="relative mt-6 flex items-center gap-2">
                <span className="rounded-full border border-canvas/15 bg-canvas/5 px-3 py-1 font-mono text-[0.52rem] uppercase tracking-editorial text-canvas/70">
                  Hindi
                </span>
                <span className="rounded-full border border-canvas/15 bg-canvas/5 px-3 py-1 font-mono text-[0.52rem] uppercase tracking-editorial text-canvas/70">
                  Sanskrit
                </span>
                <span className="rounded-full border border-canvas/15 bg-canvas/5 px-3 py-1 font-mono text-[0.52rem] uppercase tracking-editorial text-canvas/70">
                  + all subjects
                </span>
              </div>

              <div className="relative mt-8 h-px w-full bg-canvas/15" />

              <div className="relative mt-6 flex items-end justify-between gap-4">
                <div>
                  <span className="font-mono text-[0.52rem] uppercase tracking-editorial text-canvas/40">Mentor</span>
                  <p className="mt-1 font-display text-2xl leading-none text-canvas">{teacher.name}</p>
                  <p className="mt-1 font-mono text-[0.52rem] uppercase tracking-editorial text-canvas/40">
                    {teacher.role} · Classes VII–X
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onOpenChat}
                  className="group/orb grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--purple)] text-white transition-transform duration-500 hover:rotate-45 hover:bg-[var(--purple-light)]"
                  aria-label="Open Sleep Sensei"
                >
                  <ArrowUpRight size={18} strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* overlapping index card */}
            <div className="absolute -bottom-6 left-4 hidden w-[13.5rem] rounded-2xl border border-line bg-canvas/95 p-4 shadow-float backdrop-blur sm:block">
              <div className="flex items-center justify-between">
                <span className="mono-tag">Tracks</span>
                <span className="text-sm text-[var(--purple)]" aria-hidden="true">
                  ✦
                </span>
              </div>
              <p className="mt-3 font-display text-[2.6rem] leading-none text-ink">02</p>
              <p className="mt-1 font-mono text-[0.52rem] uppercase leading-relaxed tracking-editorial text-muted">
                School curriculum
                <br />
                All-subject tuition
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------- marquee */}
      <div className="relative mt-16 border-y border-ink/10 bg-ink py-3.5 md:mt-20" aria-hidden="true">
        <div className="marquee">
          <div className="marquee__track items-center">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0 items-center">
                {siteConfig.marquee.map((item) => (
                  <span key={`${copy}-${item}`} className="flex items-center">
                    <span className="px-6 font-mono text-[0.6rem] uppercase tracking-editorial text-canvas/65 sm:px-8">
                      {item}
                    </span>
                    <span className="text-[0.65rem] text-[var(--purple-light)]">✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
