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

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setEmail(session?.user?.email ?? null)

    })

    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])  // ✅ removed router and supabase.auth from deps — they don't change

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/signin')
  }

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-[1000] flex items-center justify-between
        bg-[#0f172a] text-[#f8fafc] border-b border-[#1e293b]
        transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${isScrolled ? 'py-2.5 px-8 shadow-lg' : 'py-5 px-8 shadow-none'}
      `}
    >
      {/* Logo */}
      <Link href="/" className="no-underline text-white">
        <strong className="text-xl tracking-tight">
          🇮🇹 Italian Study
        </strong>
      </Link>

      {/* Navigation */}
      {email && (
        <nav className="flex items-center gap-8">
          <Link href="/" className="text-slate-300 no-underline text-[1.2rem] font-medium transition-colors hover:text-white">Dashboard</Link>
          <Link href="/vocabulary" className="text-slate-300 no-underline text-[1.2rem] font-medium transition-colors hover:text-white">Vocabulary</Link>
          <Link href="/flashcards" className="text-slate-300 no-underline text-[1.2rem] font-medium transition-colors hover:text-white">Flashcards</Link>
          <Link href="/notes" className="text-slate-300 no-underline text-[1.2rem] font-medium transition-colors hover:text-white">Notes</Link>
          <Link href="/work" className="text-slate-300 no-underline text-[1.2rem] font-medium transition-colors hover:text-white">Work</Link>
        </nav>
      )}

      {/* Auth */}
      <div className="flex items-center gap-5">
        {email ? (
          <>
            <span className="text-slate-400 text-sm">{email}</span>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 border border-slate-700 rounded-md cursor-pointer bg-transparent text-[#f8fafc] text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link href="/signin" className="text-[#f8fafc] no-underline text-sm font-medium hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-blue-600 text-white rounded-md no-underline font-semibold text-sm hover:bg-blue-500 transition-colors shadow-sm"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  )
}