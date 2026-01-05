import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'Log', icon: '✏️' },
  { to: '/session', label: 'Session', icon: '▶️' },
  { to: '/history', label: 'History', icon: '📋' },
  { to: '/stats', label: 'Stats', icon: '📊' },
] as const

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur border-t border-zinc-800 pb-[var(--safe-area-inset-bottom)]">
      <div className="flex">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) => `
              flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors
              ${isActive ? 'text-green-500' : 'text-zinc-500 active:text-zinc-300'}
            `}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
