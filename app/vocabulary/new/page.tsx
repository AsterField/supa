'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Save, Languages, BookOpen, Link as LinkIcon, AlertCircle } from 'lucide-react'


type Example = { italian: string; english: string }
type Relation = { related_word: string; type: 'synonym' | 'antonym' | 'related' }

export default function NewWordPage() {
  const supabase = createClient()
  const router = useRouter()

  const [italian, setItalian] = useState('')
  const [english, setEnglish] = useState('')
  const [partOfSpeech, setPartOfSpeech] = useState('')
  const [gender, setGender] = useState('')
  const [examples, setExamples] = useState<Example[]>([{ italian: '', english: '' }])
  const [relations, setRelations] = useState<Relation[]>([{ related_word: '', type: 'synonym' }])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Example handlers
  const updateExample = (index: number, field: keyof Example, value: string) => {
    const updated = [...examples]
    updated[index][field] = value
    setExamples(updated)
  }
  const addExample = () => setExamples([...examples, { italian: '', english: '' }])
  const removeExample = (index: number) => setExamples(examples.filter((_, i) => i !== index))

  // Relation handlers
  const updateRelation = (index: number, field: keyof Relation, value: string) => {
    const updated = [...relations]
    updated[index] = { ...updated[index], [field]: value }
    setRelations(updated)
  }
  const addRelation = () => setRelations([...relations, { related_word: '', type: 'synonym' }])
  const removeRelation = (index: number) => setRelations(relations.filter((_, i) => i !== index))

  const handleSubmit = async () => {
    if (!italian || !english) return setError('Please fill in both Italian and English fields.')
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/signin')

    const { data: word, error: wordError } = await supabase
      .from('vocabulary')
      .insert({
        user_id: user.id,
        italian,
        english,
        part_of_speech: partOfSpeech || null,
        gender: partOfSpeech === 'noun' ? gender : null,
      })
      .select()
      .single()

    if (wordError) {
      setError(wordError.message)
      setLoading(false)
      return
    }

    const validExamples = examples.filter(e => e.italian && e.english)
    if (validExamples.length > 0) {
      await supabase.from('examples').insert(
        validExamples.map(e => ({ vocabulary_id: word.id, ...e }))
      )
    }

    const validRelations = relations.filter(r => r.related_word)
    if (validRelations.length > 0) {
      await supabase.from('word_relations').insert(
        validRelations.map(r => ({ vocabulary_id: word.id, ...r }))
      )
    }

    router.push('/vocabulary')
  }

  const inputStyles = "w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 placeholder:text-slate-400"
  const labelStyles = "block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 ml-1"
  const sectionStyles = "bg-white p-6 rounded-xl border border-slate-100 shadow-sm mb-6"

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Add New Word</h1>
            <p className="text-slate-500 mt-1">Expand your Italian vocabulary</p>
          </div>
          <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Languages size={24} />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-600 text-sm animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={18} />
            <p>{error}</p>
          </div>
        )}

        {/* Main Word Details */}
        <section className={sectionStyles}>
          <div className="flex items-center gap-2 mb-6 text-slate-800 font-semibold">
            <BookOpen size={18} className="text-indigo-600" />
            <h2>Core Definition</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelStyles}>Italian</label>
              <input
                className={inputStyles}
                placeholder="e.g. Biblioteca"
                value={italian}
                onChange={e => setItalian(e.target.value)}
              />
            </div>
            <div>
              <label className={labelStyles}>English</label>
              <input
                className={inputStyles}
                placeholder="e.g. Library"
                value={english}
                onChange={e => setEnglish(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelStyles}>Part of Speech</label>
              <select className={inputStyles} value={partOfSpeech} onChange={e => setPartOfSpeech(e.target.value)}>
                <option value="">Select category...</option>
                <option value="noun">Noun</option>
                <option value="verb">Verb</option>
                <option value="adjective">Adjective</option>
                <option value="adverb">Adverb</option>
              </select>
            </div>
            {partOfSpeech === 'noun' && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <label className={labelStyles}>Gender</label>
                <select className={inputStyles} value={gender} onChange={e => setGender(e.target.value)}>
                  <option value="">Select gender...</option>
                  <option value="masculine">Masculine</option>
                  <option value="feminine">Feminine</option>
                </select>
              </div>
            )}
          </div>
        </section>

        {/* Examples Section */}
        <section className={sectionStyles}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <Languages size={18} className="text-indigo-600" />
              <h2>Example Sentences</h2>
            </div>
            <button 
              onClick={addExample}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
            >
              <Plus size={14} /> Add New
            </button>
          </div>

          <div className="space-y-4">
  {examples.map((ex, i) => (
    <div key={i} className="group relative grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-start bg-slate-50/50 p-4 rounded-lg border border-slate-100">
      <textarea
        className={`${inputStyles} bg-white resize-none overflow-hidden min-h-[40px]`}
        placeholder="Italian sentence"
        value={ex.italian}
        rows={1}
        onChange={e => {
          updateExample(i, 'italian', e.target.value)
          e.target.style.height = 'auto'
          e.target.style.height = e.target.scrollHeight + 'px'
        }}
        onFocus={e => {
          e.target.style.height = 'auto'
          e.target.style.height = e.target.scrollHeight + 'px'
        }}
      />
      <textarea
        className={`${inputStyles} bg-white resize-none overflow-hidden min-h-[40px]`}
        placeholder="English translation"
        value={ex.english}
        rows={1}
        onChange={e => {
          updateExample(i, 'english', e.target.value)
          e.target.style.height = 'auto'
          e.target.style.height = e.target.scrollHeight + 'px'
        }}
        onFocus={e => {
          e.target.style.height = 'auto'
          e.target.style.height = e.target.scrollHeight + 'px'
        }}
      />
      {examples.length > 1 && (
        <button
          onClick={() => removeExample(i)}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  ))}
</div>
        </section>

        {/* Relations Section */}
        <section className={sectionStyles}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <LinkIcon size={18} className="text-indigo-600" />
              <h2>Word Relations</h2>
            </div>
            <button 
              onClick={addRelation}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
            >
              <Plus size={14} /> Add New
            </button>
          </div>

          <div className="space-y-4">
            {relations.map((rel, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_120px_auto] gap-3 items-start">
                <input
                  className={inputStyles}
                  placeholder="Related word"
                  value={rel.related_word}
                  onChange={e => updateRelation(i, 'related_word', e.target.value)}
                />
                <select
                  className={inputStyles}
                  value={rel.type}
                  onChange={e => updateRelation(i, 'type', e.target.value as Relation['type'])}
                >
                  <option value="synonym">Synonym</option>
                  <option value="antonym">Antonym</option>
                  <option value="related">Related</option>
                </select>
                {relations.length > 1 && (
                  <button 
                    onClick={() => removeRelation(i)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Action Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 text-lg active:scale-[0.98]"
        >
          {loading ? (
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save size={20} />
              Save Vocabulary Word
            </>
          )}
        </button>
      </div>
    </div>
  )
}