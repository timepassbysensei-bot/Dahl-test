import { useCallback, useEffect, useState } from 'react'
import { FolderOpen, LogOut, MessageSquare, Upload, X } from 'lucide-react'
import { siteConfig } from '../../config/siteConfig'
import { friendlyDataError, supabase } from '../../lib/supabaseClient'
import UploadResourceScreen from './UploadResourceScreen'
import ManageResourcesScreen from './ManageResourcesScreen'
import MessagesInboxScreen from './MessagesInboxScreen'

const TABS = [
  { id: 'upload', label: 'Upload resource', shortLabel: 'Upload', icon: Upload },
  { id: 'manage', label: 'All resources', shortLabel: 'Library', icon: FolderOpen },
  { id: 'inbox', label: 'Messages inbox', shortLabel: 'Inbox', icon: MessageSquare },
]

function HexMark({ className = '' }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <path d="M20 2.6 35.2 11.4v17.2L20 37.4 4.8 28.6V11.4L20 2.6Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M20 11.7 27.7 16.2v8.7L20 29.4l-7.7-4.5v-8.7L20 11.7Z" fill="var(--purple)" />
    </svg>
  )
}

export default function AdminDashboard({ session, onClose, onDataChanged }) {
  const [tab, setTab] = useState('upload')
  const [counts, setCounts] = useState({ resources: 0, messages: 0 })
  const [countError, setCountError] = useState('')

  const refreshCounts = useCallback(async () => {
    if (!supabase) return
    const [resourcesResult, messagesResult] = await Promise.all([
      supabase.from('resources').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true }),
    ])

    if (resourcesResult.error || messagesResult.error) {
      setCountError(friendlyDataError(resourcesResult.error || messagesResult.error, 'Could not read counts.'))
      return
    }

    setCountError('')
    setCounts({
      resources: resourcesResult.count ?? 0,
      messages: messagesResult.count ?? 0,
    })
  }, [])

  useEffect(() => {
    refreshCounts()
  }, [refreshCounts, tab])

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const notifyChange = () => {
    refreshCounts()
    onDataChanged?.()
  }

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut()
    onClose()
  }

  const email = session?.user?.email || siteConfig.admin.email

  return (
    <div className="admin-shell" role="dialog" aria-modal="true" aria-label="Teacher's console">
      <header className="sticky top-0 z-30 border-b border-line bg-canvas/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-editorial items-center justify-between gap-3 px-5 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <HexMark className="h-8 w-8 shrink-0 text-ink" />
            <div className="min-w-0">
              <p className="font-mono text-[0.46rem] uppercase tracking-editorial text-muted">
                {siteConfig.admin.consoleLabel}
              </p>
              <p className="truncate font-display text-xl leading-none text-ink">{siteConfig.teacher.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden max-w-[16rem] truncate font-mono text-[0.5rem] uppercase tracking-editorial text-muted lg:block">
              {email}
            </span>
            <button type="button" onClick={signOut} className="chip">
              <LogOut size={12} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
            <button type="button" onClick={onClose} className="icon-btn" aria-label="Close the console">
              <X size={15} />
            </button>
          </div>
        </div>

        <nav className="mx-auto hidden max-w-editorial items-center gap-1.5 px-5 pb-3 md:flex md:px-8" aria-label="Console sections">
          {TABS.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                aria-current={tab === item.id ? 'page' : undefined}
                className={`admin-tab ${tab === item.id ? 'is-active' : ''}`}
              >
                <Icon size={14} strokeWidth={1.9} />
                {item.label}
                {item.id === 'manage' && counts.resources > 0 && (
                  <span className="rounded-full bg-[var(--purple)] px-1.5 py-0.5 font-mono text-[0.5rem] text-white">
                    {counts.resources}
                  </span>
                )}
                {item.id === 'inbox' && counts.messages > 0 && (
                  <span className="rounded-full bg-[var(--purple)] px-1.5 py-0.5 font-mono text-[0.5rem] text-white">
                    {counts.messages}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-editorial px-5 pb-28 pt-6 md:px-8 md:pb-16">
        {countError && (
          <p className="mb-4 rounded-xl border border-amber-300/60 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            {countError}
          </p>
        )}

        {tab === 'upload' && <UploadResourceScreen onUploaded={notifyChange} />}
        {tab === 'manage' && <ManageResourcesScreen onChanged={notifyChange} />}
        {tab === 'inbox' && <MessagesInboxScreen onChanged={notifyChange} />}
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-canvas/95 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden"
        aria-label="Console sections"
      >
        <div className="mx-auto flex max-w-md items-center justify-between gap-1">
          {TABS.map((item) => {
            const Icon = item.icon
            const active = tab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                aria-current={active ? 'page' : undefined}
                className={`relative flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[0.62rem] font-medium transition-colors ${
                  active ? 'text-ink' : 'text-muted'
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2.1 : 1.7} />
                {item.shortLabel}
                {active && <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-[var(--purple)]" />}
                {item.id === 'inbox' && counts.messages > 0 && (
                  <span className="absolute right-2 top-1 grid h-4 min-w-[1rem] place-items-center rounded-full bg-[var(--purple)] px-1 font-mono text-[0.45rem] text-white">
                    {counts.messages}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
