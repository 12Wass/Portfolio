import { useState, useEffect, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { 
  fetchDistinctExercises, 
  fetchSetsForStats, 
  countRecentSessions 
} from '../lib/supabase'
import type { SetRecord } from '../lib/supabase'
import { getGroupId } from '../lib/storage'
import { relativeTime } from '../lib/units'
import { findPRs, groupSetsByWeek, calculateVolume, getTopExercisesByVolume, calculateE1RM } from '../lib/stats'
import { USERS } from '../components/UserPicker'

export function Stats() {
  const groupId = getGroupId() || ''
  
  // Filters
  const [userFilter, setUserFilter] = useState<string>('All')
  const [selectedExercise, setSelectedExercise] = useState<string>('')
  const [exerciseSearch, setExerciseSearch] = useState('')
  
  // Data
  const [exercises, setExercises] = useState<{ exercise_key: string; exercise: string }[]>([])
  const [sets, setSets] = useState<SetRecord[]>([])
  const [sessionCount, setSessionCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load distinct exercises
  useEffect(() => {
    if (!groupId) return
    fetchDistinctExercises(groupId)
      .then(setExercises)
      .catch(console.error)
  }, [groupId])

  // Load session count (for overview)
  useEffect(() => {
    if (!groupId) return
    countRecentSessions(groupId, 30)
      .then(setSessionCount)
      .catch(console.error)
  }, [groupId])

  // Load sets for selected exercise
  useEffect(() => {
    if (!groupId) return
    setLoading(true)
    setError('')
    
    fetchSetsForStats(groupId, {
      exerciseKey: selectedExercise || undefined,
      userName: userFilter !== 'All' ? userFilter : undefined,
      days: 180,
      limit: 500,
    })
      .then(setSets)
      .catch((err) => {
        console.error(err)
        setError('Failed to load stats')
      })
      .finally(() => setLoading(false))
  }, [groupId, selectedExercise, userFilter])

  // Filter exercises by search
  const filteredExercises = useMemo(() => {
    if (!exerciseSearch) return exercises.slice(0, 20)
    const query = exerciseSearch.toLowerCase()
    return exercises.filter(e => 
      e.exercise.toLowerCase().includes(query) ||
      e.exercise_key.includes(query)
    ).slice(0, 20)
  }, [exercises, exerciseSearch])

  // Calculate PRs
  const prs = useMemo(() => findPRs(sets), [sets])

  // Calculate weekly trend data
  const trendData = useMemo(() => groupSetsByWeek(sets), [sets])

  // Calculate volume
  const totalVolume = useMemo(() => calculateVolume(sets), [sets])

  // Get top exercises (for overview)
  const topExercises = useMemo(() => {
    if (selectedExercise) return []
    return getTopExercisesByVolume(sets, 5)
  }, [sets, selectedExercise])

  // Recent working sets
  const recentSets = useMemo(() => {
    return sets
      .filter(s => !s.is_warmup)
      .slice(0, 10)
  }, [sets])

  // Get selected exercise display name
  const selectedExerciseName = useMemo(() => {
    const ex = exercises.find(e => e.exercise_key === selectedExercise)
    return ex?.exercise || selectedExercise
  }, [exercises, selectedExercise])

  if (loading && sets.length === 0) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-10 bg-zinc-800 rounded-xl animate-pulse" />
        <div className="h-32 bg-zinc-800 rounded-xl animate-pulse" />
        <div className="h-48 bg-zinc-800 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-900/30 text-red-400 p-4 rounded-xl text-center">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {/* User filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        <button
          onClick={() => setUserFilter('All')}
          className={`px-3 h-8 rounded-full text-sm whitespace-nowrap shrink-0 transition-colors ${
            userFilter === 'All'
              ? 'bg-green-500 text-white'
              : 'bg-zinc-800 text-zinc-300 active:bg-zinc-700'
          }`}
        >
          All
        </button>
        {USERS.map((user) => (
          <button
            key={user}
            onClick={() => setUserFilter(user)}
            className={`px-3 h-8 rounded-full text-sm whitespace-nowrap shrink-0 transition-colors ${
              userFilter === user
                ? 'bg-green-500 text-white'
                : 'bg-zinc-800 text-zinc-300 active:bg-zinc-700'
            }`}
          >
            {user}
          </button>
        ))}
      </div>

      {/* Exercise selector */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={exerciseSearch}
            onChange={(e) => setExerciseSearch(e.target.value)}
            placeholder="Search exercise..."
            className="flex-1 h-10 px-4 bg-zinc-800 rounded-xl text-white placeholder-zinc-500 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {selectedExercise && (
            <button
              onClick={() => {
                setSelectedExercise('')
                setExerciseSearch('')
              }}
              className="px-3 h-10 bg-zinc-800 text-zinc-400 rounded-xl text-sm"
            >
              Clear
            </button>
          )}
        </div>
        
        {/* Exercise chips */}
        {(exerciseSearch || !selectedExercise) && filteredExercises.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {filteredExercises.map((ex) => (
              <button
                key={ex.exercise_key}
                onClick={() => {
                  setSelectedExercise(ex.exercise_key)
                  setExerciseSearch('')
                }}
                className={`px-3 h-8 rounded-full text-sm whitespace-nowrap shrink-0 transition-colors ${
                  selectedExercise === ex.exercise_key
                    ? 'bg-blue-500 text-white'
                    : 'bg-zinc-800 text-zinc-300 active:bg-zinc-700'
                }`}
              >
                {ex.exercise}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedExercise ? (
        /* Exercise-specific stats */
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">{selectedExerciseName}</h2>
          
          {/* PRs */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-800 rounded-xl p-3 text-center">
              <p className="text-xs text-zinc-500 mb-1">Best Weight</p>
              {prs.bestWeight ? (
                <>
                  <p className="text-xl font-bold text-white">{prs.bestWeight.weight} lb</p>
                  <p className="text-xs text-zinc-500">× {prs.bestWeight.reps}</p>
                </>
              ) : (
                <p className="text-zinc-600">—</p>
              )}
            </div>
            <div className="bg-zinc-800 rounded-xl p-3 text-center">
              <p className="text-xs text-zinc-500 mb-1">Est. 1RM</p>
              {prs.bestE1RM ? (
                <>
                  <p className="text-xl font-bold text-green-400">{Math.round(prs.bestE1RM.e1rm)} lb</p>
                  <p className="text-xs text-zinc-500">{prs.bestE1RM.weight}×{prs.bestE1RM.reps}</p>
                </>
              ) : (
                <p className="text-zinc-600">—</p>
              )}
            </div>
            <div className="bg-zinc-800 rounded-xl p-3 text-center">
              <p className="text-xs text-zinc-500 mb-1">Best Volume</p>
              {prs.bestVolume ? (
                <>
                  <p className="text-xl font-bold text-white">{prs.bestVolume.volume}</p>
                  <p className="text-xs text-zinc-500">{prs.bestVolume.weight}×{prs.bestVolume.reps}</p>
                </>
              ) : (
                <p className="text-zinc-600">—</p>
              )}
            </div>
          </div>

          {/* Trend chart */}
          {trendData.length > 1 && (
            <div className="bg-zinc-800 rounded-xl p-4">
              <h3 className="text-sm text-zinc-400 mb-3">Est. 1RM Trend</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <XAxis 
                      dataKey="week" 
                      tick={{ fill: '#71717a', fontSize: 10 }}
                      tickFormatter={(v) => v.split('-W')[1]}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: '#71717a', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      width={40}
                      tickFormatter={(v) => `${v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#27272a',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                      formatter={(value) => [`${Math.round(value as number)} lb`, 'Est. 1RM']}
                      labelFormatter={(label) => `Week ${String(label).split('-W')[1]}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="e1rm" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      dot={{ fill: '#22c55e', strokeWidth: 0, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Recent sets */}
          {recentSets.length > 0 && (
            <div className="bg-zinc-800 rounded-xl overflow-hidden">
              <h3 className="text-sm text-zinc-400 px-4 py-3 border-b border-zinc-700">
                Recent Working Sets
              </h3>
              <div className="divide-y divide-zinc-700/50">
                {recentSets.map((set) => (
                  <div key={set.id} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <span className="text-white font-medium">{set.weight_lb} lb</span>
                      <span className="text-zinc-400"> × </span>
                      <span className="text-white font-medium">{set.reps}</span>
                      <span className="text-zinc-500 text-sm ml-2">
                        (e1RM: {Math.round(calculateE1RM(set.weight_lb, set.reps))})
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-zinc-500 text-xs">{set.user_name}</div>
                      <div className="text-zinc-600 text-xs">{relativeTime(set.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Overview stats */
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Overview (Last 30 Days)</h2>
          
          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-800 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-white">{sessionCount}</p>
              <p className="text-sm text-zinc-500">Sessions</p>
            </div>
            <div className="bg-zinc-800 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-white">{(totalVolume / 1000).toFixed(0)}k</p>
              <p className="text-sm text-zinc-500">Total Volume (lb)</p>
            </div>
          </div>

          {/* Top exercises */}
          {topExercises.length > 0 && (
            <div className="bg-zinc-800 rounded-xl overflow-hidden">
              <h3 className="text-sm text-zinc-400 px-4 py-3 border-b border-zinc-700">
                Top Exercises by Volume
              </h3>
              <div className="divide-y divide-zinc-700/50">
                {topExercises.map((ex, i) => (
                  <button
                    key={ex.exerciseKey}
                    onClick={() => setSelectedExercise(ex.exerciseKey)}
                    className="w-full px-4 py-3 flex items-center justify-between active:bg-zinc-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-500 w-6">{i + 1}.</span>
                      <span className="text-white font-medium">{ex.displayName}</span>
                    </div>
                    <span className="text-zinc-400">{ex.volume.toLocaleString()} lb</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Prompt to select exercise */}
          <div className="text-center py-4">
            <p className="text-zinc-500 text-sm">
              Select an exercise above to see PRs and trends
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

