import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../contexts/SessionContext'
import { ExerciseGroup } from '../components/ExerciseGroup'
import { Toast, useToast } from '../components/Toast'
import { USERS } from '../components/UserPicker'
import { relativeTime, formatDuration } from '../lib/units'
import { groupByExercise, calculateVolume } from '../lib/stats'
import { deleteSet, updateSet, fetchSessions } from '../lib/supabase'
import type { SessionRecord } from '../lib/supabase'
import { getGroupId } from '../lib/storage'

export function Session() {
  const navigate = useNavigate()
  const { 
    activeSession, 
    sessionSets, 
    loading, 
    startSession, 
    endSession, 
    refreshSets 
  } = useSession()
  
  const { toast, showToast, hideToast } = useToast()
  const [starting, setStarting] = useState(false)
  const [ending, setEnding] = useState(false)
  const [title, setTitle] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)
  const [lastSession, setLastSession] = useState<SessionRecord | null>(null)

  const groupId = getGroupId() || ''

  // Sync title with active session
  useEffect(() => {
    if (activeSession) {
      setTitle(activeSession.title || '')
    }
  }, [activeSession])

  // Load last session if no active session
  useEffect(() => {
    if (!activeSession && !loading && groupId) {
      fetchSessions(groupId, 0, 1)
        .then(sessions => {
          if (sessions.length > 0) {
            setLastSession(sessions[0])
          }
        })
        .catch(console.error)
    }
  }, [activeSession, loading, groupId])

  // Group sets by exercise
  const exerciseGroups = useMemo(() => {
    return groupByExercise(sessionSets)
  }, [sessionSets])

  // Calculate stats
  const totalSets = sessionSets.length
  const totalVolume = calculateVolume(sessionSets)
  const volumeByUser = useMemo(() => {
    const byUser = new Map<string, number>()
    for (const set of sessionSets) {
      if (set.is_warmup) continue
      const current = byUser.get(set.user_name) || 0
      byUser.set(set.user_name, current + set.weight_lb * set.reps)
    }
    return byUser
  }, [sessionSets])

  const handleStartSession = async () => {
    setStarting(true)
    try {
      await startSession()
      showToast('Session started! 💪')
    } catch {
      showToast('Failed to start session')
    } finally {
      setStarting(false)
    }
  }

  const handleEndSession = async () => {
    setEnding(true)
    try {
      await endSession()
      showToast('Session ended!')
      navigate('/history')
    } catch {
      showToast('Failed to end session')
    } finally {
      setEnding(false)
    }
  }

  const handleDeleteSet = async (setId: string) => {
    try {
      await deleteSet(setId)
      await refreshSets()
      showToast('Set deleted')
    } catch {
      showToast('Failed to delete set')
    }
  }

  const handleToggleWarmup = async (setId: string, isWarmup: boolean) => {
    try {
      await updateSet(setId, { is_warmup: isWarmup })
      await refreshSets()
    } catch {
      showToast('Failed to update set')
    }
  }

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-32 bg-zinc-800 rounded-xl animate-pulse" />
        <div className="h-24 bg-zinc-800 rounded-xl animate-pulse" />
        <div className="h-24 bg-zinc-800 rounded-xl animate-pulse" />
      </div>
    )
  }

  // No active session
  if (!activeSession) {
    return (
      <div className="p-4 space-y-6">
        <Toast message={toast.message} visible={toast.visible} onHide={hideToast} />

        <div className="text-center py-8 space-y-4">
          <div className="text-6xl">🏋️</div>
          <h2 className="text-xl font-bold text-white">No Active Session</h2>
          <p className="text-zinc-500">Start a session to track your workout</p>
          
          <button
            onClick={handleStartSession}
            disabled={starting}
            className="px-8 h-14 bg-green-500 text-white font-semibold rounded-xl text-lg active:bg-green-600 transition-colors disabled:opacity-50"
          >
            {starting ? 'Starting...' : 'Start Session'}
          </button>
        </div>

        {/* Last session summary */}
        {lastSession && (
          <div className="bg-zinc-800 rounded-xl p-4 space-y-2">
            <h3 className="text-sm text-zinc-400">Last Session</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">{lastSession.title}</p>
                <p className="text-zinc-500 text-xs">
                  {relativeTime(lastSession.started_at)}
                  {lastSession.ended_at && (
                    <> • {formatDuration(lastSession.started_at, lastSession.ended_at)}</>
                  )}
                </p>
              </div>
              <button
                onClick={() => navigate(`/history/session/${lastSession.id}`)}
                className="text-green-400 text-sm font-medium"
              >
                View →
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Active session
  return (
    <div className="p-4 space-y-4">
      <Toast message={toast.message} visible={toast.visible} onHide={hideToast} />

      {/* Session header */}
      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          {editingTitle ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
              autoFocus
              className="flex-1 bg-transparent text-lg font-semibold text-white border-b border-green-500 focus:outline-none"
            />
          ) : (
            <h2
              onClick={() => setEditingTitle(true)}
              className="text-lg font-semibold text-white cursor-pointer"
            >
              {activeSession.title || 'Untitled Session'}
            </h2>
          )}
          <button
            onClick={handleEndSession}
            disabled={ending}
            className="px-4 h-10 bg-red-500/20 text-red-400 font-medium rounded-lg active:bg-red-500/30 transition-colors disabled:opacity-50"
          >
            {ending ? 'Ending...' : 'End Session'}
          </button>
        </div>
        <p className="text-zinc-500 text-sm">
          Started {relativeTime(activeSession.started_at)}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-800 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-white">{totalSets}</p>
          <p className="text-xs text-zinc-500">Sets</p>
        </div>
        <div className="bg-zinc-800 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-white">{exerciseGroups.size}</p>
          <p className="text-xs text-zinc-500">Exercises</p>
        </div>
        <div className="bg-zinc-800 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-white">{(totalVolume / 1000).toFixed(1)}k</p>
          <p className="text-xs text-zinc-500">Volume (lb)</p>
        </div>
      </div>

      {/* Per-user volume */}
      {volumeByUser.size > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {USERS.map(user => {
            const vol = volumeByUser.get(user) || 0
            if (vol === 0) return null
            return (
              <div key={user} className="px-3 py-2 bg-zinc-800 rounded-lg shrink-0">
                <span className="text-zinc-400 text-xs">{user}:</span>
                <span className="text-white text-sm font-medium ml-1">{vol.toLocaleString()} lb</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Exercise groups */}
      {exerciseGroups.size === 0 ? (
        <div className="text-center py-8">
          <p className="text-zinc-500">No sets logged yet</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 h-10 bg-green-500 text-white font-medium rounded-lg active:bg-green-600 transition-colors"
          >
            Log First Set
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {Array.from(exerciseGroups.entries()).map(([key, data]) => (
            <ExerciseGroup
              key={key}
              exerciseKey={key}
              displayName={data.displayName}
              sets={data.sets}
              onDeleteSet={handleDeleteSet}
              onToggleWarmup={handleToggleWarmup}
            />
          ))}
        </div>
      )}
    </div>
  )
}

