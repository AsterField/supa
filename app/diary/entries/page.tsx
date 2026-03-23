'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
const supabase = createClient()

// ── Types ─────────────────────────────────────────────────────────────────────

interface DiaryEntry {
  id: string
  date: string
  weather: string | null
  emotions: string[]
  activities: string[]
  food: string[]
  social: string[]
  mood_score: number | null
  energy: number | null
  sleep_hours: number | null
  sleep_quality: number | null
  words_studied: number
  study_minutes: number
  note: string | null
  photo_url: string | null
}

// ── Maps ──────────────────────────────────────────────────────────────────────

const WEATHER_EMOJI: Record<string, string> = {
  sunny: '☀️', cloudy: '☁️', rainy: '🌧️', windy: '🌬️',
  snowy: '❄️', stormy: '⛈️', foggy: '🌫️',
}

const MOOD_COLOR: Record<number, string> = {
  1: 'bg-red-100 text-red-600',
  2: 'bg-orange-100 text-orange-600',
  3: 'bg-yellow-100 text-yellow-700',
  4: 'bg-lime-100 text-lime-700',
  5: 'bg-emerald-100 text-emerald-700',
}

const MOOD_LABEL: Record<number, string> = {
  1: 'Awful', 2: 'Bad', 3: 'Okay', 4: 'Good', 5: 'Great',
}

const MOOD_BAR: Record<number, string> = {
  1: 'bg-red-400', 2: 'bg-orange-400', 3: 'bg-yellow-400',
  4: 'bg-lime-500', 5: 'bg-emerald-500',
}

// ── Detail modal ──────────────────────────────────────────────────────────────

function DetailModal({ entry, onClose }: { entry: DiaryEntry; onClose: () => void }) {
  const date = new Date(entry.date + 'T12:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-stone-200 rounded-full" />
        </div>

        {/* Photo header */}
        {entry.photo_url ? (
          <div className="relative h-48 overflow-hidden rounded-t-3xl sm:rounded-t-3xl">
            <img src={entry.photo_url} alt={date} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5">
              <p className="text-white font-bold text-xl tracking-tight">{date}</p>
            </div>
            <button onClick={onClose} className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm backdrop-blur-sm transition-colors">✕</button>
          </div>
        ) : (
          <div className="flex items-center justify-between px-5 pt-5 pb-2">
            <p className="font-bold text-lg text-stone-800 tracking-tight">{date}</p>
            <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-xl leading-none cursor-pointer">✕</button>
          </div>
        )}

        <div className="px-5 pb-6 pt-4 space-y-4">

          {/* Quick stats row */}
          <div className="grid grid-cols-4 gap-2">
            {entry.mood_score && (
              <div className={`rounded-2xl p-3 text-center ${MOOD_COLOR[entry.mood_score]}`}>
                <p className="text-xs font-medium opacity-70">Mood</p>
                <p className="font-bold text-lg">{entry.mood_score}</p>
                <p className="text-[10px] font-medium">{MOOD_LABEL[entry.mood_score]}</p>
              </div>
            )}
            {entry.energy && (
              <div className="rounded-2xl p-3 text-center bg-blue-50 text-blue-600">
                <p className="text-xs font-medium opacity-70">Energy</p>
                <p className="font-bold text-lg">{entry.energy}</p>
                <p className="text-[10px] font-medium">/5</p>
              </div>
            )}
            {entry.sleep_hours && (
              <div className="rounded-2xl p-3 text-center bg-indigo-50 text-indigo-600">
                <p className="text-xs font-medium opacity-70">Sleep</p>
                <p className="font-bold text-lg">{entry.sleep_hours}h</p>
                <p className="text-[10px] font-medium">Q: {entry.sleep_quality ?? '—'}</p>
              </div>
            )}
            {(entry.words_studied > 0 || entry.study_minutes > 0) && (
              <div className="rounded-2xl p-3 text-center bg-emerald-50 text-emerald-700">
                <p className="text-xs font-medium opacity-70">Study</p>
                <p className="font-bold text-lg">{entry.words_studied}</p>
                <p className="text-[10px] font-medium">{entry.study_minutes}min</p>
              </div>
            )}
          </div>

          {/* Emotions */}
          {entry.emotions?.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-2">Emotions</p>
              <div className="flex flex-wrap gap-1.5">
                {entry.emotions.map(e => (
                  <span key={e} className="bg-amber-50 border border-amber-200 text-amber-700 text-xs px-2.5 py-1 rounded-full font-medium capitalize">{e}</span>
                ))}
              </div>
            </div>
          )}

          {/* Activities */}
          {entry.activities?.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-2">Activities</p>
              <div className="flex flex-wrap gap-1.5">
                {entry.activities.map(a => (
                  <span key={a} className="bg-violet-50 border border-violet-200 text-violet-700 text-xs px-2.5 py-1 rounded-full font-medium capitalize">{a}</span>
                ))}
              </div>
            </div>
          )}

          {/* Food */}
          {entry.food?.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-2">Food & drink</p>
              <div className="flex flex-wrap gap-1.5">
                {entry.food.map(f => (
                  <span key={f} className="bg-orange-50 border border-orange-200 text-orange-700 text-xs px-2.5 py-1 rounded-full font-medium capitalize">{f}</span>
                ))}
              </div>
            </div>
          )}

          {/* Social */}
          {entry.social?.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-2">Social</p>
              <div className="flex flex-wrap gap-1.5">
                {entry.social.map(s => (
                  <span key={s} className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-2.5 py-1 rounded-full font-medium capitalize">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Note */}
          {entry.note && (
            <div className="bg-stone-50 rounded-2xl px-4 py-3 border border-stone-100">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-1.5">Note</p>
              <p className="text-sm text-stone-700 leading-relaxed">{entry.note}</p>
            </div>
          )}

          {/* Link to edit */}
          <Link
            href={`/diary?date=${entry.date}`}
            className="flex items-center justify-center gap-2 w-full py-3 bg-stone-900 text-white rounded-2xl text-sm font-semibold hover:bg-stone-700 transition-colors no-underline"
          >
            ✏️ Edit this entry
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Entry card ────────────────────────────────────────────────────────────────

function EntryCard({ entry, onClick }: { entry: DiaryEntry; onClick: () => void }) {
  const d    = new Date(entry.date + 'T12:00:00')
  const day  = d.toLocaleDateString('en-GB', { weekday: 'short' })
  const num  = d.getDate()
  const mon  = d.toLocaleDateString('en-GB', { month: 'short' })
  const mood = entry.mood_score ?? 3

  return (
    <button
      onClick={onClick}
      className="w-full bg-white border border-stone-100 rounded-2xl p-4 text-left hover:border-stone-200 hover:shadow-md transition-all group cursor-pointer"
    >
      <div className="flex items-start gap-4">
        {/* Date block */}
        <div className="flex flex-col items-center w-10 shrink-0">
          <span className="text-[10px] font-semibold text-stone-400 uppercase">{day}</span>
          <span className="text-2xl font-black text-stone-800 leading-tight">{num}</span>
          <span className="text-[10px] text-stone-400 uppercase">{mon}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {entry.weather && <span className="text-lg">{WEATHER_EMOJI[entry.weather] ?? '🌤️'}</span>}
            {entry.mood_score && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${MOOD_COLOR[entry.mood_score]}`}>
                {MOOD_LABEL[entry.mood_score]}
              </span>
            )}
            {entry.sleep_hours && (
              <span className="text-xs text-stone-400 font-mono">😴 {entry.sleep_hours}h</span>
            )}
            {(entry.words_studied > 0) && (
              <span className="text-xs text-emerald-600 font-mono">🇮🇹 {entry.words_studied}w</span>
            )}
          </div>

          {/* Mood bar */}
          <div className="h-1 bg-stone-100 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all ${MOOD_BAR[mood]}`}
              style={{ width: `${(mood / 5) * 100}%` }}
            />
          </div>

          {/* Chips preview */}
          <div className="flex flex-wrap gap-1">
            {[...entry.emotions.slice(0, 2), ...entry.activities.slice(0, 2)].map((tag, i) => (
              <span key={i} className="text-[10px] text-stone-500 bg-stone-50 border border-stone-100 px-2 py-0.5 rounded-full capitalize">{tag}</span>
            ))}
            {entry.note && (
              <span className="text-[10px] text-stone-400 italic truncate max-w-[150px]">"{entry.note.slice(0, 40)}{entry.note.length > 40 ? '…' : ''}"</span>
            )}
          </div>
        </div>

        {/* Photo thumbnail */}
        {entry.photo_url && (
          <img src={entry.photo_url} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform" />
        )}

        <span className="text-stone-300 group-hover:text-stone-500 transition-colors shrink-0 self-center">›</span>
      </div>
    </button>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DiaryEntriesPage() {
  const [entries,  setEntries]  = useState<DiaryEntry[]>([])
  const [loading,  setLoading]  = useState(true)
  const [selected, setSelected] = useState<DiaryEntry | null>(null)
  const [filter,   setFilter]   = useState<'all' | 'week' | 'month'>('all')

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .order('date', { ascending: false })
      if (!error && data) setEntries(data)
      setLoading(false)
    }
    load()
  }, [])

  const now = new Date()
  const filtered = entries.filter(e => {
    if (filter === 'week') {
      const d = new Date(e.date)
      return (now.getTime() - d.getTime()) / 86400000 <= 7
    }
    if (filter === 'month') {
      const d = new Date(e.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }
    return true
  })

  // Stats
  const avgMood    = filtered.length ? (filtered.reduce((s, e) => s + (e.mood_score ?? 0), 0) / filtered.filter(e => e.mood_score).length).toFixed(1) : '—'
  const totalWords = filtered.reduce((s, e) => s + (e.words_studied ?? 0), 0)
  const totalMins  = filtered.reduce((s, e) => s + (e.study_minutes ?? 0), 0)
  const avgSleep   = filtered.filter(e => e.sleep_hours).length
    ? (filtered.reduce((s, e) => s + (e.sleep_hours ?? 0), 0) / filtered.filter(e => e.sleep_hours).length).toFixed(1)
    : '—'

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      <div className="max-w-xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-800 tracking-tight">My diary</h1>
            <p className="text-stone-400 text-sm mt-0.5">{entries.length} entries total</p>
          </div>
          <Link
            href="/diary"
            className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded-xl text-sm font-semibold hover:bg-stone-700 transition-colors no-underline shadow-sm"
          >
            + New entry
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 bg-stone-100 p-1 rounded-2xl mb-5">
          {(['all', 'month', 'week'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                filter === f ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              {f === 'all' ? 'All time' : f === 'month' ? 'This month' : 'This week'}
            </button>
          ))}
        </div>

        {/* Stats strip */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-5">
            {[
              { label: 'Avg mood',  value: avgMood,                    color: 'text-amber-600',   bg: 'bg-amber-50'   },
              { label: 'Avg sleep', value: avgSleep ? `${avgSleep}h` : '—', color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'Words',     value: totalWords.toLocaleString(), color: 'text-emerald-700', bg: 'bg-emerald-50' },
              { label: 'Study min', value: totalMins.toLocaleString(),  color: 'text-violet-600',  bg: 'bg-violet-50'  },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} rounded-2xl p-3 text-center`}>
                <p className={`font-black text-base ${color}`}>{value}</p>
                <p className="text-[10px] text-stone-400 font-medium mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-3 py-20">
            <div className="w-8 h-8 rounded-full border-2 border-stone-200 border-t-stone-600 animate-spin" />
            <p className="text-stone-400 text-sm">Loading entries…</p>
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">📓</p>
            <p className="text-stone-600 font-semibold">No entries yet</p>
            <p className="text-stone-400 text-sm mt-1">Start writing your first diary entry</p>
            <Link href="/diary" className="inline-block mt-4 px-5 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-semibold hover:bg-stone-700 transition-colors no-underline">
              Write today's entry
            </Link>
          </div>
        )}

        {/* Entries list */}
        {!loading && filtered.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {filtered.map(entry => (
              <EntryCard key={entry.id} entry={entry} onClick={() => setSelected(entry)} />
            ))}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && <DetailModal entry={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}