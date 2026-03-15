import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import NotesLayout from '@/components/NotesLayout'

export default async function NotesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const { data: notes } = await supabase
    .from('notes')
    .select(`
      *,
      subnotes:notes!parent_id(*)
    `)
    .is('parent_id', null)
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })

  return <NotesLayout initialNotes={notes ?? []} userId={user.id} />
}