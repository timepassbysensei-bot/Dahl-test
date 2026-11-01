import { useCallback, useEffect, useMemo, useState } from 'react'
import { Eye, File as FileIcon, FileText, Image as ImageIcon, Loader2, RefreshCw, Search, Trash2 } from 'lucide-react'
import {
  fileTypeLabel,
  formatBytes,
  formatDate,
  friendlyDataError,
  RESOURCE_BUCKET,
  supabase,
} from '../../lib/supabaseClient'

function typeIcon(type) {
  if (type === 'image') return ImageIcon
  if (type === 'pdf') return FileText
  return FileIcon
}

export default function ManageResourcesScreen({ onChanged }) {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [warning, setWarning] = useState('')
  const [query, setQuery] = useState('')
  const [confirmId, setConfirmId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const load = useCallback(async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    setWarning('')

    const { data, error: loadError } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false })

    if (loadError) {
      setError(friendlyDataError(loadError, 'Could not load uploaded resources.'))
      setResources([])
    } else {
      setResources(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase()
    if (!search) return resources
    return resources.filter((resource) =>
      `${resource.title || ''} ${resource.category || ''}`.toLowerCase().includes(search),
    )
  }, [resources, query])

  const handleDelete = async (resource) => {
    if (!supabase || deletingId) return
    setDeletingId(resource.id)
    setError('')
    setWarning('')

    let storageWarning = ''

    if (resource.storage_path) {
      const { error: storageError } = await supabase.storage.from(RESOURCE_BUCKET).remove([resource.storage_path])
      if (storageError) {
        storageWarning = `The database record was removed, but the stored file could not be deleted (${storageError.message}).`
      }
    }

    const { error: deleteError } = await supabase.from('resources').delete().eq('id', resource.id)

    if (deleteError) {
      setError(friendlyDataError(deleteError, 'The resource could not be deleted.'))
      setDeletingId(null)
      return
    }

    setResources((current) => current.filter((item) => item.id !== resource.id))
    setConfirmId(null)
    setDeletingId(null)
    if (storageWarning) setWarning(storageWarning)
    onChanged?.()
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="mono-tag">Screen 02</span>
          <h2 className="mt-2 font-display text-[clamp(1.8rem,3.2vw,2.4rem)] leading-none text-ink">
            All uploaded resources
          </h2>
          <p className="mt-2 max-w-lg text-sm text-ink/60">
            Deleting a resource removes both the record and the file inside the Supabase storage bucket.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[0.5rem] uppercase tracking-editorial text-muted">
            {filtered.length} / {resources.length}
          </span>
          <button type="button" onClick={load} className="icon-btn" aria-label="Refresh resources" disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="relative mt-6 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search uploaded resources…"
          aria-label="Search uploaded resources"
          className="w-full rounded-full border border-line bg-transparent py-2.5 pl-9 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-[var(--purple)]"
        />
      </div>

      {warning && (
        <p className="mt-4 rounded-xl border border-amber-300/60 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
          {warning}
        </p>
      )}

      {error && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-300/60 bg-red-50 px-3 py-2">
          <p className="text-xs leading-relaxed text-red-800">{error}</p>
          <button type="button" onClick={load} className="chip">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="admin-card mt-4 divide-y divide-line">
          {[0, 1, 2].map((item) => (
            <div key={item} className="flex items-center gap-4 p-4">
              <div className="skeleton h-10 w-10 rounded-xl" />
              <div className="flex-1">
                <div className="skeleton h-5 w-2/3 rounded-md" />
                <div className="skeleton mt-2 h-3 w-1/3 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-4 rounded-[1.5rem] border border-dashed border-line px-6 py-14 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-ink/[0.04] text-[var(--purple)]">
            ✦
          </span>
          <h3 className="mt-4 font-display text-2xl text-ink">
            {resources.length === 0 ? 'Nothing uploaded yet' : 'No resource matches that search'}
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            {resources.length === 0
              ? 'Use the Upload tab to publish the first note or paper.'
              : 'Try a shorter keyword, or clear the search field.'}
          </p>
        </div>
      ) : (
        <ul className="admin-card mt-4 divide-y divide-line">
          {filtered.map((resource) => {
            const Icon = typeIcon(resource.file_type)
            const confirming = confirmId === resource.id
            const deleting = deletingId === resource.id

            return (
              <li key={resource.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-canvas text-[var(--purple)]">
                  <Icon size={17} strokeWidth={1.7} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-lg leading-tight text-ink">{resource.title}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 font-mono text-[0.5rem] uppercase tracking-editorial text-muted">
                    <span>{resource.category || 'Resource'}</span>
                    <span aria-hidden="true">·</span>
                    <span>{fileTypeLabel(resource.file_type)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{formatDate(resource.created_at)}</span>
                    {resource.file_size ? (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{formatBytes(resource.file_size)}</span>
                      </>
                    ) : null}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <a href={resource.file_url} target="_blank" rel="noreferrer noopener" className="chip">
                    <Eye size={12} />
                    Preview
                  </a>

                  {confirming ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleDelete(resource)}
                        disabled={deleting}
                        className="inline-flex items-center gap-1.5 rounded-full bg-red-700 px-3 py-1.5 text-[0.7rem] font-semibold text-white transition-colors hover:bg-red-800 disabled:opacity-60"
                      >
                        {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                        Confirm delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmId(null)}
                        disabled={deleting}
                        className="chip"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmId(resource.id)
                        setWarning('')
                        setError('')
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-[0.7rem] font-semibold text-red-700 transition-colors hover:border-red-300 hover:bg-red-50"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
