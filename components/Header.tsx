'use client'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState, useMemo } from 'react'

const TIMEZONES = [
  { label: 'IT', tz: 'Europe/Rome',      flag: '🇮🇹' },
  { label: 'UA', tz: 'Europe/Kiev',      flag: '🇺🇦' },
  { label: 'NY', tz: 'America/New_York', flag: '🇺🇸' },
]

function formatTZ(date: Date, tz: string, opts: Intl.DateTimeFormatOptions) {
  return date.toLocaleTimeString('it-IT', { ...opts, timeZone: tz })
}

export default function Header() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [now, setNow] = useState<Date | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
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

  const seconds    = now?.getSeconds() ?? 0
  const secondsPct = (seconds / 60) * 100
  const dateStr    = now?.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' }) ?? ''

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-[1000]
        bg-[#0f172a]/95 backdrop-blur-md text-[#f8fafc] border-b border-[#1e293b]
        transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${isScrolled ? 'shadow-lg shadow-black/30' : 'shadow-none'}
      `}
    >
      {/* ── Main row ───────────────────────────────────────────────── */}
      <div className={`flex items-center justify-between px-4 sm:px-8 transition-all duration-300 ${isScrolled ? 'py-2' : 'py-3'}`}>

        {/* Left: Logo */}
        <div className="flex items-center gap-4 shrink-0">
          <Link href="/" className="no-underline text-white">
            <strong className="text-lg sm:text-xl tracking-tight">🇮🇹 Italian Study</strong>
          </Link>
        </div>

        {/* Center: Nav — hidden on mobile */}
        {email && (
          <nav className="hidden md:flex items-center gap-5 lg:gap-6">
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
                <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-3 w-44 invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 ease-out z-50">
                <div className="bg-[#0f172a] border border-slate-700/60 rounded-xl shadow-2xl shadow-black/50 overflow-hidden py-1.5">
                  {[
                    { href: '/countries', label: '🌍 Countries' },
                    { href: '/nasa',      label: '🚀 NASA APOD' },
                    { href: '/weather',   label: '🌤️ Weather' },
                    { href: '/dns',       label: '🔎 DNS History' },
                    { href: '/test',      label: '🧪 Test' },
                  ].map(({ href, label }) => (
                    <Link key={href} href={href} className="flex items-center px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors no-underline">
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>
        )}

        {/* Right: Auth + mobile menu toggle */}
        <div className="flex items-center gap-3">
          {email ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {email[0].toUpperCase()}
                </div>
                <span className="text-slate-400 text-xs hidden xl:block max-w-[140px] truncate">{email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="hidden sm:block px-3.5 py-1.5 border border-slate-700 rounded-lg cursor-pointer bg-transparent text-slate-300 text-xs font-medium hover:bg-slate-800 hover:text-white hover:border-slate-600 transition-all"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/signin" className="text-slate-400 no-underline text-sm font-medium hover:text-white transition-colors hidden sm:block">Sign In</Link>
              <Link href="/signup" className="px-4 py-1.5 bg-blue-600 text-white rounded-lg no-underline font-semibold text-sm hover:bg-blue-500 transition-colors shadow-sm shadow-blue-900/50">Sign Up</Link>
            </>
          )}

          {/* Mobile menu button */}
          {email && (
            <button
              onClick={() => setMobileMenuOpen(p => !p)}
              className="md:hidden flex flex-col gap-1 p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <span className={`block w-5 h-0.5 bg-slate-400 transition-all duration-200 ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
              <span className={`block w-5 h-0.5 bg-slate-400 transition-all duration-200 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-slate-400 transition-all duration-200 ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* ── World clocks strip ─────────────────────────────────────── */}
      {now && (
        <div className={`flex items-center gap-0 border-t border-[#1e293b] px-4 sm:px-8 transition-all duration-300 ${isScrolled ? 'py-1.5' : 'py-2'}`}>

          {/* SVG ring (seconds) — desktop only */}
          <div className="relative w-6 h-6 shrink-0 mr-3 hidden sm:block">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="#1e293b" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15" fill="none" stroke="#3b82f6" strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${secondsPct * 0.942} 94.2`}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-blue-400" />
            </div>
          </div>

          {/* Date */}
          <span className="font-mono text-[10px] text-slate-600 tracking-widest uppercase mr-4 hidden sm:block">{dateStr}</span>

          {/* Timezone clocks */}
          <div className="flex items-center gap-0 divide-x divide-slate-800 flex-1">
            {TIMEZONES.map(({ label, tz, flag }) => {
              const time = formatTZ(now, tz, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              // Check if it's night (20:00–06:00) for a dim indicator
              const hour = parseInt(formatTZ(now, tz, { hour: '2-digit', hour12: false }))
              const isNight = hour >= 20 || hour < 6
              return (
                <div key={tz} className="flex items-center gap-2 px-4 first:pl-0">
                  <span className="text-base leading-none">{flag}</span>
                  <div className="flex flex-col leading-none">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs sm:text-sm font-bold text-white tabular-nums tracking-wider">
                        {time}
                      </span>
                      {isNight && <span className="text-[10px]">🌙</span>}
                    </div>
                    <span className="font-mono text-[9px] sm:text-[10px] text-slate-600 uppercase tracking-widest mt-0.5">{label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Mobile nav drawer ─────────────────────────────────────── */}
      {mobileMenuOpen && email && (
        <div className="md:hidden border-t border-slate-800 bg-[#0f172a] px-4 py-3 flex flex-col gap-1">
          {[
            { href: '/', label: '🏠 Dashboard' },
            { href: '/vocabulary', label: '📚 Vocabulary' },
            { href: '/flashcards', label: '🃏 Flashcards' },
            { href: '/notes', label: '📝 Notes' },
            { href: '/work', label: '💼 Work' },
            { href: '/countries', label: '🌍 Countries' },
            { href: '/nasa', label: '🚀 NASA APOD' },
            { href: '/weather', label: '🌤️ Weather' },
            { href: '/dns', label: '🔎 DNS History' },
            { href: '/test', label: '🧪 Test' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors no-underline"
            >
              {label}
            </Link>
          ))}
          <div className="border-t border-slate-800 mt-2 pt-2">
            <button
              onClick={handleSignOut}
              className="w-full text-left px-3 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  )
}