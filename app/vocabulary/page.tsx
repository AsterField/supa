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
    .select(`*, examples (*), word_relations (*)`)
    .order('created_at', { ascending: false })

  if (error) return <p className="text-center py-20 text-red-500">Error: {error.message}</p>

  const learned = words?.filter(w => w.learned) ?? []
  const learning = words?.filter(w => !w.learned) ?? []

  return (
    <div className="flex min-h-screen max-w-7xl mx-auto px-6 pt-28 pb-12 gap-10">
      
      {/* ── Left Sidebar (The "Column" look) ─────────────────────────────── */}
      <aside className="w-64 flex-shrink-0 sticky top-28 self-start max-h-[calc(100vh-120px)] hidden lg:block">
        <div className="bg-white/40 backdrop-blur-md border border-slate-200/50 rounded-2xl p-5 shadow-sm">
          <header className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Mastered
            </h3>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              {learned.length}
            </span>
          </header>

          {learned.length === 0 ? (
            <p className="text-xs text-slate-400 italic px-1">Words you master will appear here.</p>
          ) : (
            <div className="flex flex-col gap-1 overflow-y-auto pr-2 custom-scrollbar">
              {learned.map(word => (
                <Link
                  key={word.id}
                  href={`/vocabulary/${word.id}`}
                  className="group flex items-center justify-between px-3 py-2 rounded-xl text-sm text-slate-600 transition-all hover:bg-white hover:shadow-sm hover:text-blue-600"
                >
                  <span className="font-medium truncate">{word.italian}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px]">→</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Content Area ────────────────────────────── */}
      <main className="flex-1 min-w-0">
        
        {/* Modern Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">My Library</h1>
            <p className="text-slate-500 mt-2 font-medium">
              You are currently studying <span className="text-blue-600">{learning.length}</span> new Italian words.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/flashcards"
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
            >
              🃏 <span className="hidden sm:inline">Review Flashcards</span>
            </Link>
            <Link
              href="/vocabulary/new"
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0f172a] text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all shadow-md shadow-blue-900/10"
            >
              <span className="text-lg leading-none">+</span> Add Word
            </Link>
          </div>
        </header>

        {/* Empty State */}
        {learning.length === 0 ? (
          <div className="text-center py-24 bg-white/50 border-2 border-dashed border-slate-200 rounded-3xl">
            <div className="text-5xl mb-4">🏆</div>
            <h2 className="text-xl font-bold text-slate-800">You've cleared your list!</h2>
            <p className="text-slate-500 mt-2 mb-8">Ready to expand your Italian even further?</p>
            <Link
              href="/vocabulary/new"
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-all"
            >
              Add New Vocabulary
            </Link>
          </div>
        ) : (
          /* Learning Words Grid */
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {learning.map(word => (
              <div
                key={word.id}
                className="group relative bg-white border border-slate-100 rounded-2xl p-5 flex flex-col hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300"
              >
                {/* Accent line for part of speech */}
                <div className={`absolute top-0 left-6 h-1 w-8 rounded-b-full ${
                  word.part_of_speech === 'verb' ? 'bg-rose-400' : 'bg-blue-400'
                }`} />

                <div className="flex justify-between items-start mb-4 mt-2">
                  <div className="min-w-0">
                    <h2 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {word.italian}
                    </h2>
                    <p className="text-slate-500 font-medium italic mt-0.5">{word.english}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    {word.gender && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-500 px-2 py-1 rounded-md">
                        {word.gender}
                      </span>
                    )}
                    {word.part_of_speech && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-1 rounded-md">
                        {word.part_of_speech}
                      </span>
                    )}
                  </div>
                </div>

                {/* Example Preview */}
                {word.examples?.length > 0 && (
                  <div className="bg-slate-50/80 rounded-xl p-4 mb-4 border border-slate-100/50">
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                      “{word.examples[0].italian}”
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      {word.examples[0].english}
                    </p>
                  </div>
                )}

                {/* Actions Footer */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                  <div className="flex gap-2">
                    <Link
                      href={`/vocabulary/${word.id}`}
                      className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors px-2 py-1"
                    >
                      Details
                    </Link>
                    <Link
                      href={`/vocabulary/${word.id}/edit`}
                      className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors px-2 py-1"
                    >
                      Edit
                    </Link>
                  </div>
                  <WordActions wordId={word.id} learned={word.learned} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}