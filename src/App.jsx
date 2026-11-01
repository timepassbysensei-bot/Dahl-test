import { useCallback, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import Navbar from './components/Navbar'
import HeroEditorial from './components/HeroEditorial'
import AcademicTracksBento from './components/AcademicTracksBento'
import ResourceVault from './components/ResourceVault'
import ContactSection from './components/ContactSection'
import SleepSenseiChat from './components/SleepSenseiChat'
import FooterEditorial from './components/FooterEditorial'
import AdminLoginModal from './components/admin/AdminLoginModal'
import AdminDashboard from './components/admin/AdminDashboard'
import { isSupabaseConfigured, purgeExpiredMessages, supabase } from './lib/supabaseClient'

const ACCENTS = [
  { purple: '#6D3DF2', light: '#7C4DFF' },
  { purple: '#7C4DFF', light: '#9B7BFF' },
  { purple: '#5B2BE0', light: '#7C4DFF' },
  { purple: '#8A5CF6', light: '#A98BFF' },
]

function ScrollProgress({ progress }) {
  return (
    <div
      className="scroll-progress"
      style={{ width: `${progress}%` }}
      role="progressbar"
      aria-label="Page scroll progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
    >
      <span className="scroll-progress__spark" />
    </div>
  )
}

export default function App() {
  const [progress, setProgress] = useState(0)
  const [session, setSession] = useState(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [adminOpen, setAdminOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [vaultVersion, setVaultVersion] = useState(0)

  /* ------------------------------------------------------------ scroll bar */
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      const value = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0
      setProgress(Math.min(100, Math.max(0, value)))
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  /* --------------------------------------------------------- scroll reveals */
  useEffect(() => {
    const markAll = () => {
      document.querySelectorAll('[data-reveal]').forEach((element) => element.classList.add('is-visible'))
    }

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      markAll()
      return undefined
    }

    const seen = new WeakSet()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -8% 0px' },
    )

    const scan = () => {
      document.querySelectorAll('[data-reveal]').forEach((element) => {
        if (seen.has(element)) return
        seen.add(element)
        observer.observe(element)
      })
    }

    scan()
    const mutation = new MutationObserver(scan)
    mutation.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      mutation.disconnect()
    }
  }, [])

  /* ----------------------------------------------- interactive accent shift */
  useEffect(() => {
    let index = 0
    const cycle = () => {
      index = (index + 1) % ACCENTS.length
      const accent = ACCENTS[index]
      document.documentElement.style.setProperty('--purple', accent.purple)
      document.documentElement.style.setProperty('--purple-light', accent.light)
    }
    window.addEventListener('accent:cycle', cycle)
    return () => window.removeEventListener('accent:cycle', cycle)
  }, [])

  /* --------------------------------------------------------- message pruning */
  useEffect(() => {
    if (isSupabaseConfigured) purgeExpiredMessages()
  }, [])

  /* --------------------------------------------------------- auth session */
  useEffect(() => {
    if (!supabase) {
      setSessionLoading(false)
      return undefined
    }

    let active = true

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return
        setSession(data?.session ?? null)
        setSessionLoading(false)
      })
      .catch(() => {
        if (active) setSessionLoading(false)
      })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null)
      setSessionLoading(false)
    })

    return () => {
      active = false
      listener?.subscription?.unsubscribe?.()
    }
  }, [])

  const openAdmin = useCallback(() => {
    setChatOpen(false)
    setAdminOpen(true)
  }, [])

  const closeAdmin = useCallback(() => {
    setAdminOpen(false)
    setSessionLoading(false)
  }, [])

  const handleDataChanged = useCallback(() => {
    setVaultVersion((version) => version + 1)
  }, [])

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <a
        href="#vault"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-canvas"
      >
        Skip to the resource vault
      </a>

      <ScrollProgress progress={progress} />
      <div className="mesh-glow" aria-hidden="true" />
      <div className="grain-layer" aria-hidden="true" />

      <Navbar onOpenAdmin={openAdmin} />

      <main className="relative z-10">
        <HeroEditorial onOpenChat={() => setChatOpen(true)} />
        <AcademicTracksBento />
        <ResourceVault refreshKey={vaultVersion} />
        <ContactSection />
      </main>

      <FooterEditorial onOpenAdmin={openAdmin} />

      <SleepSenseiChat open={chatOpen} onOpenChange={setChatOpen} />

      {adminOpen && !sessionLoading && session && (
        <AdminDashboard session={session} onClose={closeAdmin} onDataChanged={handleDataChanged} />
      )}

      {adminOpen && !sessionLoading && !session && (
        <AdminLoginModal onClose={closeAdmin} onSignedIn={(nextSession) => setSession(nextSession)} />
      )}

      {adminOpen && sessionLoading && (
        <div className="scrim">
          <div className="sheet max-w-[16rem] p-6 text-center">
            <Loader2 size={18} className="mx-auto animate-spin text-[var(--purple)]" />
            <p className="mt-3 font-mono text-[0.55rem] uppercase tracking-editorial text-muted">
              Checking your session
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
