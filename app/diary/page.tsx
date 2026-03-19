'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
const supabase = createClient()

// ── Types ────────────────────────────────────────────────────────────────────

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
  { val: 'sunny',   emoji: '☀️',  label: 'Sunny'  },
  { val: 'cloudy',  emoji: '☁️',  label: 'Cloudy' },
  { val: 'rainy',   emoji: '🌧️', label: 'Rainy'  },
  { val: 'windy',   emoji: '🌬️', label: 'Windy'  },
  { val: 'snowy',   emoji: '❄️',  label: 'Snowy'  },
  { val: 'stormy',  emoji: '⛈️', label: 'Stormy' },
  { val: 'foggy',   emoji: '🌫️', label: 'Foggy'  },
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

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium uppercase tracking-widest text-stone-400 mb-3">
      {children}
    </p>
  )
}

function Divider() {
  return <hr className="border-t border-stone-100 my-6" />
}

interface WeatherPickerProps {
  value: string | null
  onChange: (val: string) => void
}

function WeatherPicker({ value, onChange }: WeatherPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {WEATHER.map(w => (
        <button
          key={w.val}
          type="button"
          onClick={() => onChange(w.val)}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border text-xs transition-all
            ${value === w.val
              ? 'bg-sky-50 border-sky-300 text-sky-700'
              : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300 hover:bg-stone-50'
            }`}
        >
          <span className="text-xl">{w.emoji}</span>
          {w.label}
        </button>
      ))}
    </div>
  )
}

interface ChipGroupProps {
  items: { val: string; emoji: string; label: string }[]
  selected: string[]
  onChange: (vals: string[]) => void
  variant?: 'emotion' | 'chip'
}

function ChipGroup({ items, selected, onChange, variant = 'chip' }: ChipGroupProps) {
  const toggle = (val: string) => {
    onChange(
      selected.includes(val)
        ? selected.filter(v => v !== val)
        : [...selected, val]
    )
  }

  if (variant === 'emotion') {
    return (
      <div className="flex flex-wrap gap-2">
        {items.map(item => (
          <button
            key={item.val}
            type="button"
            onClick={() => toggle(item.val)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border text-xs transition-all
              ${selected.includes(item.val)
                ? 'bg-amber-50 border-amber-300 text-amber-700'
                : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300 hover:bg-stone-50'
              }`}
          >
            <span className="text-2xl">{item.emoji}</span>
            {item.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map(item => (
        <button
          key={item.val}
          type="button"
          onClick={() => toggle(item.val)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-all
            ${selected.includes(item.val)
              ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
              : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50'
            }`}
        >
          <span className="text-sm">{item.emoji}</span>
          {item.label}
        </button>
      ))}
    </div>
  )
}

interface ScaleSliderProps {
  label: string
  value: number
  onChange: (val: number) => void
}

function ScaleSlider({ label, value, onChange }: ScaleSliderProps) {
  const dots = [1, 2, 3, 4, 5]
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-stone-500 w-20">{label}</span>
      <div className="flex gap-2 flex-1">
        {dots.map(d => (
          <button
            key={d}
            type="button"
            onClick={() => onChange(d)}
            className={`flex-1 h-8 rounded-lg border text-sm font-medium transition-all
              ${value === d
                ? 'bg-stone-800 border-stone-800 text-white'
                : 'bg-white border-stone-200 text-stone-400 hover:border-stone-400'
              }`}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DiaryEntry() {
  const today = new Date().toISOString().split('T')[0]

  const [date, setDate] = useState(today)
  const [weather, setWeather] = useState<string | null>(null)
  const [emotions, setEmotions] = useState<string[]>([])
  const [activities, setActivities] = useState<string[]>([])
  const [food, setFood] = useState<string[]>([])
  const [social, setSocial] = useState<string[]>([])
  const [mood, setMood] = useState(3)
  const [energy, setEnergy] = useState(3)
  const [sleepHours, setSleepHours] = useState('')
  const [sleepQuality, setSleepQuality] = useState('')
  const [wordsStudied, setWordsStudied] = useState('')
  const [studyMinutes, setStudyMinutes] = useState('')
  const [note, setNote] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const photoRef = useRef<HTMLInputElement>(null)

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
    const ext = photoFile.name.split('.').pop()
    const path = `${userId}/${date}.${ext}`
    const { error } = await supabase.storage
      .from('diary-photos')
      .upload(path, photoFile, { upsert: true })
    if (error) {
      console.error('Photo upload error:', error)
      return null
    }
    const { data } = supabase.storage.from('diary-photos').getPublicUrl(path)
    return data.publicUrl
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      console.log('user:', user, 'error:', error)
      if (!user) throw new Error('Not authenticated')

      const photoUrl = await uploadPhoto(user.id)

      const entry: DiaryEntry & { user_id: string } = {
        user_id: user.id,
        date,
        weather,
        emotions,
        activities,
        food,
        social,
        mood_score: mood,
        energy,
        sleep_hours: sleepHours ? parseFloat(sleepHours) : null,
        sleep_quality: sleepQuality ? parseInt(sleepQuality) : null,
        words_studied: wordsStudied ? parseInt(wordsStudied) : 0,
        study_minutes: studyMinutes ? parseInt(studyMinutes) : 0,
        note: note || null,
        photo_url: photoUrl,
      }

      const { error: dbError } = await supabase
        .from('diary_entries')
        .upsert(entry, { onConflict: 'user_id,date' })

      if (dbError) throw dbError

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-stone-800">Today's entry</h1>
            <p className="text-stone-400 text-sm mt-1">{formattedDate}</p>
          </div>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="text-sm border border-stone-200 rounded-lg px-3 py-2 bg-white text-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-300"
          />
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 p-6 space-y-0">

          {/* Weather */}
          <div>
            <SectionLabel>Weather</SectionLabel>
            <WeatherPicker value={weather} onChange={setWeather} />
          </div>

          <Divider />

          {/* Emotions */}
          <div>
            <SectionLabel>How do you feel?</SectionLabel>
            <ChipGroup
              items={EMOTIONS}
              selected={emotions}
              onChange={setEmotions}
              variant="emotion"
            />
          </div>

          <Divider />

          {/* Activities */}
          <div>
            <SectionLabel>Activities</SectionLabel>
            <ChipGroup items={ACTIVITIES} selected={activities} onChange={setActivities} />
          </div>

          <Divider />

          {/* Food */}
          <div>
            <SectionLabel>Food & drink</SectionLabel>
            <ChipGroup items={FOOD} selected={food} onChange={setFood} />
          </div>

          <Divider />

          {/* Social */}
          <div>
            <SectionLabel>Social</SectionLabel>
            <ChipGroup items={SOCIAL} selected={social} onChange={setSocial} />
          </div>

          <Divider />

          {/* Mood & Energy */}
          <div>
            <SectionLabel>Mood & energy</SectionLabel>
            <div className="space-y-3">
              <ScaleSlider label="Mood" value={mood} onChange={setMood} />
              <ScaleSlider label="Energy" value={energy} onChange={setEnergy} />
            </div>
          </div>

          <Divider />

          {/* Sleep */}
          <div>
            <SectionLabel>Sleep</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-stone-400 block mb-1.5">Hours slept</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  placeholder="7.5"
                  value={sleepHours}
                  onChange={e => setSleepHours(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
                />
              </div>
              <div>
                <label className="text-xs text-stone-400 block mb-1.5">Sleep quality (1–5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  placeholder="4"
                  value={sleepQuality}
                  onChange={e => setSleepQuality(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
                />
              </div>
            </div>
          </div>

          <Divider />

          {/* Italian study */}
          <div>
            <SectionLabel>🇮🇹 Italian study</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-stone-400 block mb-1.5">Words studied</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={wordsStudied}
                  onChange={e => setWordsStudied(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
                />
              </div>
              <div>
                <label className="text-xs text-stone-400 block mb-1.5">Minutes studied</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={studyMinutes}
                  onChange={e => setStudyMinutes(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
                />
              </div>
            </div>
          </div>

          <Divider />

          {/* Photo */}
          <div>
            <SectionLabel>Photo of the day</SectionLabel>
            {photoPreview ? (
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Today's photo"
                  className="w-full h-48 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => { setPhotoPreview(null); setPhotoFile(null) }}
                  className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg hover:bg-black/70 transition-colors"
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => photoRef.current?.click()}
                className="w-full border-2 border-dashed border-stone-200 rounded-xl py-8 text-center hover:border-stone-300 hover:bg-stone-50 transition-all"
              >
                <div className="text-3xl mb-2">📷</div>
                <p className="text-sm text-stone-400">Tap to add a photo</p>
              </button>
            )}
            <input
              ref={photoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhoto}
            />
          </div>

          <Divider />

          {/* Note */}
          <div>
            <SectionLabel>Note (optional)</SectionLabel>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Anything else about today..."
              rows={3}
              className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-stone-300 placeholder:text-stone-300"
            />
          </div>

        </div>

        {/* Save button */}
        <div className="mt-4 space-y-3">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}
          {saved && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3 text-center font-medium">
              Entry saved ✓
            </div>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-stone-800 text-white py-3.5 rounded-xl font-medium text-sm hover:bg-stone-700 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save today\'s entry'}
          </button>
        </div>

      </div>
    </div>
  )
}