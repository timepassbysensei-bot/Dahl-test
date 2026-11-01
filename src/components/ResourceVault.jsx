import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowUpRight,
  Download,
  ExternalLink,
  File as FileIcon,
  FileText,
  Image as ImageIcon,
  RefreshCw,
  Search,
  X,
} from 'lucide-react'
import { siteConfig } from '../config/siteConfig'
import {
  buildDownloadUrl,
  fileTypeLabel,
  formatBytes,
  formatDate,
  friendlyDataError,
  isSupabaseConfigured,
  supabase,
} from '../lib/supabaseClient'

const TUITION_TERMS = [
  'tuition',
  'maths',
  'mathematics',
  'science',
  'social',
  'sst',
  'english',
  'physics',
  'chemistry',
  'biology',
  'computer',
]

function haystack(resource) {
  return `${resource.title || ''} ${resource.category || ''}`.toLowerCase()
}

function matchesFilter(resource, filterId) {
  const text = haystack(resource)
  switch (filterId) {
    case 'pdf':
      return resource.file_type === 'pdf'
    case 'image':
      return resource.file_type === 'image'
    case 'hindi':
      return text.includes('hindi')
    case 'sanskrit':
      return text.includes('sanskrit')
    case 'tuition':
      return TUITION_TERMS.some((term) => text.includes(term))
    case 'class-7-10':
      return /class|vii|viii|ix|\bx\b|\b(7|8|9|10)\b|7\s*[–-]\s*10/.test(text)
    default:
      return true
  }
}

function typeIcon(type) {
  if (type === 'image') return ImageIcon
  if (type === 'pdf') return FileText
  return FileIcon
}

function downloadName(resource) {
  const base = String(resource.storage_path || '').split('/').pop()
  if (base) return base
  return `${String(resource.title || 'resource').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.${resource.file_type === 'image' ? 'jpg' : 'pdf'}`
}

function PreviewModal({ resource, onClose }) {
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

  if (!resource) return null

  const downloadUrl = buildDownloadUrl(resource.file_url, downloadName(resource))

  return createPortal(
    <div
      className="scrim"
      role="dialog"
      aria-modal="true"
      aria-label={`Preview of ${resource.title}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="sheet max-w-4xl overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <span className="mono-tag">{resource.category || 'Resource'}</span>
            <h3 className="mt-1.5 truncate font-display text-2xl leading-tight text-ink">{resource.title}</h3>
            <p className="mt-1 font-mono text-[0.55rem] uppercase tracking-editorial text-muted">
              {fileTypeLabel(resource.file_type)} · {formatDate(resource.created_at)}
              {resource.file_size ? ` · ${formatBytes(resource.file_size)}` : ''}
            </p>
          </div>
          <button type="button" onClick={onClose} className="icon-btn shrink-0" aria-label="Close preview">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[62vh] overflow-y-auto bg-ink/[0.03] pretty-scroll">
          {resource.file_type === 'image' && (
            <div className="flex min-h-[18rem] items-center justify-center p-4">
              <img
                src={resource.file_url}
                alt={resource.title}
                className="max-h-[56vh] w-auto max-w-full rounded-xl object-contain shadow-float"
                loading="lazy"
              />
            </div>
          )}

          {resource.file_type === 'pdf' && (
            <iframe
              src={`${resource.file_url}#view=FitH`}
              title={resource.title}
              className="h-[56vh] min-h-[22rem] w-full bg-white"
            />
          )}

          {resource.file_type !== 'image' && resource.file_type !== 'pdf' && (
            <div className="flex min-h-[16rem] flex-col items-center justify-center gap-3 p-8 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-full border border-line bg-canvas text-ink">
                <FileIcon size={22} strokeWidth={1.6} />
              </span>
              <p className="font-display text-2xl text-ink">Documents open in a new tab</p>
              <p className="max-w-sm text-sm text-muted">
                Word and text documents cannot be rendered inside the browser preview. Download the file to read it.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4 sm:px-6">
          <p className="font-mono text-[0.52rem] uppercase tracking-editorial text-muted">
            Blank preview? Open it in a new tab.
          </p>
          <div className="flex items-center gap-2">
            <a
              href={resource.file_url}
              target="_blank"
              rel="noreferrer noopener"
              className="chip"
            >
              <ExternalLink size={13} />
              Open
            </a>
            <a
              href={downloadUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="pill-cta text-[0.75rem]"
              download
            >
              Download
              <span className="pill-cta__orb">
                <Download size={13} />
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function SetupNotice() {
  return (
    <div className="dark-panel mt-10 overflow-hidden rounded-[1.75rem] p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--purple)] text-white">✦</span>
        <div>
          <h3 className="font-display text-2xl text-canvas">The vault is ready. It just needs keys.</h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-canvas/65">
            This preview is running without Supabase environment variables, so no study material can load yet.
            Add the two values below in Netlify, then redeploy.
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'].map((key) => (
          <code
            key={key}
            className="rounded-xl border border-canvas/15 bg-canvas/5 px-3 py-2 font-mono text-[0.62rem] tracking-wide text-canvas/80"
          >
            {key}
          </code>
        ))}
      </div>
      <p className="mt-4 font-mono text-[0.52rem] uppercase tracking-editorial text-canvas/40">
        Full walkthrough: MOBILE_SETUP_GUIDE.md → Step 1
      </p>
    </div>
  )
}

export default function ResourceVault({ refreshKey = 0 }) {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState(null)
  const [preview, setPreview] = useState(null)

  const loadResources = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    const { data, error: loadError } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false })

    if (loadError) {
      setError(friendlyDataError(loadError, 'Could not load the resource vault.'))
      setResources([])
    } else {
      setResources(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadResources()
  }, [loadResources, refreshKey])

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase()
    return resources.filter((resource) => {
      if (!matchesFilter(resource, filter)) return false
      if (!search) return true
      return haystack(resource).includes(search)
    })
  }, [resources, filter, query])

  const { vault } = siteConfig

  return (
    <section id="vault" className="relative z-10 scroll-mt-20 border-t border-line py-16 sm:py-20 md:py-28">
      <div className="mx-auto max-w-editorial px-5 md:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between" data-reveal>
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="mono-tag">03 — {vault.eyebrow}</span>
              <span className="h-px w-10 bg-ink/20" />
            </div>
            <h2 className="mt-4 text-balance font-display text-[clamp(2.3rem,5.4vw,4rem)] leading-[0.98] tracking-tight">
              {vault.title} <em className="italic text-[var(--purple)]">{vault.italic}</em>
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink/65">{vault.description}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="mono-tag">
              {loading ? 'Loading' : `${filtered.length} / ${resources.length} files`}
            </span>
            <button
              type="button"
              onClick={loadResources}
              disabled={loading || !isSupabaseConfigured}
              className="icon-btn disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Refresh resources"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {isSupabaseConfigured ? (
          <>
            <div className="mt-8 flex flex-col gap-4 border-y border-line py-5 lg:flex-row lg:items-center lg:justify-between" data-reveal>
              <div className="no-scrollbar -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1">
                {vault.filters.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFilter(item.id)}
                    aria-pressed={filter === item.id}
                    className={`chip ${filter === item.id ? 'is-active' : ''}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full lg:w-72">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search notes, papers, chapters…"
                  aria-label="Search resources"
                  className="w-full rounded-full border border-line bg-transparent py-2.5 pl-9 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-[var(--purple)]"
                />
              </div>
            </div>

            {error && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-300/60 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-800">{error}</p>
                <button type="button" onClick={loadResources} className="chip">
                  Try again
                </button>
              </div>
            )}

            {loading && (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="rounded-[1.75rem] border border-line p-6">
                    <div className="skeleton h-5 w-24 rounded-full" />
                    <div className="skeleton mt-8 h-7 w-4/5 rounded-lg" />
                    <div className="skeleton mt-2 h-7 w-3/5 rounded-lg" />
                    <div className="skeleton mt-8 h-4 w-32 rounded-full" />
                    <div className="skeleton mt-6 h-10 w-full rounded-full" />
                  </div>
                ))}
              </div>
            )}

            {!loading && !error && filtered.length === 0 && (
              <div className="mt-8 rounded-[1.75rem] border border-dashed border-line px-6 py-14 text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-ink/[0.04] text-[var(--purple)]">
                  ✦
                </span>
                <h3 className="mt-4 font-display text-2xl text-ink">
                  {resources.length === 0 ? 'No resources uploaded yet' : 'Nothing matches that search'}
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                  {resources.length === 0
                    ? 'The teacher can publish notes, papers and photos from the console. They will appear here instantly.'
                    : 'Try a different keyword or switch back to the All filter.'}
                </p>
                {(resources.length > 0 || query) && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilter('all')
                      setQuery('')
                    }}
                    className="chip mt-5"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((resource) => {
                  const Icon = typeIcon(resource.file_type)
                  const active = activeId === resource.id
                  return (
                    <article
                      key={resource.id}
                      onClick={() => setActiveId(active ? null : resource.id)}
                      data-reveal
                      className={`vault-card group cursor-pointer p-6 ${active ? 'is-active' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="track-tag">{resource.category || 'Resource'}</span>
                        <span className="card-orb h-10 w-10" aria-hidden="true">
                          <ArrowUpRight size={15} strokeWidth={2} />
                        </span>
                      </div>

                      <div className="mt-8 flex items-start gap-3">
                        <Icon size={18} strokeWidth={1.6} className="mt-1.5 shrink-0 text-[var(--purple)]" />
                        <h3 className="font-display text-[1.5rem] leading-[1.06] text-inherit">{resource.title}</h3>
                      </div>

                      <div className="mt-6 flex flex-wrap items-center gap-2">
                        <span className="type-chip rounded-md px-2 py-0.5 font-mono text-[0.52rem] uppercase tracking-editorial">
                          {fileTypeLabel(resource.file_type)}
                        </span>
                        <span className="font-mono text-[0.52rem] uppercase tracking-editorial card-muted">
                          {formatDate(resource.created_at)}
                        </span>
                        {resource.file_size ? (
                          <span className="font-mono text-[0.52rem] uppercase tracking-editorial card-muted">
                            · {formatBytes(resource.file_size)}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-6 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            setPreview(resource)
                          }}
                          className="chip flex-1 justify-center py-2"
                        >
                          Preview
                        </button>
                        <a
                          href={buildDownloadUrl(resource.file_url, downloadName(resource))}
                          target="_blank"
                          rel="noreferrer noopener"
                          download
                          onClick={(event) => event.stopPropagation()}
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--purple)] text-white transition-transform duration-300 hover:scale-105"
                          aria-label={`Download ${resource.title}`}
                        >
                          <Download size={14} />
                        </a>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          <SetupNotice />
        )}
      </div>

      {preview && <PreviewModal resource={preview} onClose={() => setPreview(null)} />}
    </section>
  )
}
