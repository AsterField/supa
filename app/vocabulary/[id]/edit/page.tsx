'use client'
import { useEffect, useState } from 'react'
import { use } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import ImageUpload from '@/components/ImageUpload'

type Example = { id?: string; italian: string; english: string }
type Relation = { id?: string; related_word: string; type: 'synonym' | 'antonym' | 'related' }

export default function EditWordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const supabase = createClient()
  const router = useRouter()

  const [italian, setItalian] = useState('')
  const [english, setEnglish] = useState('')
  const [partOfSpeech, setPartOfSpeech] = useState('')
  const [gender, setGender] = useState('')
  const [examples, setExamples] = useState<Example[]>([])
  const [relations, setRelations] = useState<Relation[]>([])
  const [imageUrl, setImageUrl] = useState('')        // ✅ added
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return

    const fetchWord = async () => {
      const { data } = await supabase
        .from('vocabulary')
        .select(`*, examples(*), word_relations(*)`)
        .eq('id', id)
        .single()

      if (data) {
        setItalian(data.italian)
        setEnglish(data.english)
        setPartOfSpeech(data.part_of_speech ?? '')
        setGender(data.gender ?? '')
        setExamples(data.examples ?? [])
        setRelations(data.word_relations ?? [])
        setImageUrl(data.image_url ?? '')             // ✅ added
      }
      setLoading(false)
    }

    fetchWord()
  }, [id])

  const handleSubmit = async () => {
    setLoading(true)

    const { error: wordError } = await supabase
      .from('vocabulary')
      .update({
        italian,
        english,
        part_of_speech: partOfSpeech || null,
        gender: partOfSpeech === 'noun' ? gender : null,
      })
      .eq('id', id)

    if (wordError) {
      setError(wordError.message)
      setLoading(false)
      return
    }

    await supabase.from('examples').delete().eq('vocabulary_id', id)
    const validExamples = examples.filter(e => e.italian && e.english)
    if (validExamples.length > 0) {
      await supabase.from('examples').insert(
        validExamples.map(({ italian, english }) => ({ vocabulary_id: id, italian, english }))
      )
    }

    await supabase.from('word_relations').delete().eq('vocabulary_id', id)
    const validRelations = relations.filter(r => r.related_word)
    if (validRelations.length > 0) {
      await supabase.from('word_relations').insert(
        validRelations.map(({ related_word, type }) => ({ vocabulary_id: id, related_word, type }))
      )
    }

    router.push(`/vocabulary/${id}`)
  }

  const updateExample = (i: number, field: keyof Example, value: string) => {
    const updated = [...examples]
    updated[i] = { ...updated[i], [field]: value }
    setExamples(updated)
  }

  const updateRelation = (i: number, field: keyof Relation, value: string) => {
    const updated = [...relations]
    updated[i] = { ...updated[i], [field]: value }
    setRelations(updated)
  }

  if (loading) return <p>Loading...</p>

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h1>Edit Word</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <section>
        <h2>Word</h2>
        <input placeholder="Italian" value={italian} onChange={e => setItalian(e.target.value)} />
        <input placeholder="English" value={english} onChange={e => setEnglish(e.target.value)} />
        <select value={partOfSpeech} onChange={e => setPartOfSpeech(e.target.value)}>
          <option value="">Part of speech</option>
          <option value="noun">Noun</option>
          <option value="verb">Verb</option>
          <option value="adjective">Adjective</option>
          <option value="adverb">Adverb</option>
        </select>
        {partOfSpeech === 'noun' && (
          <select value={gender} onChange={e => setGender(e.target.value)}>
            <option value="">Gender</option>
            <option value="masculine">Masculine</option>
            <option value="feminine">Feminine</option>
          </select>
        )}
      </section>

      <section>
        <h2>Examples</h2>
        {examples.map((ex, i) => (
          <div key={i}>
            <input placeholder="Italian" value={ex.italian} onChange={e => updateExample(i, 'italian', e.target.value)} />
            <input placeholder="English" value={ex.english} onChange={e => updateExample(i, 'english', e.target.value)} />
            <button onClick={() => setExamples(examples.filter((_, j) => j !== i))}>Remove</button>
          </div>
        ))}
        <button onClick={() => setExamples([...examples, { italian: '', english: '' }])}>+ Add Example</button>
      </section>

      <section>
        <h2>Synonyms / Antonyms / Related</h2>
        {relations.map((rel, i) => (
          <div key={i}>
            <input placeholder="Word" value={rel.related_word} onChange={e => updateRelation(i, 'related_word', e.target.value)} />
            <select value={rel.type} onChange={e => updateRelation(i, 'type', e.target.value as Relation['type'])}>
              <option value="synonym">Synonym</option>
              <option value="antonym">Antonym</option>
              <option value="related">Related</option>
            </select>
            <button onClick={() => setRelations(relations.filter((_, j) => j !== i))}>Remove</button>
          </div>
        ))}
        <button onClick={() => setRelations([...relations, { related_word: '', type: 'synonym' }])}>+ Add Word</button>
      </section>

      {/* ✅ image upload — already has the existing image pre-filled */}
      <ImageUpload
        wordId={id}
        existingUrl={imageUrl}
        onUpload={(url) => setImageUrl(url)}
      />

      <button onClick={handleSubmit} disabled={loading} style={{ marginTop: 24 }}>
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  )
}