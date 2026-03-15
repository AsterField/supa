import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import WordActions from '@/components/WordActions'


export default async function VocabularyPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/signin')

    const { data: words, error } = await supabase
        .from('vocabulary')
        .select(`
      *,
      examples (*),
      word_relations (*)
    `)
        .order('created_at', { ascending: false })

    if (error) return <p>Error: {error.message}</p>

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>My Vocabulary</h1>
                <Link href="/flashcards">🃏 Study Flashcards</Link>
                <Link href="/vocabulary/new">+ Add Word</Link>
            </div>

            {/* stats */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                <p>Total: {words?.length ?? 0}</p>
                <p>Learned: {words?.filter(w => w.learned).length ?? 0}</p>
                <p>To learn: {words?.filter(w => !w.learned).length ?? 0}</p>
            </div>

            {words?.length === 0 && <p>No words yet. Add your first word!</p>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {words?.map(word => (
                    <div key={word.id} style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16 }}>

                        {/* header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <h2 style={{ margin: 0 }}>{word.italian}</h2>
                                <p style={{ margin: 0, color: '#666' }}>{word.english}</p>
                            </div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'start' }}>
                                {word.part_of_speech && <span>{word.part_of_speech}</span>}
                                {word.gender && <span>{word.gender}</span>}
                                <span style={{ color: word.learned ? 'green' : 'orange' }}>
                                    {word.learned ? '✅ Learned' : '⏳ Learning'}
                                </span>
                            </div>
                        </div>

                        {/* examples */}
                        {word.examples?.length > 0 && (
                            <div style={{ marginTop: 12 }}>
                                <strong>Examples</strong>
                                {word.examples.map((ex: any) => (
                                    <div key={ex.id} style={{ marginTop: 4 }}>
                                        <p style={{ margin: 0 }}>🇮🇹 {ex.italian}</p>
                                        <p style={{ margin: 0, color: '#666' }}>🇬🇧 {ex.english}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* synonyms */}
                        {word.word_relations?.filter((r: any) => r.type === 'synonym').length > 0 && (
                            <div style={{ marginTop: 12 }}>
                                <strong>Synonyms: </strong>
                                {word.word_relations
                                    .filter((r: any) => r.type === 'synonym')
                                    .map((r: any) => r.related_word)
                                    .join(', ')}
                            </div>
                        )}

                        {/* antonyms */}
                        {word.word_relations?.filter((r: any) => r.type === 'antonym').length > 0 && (
                            <div style={{ marginTop: 8 }}>
                                <strong>Antonyms: </strong>
                                {word.word_relations
                                    .filter((r: any) => r.type === 'antonym')
                                    .map((r: any) => r.related_word)
                                    .join(', ')}
                            </div>
                        )}

                        {/* related */}
                        {word.word_relations?.filter((r: any) => r.type === 'related').length > 0 && (
                            <div style={{ marginTop: 8 }}>
                                <strong>Related: </strong>
                                {word.word_relations
                                    .filter((r: any) => r.type === 'related')
                                    .map((r: any) => r.related_word)
                                    .join(', ')}
                            </div>
                        )}

                        {/* actions */}
                        <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
                            <Link href={`/vocabulary/${word.id}`}>View</Link>
                            <Link href={`/vocabulary/${word.id}/edit`}>Edit</Link>
                            <WordActions wordId={word.id} learned={word.learned} />
                        </div>

                    </div>
                ))}
            </div>
        </div>
    )
}