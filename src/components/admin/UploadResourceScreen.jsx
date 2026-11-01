import { useRef, useState } from 'react'
import { ArrowUpRight, Check, Loader2, Trash2, Upload } from 'lucide-react'
import {
  buildStoragePath,
  detectFileType,
  extensionOf,
  fileTypeLabel,
  formatBytes,
  friendlyDataError,
  MAX_UPLOAD_BYTES,
  RESOURCE_BUCKET,
  supabase,
} from '../../lib/supabaseClient'

const CATEGORIES = [
  'Hindi',
  'Sanskrit',
  'Hindi · Class 7–10',
  'Sanskrit · Class 7–10',
  'Tuition · All Subjects',
  'Maths',
  'Science',
  'Social Studies',
  'English',
  'Board Preparation',
  'Handout',
]

const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'gif', 'doc', 'docx', 'txt', 'ppt', 'pptx']

export default function UploadResourceScreen({ onUploaded }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [status, setStatus] = useState('idle') // idle | uploading | success
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef(null)

  const resetForm = () => {
    setTitle('')
    setCategory(CATEGORIES[0])
    setFile(null)
    setSuccess('')
    setError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const acceptFile = (candidate) => {
    setError('')
    setSuccess('')
    if (!candidate) return

    if (candidate.size > MAX_UPLOAD_BYTES) {
      setError(`“${candidate.name}” is ${formatBytes(candidate.size)}. The limit is 25 MB.`)
      return
    }

    if (!ALLOWED_EXTENSIONS.includes(extensionOf(candidate.name))) {
      setError('Unsupported file type. Use PDF, JPG, PNG, WEBP, DOC, DOCX, TXT or PPT.')
      return
    }

    setFile(candidate)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setDragging(false)
    acceptFile(event.dataTransfer?.files?.[0])
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (status === 'uploading') return

    if (!supabase) {
      setError('Supabase is not connected. Add your environment variables and redeploy.')
      return
    }

    const cleanTitle = title.trim()
    if (cleanTitle.length < 3) {
      setError('Give the resource a clear title so students know exactly what it is.')
      return
    }
    if (!file) {
      setError('Choose a file to upload.')
      return
    }

    setStatus('uploading')
    setError('')
    setSuccess('')

    const storagePath = buildStoragePath(file)
    const fileType = detectFileType(file)

    const { error: uploadError } = await supabase.storage.from(RESOURCE_BUCKET).upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    })

    if (uploadError) {
      setStatus('idle')
      setError(friendlyDataError(uploadError, 'The file could not be uploaded.'))
      return
    }

    const { data: publicUrlData } = supabase.storage.from(RESOURCE_BUCKET).getPublicUrl(storagePath)

    const { error: insertError } = await supabase.from('resources').insert({
      title: cleanTitle,
      category,
      file_url: publicUrlData?.publicUrl || '',
      storage_path: storagePath,
      file_type: fileType,
      file_size: file.size,
    })

    if (insertError) {
      // Roll back the orphaned upload so storage never silently bloats.
      await supabase.storage.from(RESOURCE_BUCKET).remove([storagePath])
      setStatus('idle')
      setError(friendlyDataError(insertError, 'The file uploaded but its record could not be saved.'))
      return
    }

    setStatus('success')
    setSuccess(`“${cleanTitle}” is live in the resource vault.`)
    setTitle('')
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    onUploaded?.()
  }

  const previewType = file ? detectFileType(file) : 'pdf'
  const previewTitle = title.trim() || 'Untitled resource'

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <form onSubmit={handleSubmit} className="admin-card p-5 sm:p-7 lg:col-span-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="mono-tag">Screen 01</span>
            <h2 className="mt-2 font-display text-[clamp(1.8rem,3.2vw,2.4rem)] leading-none text-ink">
              Upload a resource
            </h2>
          </div>
          <span className="font-mono text-[0.5rem] uppercase tracking-editorial text-muted">PDF · Photo · Document</span>
        </div>

        {success && (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-[var(--purple)]/25 bg-[var(--purple)]/[0.06] px-3 py-2.5">
            <Check size={14} className="mt-0.5 shrink-0 text-[var(--purple)]" />
            <p className="text-xs leading-relaxed text-ink/80">{success}</p>
          </div>
        )}

        <div className="mt-6">
          <label className="field-label" htmlFor="resource-title">
            Resource title <span className="text-[var(--purple)]">*</span>
          </label>
          <input
            id="resource-title"
            className="field-input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={120}
            placeholder="e.g. Class 10 Hindi — Patra Lekhan format sheet"
            disabled={status === 'uploading'}
          />
          <p className="mt-1 text-right font-mono text-[0.48rem] uppercase tracking-editorial text-muted">
            {title.length}/120
          </p>
        </div>

        <div className="mt-4">
          <label className="field-label" htmlFor="resource-category">
            Subject / category
          </label>
          <select
            id="resource-category"
            className="field-input"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            disabled={status === 'uploading'}
          >
            {CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5">
          <span className="field-label">File</span>
          <div
            onDragOver={(event) => {
              event.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`mt-1.5 rounded-2xl border border-dashed px-4 py-6 text-center transition-colors ${
              dragging ? 'border-[var(--purple)] bg-[var(--purple)]/[0.06]' : 'border-line bg-canvas/40'
            }`}
          >
            <input
              ref={fileInputRef}
              id="resource-file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.doc,.docx,.txt,.ppt,.pptx"
              className="sr-only"
              onChange={(event) => acceptFile(event.target.files?.[0])}
              disabled={status === 'uploading'}
            />

            {file ? (
              <div className="flex flex-col items-center gap-2">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-[var(--purple)]/10 text-[var(--purple)]">
                  <Upload size={18} strokeWidth={1.8} />
                </span>
                <p className="max-w-full break-all px-2 text-sm font-medium text-ink">{file.name}</p>
                <p className="font-mono text-[0.5rem] uppercase tracking-editorial text-muted">
                  {fileTypeLabel(detectFileType(file))} · {formatBytes(file.size)}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="mt-1 inline-flex items-center gap-1.5 font-mono text-[0.52rem] uppercase tracking-editorial text-muted transition-colors hover:text-red-700"
                  disabled={status === 'uploading'}
                >
                  <Trash2 size={11} />
                  Remove file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-ink/[0.04] text-ink">
                  <Upload size={18} strokeWidth={1.8} />
                </span>
                <label
                  htmlFor="resource-file"
                  className="cursor-pointer text-sm font-medium text-ink underline decoration-[var(--purple)] decoration-2 underline-offset-4"
                >
                  Choose a file
                </label>
                <p className="font-mono text-[0.5rem] uppercase tracking-editorial text-muted">
                  or drag it here · max 25 MB
                </p>
              </div>
            )}
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-red-300/60 bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-800">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          <p className="max-w-[18rem] font-mono text-[0.48rem] uppercase leading-relaxed tracking-editorial text-muted">
            Stored in the public “resources” bucket with authenticated write access only.
          </p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={resetForm} className="chip" disabled={status === 'uploading'}>
              Clear
            </button>
            <button type="submit" className="pill-cta disabled:opacity-60" disabled={status === 'uploading'}>
              {status === 'uploading' ? 'Publishing…' : 'Publish to vault'}
              <span className="pill-cta__orb">
                {status === 'uploading' ? <Loader2 size={13} className="animate-spin" /> : <ArrowUpRight size={13} />}
              </span>
            </button>
          </div>
        </div>
      </form>

      <aside className="lg:col-span-5">
        <div className="rounded-[1.5rem] border border-line bg-canvas p-5">
          <div className="flex items-center justify-between">
            <span className="mono-tag">Student preview</span>
            <span className="text-sm text-[var(--purple)]" aria-hidden="true">
              ✦
            </span>
          </div>

          <div className="track-card mt-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="track-tag">{category}</span>
              <span className="card-orb h-10 w-10" aria-hidden="true">
                <ArrowUpRight size={15} strokeWidth={2} />
              </span>
            </div>
            <h3 className="mt-7 font-display text-[1.5rem] leading-[1.06] text-ink">{previewTitle}</h3>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="type-chip rounded-md px-2 py-0.5 font-mono text-[0.52rem] uppercase tracking-editorial">
                {fileTypeLabel(previewType)}
              </span>
              <span className="font-mono text-[0.52rem] uppercase tracking-editorial text-muted">
                {file ? formatBytes(file.size) : 'Awaiting file'}
              </span>
            </div>
            <div className="mt-5 flex items-center gap-2">
              <span className="chip flex-1 justify-center py-2">Preview</span>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--purple)] text-white">
                <ArrowUpRight size={14} />
              </span>
            </div>
          </div>
        </div>

        <div className="dark-panel mt-4 rounded-[1.5rem] p-5">
          <p className="font-mono text-[0.5rem] uppercase tracking-editorial text-canvas/40">Upload rules</p>
          <ul className="mt-3 space-y-2.5 text-[0.78rem] leading-relaxed text-canvas/70">
            <li className="flex gap-2">
              <span className="text-[var(--purple-light)]">01</span>
              Write the title exactly as students should read it.
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--purple-light)]">02</span>
              Pick the closest subject so the filters work.
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--purple-light)]">03</span>
              Keep files under 25 MB — compress photos first.
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--purple-light)]">04</span>
              The vault updates the moment publishing finishes.
            </li>
          </ul>
        </div>
      </aside>
    </div>
  )
}
