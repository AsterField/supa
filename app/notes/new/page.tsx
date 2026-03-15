'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import RichTextEditor from '@/components/RichTextEditor'

export default function NewNotePage() {
  const supabase = createClient()
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!title) return setError('Title is required')
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/signin')

    const { data: note, error: noteError } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,
        title,
        content,
        parent_id: null,
      })
      .select()
      .single()

    if (noteError) {
      setError(noteError.message)
      setLoading(false)
      return
    }

    router.push(`/notes/${note.id}`)
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <h1>New Note</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <input
        placeholder="Note title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        style={{ width: '100%', padding: 12, fontSize: 18, borderRadius: 8, border: '1px solid #e5e7eb', marginBottom: 16, boxSizing: 'border-box' }}
      />

      <RichTextEditor
        content={content}
        onChange={setContent}
        placeholder="Write your note here..."
      />

      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <button onClick={() => router.back()} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #e5e7eb', cursor: 'pointer' }}>
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={loading} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', backgroundColor: '#2563eb', color: '#fff', cursor: 'pointer' }}>
          {loading ? 'Saving...' : 'Save Note'}
        </button>
      </div>
    </div>
  )
}