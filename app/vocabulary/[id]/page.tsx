import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import WordActions from '@/components/WordActions'

export default async function WordDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const { data: word, error } = await supabase
    .from('vocabulary')
    .select(`*, examples(*), word_relations(*)`)
    .eq('id', id)
    .single()

  if (error || !word) redirect('/vocabulary')

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>

      {/* back */}
      <Link href="/vocabulary">← Back to list</Link>

      {/* header */}
      <div style={{ marginTop: 16 }}>
        <h1 style={{ margin: 0 }}>{word.italian}</h1>
        <p style={{ color: '#666', fontSize: 20 }}>{word.english}</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {word.part_of_speech && <span>📝 {word.part_of_speech}</span>}
          {word.gender && <span>⚥ {word.gender}</span>}
          <span>{word.learned ? '✅ Learned' : '⏳ Still learning'}</span>
        </div>
      </div>

      {/* examples */}
      {word.examples?.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h2>Example Sentences</h2>
          {word.examples.map((ex: any) => (
            <div key={ex.id} style={{ backgroundColor: '#f9fafb', padding: 12, borderRadius: 8, marginBottom: 8 }}>
              <p style={{ margin: 0 }}>🇮🇹 {ex.italian}</p>
              <p style={{ margin: 0, color: '#666' }}>🇬🇧 {ex.english}</p>
            </div>
          ))}
        </div>
      )}

      {/* synonyms */}
      {word.word_relations?.filter((r: any) => r.type === 'synonym').length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h2>Synonyms</h2>
          <p>{word.word_relations.filter((r: any) => r.type === 'synonym').map((r: any) => r.related_word).join(', ')}</p>
        </div>
      )}

      {/* antonyms */}
      {word.word_relations?.filter((r: any) => r.type === 'antonym').length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h2>Antonyms</h2>
          <p>{word.word_relations.filter((r: any) => r.type === 'antonym').map((r: any) => r.related_word).join(', ')}</p>
        </div>
      )}

      {/* related */}
      {word.word_relations?.filter((r: any) => r.type === 'related').length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h2>Related Words</h2>
          <p>{word.word_relations.filter((r: any) => r.type === 'related').map((r: any) => r.related_word).join(', ')}</p>
        </div>
      )}

      {/* image — display only, upload is on the edit page */}
      {word.image_url && (
        <div style={{ marginTop: 24 }}>
          <h2>Image</h2>
          <img
            src={word.image_url}
            alt={word.italian}
            style={{ maxWidth: '100%', borderRadius: 8 }}
          />
        </div>
      )}

      {/* actions */}
      <div style={{ marginTop: 24, display: 'flex', gap: 8, alignItems: 'center' }}>
        <Link href={`/vocabulary/${word.id}/edit`}>✏️ Edit</Link>
        <WordActions wordId={word.id} learned={word.learned} />
      </div>

    </div>
  )
}