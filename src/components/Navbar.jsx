import { useEffect, useState } from 'react'
import { ArrowUpRight, Lock, Menu, X } from 'lucide-react'
import { siteConfig } from '../config/siteConfig'

function HexMark({ className = '' }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <path
        d="M20 2.6 35.2 11.4v17.2L20 37.4 4.8 28.6V11.4L20 2.6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M20 11.7 27.7 16.2v8.7L20 29.4l-7.7-4.5v-8.7L20 11.7Z" fill="var(--purple)" />
      <path d="M20 3.8v5.4M33.9 12.3 29.2 15M33.9 27.7 29.2 25M20 36.2v-5.4M6.1 27.7 10.8 25M6.1 12.3 10.8 15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".45" />
    </svg>
  )
}

export default function Navbar({ onOpenAdmin }) {
  const [stuck, setStuck] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 14)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className={`glass-nav fixed inset-x-0 top-0 z-50 ${stuck ? 'is-stuck' : ''}`}>
      <div className="mx-auto flex h-16 max-w-editorial items-center justify-between gap-3 px-5 md:h-[4.75rem] md:px-8">
        <a href="#top" className="group flex min-w-0 items-center gap-3" aria-label={`${siteConfig.teacher.name} — back to top`}>
          <HexMark className="h-9 w-9 shrink-0 text-ink transition-transform duration-700 ease-out group-hover:rotate-[24deg]" />
          <span className="min-w-0 leading-none">
            <span className="block truncate font-display text-[1.4rem] leading-none tracking-tight text-ink">
              {siteConfig.teacher.name}
            </span>
            <span className="mt-1.5 block truncate font-mono text-[0.53rem] uppercase tracking-editorial text-muted">
              {siteConfig.school.shortName} · {siteConfig.school.hubLabel}
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {siteConfig.nav.map((item) => (
            <a key={item.href} href={item.href} className="nav-link">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={onOpenAdmin}
            className="icon-btn"
            aria-label="Open the teacher's console"
            title="Teacher's console"
          >
            <Lock size={14} strokeWidth={1.8} />
          </button>

          <a href="#vault" className="pill-cta hidden sm:inline-flex">
            Resources
            <span className="pill-cta__orb">
              <ArrowUpRight size={14} strokeWidth={2.2} />
            </span>
          </a>

          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="icon-btn md:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            {menuOpen ? <X size={16} strokeWidth={1.9} /> : <Menu size={16} strokeWidth={1.9} />}
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={`overflow-hidden border-line bg-canvas/95 backdrop-blur-xl transition-[max-height,opacity] duration-500 ease-out md:hidden ${
          menuOpen ? 'max-h-80 border-t opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="mx-auto flex max-w-editorial flex-col gap-1 px-5 py-4" aria-label="Mobile">
          {siteConfig.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={closeMenu}
              className="flex items-center justify-between rounded-2xl px-3 py-3 text-sm font-medium text-ink transition-colors hover:bg-ink/[0.04]"
            >
              {item.label}
              <ArrowUpRight size={15} className="text-muted" />
            </a>
          ))}
          <a
            href="#vault"
            onClick={closeMenu}
            className="mt-2 flex items-center justify-between rounded-full bg-ink px-5 py-3 text-sm font-semibold text-canvas"
          >
            Resources
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--purple)] text-white">
              <ArrowUpRight size={14} strokeWidth={2.2} />
            </span>
          </a>
        </nav>
      </div>
    </header>
  )
}
