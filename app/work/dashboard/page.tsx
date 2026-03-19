export default function WorkDashboard() {
  return (
    <div>

      {/* Page header */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-stone-800 tracking-tight">Dashboard</h1>
        <p className="text-stone-400 mt-1 text-sm">Welcome back. Here's what's happening.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Active projects', value: '—' },
          { label: 'Open tasks',      value: '—' },
          { label: 'Notes',           value: '—' },
          { label: 'This week',       value: '—' },
        ].map(card => (
          <div
            key={card.label}
            className="bg-white border border-stone-200 rounded-2xl p-5"
          >
            <p className="text-xs text-stone-400 uppercase tracking-widest font-medium mb-2">
              {card.label}
            </p>
            <p className="text-2xl font-semibold text-stone-700">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Two column placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Recent activity */}
        <div className="md:col-span-2 bg-white border border-stone-200 rounded-2xl p-6">
          <p className="text-xs text-stone-400 uppercase tracking-widest font-medium mb-6">
            Recent activity
          </p>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="text-4xl mb-3">◎</span>
            <p className="text-stone-400 text-sm">Nothing here yet</p>
            <p className="text-stone-300 text-xs mt-1">Activity will appear as you use the app</p>
          </div>
        </div>

        {/* Quick links */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6">
          <p className="text-xs text-stone-400 uppercase tracking-widest font-medium mb-4">
            Quick access
          </p>
          <div className="flex flex-col gap-2">
            {[
              { label: 'New project',  href: '/work/projects' },
              { label: 'Add task',     href: '/work/tasks'    },
              { label: 'Write a note', href: '/work/notes'    },
              { label: 'Open calendar',href: '/work/calendar' },
            ].map(link => (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-stone-600 no-underline hover:bg-stone-50 hover:text-stone-900 transition-colors border border-transparent hover:border-stone-200"
              >
                <span>{link.label}</span>
                <span className="text-stone-300 text-xs">→</span>
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}