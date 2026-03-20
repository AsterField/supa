'use client'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState, useMemo } from 'react'

export default function Header() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    // Set initial time client-side only to avoid hydration mismatch
    setNow(new Date())
    const tick = setInterval(() => setNow(new Date()), 1000)

    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setEmail(session?.user?.email ?? null)
    })

    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('scroll', handleScroll)
      clearInterval(tick)
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/signin')
  }

  const timeStr = now?.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) ?? ''
  const dateStr = now?.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' }) ?? ''

  // Seconds hand progress for the ring
  const seconds = now?.getSeconds() ?? 0
  const secondsPct = (seconds / 60) * 100

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-[1000] flex items-center justify-between
        bg-[#0f172a]/95 backdrop-blur-md text-[#f8fafc] border-b border-[#1e293b]
        transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${isScrolled ? 'py-2 px-8 shadow-lg shadow-black/30' : 'py-4 px-8 shadow-none'}
      `}
    >
      {/* Left: Logo + Clock */}
      <div className="flex items-center gap-5">
        <Link href="/" className="no-underline text-white">
          <strong className="text-xl tracking-tight">🇮🇹 Italian Study</strong>
        </Link>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-700" />

        {/* Clock widget */}
        {now && (
          <div className="flex items-center gap-2.5">
            {/* SVG ring clock */}
            <div className="relative w-8 h-8 shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {/* Track */}
                <circle cx="18" cy="18" r="15" fill="none" stroke="#1e293b" strokeWidth="3" />
                {/* Progress — seconds */}
                <circle
                  cx="18" cy="18" r="15"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${secondsPct * 0.942} 94.2`}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              {/* Center dot */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              </div>
            </div>

            {/* Time + date text */}
            <div className="flex flex-col leading-none">
              <span className="font-mono text-sm font-bold text-white tracking-wider tabular-nums">
                {timeStr}
              </span>
              <span className="font-mono text-[10px] text-slate-500 tracking-widest uppercase mt-0.5">
                {dateStr}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Center: Navigation */}
      {email && (
        <nav className="flex items-center gap-6">
          {[
            { href: '/', label: 'Dashboard' },
            { href: '/vocabulary', label: 'Vocabulary' },
            { href: '/flashcards', label: 'Flashcards' },
            { href: '/notes', label: 'Notes' },
            { href: '/work', label: 'Work' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="relative text-slate-400 no-underline text-sm font-medium transition-colors hover:text-white group"
            >
              {label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-blue-500 transition-all duration-200 group-hover:w-full" />
            </Link>
          ))}

          {/* Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1 text-slate-400 text-sm font-medium transition-colors hover:text-white cursor-pointer">
              More
              <svg
                className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div className="absolute top-full left-0 mt-3 w-44 invisible opacity-0 translate-y-1
              group-hover:visible group-hover:opacity-100 group-hover:translate-y-0
              transition-all duration-200 ease-out z-50">
              <div className="bg-[#0f172a] border border-slate-700/60 rounded-xl shadow-2xl shadow-black/50 overflow-hidden py-1.5">
                {[
                  { href: '/countries', label: '🌍 Countries' },
                  { href: '/nasa',      label: '🚀 NASA APOD' },
                  { href: '/weather',   label: '🌤️ Weather' },
                  { href: '/test',      label: '🧪 Test' },
                ].map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors no-underline"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Right: Auth */}
      <div className="flex items-center gap-4">
        {email ? (
          <>
            <div className="flex items-center gap-2">
              {/* Avatar initial */}
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {email[0].toUpperCase()}
              </div>
              <span className="text-slate-400 text-xs hidden lg:block max-w-[140px] truncate">{email}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="px-3.5 py-1.5 border border-slate-700 rounded-lg cursor-pointer bg-transparent text-slate-300 text-xs font-medium hover:bg-slate-800 hover:text-white hover:border-slate-600 transition-all"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link href="/signin" className="text-slate-400 no-underline text-sm font-medium hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg no-underline font-semibold text-sm hover:bg-blue-500 transition-colors shadow-sm shadow-blue-900/50"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  )
}