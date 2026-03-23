'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import RichTextEditor from '@/components/RichTextEditor'

type Note = {
  id: string
  title: string
  content: string | null
  pinned: boolean
  parent_id: string | null
  created_at: string
  updated_at: string
  subnotes?: Note[]
}

export default function NotesLayout({ initialNotes, userId }: { initialNotes: Note[], userId: string }) {
  const supabase = createClient()
  const [notes, setNotes]               = useState<Note[]>(initialNotes)
  const [selectedId, setSelectedId]     = useState<string | null>(null)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [title, setTitle]               = useState('')
  const [content, setContent]           = useState('')
  const [saveStatus, setSaveStatus]     = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const [expanded, setExpanded]         = useState<Set<string>>(new Set())
  const [search, setSearch]             = useState('')
  const [sidebarOpen, setSidebarOpen]   = useState(true)

  const handleSelect = async (id: string) => {
    setSelectedId(id)
    const { data } = await supabase.from('notes').select('*').eq('id', id).single()
    if (data) {
      setSelectedNote(data)
      setTitle(data.title)
      setContent(data.content ?? '')
      setSaveStatus('saved')
    }
  }

  const save = useCallback(async (id: string, newTitle: string, newContent: string) => {
    setSaveStatus('saving')
    await supabase
      .from('notes')
      .update({ title: newTitle, content: newContent, updated_at: new Date().toISOString() })
      .eq('id', id)
    setNotes(prev => prev.map(note => ({
      ...note,
      ...(note.id === id ? { title: newTitle, content: newContent } : {}),
      subnotes: note.subnotes?.map(sub =>
        sub.id === id ? { ...sub, title: newTitle, content: newContent } : sub
      )
    })))
    setSaveStatus('saved')
  }, [])

  useEffect(() => {
    if (!selectedId) return
    setSaveStatus('unsaved')
    const t = setTimeout(() => save(selectedId, title, content), 1000)
    return () => clearTimeout(t)
  }, [title, content])

  const handleNewNote = async () => {
    const { data } = await supabase
      .from('notes')
      .insert({ user_id: userId, title: 'Untitled', content: '', parent_id: null })
      .select().single()
    if (data) {
      setNotes(prev => [{ ...data, subnotes: [] }, ...prev])
      handleSelect(data.id)
    }
  }

  const handleNewSubnote = async (parentId: string) => {
    const { data } = await supabase
      .from('notes')
      .insert({ user_id: userId, title: 'Untitled', content: '', parent_id: parentId })
      .select().single()
    if (data) {
      setNotes(prev => prev.map(n =>
        n.id === parentId ? { ...n, subnotes: [...(n.subnotes ?? []), data] } : n
      ))
      setExpanded(prev => new Set(prev).add(parentId))
      handleSelect(data.id)
    }
  }

  const handleDelete = async (id: string, parentId?: string) => {
    if (!confirm('Delete this note?')) return
    await supabase.from('notes').delete().eq('id', id)
    if (parentId) {
      setNotes(prev => prev.map(n =>
        n.id === parentId ? { ...n, subnotes: n.subnotes?.filter(s => s.id !== id) } : n
      ))
    } else {
      setNotes(prev => prev.filter(n => n.id !== id))
    }
    if (selectedId === id) { setSelectedId(null); setSelectedNote(null); setTitle(''); setContent('') }
  }

  const handleTogglePin = async (id: string, pinned: boolean) => {
    await supabase.from('notes').update({ pinned: !pinned }).eq('id', id)
    setNotes(prev => prev
      .map(n => n.id === id ? { ...n, pinned: !pinned } : n)
      .sort((a, b) => Number(b.pinned) - Number(a.pinned))
    )
  }

  const toggleExpand = (id: string) => setExpanded(prev => {
    const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next
  })

  const filtered = search.trim()
    ? notes.filter(n =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.subnotes?.some(s => s.title.toLowerCase().includes(search.toLowerCase()))
      )
    : notes

  const wordCount = content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length
  const charCount = content.replace(/<[^>]*>/g, '').length

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

  return (
    <div className="flex bg-[#fafaf9]" style={{ height: 'calc(100vh - 57px)', overflow: 'hidden' }}>

      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <aside className={`flex flex-col bg-[#f5f4f1] border-r border-stone-200 transition-all duration-300 shrink-0 ${sidebarOpen ? 'w-80' : 'w-0 overflow-hidden'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-stone-200">
          <span className="text-sm font-semibold text-stone-700 tracking-wide">Notes</span>
          <button
            onClick={handleNewNote}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-800 text-white text-lg leading-none hover:bg-stone-700 transition-colors cursor-pointer"
            title="New note"
          >+</button>
        </div>

        {/* Search */}
        <div className="px-3 py-2.5 border-b border-stone-200">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notes…"
            className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-600 placeholder-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-300 transition-all"
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-2 px-2">
          {filtered.length === 0 && (
            <p className="text-stone-400 text-xs px-3 py-4 text-center">No notes found.</p>
          )}
          {filtered.map(note => (
            <div key={note.id}>
              {/* Main note */}
              <div className={`group flex items-center gap-1 rounded-xl px-2 py-2.5 mb-1 cursor-pointer transition-all ${
                selectedId === note.id ? 'bg-white shadow-sm border border-stone-200' : 'hover:bg-stone-100'
              }`}>
                {/* Expand chevron */}
                <button
                  onClick={() => toggleExpand(note.id)}
                  className="w-4 h-4 flex items-center justify-center text-stone-300 hover:text-stone-500 shrink-0 transition-colors cursor-pointer"
                >
                  {note.subnotes && note.subnotes.length > 0
                    ? <span className="text-[10px]">{expanded.has(note.id) ? '▾' : '▸'}</span>
                    : <span className="text-[8px]">•</span>}
                </button>

                {/* Title */}
                <button
                  onClick={() => handleSelect(note.id)}
                  className="flex-1 text-left min-w-0"
                >
                  <p className={`text-base truncate ${selectedId === note.id ? 'text-stone-900 font-medium' : 'text-stone-700'}`}>
                    {note.pinned && <span className="mr-1 text-[10px]">📌</span>}
                    {note.title || 'Untitled'}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">{formatDate(note.updated_at)}</p>
                </button>

                {/* Actions — show on hover */}
                <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
                  <button onClick={() => handleNewSubnote(note.id)} title="Add subnote"
                    className="w-6 h-6 flex items-center justify-center rounded text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer text-sm">
                    +
                  </button>
                  <button onClick={() => handleTogglePin(note.id, note.pinned)} title={note.pinned ? 'Unpin' : 'Pin'}
                    className="w-6 h-6 flex items-center justify-center rounded text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer text-[11px]">
                    {note.pinned ? '📌' : '·'}
                  </button>
                  <button onClick={() => handleDelete(note.id)} title="Delete"
                    className="w-6 h-6 flex items-center justify-center rounded text-stone-300 hover:text-red-400 hover:bg-red-50 transition-colors cursor-pointer text-xs">
                    ×
                  </button>
                </div>
              </div>

              {/* Subnotes */}
              {expanded.has(note.id) && note.subnotes?.map(sub => (
                <div key={sub.id} className={`group flex items-center gap-1 rounded-xl px-2 py-1.5 mb-0.5 ml-5 cursor-pointer transition-all ${
                  selectedId === sub.id ? 'bg-white shadow-sm border border-stone-200' : 'hover:bg-stone-100'
                }`}>
                  <span className="text-stone-300 text-[10px] mr-1">└</span>
                  <button onClick={() => handleSelect(sub.id)} className="flex-1 text-left min-w-0">
                    <p className={`text-sm truncate ${selectedId === sub.id ? 'text-stone-900 font-medium' : 'text-stone-600'}`}>
                      {sub.title || 'Untitled'}
                    </p>
                  </button>
                  <button onClick={() => handleDelete(sub.id, note.id)}
                    className="hidden group-hover:flex w-6 h-6 items-center justify-center rounded text-stone-300 hover:text-red-400 hover:bg-red-50 transition-colors cursor-pointer text-xs shrink-0">
                    ×
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Footer stats */}
        <div className="px-4 py-2.5 border-t border-stone-200">
          <p className="text-[10px] text-stone-400">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
        </div>
      </aside>

      {/* ── Editor ───────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {selectedNote ? (
          <>
            {/* Toolbar */}
            <div className="flex items-center gap-3 px-8 py-3 border-b border-stone-100 bg-white shrink-0">
              {/* Sidebar toggle */}
              <button
                onClick={() => setSidebarOpen(p => !p)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer text-sm shrink-0"
                title="Toggle sidebar"
              >
                {sidebarOpen ? '◂' : '▸'}
              </button>

              <div className="w-px h-4 bg-stone-200" />

              {/* Save status */}
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  saveStatus === 'saved' ? 'bg-emerald-400' :
                  saveStatus === 'saving' ? 'bg-amber-400' : 'bg-stone-300'
                }`} />
                <span className="text-[11px] text-stone-400 font-mono">
                  {saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving…' : 'Unsaved'}
                </span>
              </div>

              <div className="flex-1" />

              {/* Word / char count */}
              <span className="text-[11px] text-stone-300 font-mono hidden sm:block">
                {wordCount} words · {charCount} chars
              </span>

              <div className="w-px h-4 bg-stone-200" />

              {/* Pin */}
              <button
                onClick={() => handleTogglePin(selectedNote.id, selectedNote.pinned)}
                className={`text-xs px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedNote.pinned
                    ? 'bg-amber-50 text-amber-600 border border-amber-200'
                    : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'
                }`}
              >
                {selectedNote.pinned ? '📌 Pinned' : '📌'}
              </button>

              {/* Delete */}
              <button
                onClick={() => handleDelete(selectedNote.id, selectedNote.parent_id ?? undefined)}
                className="text-xs text-stone-300 hover:text-red-400 px-2 py-1 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
              >
                Delete
              </button>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto">
              <div className="w-full mx-auto px-8 py-10">

                {/* Title */}
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Untitled"
                  className="w-full text-3xl font-bold text-stone-900 bg-transparent border-none outline-none placeholder-stone-200 mb-6 tracking-tight leading-tight"
                  style={{ fontFamily: 'Georgia, serif' }}
                />

                {/* Divider */}
                <div className="h-px bg-stone-100 mb-8" />

                {/* Editor — visible bordered area */}
                <div className="border border-stone-200 rounded-2xl bg-white shadow-sm overflow-hidden focus-within:border-stone-400 focus-within:shadow-md transition-all">
                  <div className="px-6 py-5 min-h-[400px]">
                    <RichTextEditor
                      content={content}
                      onChange={setContent}
                      placeholder="Start writing…"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center">
            <button
              onClick={() => setSidebarOpen(p => !p)}
              className="absolute top-20 left-4 w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer text-sm"
            >
              {sidebarOpen ? '◂' : '▸'}
            </button>
            <div className="text-center opacity-40">
              <p className="text-5xl mb-4">📓</p>
              <p className="text-sm text-stone-500 mb-4">Select a note or create one</p>
              <button
                onClick={handleNewNote}
                className="px-4 py-2 bg-stone-900 text-white rounded-xl text-sm hover:bg-stone-700 transition-colors cursor-pointer"
              >
                New note
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}