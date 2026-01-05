import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { 
  fetchActiveSession, 
  fetchSessionSets, 
  startSession as startSessionApi, 
  endSession as endSessionApi,
  type SessionRecord,
  type SetRecord 
} from '../lib/supabase'
import { getGroupId } from '../lib/storage'

interface SessionContextValue {
  activeSession: SessionRecord | null
  sessionSets: SetRecord[]
  loading: boolean
  error: string | null
  startSession: (title?: string) => Promise<void>
  endSession: () => Promise<void>
  refreshSession: () => Promise<void>
  refreshSets: () => Promise<void>
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [activeSession, setActiveSession] = useState<SessionRecord | null>(null)
  const [sessionSets, setSessionSets] = useState<SetRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const groupId = getGroupId()

  // Load active session on mount
  const refreshSession = useCallback(async () => {
    if (!groupId) {
      setLoading(false)
      return
    }

    try {
      const session = await fetchActiveSession(groupId)
      setActiveSession(session)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch active session:', err)
      setError('Failed to load session')
    } finally {
      setLoading(false)
    }
  }, [groupId])

  // Load sets for active session
  const refreshSets = useCallback(async () => {
    if (!activeSession) {
      setSessionSets([])
      return
    }

    try {
      const sets = await fetchSessionSets(activeSession.id)
      setSessionSets(sets)
    } catch (err) {
      console.error('Failed to fetch session sets:', err)
    }
  }, [activeSession])

  // Initial load
  useEffect(() => {
    refreshSession()
  }, [refreshSession])

  // Load sets when session changes
  useEffect(() => {
    refreshSets()
  }, [refreshSets])

  // Start a new session
  const startSession = useCallback(async (title?: string) => {
    if (!groupId) return

    try {
      const session = await startSessionApi(groupId, title)
      setActiveSession(session)
      setSessionSets([])
      setError(null)
    } catch (err) {
      console.error('Failed to start session:', err)
      setError('Failed to start session')
      throw err
    }
  }, [groupId])

  // End the active session
  const endSession = useCallback(async () => {
    if (!activeSession) return

    try {
      await endSessionApi(activeSession.id)
      setActiveSession(null)
      setSessionSets([])
      setError(null)
    } catch (err) {
      console.error('Failed to end session:', err)
      setError('Failed to end session')
      throw err
    }
  }, [activeSession])

  return (
    <SessionContext.Provider
      value={{
        activeSession,
        sessionSets,
        loading,
        error,
        startSession,
        endSession,
        refreshSession,
        refreshSets,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}

