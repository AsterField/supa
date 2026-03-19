import Link from 'next/link'
// app/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  console.log('Dashboard auth check:', { user: user?.email, error })  // ← add this
  
  if (!user) redirect('/signin')
  
  // ... rest of page

  const { data: words } = await supabase
    .from('vocabulary')
    .select('*, examples(*)')

  const today = new Date().toISOString().split('T')[0]
  const { data: todayEntry } = await supabase
    .from('diary_entries')
    .select('mood_score, energy, words_studied, study_minutes')
    .eq('date', today)
    .single()

  const { data: recentEntries } = await supabase
    .from('diary_entries')
    .select('date')
    .order('date', { ascending: false })
    .limit(60)

  const total          = words?.length ?? 0
  const learned        = words?.filter(w => w.learned).length ?? 0
  const unlearned      = words?.filter(w => !w.learned).length ?? 0
  const totalReviews   = words?.reduce((sum, w) => sum + (w.times_reviewed ?? 0), 0) ?? 0
  const totalExamples  = words?.reduce((sum, w) => sum + (w.examples?.length ?? 0), 0) ?? 0
  const progressPct    = total > 0 ? Math.round((learned / total) * 100) : 0

  const MOOD_EMOJI: Record<number, string> = {
    1: '😞', 2: '😕', 3: '😐', 4: '🙂', 5: '😄'
  }

  // Streak
  let streak = 0
  if (recentEntries?.length) {
    const dateSet = new Set(recentEntries.map(e => e.date))
    const cursor = new Date()
    while (true) {
      const d = cursor.toISOString().split('T')[0]
      if (dateSet.has(d)) { streak++; cursor.setDate(cursor.getDate() - 1) }
      else break
    }
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const firstName = user.email?.split('@')[0] ?? 'there'

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-stone-800 tracking-tight">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-stone-400 text-sm mt-1">
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* ── Top stat row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total words',   value: total,        icon: '📚', href: '/vocabulary'  },
          { label: 'Learned',       value: learned,      icon: '✅', href: '/vocabulary'  },
          { label: 'To learn',      value: unlearned,    icon: '⏳', href: '/flashcards'  },
          { label: 'Study streak',  value: `${streak}🔥`, icon: null, href: '/diary'      },
        ].map(card => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white border border-stone-200 rounded-2xl p-5 no-underline hover:border-stone-300 hover:shadow-sm transition-all group"
          >
            <p className="text-xs text-stone-400 uppercase tracking-widest font-medium mb-2">
              {card.label}
            </p>
            <p className="text-3xl font-semibold text-stone-800 leading-none">
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      {/* ── Progress bar ─────────────────────────────────────────────── */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs text-stone-400 uppercase tracking-widest font-medium">
            Overall progress
          </p>
          <p className="text-sm font-semibold text-stone-700">{progressPct}%</p>
        </div>
        <div className="bg-stone-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-emerald-400 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-xs text-stone-400 mt-2">
          {learned} of {total} words learned
        </p>
      </div>

      {/* ── Two columns ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

        {/* Today's diary */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6">
          <p className="text-xs text-stone-400 uppercase tracking-widest font-medium mb-4">
            Today's diary
          </p>
          {todayEntry ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{MOOD_EMOJI[todayEntry.mood_score] ?? '😐'}</span>
                <div>
                  <p className="text-sm font-medium text-stone-700">Mood {todayEntry.mood_score}/5</p>
                  <p className="text-xs text-stone-400">Energy {todayEntry.energy}/5</p>
                </div>
              </div>
              {todayEntry.words_studied > 0 && (
                <p className="text-xs text-stone-400 bg-stone-50 rounded-lg px-3 py-2">
                  🇮🇹 {todayEntry.words_studied} words · {todayEntry.study_minutes} min studied
                </p>
              )}
              <Link href="/diary" className="text-xs text-stone-400 no-underline hover:text-stone-600 transition-colors">
                View entry →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-stone-400">No entry yet today</p>
              <Link
                href="/diary/new"
                className="text-xs bg-stone-800 text-white px-3 py-2 rounded-lg no-underline hover:bg-stone-700 transition-colors text-center"
              >
                + Log today
              </Link>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6">
          <p className="text-xs text-stone-400 uppercase tracking-widest font-medium mb-4">
            All time
          </p>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Total reviews', value: totalReviews },
              { label: 'Examples',      value: totalExamples },
              { label: 'Completion',    value: `${progressPct}%` },
            ].map(stat => (
              <div key={stat.label} className="flex justify-between items-center">
                <span className="text-sm text-stone-500">{stat.label}</span>
                <span className="text-sm font-semibold text-stone-800">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6">
          <p className="text-xs text-stone-400 uppercase tracking-widest font-medium mb-4">
            Quick actions
          </p>
          <div className="flex flex-col gap-2">
            {[
              { label: '🃏 Study flashcards', href: '/flashcards'    },
              { label: '+ Add word',          href: '/vocabulary/new' },
              { label: '📖 All vocabulary',   href: '/vocabulary'     },
              { label: '📔 Diary',            href: '/diary'          },
            ].map(action => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-stone-600 no-underline hover:bg-stone-50 hover:text-stone-900 transition-colors border border-transparent hover:border-stone-200"
              >
                <span>{action.label}</span>
                <span className="text-stone-300 text-xs">→</span>
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* ── Recently added ───────────────────────────────────────────── */}
      {words && words.length > 0 && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6">
          <p className="text-xs text-stone-400 uppercase tracking-widest font-medium mb-4">
            Recently added
          </p>
          <div className="flex flex-col gap-1">
            {words.slice(0, 6).map(word => (
              <Link
                key={word.id}
                href={`/vocabulary/${word.id}`}
                className="flex justify-between items-center px-3 py-2.5 rounded-xl no-underline hover:bg-stone-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-stone-700">{word.italian}</span>
                  <span className="text-stone-300 text-xs">—</span>
                  <span className="text-sm text-stone-400">{word.english}</span>
                </div>
                <span className="text-xs">{word.learned ? '✅' : '⏳'}</span>
              </Link>
            ))}
          </div>
          <Link
            href="/vocabulary"
            className="block text-center text-xs text-stone-400 no-underline hover:text-stone-600 mt-3 pt-3 border-t border-stone-100 transition-colors"
          >
            View all {total} words →
          </Link>
        </div>
      )}

    </div>
  )
}