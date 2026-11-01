import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { siteConfig } from '../config/siteConfig'

function TrackCard({ track, className = '', delay = 0 }) {
  const [active, setActive] = useState(false)

  const toggle = () => setActive((value) => !value)

  return (
    <article
      role="button"
      tabIndex={0}
      aria-pressed={active}
      aria-label={`${track.title} — tap to ${active ? 'dim' : 'highlight'} this card`}
      onClick={toggle}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          toggle()
        }
      }}
      data-reveal
      style={{ transitionDelay: `${delay}ms` }}
      className={`track-card group cursor-pointer p-6 sm:p-8 ${active ? 'is-active' : ''} ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-display text-[2.6rem] leading-none text-inherit sm:text-[3.2rem]">{track.index}</span>
          <span className="h-9 w-px bg-current opacity-15" />
          <span className="font-mono text-[0.56rem] uppercase leading-relaxed tracking-editorial card-muted">
            {track.index} / {track.meta}
          </span>
        </div>
        <span className="card-orb" aria-hidden="true">
          <ArrowUpRight size={17} strokeWidth={2} />
        </span>
      </div>

      <div className="mt-10 sm:mt-14">
        <h3 className="font-display text-[clamp(2.1rem,3.6vw,3rem)] leading-[0.95] tracking-tight text-inherit">
          {track.title}
        </h3>
        <p className="mt-2 font-display text-[1.35rem] italic leading-snug text-[var(--purple)] sm:text-[1.5rem]">
          {track.italic}
        </p>
      </div>

      <p className="mt-4 max-w-md text-[0.86rem] leading-relaxed card-muted">{track.description}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {track.tags.map((tag) => (
          <span key={tag} className="track-tag">
            {tag}
          </span>
        ))}
      </div>

      <div className="card-rule mt-8" />

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <span className="font-mono text-[0.53rem] uppercase tracking-editorial card-muted">{track.note}</span>
        <div className="flex gap-5">
          {track.stats.map((stat) => (
            <div key={stat.label}>
              <p className="font-mono text-[0.46rem] uppercase tracking-editorial card-muted">{stat.label}</p>
              <p className="font-display text-lg leading-none text-inherit">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}

function MethodCard({ delay = 0 }) {
  const [active, setActive] = useState(false)
  const { method } = siteConfig

  return (
    <article
      role="button"
      tabIndex={0}
      aria-pressed={active}
      aria-label={`${method.title} — tap to ${active ? 'dim' : 'highlight'} this card`}
      onClick={() => setActive((value) => !value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          setActive((value) => !value)
        }
      }}
      data-reveal
      style={{ transitionDelay: `${delay}ms` }}
      className={`track-card group cursor-pointer p-6 sm:p-8 ${active ? 'is-active' : ''}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="font-mono text-[0.56rem] uppercase tracking-editorial card-muted">
            03 / {method.eyebrow}
          </span>
          <h3 className="mt-3 max-w-xl font-display text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.02] text-inherit">
            {method.title}
          </h3>
        </div>
        <span className="card-orb" aria-hidden="true">
          <ArrowUpRight size={17} strokeWidth={2} />
        </span>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-3 sm:gap-8">
        {method.steps.map((step) => (
          <div key={step.index} className="relative">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[0.55rem] uppercase tracking-editorial text-[var(--purple)]">
                {step.index}
              </span>
              <span className="h-px flex-1 bg-current opacity-15" />
            </div>
            <h4 className="mt-3 font-display text-xl text-inherit">{step.title}</h4>
            <p className="mt-1.5 text-[0.82rem] leading-relaxed card-muted">{step.detail}</p>
          </div>
        ))}
      </div>
    </article>
  )
}

export default function AcademicTracksBento() {
  const [school, tuition] = siteConfig.tracks

  return (
    <section id="tracks" className="relative z-10 scroll-mt-24 py-16 sm:py-20 md:py-28">
      <div className="mx-auto max-w-editorial px-5 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between" data-reveal>
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="mono-tag">02 — Academic tracks</span>
              <span className="h-px w-10 bg-ink/20" />
            </div>
            <h2 className="mt-4 text-balance font-display text-[clamp(2.3rem,5.4vw,4rem)] leading-[0.98] tracking-tight">
              Two tracks. One obsession with <em className="italic text-[var(--purple)]">clarity.</em>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-ink/65">
            School support for Hindi and Sanskrit, or complete tuition across every subject — both built around the
            same idea: nothing moves forward until the concept is genuinely understood.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-12">
          <TrackCard track={school} className="md:col-span-7" />
          <TrackCard track={tuition} className="md:col-span-5" delay={90} />
          <MethodCard delay={140} />
        </div>

        <p className="mt-5 text-center font-mono text-[0.55rem] uppercase tracking-editorial text-muted">
          Tap any card to switch the lights on
        </p>
      </div>
    </section>
  )
}
