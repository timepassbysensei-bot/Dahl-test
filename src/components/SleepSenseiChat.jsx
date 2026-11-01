import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Loader2, RotateCcw, Sparkles, X } from 'lucide-react'
import { siteConfig } from '../config/siteConfig'
import { askSleepSensei, isAiConfigured } from '../lib/sleepSenseiAI'

let messageId = 0
const nextId = () => {
  messageId += 1
  return `msg-${messageId}`
}

function RichText({ text }) {
  const lines = String(text).split('\n')
  return (
    <div className="space-y-1.5">
      {lines.map((line, index) => {
        if (!line.trim()) return <div key={index} className="h-1" />
        const parts = line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean)
        return (
          <p key={index} className="whitespace-pre-wrap">
            {parts.map((part, partIndex) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={partIndex} className="font-semibold">
                    {part.slice(2, -2)}
                  </strong>
                )
              }
              return <span key={partIndex}>{part}</span>
            })}
          </p>
        )
      })}
    </div>
  )
}

function Bubble({ message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
      <span className="px-1 font-mono text-[0.46rem] uppercase tracking-editorial text-muted">
        {isUser ? 'You' : 'Sleep Sensei'}
      </span>
      <div
        className={`max-w-[88%] rounded-2xl px-4 py-3 text-[0.84rem] leading-relaxed ${
          isUser
            ? 'rounded-br-md bg-ink text-canvas'
            : 'rounded-bl-md border border-line bg-white/70 text-ink'
        }`}
      >
        <RichText text={message.text} />
      </div>
    </div>
  )
}

export default function SleepSenseiChat({ open, onOpenChange }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [error, setError] = useState('')
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  const { ai } = siteConfig

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') onOpenChange(false)
    }
    const previous = document.body.style.overflow
    if (window.innerWidth < 768) document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    const timer = window.setTimeout(() => inputRef.current?.focus(), 260)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
      window.clearTimeout(timer)
    }
  }, [open, onOpenChange])

  useEffect(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking, open])

  const send = async (rawText) => {
    const text = String(rawText ?? input).trim()
    if (!text || thinking) return

    setError('')
    setInput('')
    const outgoing = { id: nextId(), role: 'user', text }
    const history = messages.map(({ role, text: body }) => ({ role, text: body }))
    setMessages((current) => [...current, outgoing])
    setThinking(true)

    try {
      const reply = await askSleepSensei({ history, message: text })
      setMessages((current) => [...current, { id: nextId(), role: 'assistant', text: reply }])
    } catch (requestError) {
      setError(requestError?.message || 'The study assistant could not answer. Please try again.')
    } finally {
      setThinking(false)
    }
  }

  const onSubmit = (event) => {
    event.preventDefault()
    send()
  }

  const onKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      send()
    }
  }

  const reset = () => {
    setMessages([])
    setError('')
    setInput('')
  }

  return (
    <>
      {/* floating trigger */}
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-controls="sleep-sensei-drawer"
        className="group fixed bottom-4 right-4 z-[75] flex items-center gap-3 rounded-full border border-canvas/15 bg-ink py-2 pl-4 pr-2 text-canvas shadow-drawer transition-transform duration-500 hover:-translate-y-1 sm:bottom-6 sm:right-6"
      >
        <span className="hidden font-mono text-[0.56rem] uppercase tracking-editorial text-canvas/70 sm:block">
          Ask Sleep Sensei
        </span>
        <span className="font-mono text-[0.56rem] uppercase tracking-editorial text-canvas/70 sm:hidden">Sensei</span>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--purple)] text-white transition-transform duration-500 group-hover:rotate-45">
          {open ? <X size={15} /> : <Sparkles size={15} />}
        </span>
      </button>

      {/* mobile scrim */}
      {open && (
        <button
          type="button"
          aria-label="Close the study assistant"
          onClick={() => onOpenChange(false)}
          className="fixed inset-0 z-[68] bg-ink/35 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        id="sleep-sensei-drawer"
        aria-hidden={!open}
        aria-label="Sleep Sensei study assistant"
        className={`chat-drawer ${open ? 'is-open' : ''}`}
      >
        {/* header */}
        <div className="dark-panel relative shrink-0 overflow-hidden px-5 pb-5 pt-5">
          <div
            className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full opacity-80 blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(109,61,242,.9), transparent 70%)' }}
            aria-hidden="true"
          />
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--purple)] text-lg text-white">
                ✦
              </span>
              <div>
                <h2 className="font-display text-2xl leading-none text-canvas">{ai.name}</h2>
                <p className="mt-1 font-mono text-[0.48rem] uppercase tracking-editorial text-canvas/45">
                  {ai.tagline}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={reset}
                  className="grid h-8 w-8 place-items-center rounded-full border border-canvas/15 text-canvas/60 transition-colors hover:border-canvas/40 hover:text-canvas"
                  aria-label="Clear the conversation"
                  title="Clear conversation"
                >
                  <RotateCcw size={13} />
                </button>
              )}
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="grid h-8 w-8 place-items-center rounded-full border border-canvas/15 text-canvas/70 transition-colors hover:border-canvas/40 hover:text-canvas"
                aria-label="Close Sleep Sensei"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          <p className="relative mt-4 flex items-center gap-2 font-mono text-[0.46rem] uppercase tracking-editorial text-canvas/35">
            <span className="h-1 w-1 rounded-full bg-emerald-400" />
            Identity lock active · Class VII–X
          </p>
        </div>

        {/* messages */}
        <div ref={scrollRef} className="pretty-scroll flex-1 space-y-5 overflow-y-auto px-4 py-5">
          <div className="flex flex-col items-start gap-1">
            <span className="px-1 font-mono text-[0.46rem] uppercase tracking-editorial text-muted">Sleep Sensei</span>
            <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-line bg-white/70 px-4 py-3 text-[0.84rem] leading-relaxed text-ink">
              {ai.greeting}
            </div>
          </div>

          {messages.length === 0 && (
            <div className="space-y-2 pt-1">
              <p className="px-1 font-mono text-[0.46rem] uppercase tracking-editorial text-muted">Try asking</p>
              {ai.suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => send(suggestion)}
                  disabled={!isAiConfigured || thinking}
                  className="block w-full rounded-xl border border-line bg-transparent px-3 py-2.5 text-left text-[0.78rem] leading-snug text-ink/80 transition-colors hover:border-[var(--purple)]/50 hover:bg-[var(--purple)]/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {messages.map((message) => (
            <Bubble key={message.id} message={message} />
          ))}

          {thinking && (
            <div className="flex flex-col items-start gap-1">
              <span className="px-1 font-mono text-[0.46rem] uppercase tracking-editorial text-muted">
                Sleep Sensei is thinking
              </span>
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-line bg-white/70 px-4 py-3">
                {[0, 1, 2].map((dot) => (
                  <span key={dot} className="typing-dot h-1.5 w-1.5 rounded-full bg-[var(--purple)]" />
                ))}
              </div>
            </div>
          )}

          {error && (
            <p className="rounded-xl border border-red-300/60 bg-red-50 px-3 py-2 text-[0.75rem] leading-relaxed text-red-800">
              {error}
            </p>
          )}

          {!isAiConfigured && (
            <div className="rounded-xl border border-line bg-ink/[0.03] p-3">
              <p className="font-mono text-[0.48rem] uppercase tracking-editorial text-muted">Assistant disconnected</p>
              <p className="mt-1.5 text-[0.76rem] leading-relaxed text-ink/65">
                Add <code className="font-mono text-[0.7rem] text-ink">VITE_GEMINI_API_KEY</code> to your environment
                variables and redeploy to wake Sleep Sensei up.
              </p>
            </div>
          )}
        </div>

        {/* composer */}
        <form onSubmit={onSubmit} className="shrink-0 border-t border-line bg-canvas px-4 pb-3 pt-3 safe-bottom">
          <div className="flex items-end gap-2 rounded-2xl border border-line bg-white/60 px-3 py-2 transition-colors focus-within:border-[var(--purple)]">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder={isAiConfigured ? 'Ask about a chapter, rule or doubt…' : 'Assistant not connected yet…'}
              disabled={!isAiConfigured}
              aria-label="Message Sleep Sensei"
              className="max-h-28 min-h-[2.1rem] w-full resize-none bg-transparent py-1.5 text-[0.85rem] text-ink outline-none placeholder:text-muted/60 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!isAiConfigured || thinking || !input.trim()}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--purple)] text-white transition-transform duration-300 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Send message"
            >
              {thinking ? <Loader2 size={15} className="animate-spin" /> : <ArrowUp size={15} strokeWidth={2.4} />}
            </button>
          </div>
          <p className="mt-2 px-1 font-mono text-[0.45rem] uppercase tracking-editorial text-muted">{ai.disclaimer}</p>
        </form>
      </aside>
    </>
  )
}
