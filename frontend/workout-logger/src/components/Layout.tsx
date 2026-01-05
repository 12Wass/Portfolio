import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { getGroupId, clearGroupId } from '../lib/storage'

interface LayoutProps {
  onClearGroup: () => void
}

export function Layout({ onClearGroup }: LayoutProps) {
  const groupId = getGroupId()
  const shortGroupId = groupId ? groupId.slice(0, 6) : ''

  const handleChangeGroup = () => {
    clearGroupId()
    onClearGroup()
  }

  return (
    <div className="min-h-full flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Workout</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 font-mono">{shortGroupId}</span>
          <button
            onClick={handleChangeGroup}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Change
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <BottomNav />
    </div>
  )
}

