'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
const supabase = createClient()

// ── Types ─────────────────────────────────────────────────────────────────────

interface DiaryEntry {
  date: string
  weather: string | null
  emotions: string[]
  activities: string[]
  food: string[]
  social: string[]
  mood_score: number
  energy: number
  sleep_hours: number | null
  sleep_quality: number | null
  words_studied: number
  study_minutes: number
  note: string | null
  photo_url: string | null
}

// ── Static data ───────────────────────────────────────────────────────────────

const WEATHER = [
  { val: 'sunny',  emoji: '☀️',  label: 'Sunny'  },
  { val: 'cloudy', emoji: '☁️',  label: 'Cloudy' },
  { val: 'rainy',  emoji: '🌧️', label: 'Rainy'  },
  { val: 'windy',  emoji: '🌬️', label: 'Windy'  },
  { val: 'snowy',  emoji: '❄️',  label: 'Snowy'  },
  { val: 'stormy', emoji: '⛈️', label: 'Stormy' },
  { val: 'foggy',  emoji: '🌫️', label: 'Foggy'  },
]

const EMOTIONS = [
  { val: 'happy',     emoji: '😊', label: 'Happy'     },
  { val: 'excited',   emoji: '🤩', label: 'Excited'   },
  { val: 'calm',      emoji: '😌', label: 'Calm'      },
  { val: 'grateful',  emoji: '🙏', label: 'Grateful'  },
  { val: 'loved',     emoji: '🥰', label: 'Loved'     },
  { val: 'motivated', emoji: '🔥', label: 'Motivated' },
  { val: 'tired',     emoji: '😴', label: 'Tired'     },
  { val: 'sad',       emoji: '😢', label: 'Sad'       },
  { val: 'anxious',   emoji: '😰', label: 'Anxious'   },
  { val: 'angry',     emoji: '😤', label: 'Angry'     },
  { val: 'bored',     emoji: '😑', label: 'Bored'     },
  { val: 'stressed',  emoji: '😫', label: 'Stressed'  },
]

const ACTIVITIES = [
  { val: 'walking',    emoji: '🚶', label: 'Walking'    },
  { val: 'running',    emoji: '🏃', label: 'Running'    },
  { val: 'gym',        emoji: '💪', label: 'Gym'        },
  { val: 'cycling',    emoji: '🚴', label: 'Cycling'    },
  { val: 'swimming',   emoji: '🏊', label: 'Swimming'   },
  { val: 'cooking',    emoji: '🍳', label: 'Cooking'    },
  { val: 'reading',    emoji: '📚', label: 'Reading'    },
  { val: 'working',    emoji: '💼', label: 'Working'    },
  { val: 'studying',   emoji: '📖', label: 'Studying'   },
  { val: 'gaming',     emoji: '🎮', label: 'Gaming'     },
  { val: 'shopping',   emoji: '🛍️', label: 'Shopping'   },
  { val: 'meditating', emoji: '🧘', label: 'Meditating' },
  { val: 'traveling',  emoji: '✈️', label: 'Traveling'  },
  { val: 'cleaning',   emoji: '🧹', label: 'Cleaning'   },
]

const FOOD = [
  { val: 'homemade',   emoji: '🏠', label: 'Homemade'   },
  { val: 'restaurant', emoji: '🍽️', label: 'Restaurant' },
  { val: 'pizza',      emoji: '🍕', label: 'Pizza'      },
  { val: 'pasta',      emoji: '🍝', label: 'Pasta'      },
  { val: 'salad',      emoji: '🥗', label: 'Salad'      },
  { val: 'sushi',      emoji: '🍣', label: 'Sushi'      },
  { val: 'coffee',     emoji: '☕', label: 'Coffee'     },
  { val: 'fastfood',   emoji: '🍔', label: 'Fast food'  },
  { val: 'healthy',    emoji: '🥦', label: 'Healthy'    },
  { val: 'sweets',     emoji: '🍰', label: 'Sweets'     },
  { val: 'alcohol',    emoji: '🍷', label: 'Alcohol'    },
]

const SOCIAL = [
  { val: 'alone',      emoji: '🧍',    label: 'Alone'      },
  { val: 'family',     emoji: '👨‍👩‍👧', label: 'Family'     },
  { val: 'friends',    emoji: '👫',    label: 'Friends'    },
  { val: 'partner',    emoji: '❤️',   label: 'Partner'    },
  { val: 'colleagues', emoji: '👥',    label: 'Colleagues' },
]

const MOOD_LABELS: Record<number, string> = { 1: 'Awful', 2: 'Bad', 3: 'Okay', 4: 'Good', 5: 'Great' }
const ENERGY_LABELS: Record<number, string> = { 1: 'Drained', 2: 'Low', 3: 'Okay', 4: 'High', 5: 'Peak' }

const WEATHER_MAP = Object.fromEntries(WEATHER.map(w => [w.val, w.emoji]))

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ icon, children }: { icon?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon && <span className="text-base">{icon}</span>}
      <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">{children}</p>
    </div>
  )
}

function Divider() {
  return <hr className="border-t border-stone-100 my-5" />
}

function WeatherPicker({ value, onChange }: { value: string | null; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {WEATHER.map(w => (
        <button key={w.val} type="button" onClick={() => onChange(w.val)}
          className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-2xl border text-xs font-medium transition-all ${
            value === w.val
              ? 'bg-sky-500 border-sky-500 text-white shadow-md shadow-sky-200'
              : 'bg-white border-stone-200 text-stone-500 hover:border-sky-200 hover:bg-sky-50'
          }`}
        >
          <span className="text-xl">{w.emoji}</span>
          {w.label}
        </button>
      ))}
    </div>
  )
}

function ChipGroup({ items, selected, onChange, color = 'emerald' }: {
  items: { val: string; emoji: string; label: string }[]
  selected: string[]
  onChange: (v: string[]) => void
  color?: 'emerald' | 'amber' | 'violet' | 'rose' | 'orange'
}) {
  const toggle = (val: string) =>
    onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val])

  const activeClass: Record<string, string> = {
    emerald: 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-200',
    amber:   'bg-amber-400 border-amber-400 text-white shadow-sm shadow-amber-200',
    violet:  'bg-violet-500 border-violet-500 text-white shadow-sm shadow-violet-200',
    rose:    'bg-rose-500 border-rose-500 text-white shadow-sm shadow-rose-200',
    orange:  'bg-orange-500 border-orange-500 text-white shadow-sm shadow-orange-200',
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map(item => (
        <button key={item.val} type="button" onClick={() => toggle(item.val)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
            selected.includes(item.val)
              ? activeClass[color]
              : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50'
          }`}
        >
          <span>{item.emoji}</span> {item.label}
        </button>
      ))}
    </div>
  )
}

function ScaleRow({ label, value, onChange, labels }: {
  label: string; value: number; onChange: (v: number) => void; labels: Record<number, string>
}) {
  const colors = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-lime-500', 'bg-emerald-500']
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-stone-500 w-16 shrink-0">{label}</span>
      <div className="flex gap-1.5 flex-1">
        {[1,2,3,4,5].map(d => (
          <button key={d} type="button" onClick={() => onChange(d)}
            className={`flex-1 h-9 rounded-xl text-xs font-bold transition-all ${
              value === d
                ? `${colors[d]} text-white shadow-sm`
                : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
            }`}
          >
            {d}
          </button>
        ))}
      </div>
      <span className="text-xs text-stone-400 w-14 text-right">{labels[value]}</span>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function DiaryEntryPage() {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate]               = useState(today)
  const [weather, setWeather]         = useState<string | null>(null)
  const [emotions, setEmotions]       = useState<string[]>([])
  const [activities, setActivities]   = useState<string[]>([])
  const [food, setFood]               = useState<string[]>([])
  const [social, setSocial]           = useState<string[]>([])
  const [mood, setMood]               = useState(3)
  const [energy, setEnergy]           = useState(3)
  const [sleepHours, setSleepHours]   = useState('')
  const [sleepQuality, setSleepQuality] = useState(3)
  const [wordsStudied, setWordsStudied] = useState('')
  const [studyMinutes, setStudyMinutes] = useState('')
  const [note, setNote]               = useState('')
  const [photoFile, setPhotoFile]     = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [saving, setSaving]           = useState(false)
  const [saved, setSaved]             = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const photoRef                      = useRef<HTMLInputElement>(null)

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = ev => setPhotoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const uploadPhoto = async (userId: string): Promise<string | null> => {
    if (!photoFile) return null
    const ext  = photoFile.name.split('.').pop()
    const path = `${userId}/${date}.${ext}`
    const { error } = await supabase.storage.from('diary-photos').upload(path, photoFile, { upsert: true })
    if (error) { console.error(error); return null }
    return supabase.storage.from('diary-photos').getPublicUrl(path).data.publicUrl
  }

  const handleSave = async () => {
    setSaving(true); setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const photoUrl = await uploadPhoto(user.id)
      const entry: DiaryEntry & { user_id: string } = {
        user_id: user.id, date, weather, emotions, activities, food, social,
        mood_score: mood, energy,
        sleep_hours: sleepHours ? parseFloat(sleepHours) : null,
        sleep_quality: sleepQuality,
        words_studied: wordsStudied ? parseInt(wordsStudied) : 0,
        study_minutes: studyMinutes ? parseInt(studyMinutes) : 0,
        note: note || null, photo_url: photoUrl,
      }
      const { error: dbError } = await supabase
        .from('diary_entries').upsert(entry, { onConflict: 'user_id,date' })
      if (dbError) throw dbError
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const completionItems = [
    weather, emotions.length, activities.length, food.length, social.length,
    sleepHours, wordsStudied || studyMinutes,
  ]
  const completion = Math.round((completionItems.filter(Boolean).length / completionItems.length) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      <div className="max-w-xl mx-auto px-4 py-8 pb-24">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-800 tracking-tight">Today's entry</h1>
            <p className="text-stone-400 text-sm mt-0.5">{formattedDate}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/diary/entries"
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-50 hover:border-stone-300 transition-all no-underline shadow-sm"
            >
              📋 View entries
            </Link>
            <input
              type="date" value={date}
              onChange={e => setDate(e.target.value)}
              className="text-sm border border-stone-200 rounded-xl px-3 py-2 bg-white text-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-300 shadow-sm"
            />
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-stone-400 font-medium">Entry completion</span>
            <span className="text-xs font-bold text-stone-600">{completion}%</span>
          </div>
          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">

          {/* Weather */}
          <div className="p-5 sm:p-6">
            <SectionLabel icon="🌤️">Weather</SectionLabel>
            <WeatherPicker value={weather} onChange={setWeather} />
          </div>

          <Divider />

          {/* Emotions */}
          <div className="px-5 sm:px-6 pb-5 sm:pb-6">
            <SectionLabel icon="💭">How do you feel?</SectionLabel>
            <ChipGroup items={EMOTIONS} selected={emotions} onChange={setEmotions} color="amber" />
          </div>

          <Divider />

          {/* Mood & Energy */}
          <div className="px-5 sm:px-6 pb-5 sm:pb-6">
            <SectionLabel icon="⚡">Mood & energy</SectionLabel>
            <div className="space-y-3">
              <ScaleRow label="Mood"   value={mood}   onChange={setMood}   labels={MOOD_LABELS} />
              <ScaleRow label="Energy" value={energy} onChange={setEnergy} labels={ENERGY_LABELS} />
            </div>
          </div>

          <Divider />

          {/* Activities */}
          <div className="px-5 sm:px-6 pb-5 sm:pb-6">
            <SectionLabel icon="🏃">Activities</SectionLabel>
            <ChipGroup items={ACTIVITIES} selected={activities} onChange={setActivities} color="violet" />
          </div>

          <Divider />

          {/* Food */}
          <div className="px-5 sm:px-6 pb-5 sm:pb-6">
            <SectionLabel icon="🍽️">Food & drink</SectionLabel>
            <ChipGroup items={FOOD} selected={food} onChange={setFood} color="orange" />
          </div>

          <Divider />

          {/* Social */}
          <div className="px-5 sm:px-6 pb-5 sm:pb-6">
            <SectionLabel icon="👥">Social</SectionLabel>
            <ChipGroup items={SOCIAL} selected={social} onChange={setSocial} color="rose" />
          </div>

          <Divider />

          {/* Sleep */}
          <div className="px-5 sm:px-6 pb-5 sm:pb-6">
            <SectionLabel icon="😴">Sleep</SectionLabel>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs text-stone-400 block mb-1.5">Hours slept</label>
                <input
                  type="number" min="0" max="24" step="0.5" placeholder="7.5"
                  value={sleepHours} onChange={e => setSleepHours(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 bg-stone-50"
                />
              </div>
              <div>
                <label className="text-xs text-stone-400 block mb-1.5">Sleep quality</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(d => (
                    <button key={d} type="button" onClick={() => setSleepQuality(d)}
                      className={`flex-1 h-10 rounded-xl text-xs font-bold transition-all ${
                        sleepQuality === d ? 'bg-indigo-500 text-white' : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                      }`}
                    >{d}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Divider />

          {/* Italian study */}
          <div className="px-5 sm:px-6 pb-5 sm:pb-6">
            <SectionLabel icon="🇮🇹">Italian study</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-stone-400 block mb-1.5">Words studied</label>
                <input
                  type="number" min="0" placeholder="0"
                  value={wordsStudied} onChange={e => setWordsStudied(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 bg-stone-50"
                />
              </div>
              <div>
                <label className="text-xs text-stone-400 block mb-1.5">Minutes studied</label>
                <input
                  type="number" min="0" placeholder="0"
                  value={studyMinutes} onChange={e => setStudyMinutes(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 bg-stone-50"
                />
              </div>
            </div>
          </div>

          <Divider />

          {/* Photo */}
          <div className="px-5 sm:px-6 pb-5 sm:pb-6">
            <SectionLabel icon="📷">Photo of the day</SectionLabel>
            {photoPreview ? (
              <div className="relative rounded-2xl overflow-hidden">
                <img src={photoPreview} alt="Preview" className="w-full h-52 object-cover" />
                <button
                  type="button"
                  onClick={() => { setPhotoPreview(null); setPhotoFile(null) }}
                  className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white text-xs px-3 py-1.5 rounded-lg transition-colors backdrop-blur-sm"
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button" onClick={() => photoRef.current?.click()}
                className="w-full border-2 border-dashed border-stone-200 rounded-2xl py-10 text-center hover:border-stone-300 hover:bg-stone-50 transition-all group"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📷</div>
                <p className="text-sm text-stone-400">Tap to add a photo</p>
              </button>
            )}
            <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </div>

          <Divider />

          {/* Note */}
          <div className="px-5 sm:px-6 pb-6">
            <SectionLabel icon="✏️">Note</SectionLabel>
            <textarea
              value={note} onChange={e => setNote(e.target.value)}
              placeholder="Anything else about today..."
              rows={4}
              className="w-full border border-stone-200 rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-stone-300 placeholder:text-stone-300 bg-stone-50 leading-relaxed"
            />
          </div>
        </div>

        {/* Save */}
        <div className="mt-4 space-y-3">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3">{error}</div>
          )}
          {saved && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-2xl px-4 py-3 text-center font-semibold">
              ✓ Entry saved successfully
            </div>
          )}
          <button
            type="button" onClick={handleSave} disabled={saving}
            className="w-full bg-stone-900 text-white py-4 rounded-2xl font-semibold text-sm hover:bg-stone-800 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-stone-200"
          >
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save entry'}
          </button>
        </div>
      </div>
    </div>
  )
}