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

  const learned  = words?.filter(w => w.learned)  ?? []
  const learning = words?.filter(w => !w.learned) ?? []

  return (
    <div className="flex min-h-screen w-full mx-auto px-6 pt-2 pb-16 gap-10">

      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <aside className="w-72 flex-shrink-0 sticky top-28 self-start max-h-[calc(100vh-120px)] hidden lg:block">
        <div className="bg-white/50 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 shadow-sm">
          <header className="flex items-center justify-between mb-5 px-1">
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
              Mastered
            </h3>
            <span className="text-sm font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full">
              {learned.length}
            </span>
          </header>

          {learned.length === 0 ? (
            <p className="text-sm text-slate-400 italic px-1 leading-relaxed">
              Words you master will appear here.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5 overflow-y-auto pr-1">
              {learned.map(word => (
                <Link
                  key={word.id}
                  href={`/vocabulary/${word.id}`}
                  className="group flex items-center justify-between px-4 py-3 rounded-2xl text-base text-slate-600 transition-all hover:bg-white hover:shadow-sm hover:text-blue-600 no-underline"
                >
                  <span className="font-semibold truncate">{word.italian}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-sm">→</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-5">
          <div>
            <h1 className="text-5xl font-bold text-slate-900 tracking-tight leading-tight">
              My Library
            </h1>
            <p className="text-lg text-slate-500 mt-3 font-medium">
              You are studying{' '}
              <span className="text-blue-600 font-bold">{learning.length}</span>{' '}
              Italian words right now.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/flashcards"
              className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-base font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm no-underline"
            >
              🃏 <span className="hidden sm:inline">Flashcards</span>
            </Link>
            <Link
              href="/vocabulary/new"
              className="flex items-center gap-2.5 px-6 py-3 bg-[#0f172a] text-white rounded-2xl text-base font-semibold hover:bg-slate-800 transition-all shadow-md shadow-blue-900/10 no-underline"
            >
              <span className="text-xl leading-none">+</span> Add Word
            </Link>
          </div>
        </header>

        {/* Empty state */}
        {learning.length === 0 ? (
          <div className="text-center py-28 bg-white/50 border-2 border-dashed border-slate-200 rounded-3xl">
            <div className="text-6xl mb-5">🏆</div>
            <h2 className="text-2xl font-bold text-slate-800">You've cleared your list!</h2>
            <p className="text-lg text-slate-500 mt-3 mb-8">Ready to expand your Italian even further?</p>
            <Link
              href="/vocabulary/new"
              className="px-10 py-4 bg-blue-600 text-white rounded-2xl text-base font-bold hover:bg-blue-500 transition-all no-underline"
            >
              Add New Vocabulary
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {learning.map(word => (
              <div
                key={word.id}
                className="group relative bg-white border border-slate-100 rounded-3xl p-7 flex flex-col hover:shadow-2xl hover:shadow-blue-900/6 hover:-translate-y-1 transition-all duration-300"
              >
                {/* Accent bar */}
                <div className={`absolute top-0 left-8 h-1.5 w-12 rounded-b-full ${
                  word.part_of_speech === 'verb' ? 'bg-rose-400' : 'bg-blue-400'
                }`} />

                {/* Word + badges */}
                <div className="flex justify-between items-start mb-5 mt-2">
                  <div className="min-w-0">
                    <h2 className="text-3xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                      {word.italian}
                    </h2>
                    <p className="text-lg text-slate-500 font-medium italic mt-1.5">
                      {word.english}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0 ml-4">
                    {word.gender && (
                      <span className="text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-500 px-3 py-1.5 rounded-lg">
                        {word.gender}
                      </span>
                    )}
                    {word.part_of_speech && (
                      <span className="text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg">
                        {word.part_of_speech}
                      </span>
                    )}
                  </div>
                </div>

                {/* Example */}
                {word.examples?.length > 0 && (
                  <div className="bg-slate-50 rounded-2xl p-5 mb-5 border border-slate-100">
                    <p className="text-base text-slate-700 leading-relaxed font-medium">
                      "{word.examples[0].italian}"
                    </p>
                    <p className="text-sm text-slate-400 mt-2.5 leading-relaxed">
                      {word.examples[0].english}
                    </p>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-5 border-t border-slate-100">
                  <div className="flex gap-1">
                    <Link
                      href={`/vocabulary/${word.id}`}
                      className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors px-3 py-2 rounded-xl hover:bg-slate-50 no-underline"
                    >
                      Details
                    </Link>
                    <Link
                      href={`/vocabulary/${word.id}/edit`}
                      className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors px-3 py-2 rounded-xl hover:bg-slate-50 no-underline"
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