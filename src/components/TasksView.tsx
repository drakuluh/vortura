import { useState, useEffect } from 'react'

import {

  Zap, Plus, Search, CheckCircle2, Activity,

  AlertCircle, Clock, X, Tag, ChevronDown,

  Globe, FileText, Terminal, FilePlus, FileEdit,

  DollarSign, ChevronUp, Cpu, Hash, Copy, Check,

} from 'lucide-react'

interface Task {

  id: string

  prompt: string

  status: 'queued' | 'running' | 'done' | 'error' | 'cancelled'

  model?: string

  tags?: string[]

  tools?: string[]

  messages?: TaskMessage[]

  totalCost?: number

  inputTokens?: number

  outputTokens?: number

  createdAt: number

  updatedAt: number

  error?: string

}

interface TaskMessage {

  type: 'text' | 'tool_use' | 'tool_result' | 'error' | 'result'

  content?: string

  toolName?: string

  input?: Record<string, any>

  message?: string

  cost?: number

  inputTokens?: number

  outputTokens?: number

}

const STATUS_CFG = {

  done:      { label: 'Done',      color: '#30D158', bg: 'rgba(48,209,88,0.1)',    border: 'rgba(48,209,88,0.22)',   Icon: CheckCircle2 },

  running:   { label: 'Running',   color: '#BF5AF2', bg: 'rgba(191,90,242,0.1)',   border: 'rgba(191,90,242,0.22)', Icon: Activity },

  error:     { label: 'Error',     color: '#FF453A', bg: 'rgba(255,69,58,0.1)',    border: 'rgba(255,69,58,0.22)',  Icon: AlertCircle },

  queued:    { label: 'Queued',    color: '#FF9F0A', bg: 'rgba(255,159,10,0.1)',   border: 'rgba(255,159,10,0.22)', Icon: Clock },

  cancelled: { label: 'Cancelled', color: 'rgba(255,255,255,0.3)', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)', Icon: X },

} as const

const TOOL_CFG: Record<string, { color: string; bg: string; border: string; Icon: any; label: string }> = {

  WebSearch: { color: '#0A84FF', bg: 'rgba(10,132,255,0.12)',  border: 'rgba(10,132,255,0.25)',  Icon: Search,   label: 'Web Search'  },

  WebFetch:  { color: '#0A84FF', bg: 'rgba(10,132,255,0.12)',  border: 'rgba(10,132,255,0.25)',  Icon: Globe,    label: 'Web Fetch'   },

  Read:      { color: '#FF9F0A', bg: 'rgba(255,159,10,0.1)',   border: 'rgba(255,159,10,0.2)',   Icon: FileText, label: 'Read File'   },

  Write:     { color: '#30D158', bg: 'rgba(48,209,88,0.1)',    border: 'rgba(48,209,88,0.22)',   Icon: FilePlus, label: 'Write File'  },

  Edit:      { color: '#30D158', bg: 'rgba(48,209,88,0.1)',    border: 'rgba(48,209,88,0.22)',   Icon: FileEdit, label: 'Edit File'   },

  Bash:      { color: '#BF5AF2', bg: 'rgba(191,90,242,0.1)',   border: 'rgba(191,90,242,0.25)', Icon: Terminal, label: 'Run Command' },

}

const FILTERS   = ['all', 'running', 'done', 'error', 'queued'] as const

const TOOLS_ALL = ['WebSearch', 'WebFetch', 'Read', 'Write', 'Edit', 'Bash']

const MODELS    = [

  { value: 'claude-sonnet-4-5', label: 'Claude Sonnet' },

  { value: 'claude-opus-4-5',   label: 'Claude Opus'   },

  { value: 'claude-haiku-4-5',  label: 'Claude Haiku'  },

]

const API = 'https://vortura-production.up.railway.app'

function StatusBadge({ status }: { status: string }) {

  const cfg = STATUS_CFG[status as keyof typeof STATUS_CFG] ?? STATUS_CFG.queued

  const { Icon } = cfg

  return (

    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 9px', borderRadius: 99, fontSize: 11, fontWeight: 600, color: cfg.color, background: cfg.bg, border: `0.5px solid ${cfg.border}` }}>

      {status === 'running' ? (

        <span style={{ position: 'relative', display: 'flex', width: 6, height: 6 }}>

          <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#BF5AF2', animation: 'liveRing 1.6s ease-out infinite' }} />

          <span style={{ position: 'relative', borderRadius: '50%', width: '100%', height: '100%', background: '#BF5AF2', display: 'inline-flex' }} />

        </span>

      ) : <Icon size={10} strokeWidth={2.5} />}

      {cfg.label}

    </span>

  )

}

function ExpandableText({ text, mono = false, limit = 320 }: { text: string; mono?: boolean; limit?: number }) {

  const [open, setOpen] = useState(false)

  const long  = text?.length > limit

  const shown = !long || open ? text : text.slice(0, limit) + '…'

  return (

    <div>

      <pre style={{ margin: 0, fontFamily: mono ? '"SF Mono", monospace' : 'inherit', fontSize: mono ? 11 : 12.5, lineHeight: 1.65, color: 'rgba(255,255,255,0.68)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>

        {shown}

      </pre>

      {long && (

        <button onClick={() => setOpen(o => !o)} style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(191,90,242,0.7)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>

          {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}

          {open ? 'Collapse' : `Show ${(text.length - limit).toLocaleString()} more chars`}

        </button>

      )}

    </div>

  )

}

function TaskDetailModal({ task, onClose }: { task: Task; onClose: () => void }) {

  const cfg = STATUS_CFG[task.status] ?? STATUS_CFG.queued

  const messages  = task.messages ?? []

  const [copied, setCopied] = useState(false)

  useEffect(() => {

    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()

    window.addEventListener('keydown', h)

    return () => window.removeEventListener('keydown', h)

  }, [onClose])

  const copyPrompt = () => {

    navigator.clipboard.writeText(task.prompt).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })

  }

  const duration = () => {

    const s = Math.floor(((task.updatedAt || Date.now()) - task.createdAt) / 1000)

    return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`

  }

  const timeline = messages.filter(m => ['text', 'tool_use', 'tool_result', 'error', 'result'].includes(m.type))

  const fileOps  = messages.filter(m => m.type === 'tool_use' && ['Write','Edit'].includes(m.toolName ?? '') && m.input?.file_path)

  const byFile: Record<string, string[]> = {}

  for (const m of fileOps) {

    const fp = m.input!.file_path

    if (!byFile[fp]) byFile[fp] = []

    byFile[fp].push(m.toolName!)

  }

  return (

    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.76)', backdropFilter: 'blur(14px)' }} onClick={e => e.target === e.currentTarget && onClose()}>

      <div style={{ width: 700, maxHeight: '88vh', borderRadius: 24, background: 'rgba(10,10,14,0.99)', border: '0.5px solid rgba(255,255,255,0.11)', boxShadow: '0 0 80px rgba(191,90,242,0.1), 0 32px 80px rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1) forwards' }}>

        <div style={{ padding: '14px 24px', borderBottom: '0.5px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, flexWrap: 'wrap' }}>

              <StatusBadge status={task.status} />

              <span style={{ fontFamily: '"SF Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,0.28)' }}>{task.id}</span>

              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)' }}>{new Date(task.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>

            </div>

            <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.28)', background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.09)', borderRadius: 99, width: 22, height: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

              <X size={10} strokeWidth={2.5} />

            </button>

          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>

            <span style={{ fontSize: 11, color: '#D07CF5', background: 'rgba(191,90,242,0.1)', padding: '2px 10px', borderRadius: 99, border: '0.5px solid rgba(191,90,242,0.22)', fontWeight: 600 }}>{task.model ?? 'sonnet'}</span>

            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={10} strokeWidth={2} />{duration()}</span>

            {(task.totalCost ?? 0) > 0 && <span style={{ fontFamily: '"SF Mono", monospace', fontSize: 11, color: '#FF9F0A', background: 'rgba(255,159,10,0.08)', padding: '2px 10px', borderRadius: 99, border: '0.5px solid rgba(255,159,10,0.18)' }}>${task.totalCost!.toFixed(5)}</span>}

            {task.tags?.map(tag => <span key={tag} style={{ fontSize: 10, color: 'rgba(191,90,242,0.7)', background: 'rgba(191,90,242,0.1)', padding: '1px 8px', borderRadius: 99, border: '0.5px solid rgba(191,90,242,0.2)', display: 'flex', alignItems: 'center', gap: 3 }}><Hash size={8} strokeWidth={2.5} />{tag}</span>)}

          </div>

        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>

          <div style={{ margin: '20px 24px 0', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 14px', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>

              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)' }}>Prompt</span>

              <button onClick={copyPrompt} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: copied ? '#30D158' : 'rgba(255,255,255,0.35)', background: copied ? 'rgba(48,209,88,0.1)' : 'rgba(255,255,255,0.05)', border: `0.5px solid ${copied ? 'rgba(48,209,88,0.25)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 99, padding: '3px 10px', cursor: 'pointer', transition: 'all 0.2s' }}>

                {copied ? <><Check size={10} /> Copied!</> : <><Copy size={10} /> Copy</>}

              </button>

            </div>

            <div style={{ maxHeight: 180, overflowY: 'auto', padding: '12px 16px' }}>

              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#F5F5F7', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{task.prompt}</p>

            </div>

          </div>

          {Object.keys(byFile).length > 0 && (

            <div style={{ margin: '16px 24px 0', padding: '14px 16px', borderRadius: 14, background: 'rgba(48,209,88,0.05)', border: '0.5px solid rgba(48,209,88,0.18)' }}>

              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(48,209,88,0.7)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>

                <FilePlus size={10} strokeWidth={2} /> Files Affected · {Object.keys(byFile).length}

              </div>

              {Object.entries(byFile).map(([fp, actions]) => (

                <div key={fp} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>

                  <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: '#30D158', background: 'rgba(48,209,88,0.12)', padding: '1px 6px', borderRadius: 99, flexShrink: 0 }}>{[...new Set(actions)].join(' + ')}</span>

                  <span style={{ fontFamily: '"SF Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,0.65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fp}</span>

                </div>

              ))}

            </div>

          )}

          {timeline.length === 0 ? (

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: 10 }}>

              <Activity size={22} strokeWidth={1.5} style={{ color: 'rgba(255,255,255,0.1)' }} />

              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>

                {task.status === 'queued' ? 'Task is queued…' : task.status === 'running' ? 'Running — no output yet' : 'No activity recorded'}

              </span>

            </div>

          ) : (

            <div style={{ padding: '16px 24px 32px' }}>

              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 16 }}>

                Timeline · {timeline.length} event{timeline.length !== 1 ? 's' : ''}

              </div>

              {timeline.map((msg, i) => {

                const key = `${msg.type}-${i}`

                if (msg.type === 'text') return (

                  <div key={key} style={{ display: 'flex', gap: 12, marginBottom: 4 }}>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>

                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>

                        <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)' }}>AI</span>

                      </div>

                      <div style={{ width: 1, flex: 1, background: 'rgba(255,255,255,0.06)', marginTop: 4 }} />

                    </div>

                    <div style={{ flex: 1, paddingBottom: 18 }}>

                      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 6 }}>Agent Response</div>

                      <ExpandableText text={msg.content ?? ''} />

                    </div>

                  </div>

                )

                if (msg.type === 'tool_use') {

                  const tc = TOOL_CFG[msg.toolName ?? ''] ?? { color: '#BF5AF2', bg: 'rgba(191,90,242,0.1)', border: 'rgba(191,90,242,0.2)', Icon: Cpu, label: msg.toolName }

                  return (

                    <div key={key} style={{ display: 'flex', gap: 12, marginBottom: 4 }}>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>

                        <div style={{ width: 22, height: 22, borderRadius: 7, background: tc.bg, border: `0.5px solid ${tc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>

                          <tc.Icon size={11} strokeWidth={2} style={{ color: tc.color }} />

                        </div>

                        <div style={{ width: 1, flex: 1, background: 'rgba(255,255,255,0.06)', marginTop: 4 }} />

                      </div>

                      <div style={{ flex: 1, paddingBottom: 16 }}>

                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 99, background: tc.bg, color: tc.color, border: `0.5px solid ${tc.border}`, display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>

                          <tc.Icon size={9} strokeWidth={2.5} />{tc.label}

                        </span>

                        {msg.input?.query && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontFamily: '"SF Mono", monospace', marginTop: 4 }}>{msg.input.query}</div>}

                        {msg.input?.url && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontFamily: '"SF Mono", monospace', marginTop: 4, wordBreak: 'break-all' }}>{msg.input.url}</div>}

                        {msg.input?.file_path && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontFamily: '"SF Mono", monospace', marginTop: 4 }}>{msg.input.file_path}</div>}

                        {msg.input?.command && <pre style={{ margin: '4px 0 0', padding: '8px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.4)', border: '0.5px solid rgba(255,255,255,0.08)', fontSize: 11, fontFamily: '"SF Mono", monospace', color: 'rgba(191,90,242,0.9)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>$ {msg.input.command}</pre>}

                      </div>

                    </div>

                  )

                }

                if (msg.type === 'result') return (

                  <div key={key} style={{ display: 'flex', gap: 12 }}>

                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #BF5AF2, #9B40E0)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(191,90,242,0.4)', flexShrink: 0 }}>

                      <CheckCircle2 size={11} strokeWidth={2.5} style={{ color: '#fff' }} />

                    </div>

                    <div style={{ flex: 1 }}>

                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(191,90,242,0.7)', marginBottom: 8 }}>Completed</div>

                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>

                        {(msg.cost ?? 0) > 0 && <span style={{ fontSize: 11, color: '#FF9F0A', background: 'rgba(255,159,10,0.1)', padding: '3px 10px', borderRadius: 99, border: '0.5px solid rgba(255,159,10,0.2)', fontFamily: '"SF Mono", monospace' }}>${msg.cost!.toFixed(5)}</span>}

                        {(msg.inputTokens ?? 0) > 0 && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)', padding: '3px 10px', borderRadius: 99, border: '0.5px solid rgba(255,255,255,0.1)' }}>{msg.inputTokens!.toLocaleString()} in · {msg.outputTokens!.toLocaleString()} out</span>}

                      </div>

                    </div>

                  </div>

                )

                return null

              })}

            </div>

          )}

        </div>

      </div>

    </div>

  )

}

function NewTaskModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {

  const [form, setForm]         = useState({ prompt: '', model: MODELS[0].value, tags: '', tools: ['WebSearch','WebFetch','Read','Write','Bash'] })

  const [loading, setLoading]   = useState(false)

  const [error,   setError]     = useState<string | null>(null)

  const [advanced, setAdvanced] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>

    setForm(f => ({ ...f, [k]: e.target.value }))

  const toggleTool = (t: string) =>

    setForm(f => ({ ...f, tools: f.tools.includes(t) ? f.tools.filter(x => x !== t) : [...f.tools, t] }))

  const submit = async () => {

    if (!form.prompt.trim()) { setError('A prompt is required.'); return }

    setLoading(true); setError(null)

    try {

      const tags = form.tags.trim() ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []

      const res  = await fetch(`${API}/api/tasks`, {

        method: 'POST', headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ prompt: form.prompt, model: form.model, tags, tools: form.tools }),

      })

      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Request failed') }

      onCreated(); onClose()

    } catch (e: any) { setError(e.message) } finally { setLoading(false) }

  }

  useEffect(() => {

    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()

    window.addEventListener('keydown', h)

    return () => window.removeEventListener('keydown', h)

  }, [onClose])

  return (

    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(14px)' }} onClick={e => e.target === e.currentTarget && onClose()}>

      <div style={{ width: 540, borderRadius: 24, background: 'rgba(11,11,15,0.98)', border: '0.5px solid rgba(255,255,255,0.12)', boxShadow: '0 0 80px rgba(191,90,242,0.14), 0 32px 80px rgba(0,0,0,0.75)', overflow: 'hidden', animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1) forwards' }}>

        <div style={{ padding: '20px 24px', borderBottom: '0.5px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

            <div style={{ width: 32, height: 32, borderRadius: 11, background: 'rgba(191,90,242,0.15)', border: '0.5px solid rgba(191,90,242,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

              <Zap size={15} strokeWidth={2} style={{ color: '#BF5AF2' }} />

            </div>

            <div>

              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.025em', color: '#F5F5F7' }}>New Task</div>

              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>Run an AI agent task</div>

            </div>

          </div>

          <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 99, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

            <X size={13} strokeWidth={2} />

          </button>

        </div>

        <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          <div>

            <label className="block text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Prompt</label>

            <textarea

              className="w-full bg-zinc-800/80 border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-violet-500/50 resize-none"

              style={{ fontFamily: '"SF Mono", monospace', fontSize: 12.5, lineHeight: 1.7, minHeight: 120 }}

              rows={5}

              placeholder="What should the agent do? Be specific."

              value={form.prompt}

              onChange={set('prompt')}

              autoFocus

            />

          </div>

          <div className="grid grid-cols-2 gap-3.5">

            <div>

              <label className="block text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Model</label>

              <select className="w-full bg-zinc-800/80 border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-zinc-100 outline-none appearance-none cursor-pointer" value={form.model} onChange={set('model')}>

                {MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}

              </select>

            </div>

            <div>

              <label className="block text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Tags</label>

              <input className="w-full bg-zinc-800/80 border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600" placeholder="research, leads…" value={form.tags} onChange={set('tags')} />

            </div>

          </div>

          <button onClick={() => setAdvanced(a => !a)} className="flex items-center gap-1.5 text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors bg-transparent border-none cursor-pointer p-0">

            <ChevronDown size={12} style={{ transform: advanced ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />

            {advanced ? 'Hide' : 'Show'} tool selection

          </button>

          {advanced && (

            <div>

              <label className="block text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Allowed Tools</label>

              <div className="flex flex-wrap gap-1.5">

                {TOOLS_ALL.map(tool => {

                  const on = form.tools.includes(tool)

                  return (

                    <button key={tool} onClick={() => toggleTool(tool)} style={{ fontSize: 11, fontWeight: 600, padding: '5px 13px', borderRadius: 99, cursor: 'pointer', fontFamily: '"SF Mono", monospace', transition: 'all 0.15s', background: on ? 'rgba(191,90,242,0.14)' : 'rgba(255,255,255,0.05)', color: on ? '#D07CF5' : 'rgba(255,255,255,0.32)', border: on ? '0.5px solid rgba(191,90,242,0.35)' : '0.5px solid rgba(255,255,255,0.1)' }}>

                      {tool}

                    </button>

                  )

                })}

              </div>

            </div>

          )}

          {error && (

            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[12px] text-red-400 bg-red-500/[0.08] border border-red-500/20">

              <AlertCircle size={13} strokeWidth={2} />{error}

            </div>

          )}

        </div>

        <div style={{ padding: '4px 24px 24px', display: 'flex', gap: 10 }}>

          <button onClick={submit} disabled={loading || !form.prompt.trim()} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-violet-700 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-all">

            {loading ? <><Activity size={13} className="animate-spin" /> Launching…</> : <><Zap size={13} /> Run Task</>}

          </button>

          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 bg-zinc-800 border border-white/[0.07] hover:bg-zinc-700 transition-colors cursor-pointer">

            Cancel

          </button>

        </div>

      </div>

    </div>

  )

}

export default function TasksView() {

  const [tasks,        setTasks]        = useState<Task[]>([])

  const [search,       setSearch]       = useState('')

  const [filter,       setFilter]       = useState<string>('all')

  const [loading,      setLoading]      = useState(true)

  const [modal,        setModal]        = useState(false)

  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const load = () =>

    fetch(`${API}/api/tasks`)

      .then(r => r.json())

      .then(d => { setTasks(Array.isArray(d) ? d : []); setLoading(false) })

      .catch(() => setLoading(false))

  useEffect(() => { load() }, [])

  useEffect(() => {

    if (!tasks.some(t => t.status === 'running' || t.status === 'queued')) return

    const id = setInterval(load, 3000)

    return () => clearInterval(id)

  }, [tasks])

  const counts   = tasks.reduce<Record<string, number>>((a, t) => { a[t.status] = (a[t.status] || 0) + 1; return a }, {})

  const filtered = tasks.filter(t =>

    (!search || t.prompt.toLowerCase().includes(search.toLowerCase()))

    && (filter === 'all' || t.status === filter)

  )

  return (

    <div className="h-full flex flex-col bg-black/20">

      {modal        && <NewTaskModal    onClose={() => setModal(false)}        onCreated={load} />}

      {selectedTask && <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />}

      <div className="flex items-center justify-between px-7 py-4 flex-shrink-0 border-b border-white/[0.07]">

        <div className="flex items-center gap-2 flex-wrap">

          <div className="relative">

            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />

            <input className="pl-8 pr-3 py-1.5 bg-zinc-900 border border-white/[0.08] rounded-full text-xs text-zinc-300 outline-none placeholder:text-zinc-600 w-52" placeholder="Search tasks…" value={search} onChange={e => setSearch(e.target.value)} />

          </div>

          <div className="flex gap-1">

            {FILTERS.map(f => {

              const active = filter === f

              const count  = f === 'all' ? tasks.length : (counts[f] || 0)

              return (

                <button key={f} onClick={() => setFilter(f)} style={{ fontSize: 11, fontWeight: 500, padding: '5px 13px', borderRadius: 99, cursor: 'pointer', transition: 'all 0.15s', background: active ? 'rgba(191,90,242,0.14)' : 'rgba(255,255,255,0.05)', color: active ? '#D07CF5' : 'rgba(255,255,255,0.3)', border: active ? '0.5px solid rgba(191,90,242,0.3)' : '0.5px solid rgba(255,255,255,0.09)' }}>

                  {f.charAt(0).toUpperCase() + f.slice(1)}{count > 0 ? `  ${count}` : ''}

                </button>

              )

            })}

          </div>

        </div>

        <button onClick={() => setModal(true)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-violet-700 hover:brightness-110 transition-all">

          <Plus size={13} strokeWidth={2.5} /> New Task

        </button>

      </div>

      <div className="flex-1 overflow-y-auto px-7 py-5 space-y-2">

        {loading ? (

          <div className="flex items-center justify-center h-40 gap-2 text-zinc-600 text-sm">

            <Activity size={15} strokeWidth={1.5} style={{ animation: 'floatY 1s ease-in-out infinite' }} /> Loading…

          </div>

        ) : filtered.length === 0 ? (

          <div className="flex flex-col items-center justify-center h-64 gap-4">

            <div style={{ width: 52, height: 52, borderRadius: 18, background: 'rgba(191,90,242,0.06)', border: '0.5px solid rgba(191,90,242,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

              <Zap size={20} strokeWidth={1.5} style={{ color: 'rgba(191,90,242,0.4)' }} />

            </div>

            <p className="text-sm text-zinc-600 text-center">

              {search || filter !== 'all' ? 'No matching tasks' : 'No tasks yet — create your first one'}

            </p>

            {!search && filter === 'all' && (

              <button onClick={() => setModal(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-violet-700">

                <Plus size={13} /> Create First Task

              </button>

            )}

          </div>

        ) : filtered.map((task, i) => {

          const cfg       = STATUS_CFG[task.status] ?? STATUS_CFG.queued

          const isRunning = task.status === 'running'

          const isError   = task.status === 'error'

          return (

            <div key={task.id} onClick={() => setSelectedTask(task)} style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, borderRadius: 14, position: 'relative', overflow: 'hidden', cursor: 'pointer', background: isRunning ? 'rgba(191,90,242,0.04)' : isError ? 'rgba(255,69,58,0.03)' : 'rgba(255,255,255,0.02)', border: `0.5px solid ${isRunning ? 'rgba(191,90,242,0.2)' : isError ? 'rgba(255,69,58,0.15)' : 'rgba(255,255,255,0.07)'}`, transition: 'all 0.2s ease', animation: `slideUp 0.35s cubic-bezier(0.16,1,0.3,1) forwards ${Math.min(i * 25, 300)}ms`, opacity: 0 }}

              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.3)' }}

              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '' }}

            >

              {isRunning && <div aria-hidden style={{ position: 'absolute', top: 0, bottom: 0, width: '28%', background: 'linear-gradient(90deg, transparent, rgba(191,90,242,0.07), transparent)', animation: 'scanLine 2.8s ease-in-out infinite', pointerEvents: 'none' }} />}

              <div className="flex-shrink-0 flex items-center justify-center w-6">

                {isRunning ? (

                  <span style={{ position: 'relative', display: 'flex', width: 12, height: 12 }}>

                    <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#BF5AF2', animation: 'liveRing 1.6s ease-out infinite' }} />

                    <span style={{ position: 'relative', borderRadius: '50%', width: '100%', height: '100%', background: '#BF5AF2', boxShadow: '0 0 8px rgba(191,90,242,0.8)', display: 'inline-flex' }} />

                  </span>

                ) : (

                  <div style={{ width: 22, height: 22, borderRadius: 7, background: cfg.bg, border: `0.5px solid ${cfg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                    <cfg.Icon size={11} strokeWidth={2} style={{ color: cfg.color }} />

                  </div>

                )}

              </div>

              <div className="flex-1 min-w-0">

                <p className="text-sm font-medium text-zinc-200 truncate leading-relaxed">{task.prompt}</p>

                <div className="flex items-center gap-2 mt-1 flex-wrap">

                  <span style={{ fontFamily: '"SF Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{task.id}</span>

                  {task.model && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.05)', padding: '1px 7px', borderRadius: 99 }}>{task.model}</span>}

                  {task.tags?.slice(0, 2).map(tag => <span key={tag} style={{ fontSize: 10, color: 'rgba(191,90,242,0.75)', background: 'rgba(191,90,242,0.1)', borderRadius: 99, padding: '1px 8px', border: '0.5px solid rgba(191,90,242,0.2)' }}>{tag}</span>)}

                </div>

              </div>

              <div className="flex items-center gap-2.5 flex-shrink-0">

                {(task.totalCost ?? 0) > 0 && <span style={{ fontFamily: '"SF Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>${task.totalCost!.toFixed(4)}</span>}

                <StatusBadge status={task.status} />

              </div>

            </div>

          )

        })}

      </div>

    </div>

  )

}