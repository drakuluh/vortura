import { useState, useEffect, useCallback } from 'react'
import { Target, Search, RefreshCw, Trash2, X, EyeOff, Eye, ChevronLeft, ChevronRight, SlidersHorizontal, UserPlus } from 'lucide-react'

interface Lead {
  id: string
  name: string
  phone?: string
  city?: string
  industry?: string
  address?: string
  website?: string | null
  score?: number
  notes?: string
  hidden?: boolean
  generatedAt?: number
}

const API = 'https://vortura-production.up.railway.app'

function scoreTier(score: number) {
  if (score >= 8) return 'hot'
  if (score >= 5) return 'warm'
  if (score >= 2) return 'cool'
  return 'cold'
}

const TIER = {
  hot:  { bg: 'rgba(48,209,88,0.13)',  border: 'rgba(48,209,88,0.45)',  text: '#30D158', icon: '🔥' },
  warm: { bg: 'rgba(255,214,10,0.12)', border: 'rgba(255,214,10,0.4)',  text: '#FFD60A', icon: '🌡️' },
  cool: { bg: 'rgba(255,159,10,0.12)', border: 'rgba(255,159,10,0.4)',  text: '#FF9F0A', icon: '❄️' },
  cold: { bg: 'rgba(255,69,58,0.10)',  border: 'rgba(255,69,58,0.38)',  text: '#FF6B6B', icon: '🥶' },
} as const

function getWebsite(lead: Lead) {
  if (lead.website && lead.website !== '' && lead.website !== '–') return lead.website
  return null
}

const DEFAULT_PROMPT = `You are a lead generation specialist for a web design agency.
Find exactly 10 local businesses in the Greater Toronto Area (GTA) that would benefit from web services.
ALREADY IN DATABASE — skip these:
{{SKIP_LIST}}
WEBSITE VERIFICATION — complete all 4 steps before marking website as null:
1. Check Google Maps listing for a Website button
2. Google search "[Business Name] [City] Ontario"
3. Check YellowPages.ca, Yelp.ca, Facebook
4. Try businessname.ca / businessname.com
TARGET NICHES: Automotive, dental, restaurants, HVAC, salons, gyms, law offices, cleaning, landscaping.
SCORING (1–10):
8–10 Hot  — no web presence, high-revenue industry
5–7  Warm — basic site or harder to reach
2–4  Cool — low budget signals
0–1  Cold — franchise or great site already
OUTPUT — paste this block EXACTLY:
===LEADS_JSON===
[
  {
    "name": "Business Name",
    "phone": "416-555-0000",
    "city": "Toronto",
    "industry": "Automotive",
    "address": "123 Main St, Toronto, ON",
    "website": null,
    "score": 9,
    "notes": "One sentence on why this is a strong lead."
  }
]
===END_LEADS===`

function buildPrompt(existing: Lead[]) {
  const skip = existing.length ? existing.map(l => `  - ${l.name}, ${l.city}`).join('\n') : '  (none yet)'
  return DEFAULT_PROMPT.replace('{{SKIP_LIST}}', skip)
}

function ConfirmDialog({ action, leadName, onConfirm, onCancel }: { action: string; leadName: string; onConfirm: () => void; onCancel: () => void }) {
  const isDelete  = action === 'delete'
  const isContact = action === 'contact'
  const iconBg     = isDelete ? 'rgba(255,69,58,0.15)'  : isContact ? 'rgba(26,174,255,0.12)' : 'rgba(255,159,10,0.12)'
  const iconBorder = isDelete ? 'rgba(255,69,58,0.3)'   : isContact ? 'rgba(26,174,255,0.3)'  : 'rgba(255,159,10,0.25)'
  const btnBg      = isDelete ? 'rgba(255,69,58,0.9)'   : isContact ? 'rgba(26,174,255,0.9)'  : 'rgba(255,159,10,0.85)'
  const title      = isDelete ? 'Delete this lead?' : isContact ? 'Move to Contacts?' : 'Hide this lead?'
  const body       = isDelete ? ' will be permanently removed.' : isContact ? ' will be added to Contacts and hidden.' : ' will be hidden but kept for deduplication.'
  const btnLabel   = isDelete ? 'Yes, delete' : isContact ? 'Move to Contacts' : 'Yes, hide'

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onCancel}>
      <div style={{ background: '#1a1a1c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 28, width: 380, maxWidth: '90vw', boxShadow: '0 24px 64px rgba(0,0,0,0.7)' }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 44, height: 44, borderRadius: 12, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: iconBg, border: `1px solid ${iconBorder}` }}>
          {isDelete ? <Trash2 size={20} style={{ color: '#FF453A' }} /> : isContact ? <UserPlus size={20} style={{ color: '#1AAEFF' }} /> : <EyeOff size={20} style={{ color: '#FF9F0A' }} />}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f0f0', marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: 24 }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{leadName}</span>{body}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm text-zinc-400 bg-zinc-800 border border-white/[0.08] cursor-pointer">Cancel</button>
          <button onClick={onConfirm} style={{ padding: '8px 18px', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: btnBg, border: '1px solid transparent', color: '#fff' }}>{btnLabel}</button>
        </div>
      </div>
    </div>
  )
}

function ScoreChip({ active, color, onClick, children }: { active: boolean; color: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{ padding: '5px 11px', borderRadius: 20, fontSize: 11, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap', background: active ? `${color}22` : 'rgba(255,255,255,0.04)', border: active ? `1px solid ${color}88` : '1px solid rgba(255,255,255,0.07)', color: active ? color : 'rgba(255,255,255,0.45)' }}>
      {children}
    </button>
  )
}

const GRID    = '20fr 11fr 9fr 11fr 17fr 8fr 24fr'
const HEADERS = ['Business Name','Phone','City','Industry','Website','Score','Notes']
const ITEMS_PER_PAGE = 50

export default function LeadsView() {
  const [leads,         setLeads]         = useState<Lead[]>([])
  const [search,        setSearch]        = useState('')
  const [scoreFilter,   setScoreFilter]   = useState('all')
  const [websiteFilter, setWebsiteFilter] = useState<'none' | 'has'>('none')
  const [showHidden,    setShowHidden]    = useState(false)
  const [customPrompt,  setCustomPrompt]  = useState<string | null>(null)
  const [promptModal,   setPromptModal]   = useState(false)
  const [page,          setPage]          = useState(0)
  const [loading,       setLoading]       = useState(true)
  const [generating,    setGenerating]    = useState(false)
  const [genTaskId,     setGenTaskId]     = useState<string | null>(null)
  const [genStatus,     setGenStatus]     = useState('')
  const [error,         setError]         = useState<string | null>(null)
  const [confirm,       setConfirm]       = useState<{ action: string; id: string; name: string } | null>(null)

  const fetchLeads = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/leads`)
      if (r.ok) setLeads(await r.json())
    } catch { setError('Failed to load leads') }
    finally  { setLoading(false) }
  }, [])

  useEffect(() => { fetchLeads() }, [fetchLeads])
  useEffect(() => { setPage(0) }, [search, scoreFilter, websiteFilter])

  useEffect(() => {
    if (!genTaskId) return
    let alive = true
    const poll = async () => {
      if (!alive) return
      try {
        const list = await fetch(`${API}/api/tasks`).then(r => r.json())
        const task = list.find((t: any) => t.id === genTaskId)
        if (!task) { setGenerating(false); return }
        if (task.status === 'queued')  { setGenStatus('Queued…');                         setTimeout(poll, 2500); return }
        if (task.status === 'running') { setGenStatus('Agent is researching GTA leads…'); setTimeout(poll, 2500); return }
        if (task.status === 'done') {
          await fetchLeads()
          const added = task.leadsAdded ?? 0
          setGenStatus(added > 0 ? `✓ ${added} new leads added!` : 'Task complete.')
        } else {
          setGenStatus(`Error: ${task.error ?? 'unknown'}`)
        }
        setGenerating(false); setGenTaskId(null)
        setTimeout(() => setGenStatus(''), 4000)
      } catch { if (alive) setTimeout(poll, 3000) }
    }
    poll()
    return () => { alive = false }
  }, [genTaskId, fetchLeads])

  const handleGenerate = async () => {
    if (generating) return
    setGenerating(true); setError(null); setGenStatus('Starting lead generation…')
    try {
      const r = await fetch(`${API}/api/tasks`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: buildPrompt(leads), tags: ['leads'], tools: ['WebSearch','WebFetch'] }),
      })
      if (!r.ok) throw new Error('Failed to create task')
      setGenTaskId((await r.json()).id)
    } catch (e: any) { setError(e.message); setGenerating(false); setGenStatus('') }
  }

  const handleConfirm = async () => {
    if (!confirm) return
    const { action, id } = confirm
    setConfirm(null)
    if (action === 'delete') {
      await fetch(`${API}/api/leads/${id}`, { method: 'DELETE' })
      setLeads(prev => prev.filter(l => l.id !== id))
    } else if (action === 'hide') {
      await fetch(`${API}/api/leads/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hidden: true }) })
      setLeads(prev => prev.map(l => l.id === id ? { ...l, hidden: true } : l))
    } else if (action === 'contact') {
      const lead = leads.find(l => l.id === id)
      if (lead) {
        await fetch(`${API}/api/contacts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead) })
        await fetch(`${API}/api/leads/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hidden: true }) })
        setLeads(prev => prev.map(l => l.id === id ? { ...l, hidden: true } : l))
      }
    }
  }

  const active   = leads.filter(l => !l.hidden)
  const base     = showHidden ? leads : active
  const filtered = base.filter(lead => {
    const q = search.toLowerCase()
    const matchSearch  = !q || lead.name?.toLowerCase().includes(q) || lead.city?.toLowerCase().includes(q) || lead.industry?.toLowerCase().includes(q)
    const site         = getWebsite(lead)
    const matchWebsite = websiteFilter === 'has' ? !!site : !site
    const matchScore   = scoreFilter === 'all' || scoreTier(lead.score ?? 0) === scoreFilter
    return matchSearch && matchWebsite && matchScore
  })

  const sorted     = [...filtered].sort((a, b) => (b.generatedAt ?? 0) - (a.generatedAt ?? 0))
  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE))
  const safePage   = Math.min(page, totalPages - 1)
  const paginated  = sorted.slice(safePage * ITEMS_PER_PAGE, (safePage + 1) * ITEMS_PER_PAGE)

  const hot  = active.filter(l => scoreTier(l.score ?? 0) === 'hot').length
  const warm = active.filter(l => scoreTier(l.score ?? 0) === 'warm').length
  const cool = active.filter(l => scoreTier(l.score ?? 0) === 'cool').length
  const cold = active.filter(l => scoreTier(l.score ?? 0) === 'cold').length

  return (
    <>
      {confirm && <ConfirmDialog action={confirm.action} leadName={confirm.name} onConfirm={handleConfirm} onCancel={() => setConfirm(null)} />}
      {promptModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setPromptModal(false)}>
          <div style={{ background: '#1a1a1c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 28, width: '100%', maxWidth: 720, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#f0f0f0' }}>Edit Generation Prompt</span>
              <button onClick={() => setPromptModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}><X size={16} /></button>
            </div>
            <textarea value={customPrompt ?? DEFAULT_PROMPT} onChange={e => setCustomPrompt(e.target.value)} spellCheck={false} style={{ flex: 1, minHeight: 380, maxHeight: 480, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 10, padding: '14px 16px', color: '#f0f0f0', fontSize: 12, lineHeight: 1.7, fontFamily: '"SF Mono", Consolas, monospace', resize: 'vertical', outline: 'none' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button onClick={() => setCustomPrompt(null)} className="px-3 py-1.5 rounded-lg text-xs text-zinc-500 border border-white/[0.08] bg-transparent cursor-pointer">Reset</button>
              <button onClick={() => setPromptModal(false)} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 cursor-pointer">Save</button>
            </div>
          </div>
        </div>
      )}
      <div className="h-full overflow-y-auto" style={{ padding: '24px 28px' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(145deg, #1AAEFF, #083147)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 18px rgba(26,174,255,0.4)', flexShrink: 0 }}>
              <Target size={18} strokeWidth={2} style={{ color: '#fff' }} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-100" style={{ letterSpacing: '-0.02em' }}>GTA Leads</h1>
              <p className="text-xs text-zinc-500 mt-0.5">Local businesses in the Greater Toronto Area</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPromptModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', background: customPrompt ? 'rgba(26,174,255,0.12)' : 'rgba(255,255,255,0.05)', border: customPrompt ? '1px solid rgba(26,174,255,0.35)' : '1px solid rgba(255,255,255,0.08)', color: customPrompt ? '#1AAEFF' : 'rgba(255,255,255,0.5)' }}>
              <SlidersHorizontal size={13} />{customPrompt ? 'Custom Prompt' : 'Edit Prompt'}
            </button>
            <button onClick={handleGenerate} disabled={generating} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: generating ? 'not-allowed' : 'pointer', background: generating ? 'rgba(26,174,255,0.15)' : 'linear-gradient(135deg, #1AAEFF, #083147)', color: generating ? 'rgba(26,174,255,0.55)' : '#fff', border: generating ? '1px solid rgba(26,174,255,0.25)' : '1px solid transparent', boxShadow: generating ? 'none' : '0 4px 16px rgba(26,174,255,0.35)' }}>
              {generating ? <RefreshCw size={14} className="animate-spin" /> : <Target size={14} />}
              {generating ? 'Generating…' : 'Generate Leads'}
            </button>
          </div>
        </div>

        {genStatus && <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 10, background: 'rgba(26,174,255,0.07)', border: '1px solid rgba(26,174,255,0.2)', color: '#1AAEFF', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>{generating && <RefreshCw size={12} className="animate-spin" />}{genStatus}</div>}
        {error    && <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.22)', color: '#FF6B6B', fontSize: 12 }}>{error}</div>}

        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Total Leads', value: active.length, color: '#1AAEFF' },
            { label: 'Hot Leads',   value: hot,           color: '#30D158' },
            { label: 'Warm Leads',  value: warm,          color: '#FFD60A' },
            { label: 'Cool Leads',  value: cool,          color: '#FF9F0A' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color, lineHeight: 1.1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2.5 mb-3.5 flex-wrap">
          <div className="relative" style={{ flex: '0 0 220px' }}>
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
            <input type="text" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-7 pr-7 py-1.5 bg-zinc-900 border border-white/[0.08] rounded-lg text-xs text-zinc-200 outline-none placeholder:text-zinc-600" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 bg-transparent border-none cursor-pointer"><X size={11} /></button>}
          </div>
          <div onClick={() => setWebsiteFilter(v => v === 'has' ? 'none' : 'has')} className="flex items-center gap-2 cursor-pointer select-none">
            <span style={{ fontSize: 11, fontWeight: 500, color: websiteFilter !== 'has' ? '#FF6B6B' : 'rgba(255,255,255,0.3)' }}>🚫 No Site</span>
            <div style={{ width: 36, height: 20, borderRadius: 10, position: 'relative', background: websiteFilter === 'has' ? 'rgba(26,174,255,0.25)' : 'rgba(255,255,255,0.1)', border: `1px solid ${websiteFilter === 'has' ? 'rgba(26,174,255,0.45)' : 'rgba(255,255,255,0.14)'}`, transition: 'all 0.2s' }}>
              <div style={{ position: 'absolute', top: 3, left: websiteFilter === 'has' ? 17 : 3, width: 12, height: 12, borderRadius: '50%', background: websiteFilter === 'has' ? '#1AAEFF' : 'rgba(255,255,255,0.4)', transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)' }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 500, color: websiteFilter === 'has' ? '#1AAEFF' : 'rgba(255,255,255,0.3)' }}>🌐 Website</span>
          </div>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)' }} />
          <button onClick={() => setShowHidden(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', background: showHidden ? 'rgba(255,159,10,0.14)' : 'rgba(255,255,255,0.04)', border: showHidden ? '1px solid rgba(255,159,10,0.4)' : '1px solid rgba(255,255,255,0.07)', color: showHidden ? '#FF9F0A' : 'rgba(255,255,255,0.4)' }}>
            {showHidden ? <EyeOff size={12} /> : <Eye size={12} />}
            {showHidden ? `Showing Hidden (${leads.filter(l => l.hidden).length})` : 'Show Hidden'}
          </button>
          <div style={{ flex: 1 }} />
          <div className="flex gap-1">
            <ScoreChip active={scoreFilter === 'all'}  color="#1AAEFF" onClick={() => setScoreFilter('all')}>All</ScoreChip>
            <ScoreChip active={scoreFilter === 'hot'}  color="#30D158" onClick={() => setScoreFilter('hot')}>🔥 Hot ({hot})</ScoreChip>
            <ScoreChip active={scoreFilter === 'warm'} color="#FFD60A" onClick={() => setScoreFilter('warm')}>🌡️ Warm ({warm})</ScoreChip>
            <ScoreChip active={scoreFilter === 'cool'} color="#FF9F0A" onClick={() => setScoreFilter('cool')}>❄️ Cool ({cool})</ScoreChip>
            <ScoreChip active={scoreFilter === 'cold'} color="#FF6B6B" onClick={() => setScoreFilter('cold')}>🥶 Cold ({cold})</ScoreChip>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-zinc-600 text-sm py-16">Loading leads…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14 }}>
            <Target size={32} style={{ color: 'rgba(26,174,255,0.3)', margin: '0 auto 12px', display: 'block' }} />
            <div className="text-zinc-400 text-sm font-medium mb-1">{active.length === 0 ? 'No leads yet' : 'No leads match your filters'}</div>
            <div className="text-zinc-600 text-xs">{active.length === 0 ? 'Click "Generate Leads" to start' : 'Try adjusting your filters'}</div>
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: GRID, gap: 10, padding: '10px 16px', background: 'rgba(26,174,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {HEADERS.map(h => <div key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#1AAEFF' }}>{h}</div>)}
            </div>
            {paginated.map((lead, idx) => {
              const tier     = scoreTier(lead.score ?? 0)
              const tc       = TIER[tier]
              const site     = getWebsite(lead)
              const isHidden = !!lead.hidden
              return (
                <div key={lead.id}
                  style={{ display: 'grid', gridTemplateColumns: GRID, gap: 10, padding: '10px 16px', alignItems: 'center', background: isHidden ? 'rgba(255,159,10,0.04)' : idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)', borderBottom: idx < paginated.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', opacity: isHidden ? 0.45 : 1, transition: 'background 0.12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(26,174,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = isHidden ? 'rgba(255,159,10,0.04)' : idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'}
                >
                  <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                    <a href={`https://www.google.com/maps/search/${encodeURIComponent(`${lead.name} ${lead.city} ON`)}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 600, color: '#1AAEFF', textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>{lead.name}</a>
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.phone || '—'}</div>
                  <div style={{ fontSize: 12, color: '#f0f0f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.city || '—'}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.industry || '—'}</div>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {site ? <a href={site.startsWith('http') ? site : `https://${site}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#1AAEFF', textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>{site.replace(/^https?:\/\/(www\.)?/, '')}</a>
                    : <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 12 }}>–</span>}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 9px', borderRadius: 10, fontSize: 12, fontWeight: 700, background: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }}>
                      <span style={{ fontSize: 11 }}>{tc.icon}</span>{lead.score ?? '?'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
                    <div style={{ flex: 1, fontSize: 11, color: 'rgba(255,255,255,0.42)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.notes || '—'}</div>
                    {[
                      { title: 'Move to Contacts', icon: <UserPlus size={12} />, action: 'contact', hover: '#1AAEFF' },
                      { title: 'Hide',             icon: <EyeOff   size={12} />, action: 'hide',    hover: '#FF9F0A' },
                      { title: 'Delete',           icon: <Trash2   size={12} />, action: 'delete',  hover: '#FF453A' },
                    ].map(btn => (
                      <button key={btn.action} title={btn.title} onClick={() => setConfirm({ action: btn.action, id: lead.id, name: lead.name })}
                        style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.18)', padding: 4, borderRadius: 6, transition: 'color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = btn.hover}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.18)'}
                      >{btn.icon}</button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-3.5 px-1">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={safePage === 0} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs bg-zinc-900 border border-white/[0.08] text-zinc-400 disabled:text-zinc-700 cursor-pointer disabled:cursor-default">
              <ChevronLeft size={14} /> Previous
            </button>
            <span className="text-xs text-zinc-500">Page {safePage + 1} of {totalPages} <span className="text-zinc-700">({sorted.length} leads)</span></span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={safePage >= totalPages - 1} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs bg-zinc-900 border border-white/[0.08] text-zinc-400 disabled:text-zinc-700 cursor-pointer disabled:cursor-default">
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </>
  )
}