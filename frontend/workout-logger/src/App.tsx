import { useState, useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { GroupGate } from './pages/GroupGate'
import { Log } from './pages/Log'
import { Session } from './pages/Session'
import { History } from './pages/History'
import { SessionDetail } from './pages/SessionDetail'
import { Stats } from './pages/Stats'
import { SessionProvider } from './contexts/SessionContext'
import { getGroupId, setGroupId } from './lib/storage'
import { isSupabaseConfigured } from './lib/supabase'
import type { SetRecord } from './lib/supabase'
import './index.css'

// Error screen for missing Supabase config
function ConfigError() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-950">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="text-5xl">⚠️</div>
        <h1 className="text-xl font-bold text-white">Configuration Missing</h1>
        <p className="text-zinc-400">
          Supabase environment variables are not configured. Please set:
        </p>
        <div className="bg-zinc-800 rounded-xl p-4 text-left font-mono text-sm text-zinc-300 space-y-1">
          <div>VITE_SUPABASE_URL</div>
          <div>VITE_SUPABASE_ANON_KEY</div>
        </div>
        <p className="text-zinc-500 text-sm">
          Create a <code className="text-zinc-400">.env</code> file in the project root with these values.
        </p>
      </div>
    </div>
  )
}

function App() {
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)
  const [prefill, setPrefill] = useState<{
    user?: string
    exercise?: string
    weightLb?: number
    reps?: number
  } | undefined>()

  // Initialize group ID from URL or localStorage
  useEffect(() => {
    // Check URL for ?g=GROUPID
    const params = new URLSearchParams(window.location.search)
    const urlGroupId = params.get('g')

    if (urlGroupId) {
      setGroupId(urlGroupId)
      setCurrentGroupId(urlGroupId)
      // Clean up URL
      const url = new URL(window.location.href)
      url.searchParams.delete('g')
      window.history.replaceState({}, '', url.pathname)
    } else {
      // Check localStorage
      const storedGroupId = getGroupId()
      setCurrentGroupId(storedGroupId)
    }

    setInitialized(true)
  }, [])

  // Handle group submission
  const handleGroupSubmit = (groupId: string) => {
    setGroupId(groupId)
    setCurrentGroupId(groupId)
  }

  // Handle group clear (for "Change group" button)
  const handleClearGroup = () => {
    setCurrentGroupId(null)
  }

  // Handle copy to log from History
  const handleCopyToLog = useCallback((set: SetRecord) => {
    setPrefill({
      user: set.user_name,
      exercise: set.exercise,
      weightLb: set.weight_lb,
      reps: set.reps,
    })
  }, [])

  const handlePrefillConsumed = useCallback(() => {
    setPrefill(undefined)
  }, [])

  // Check Supabase config
  if (!isSupabaseConfigured) {
    return <ConfigError />
  }

  // Wait for initialization
  if (!initialized) {
    return null
  }

  // Show group gate if no group
  if (!currentGroupId) {
    return <GroupGate onSubmit={handleGroupSubmit} />
  }

  // Main app with routing
  return (
    <BrowserRouter basename="/workout-logger">
      <SessionProvider>
        <Routes>
          <Route element={<Layout onClearGroup={handleClearGroup} />}>
            <Route
              path="/"
              element={
                <Log
                  prefill={prefill}
                  onPrefillConsumed={handlePrefillConsumed}
                />
              }
            />
            <Route path="/session" element={<Session />} />
            <Route
              path="/history"
              element={<History onCopyToLog={handleCopyToLog} />}
            />
            <Route path="/history/session/:sessionId" element={<SessionDetail />} />
            <Route path="/stats" element={<Stats />} />
          </Route>
        </Routes>
      </SessionProvider>
    </BrowserRouter>
  )
}

export default App
