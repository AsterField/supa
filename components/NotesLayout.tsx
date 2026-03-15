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
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())

  // select a note
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

  // autosave with debounce
  const save = useCallback(async (id: string, newTitle: string, newContent: string) => {
    setSaveStatus('saving')
    await supabase
      .from('notes')
      .update({ title: newTitle, content: newContent, updated_at: new Date().toISOString() })
      .eq('id', id)

    // update local state
    setNotes(prev => prev.map(note => {
      if (note.id === id) return { ...note, title: newTitle, content: newContent }
      return {
        ...note,
        subnotes: note.subnotes?.map(sub =>
          sub.id === id ? { ...sub, title: newTitle, content: newContent } : sub
        )
      }
    }))
    setSaveStatus('saved')
  }, [])

  useEffect(() => {
    if (!selectedId) return
    setSaveStatus('unsaved')
    const timer = setTimeout(() => save(selectedId, title, content), 1000)
    return () => clearTimeout(timer)
  }, [title, content])

  // create new main note
  const handleNewNote = async () => {
    const { data } = await supabase
      .from('notes')
      .insert({ user_id: userId, title: 'New Note', content: '', parent_id: null })
      .select()
      .single()

    if (data) {
      setNotes(prev => [{ ...data, subnotes: [] }, ...prev])
      handleSelect(data.id)
    }
  }

  // create new subnote
  const handleNewSubnote = async (parentId: string) => {
    const { data } = await supabase
      .from('notes')
      .insert({ user_id: userId, title: 'New Subnote', content: '', parent_id: parentId })
      .select()
      .single()

    if (data) {
      setNotes(prev => prev.map(note =>
        note.id === parentId
          ? { ...note, subnotes: [...(note.subnotes ?? []), data] }
          : note
      ))
      setExpandedNotes(prev => new Set(prev).add(parentId))
      handleSelect(data.id)
    }
  }

  // delete note
  const handleDelete = async (id: string, parentId?: string) => {
    const confirmed = confirm('Delete this note?')
    if (!confirmed) return

    await supabase.from('notes').delete().eq('id', id)

    if (parentId) {
      setNotes(prev => prev.map(note =>
        note.id === parentId
          ? { ...note, subnotes: note.subnotes?.filter(sub => sub.id !== id) }
          : note
      ))
    } else {
      setNotes(prev => prev.filter(note => note.id !== id))
    }

    if (selectedId === id) {
      setSelectedId(null)
      setSelectedNote(null)
      setTitle('')
      setContent('')
    }
  }

  // toggle pin
  const handleTogglePin = async (id: string, pinned: boolean) => {
    await supabase.from('notes').update({ pinned: !pinned }).eq('id', id)
    setNotes(prev => prev
      .map(note => note.id === id ? { ...note, pinned: !pinned } : note)
      .sort((a, b) => Number(b.pinned) - Number(a.pinned))
    )
  }

  // toggle expand subnotes
  const toggleExpand = (id: string) => {
    setExpandedNotes(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 57px)', overflow: 'hidden' }}>

      {/* LEFT PANEL — notes list */}
      <div style={{
        width: 280,
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f9fafb',
        flexShrink: 0
      }}>
        <div style={{ padding: '16px 16px 8px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ margin: 0, fontSize: 16 }}>📓 Notes</h2>
        </div>

        {/* notes list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
          {notes.length === 0 && (
            <p style={{ color: '#9ca3af', fontSize: 14, padding: 8 }}>No notes yet.</p>
          )}
          {notes.map(note => (
            <div key={note.id}>
              {/* main note row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: 8,
                backgroundColor: selectedId === note.id ? '#e0e7ff' : 'transparent',
                padding: '2px 4px',
                marginBottom: 2
              }}>
                {/* expand toggle */}
                <button
                  onClick={() => toggleExpand(note.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px', color: '#6b7280', fontSize: 12, flexShrink: 0 }}
                >
                  {note.subnotes && note.subnotes.length > 0
                    ? expandedNotes.has(note.id) ? '▼' : '▶'
                    : '·'}
                </button>

                {/* note title */}
                <button
                  onClick={() => handleSelect(note.id)}
                  style={{
                    flex: 1,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    padding: '6px 4px',
                    fontSize: 14,
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {note.pinned ? '📌 ' : ''}{note.title}
                </button>

                {/* actions */}
                <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                  <button
                    onClick={() => handleNewSubnote(note.id)}
                    title="Add subnote"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#6b7280', fontSize: 14 }}
                  >+</button>
                  <button
                    onClick={() => handleTogglePin(note.id, note.pinned)}
                    title={note.pinned ? 'Unpin' : 'Pin'}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#6b7280', fontSize: 12 }}
                  >📌</button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    title="Delete"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#ef4444', fontSize: 12 }}
                  >🗑</button>
                </div>
              </div>

              {/* subnotes */}
              {expandedNotes.has(note.id) && note.subnotes?.map(sub => (
                <div key={sub.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 8,
                  backgroundColor: selectedId === sub.id ? '#e0e7ff' : 'transparent',
                  padding: '2px 4px',
                  marginLeft: 20,
                  marginBottom: 2
                }}>
                  <span style={{ color: '#9ca3af', fontSize: 12, padding: '4px 6px' }}>└</span>
                  <button
                    onClick={() => handleSelect(sub.id)}
                    style={{
                      flex: 1,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      padding: '6px 4px',
                      fontSize: 13,
                      color: '#374151',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {sub.title}
                  </button>
                  <button
                    onClick={() => handleDelete(sub.id, note.id)}
                    title="Delete"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#ef4444', fontSize: 12 }}
                  >🗑</button>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* new note button */}
        <div style={{ padding: 12, borderTop: '1px solid #e5e7eb' }}>
          <button
            onClick={handleNewNote}
            style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            + New Note
          </button>
        </div>
      </div>

      {/* RIGHT PANEL — note content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedNote ? (
          <>
            {/* header */}
            <div style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={{ fontSize: 22, fontWeight: 'bold', border: 'none', outline: 'none', flex: 1, backgroundColor: 'transparent' }}
                placeholder="Note title"
              />
              <span style={{ fontSize: 13, color: saveStatus === 'saved' ? '#22c55e' : saveStatus === 'saving' ? '#f59e0b' : '#9ca3af', marginLeft: 16 }}>
                {saveStatus === 'saved' ? '✓ Saved' : saveStatus === 'saving' ? 'Saving...' : 'Unsaved'}
              </span>
            </div>

            {/* editor */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Start writing..."
              />
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 48 }}>📓</p>
              <p>Select a note to start editing</p>
              <button
                onClick={handleNewNote}
                style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', marginTop: 8 }}
              >
                + Create your first note
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}