'use client'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function WordActions({ wordId, learned }: { wordId: string; learned: boolean }) {
  const supabase = createClient()
  const router = useRouter()

  const handleDelete = async () => {
    const confirmed = confirm('Are you sure you want to delete this word?')
    if (!confirmed) return

    await supabase.from('vocabulary').delete().eq('id', wordId)
    router.refresh()
  }

  const handleToggleLearned = async () => {
    await supabase.from('vocabulary').update({ learned: !learned }).eq('id', wordId)
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
      <button onClick={handleToggleLearned}>
        {learned ? '↩️ Mark as Learning' : '✅ Mark as Learned'}
      </button>
      <button onClick={handleDelete} style={{ color: 'red' }}>
        🗑️ Delete
      </button>
    </div>
  )
}