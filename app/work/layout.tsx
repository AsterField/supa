'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/work/dashboard', icon: '⬡' },
  { label: 'Projects',  href: '/work/projects',  icon: '◈' },
  { label: 'Tasks',     href: '/work/tasks',      icon: '◎' },
  { label: 'Notes',     href: '/work/notes',      icon: '◇' },
  { label: 'Calendar',  href: '/work/calendar',   icon: '◻' },
]

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#f7f6f3]">

      {/* ── Top nav ───────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#f7f6f3]/90 backdrop-blur-md border-b border-stone-200/60">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-8 h-14">

            {/* Logo / section title */}
            <span className="text-sm font-semibold tracking-[0.15em] uppercase text-stone-400 select-none mr-4">
              Work
            </span>

            {/* Nav items */}
            <nav className="flex items-center gap-1">
              {NAV_ITEMS.map(item => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      relative flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm transition-all duration-150 no-underline
                      ${isActive
                        ? 'text-stone-900 font-medium bg-white shadow-sm border border-stone-200/80'
                        : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
                      }
                    `}
                  >
                    <span className="text-xs opacity-60">{item.icon}</span>
                    {item.label}
                  </Link>
                )
              })}
            </nav>

          </div>
        </div>
      </header>

      {/* ── Page content ─────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {children}
      </main>

    </div>
  )
}