// app/page.tsx
import { createClient } from '@/utils/supabase/server'

export default async function Page() {
  const supabase = await createClient()

  const { data: todos } = await supabase.from('instruments').select()

  return (
    <ul>
      {todos?.map((todo) => (
        <li key={todo.id}>{todo.name}</li>
      ))}
    </ul>
  )
}