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

        <div className="max-w-6xl flex justify-center mx-auto">
          <div className="flex  gap-2 w-full h-14">


            {/* Nav items */}
            <nav className="flex w-full justify-around">
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

      {/* ── Page content ─────────────────────────────────────────────── */}
      <main className="w-full mx-auto">
        {children}
      </main>

    </div>
  )
}