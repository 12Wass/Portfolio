import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchSession, fetchSessionSets } from '../lib/supabase'
import type { SessionRecord, SetRecord } from '../lib/supabase'
import { ExerciseGroup } from '../components/ExerciseGroup'
import { formatDuration, formatTimestamp } from '../lib/units'
import { groupByExercise, calculateVolume } from '../lib/stats'
import { USERS } from '../components/UserPicker'

export function SessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  
  const [session, setSession] = useState<SessionRecord | null>(null)
  const [sets, setSets] = useState<SetRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load session and sets
  useEffect(() => {
    if (!sessionId) return
    
    setLoading(true)
    setError('')
    
    Promise.all([
      fetchSession(sessionId),
      fetchSessionSets(sessionId),
    ])
      .then(([sessionData, setsData]) => {
        setSession(sessionData)
        setSets(setsData)
      })
      .catch((err) => {
        console.error(err)
        setError('Failed to load session')
      })
      .finally(() => setLoading(false))
  }, [sessionId])

  // Group sets by exercise
  const exerciseGroups = useMemo(() => {
    return groupByExercise(sets)
  }, [sets])

  // Calculate stats
  const totalSets = sets.length
  const totalVolume = calculateVolume(sets)
  const volumeByUser = useMemo(() => {
    const byUser = new Map<string, number>()
    for (const set of sets) {
      if (set.is_warmup) continue
      const current = byUser.get(set.user_name) || 0
      byUser.set(set.user_name, current + set.weight_lb * set.reps)
    }
    return byUser
  }, [sets])

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-24 bg-zinc-800 rounded-xl animate-pulse" />
        <div className="h-16 bg-zinc-800 rounded-xl animate-pulse" />
        <div className="h-32 bg-zinc-800 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="p-4">
        <div className="bg-red-900/30 text-red-400 p-4 rounded-xl text-center">
          {error || 'Session not found'}
        </div>
        <button
          onClick={() => navigate('/history')}
          className="mt-4 w-full h-12 bg-zinc-800 text-white rounded-xl font-medium"
        >
          Back to History
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {/* Back button */}
      <button
        onClick={() => navigate('/history')}
        className="text-zinc-400 text-sm flex items-center gap-1"
      >
        ← Back to History
      </button>

      {/* Session header */}
      <div className="bg-zinc-800 rounded-xl p-4 space-y-2">
        <h2 className="text-xl font-semibold text-white">{session.title || 'Untitled Session'}</h2>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-400">
          <span>{formatTimestamp(session.started_at)}</span>
          {session.ended_at && (
            <span>Duration: {formatDuration(session.started_at, session.ended_at)}</span>
          )}
        </div>
        {session.note && (
          <p className="text-zinc-500 text-sm mt-2">{session.note}</p>
        )}
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
          <p className="text-zinc-500">No sets in this session</p>
        </div>
      ) : (
        <div className="space-y-3">
          {Array.from(exerciseGroups.entries()).map(([key, data]) => (
            <ExerciseGroup
              key={key}
              exerciseKey={key}
              displayName={data.displayName}
              sets={data.sets}
              readOnly
            />
          ))}
        </div>
      )}
    </div>
  )
}

