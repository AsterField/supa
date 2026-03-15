import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import FlashcardClient from '@/components/FlashcardClient'

export default async function FlashcardsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const { data: words } = await supabase
    .from('vocabulary')
    .select(`*, examples(*), word_relations(*)`)
    .eq('learned', false)
    .order('created_at', { ascending: true })

  if (!words?.length) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 24, textAlign: 'center' }}>
        <h1>Flashcards</h1>
        <p>No unlearned words found. Add some words first!</p>
        <a href="/vocabulary/new">+ Add Word</a>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h1>Flashcards</h1>
      <p>{words.length} words to study</p>
      <FlashcardClient words={words} />
    </div>
  )
}