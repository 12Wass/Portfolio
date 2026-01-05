import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { fetchSets, fetchSessions } from '../lib/supabase'
import type { SetRecord, SessionRecord } from '../lib/supabase'
import { getGroupId } from '../lib/storage'
import { lbToKg, relativeTime, formatTimestamp, formatDuration } from '../lib/units'
import { USERS } from '../components/UserPicker'

const PAGE_SIZE = 50

interface HistoryProps {
  onCopyToLog: (set: SetRecord) => void
}

type TabType = 'sessions' | 'sets'

export function History({ onCopyToLog }: HistoryProps) {
  const navigate = useNavigate()
  const groupId = getGroupId() || ''
  
  const [tab, setTab] = useState<TabType>('sessions')

  // Sessions state
  const [sessions, setSessions] = useState<SessionRecord[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [sessionsHasMore, setSessionsHasMore] = useState(true)
  const [sessionsLoadingMore, setSessionsLoadingMore] = useState(false)

  // Sets state
  const [sets, setSets] = useState<SetRecord[]>([])
  const [setsLoading, setSetsLoading] = useState(true)
  const [setsHasMore, setSetsHasMore] = useState(true)
  const [setsLoadingMore, setSetsLoadingMore] = useState(false)

  const [error, setError] = useState('')

  // Filters (for sets)
  const [userFilter, setUserFilter] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [hideWarmups, setHideWarmups] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Session set counts (for display)
  const [sessionSetCounts, setSessionSetCounts] = useState<Map<string, { count: number; volume: number }>>(new Map())

  // Load sessions
  useEffect(() => {
    if (!groupId) return
    setSessionsLoading(true)
    setError('')
    
    fetchSessions(groupId, 0, PAGE_SIZE)
      .then((data) => {
        setSessions(data)
        setSessionsHasMore(data.length === PAGE_SIZE)
        // Also fetch set counts for each session
        loadSessionStats(data)
      })
      .catch((err) => {
        console.error(err)
        setError('Failed to load sessions')
      })
      .finally(() => setSessionsLoading(false))
  }, [groupId])

  // Load sets
  useEffect(() => {
    if (!groupId) return
    setSetsLoading(true)
    
    fetchSets(groupId, 0, PAGE_SIZE)
      .then((data) => {
        setSets(data)
        setSetsHasMore(data.length === PAGE_SIZE)
      })
      .catch((err) => {
        console.error(err)
        setError('Failed to load sets')
      })
      .finally(() => setSetsLoading(false))
  }, [groupId])

  // Load session stats (set count + volume)
  const loadSessionStats = async (sessionList: SessionRecord[]) => {
    const counts = new Map<string, { count: number; volume: number }>()
    
    // For simplicity, we'll fetch all sets and calculate client-side
    // In production, you'd want a more efficient approach
    for (const session of sessionList) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/sets?session_id=eq.${session.id}&select=weight_lb,reps,is_warmup`,
          {
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
          }
        )
        const sets = await response.json()
        const volume = sets
          .filter((s: { is_warmup: boolean }) => !s.is_warmup)
          .reduce((sum: number, s: { weight_lb: number; reps: number }) => sum + s.weight_lb * s.reps, 0)
        counts.set(session.id, { count: sets.length, volume })
      } catch {
        counts.set(session.id, { count: 0, volume: 0 })
      }
    }
    
    setSessionSetCounts(counts)
  }

  // Load more sessions
  const handleLoadMoreSessions = async () => {
    if (sessionsLoadingMore || !sessionsHasMore) return
    setSessionsLoadingMore(true)
    try {
      const more = await fetchSessions(groupId, sessions.length, PAGE_SIZE)
      setSessions((prev) => [...prev, ...more])
      setSessionsHasMore(more.length === PAGE_SIZE)
      loadSessionStats(more)
    } catch (err) {
      console.error(err)
    } finally {
      setSessionsLoadingMore(false)
    }
  }

  // Load more sets
  const handleLoadMoreSets = async () => {
    if (setsLoadingMore || !setsHasMore) return
    setSetsLoadingMore(true)
    try {
      const more = await fetchSets(groupId, sets.length, PAGE_SIZE)
      setSets((prev) => [...prev, ...more])
      setSetsHasMore(more.length === PAGE_SIZE)
    } catch (err) {
      console.error(err)
    } finally {
      setSetsLoadingMore(false)
    }
  }

  // Filtered sets
  const filteredSets = useMemo(() => {
    return sets.filter((set) => {
      if (userFilter !== 'All' && set.user_name !== userFilter) return false
      if (hideWarmups && set.is_warmup) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!set.exercise.toLowerCase().includes(query)) return false
      }
      return true
    })
  }, [sets, userFilter, searchQuery, hideWarmups])

  // Copy to log
  const handleCopy = (set: SetRecord) => {
    onCopyToLog(set)
    navigate('/')
  }

  const loading = tab === 'sessions' ? sessionsLoading : setsLoading

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex gap-2 mb-4">
          <div className="h-10 w-24 bg-zinc-800 rounded-lg animate-pulse" />
          <div className="h-10 w-24 bg-zinc-800 rounded-lg animate-pulse" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-zinc-800 rounded-xl animate-pulse" />
        ))}
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
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('sessions')}
          className={`px-4 h-10 rounded-lg font-medium text-sm transition-colors ${
            tab === 'sessions'
              ? 'bg-green-500 text-white'
              : 'bg-zinc-800 text-zinc-300 active:bg-zinc-700'
          }`}
        >
          Sessions
        </button>
        <button
          onClick={() => setTab('sets')}
          className={`px-4 h-10 rounded-lg font-medium text-sm transition-colors ${
            tab === 'sets'
              ? 'bg-green-500 text-white'
              : 'bg-zinc-800 text-zinc-300 active:bg-zinc-700'
          }`}
        >
          All Sets
        </button>
      </div>

      {tab === 'sessions' ? (
        /* Sessions list */
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <div className="text-zinc-500 text-center py-8">
              No sessions yet
            </div>
          ) : (
            sessions.map((session) => {
              const stats = sessionSetCounts.get(session.id)
              return (
                <Link
                  key={session.id}
                  to={`/history/session/${session.id}`}
                  className="block bg-zinc-800 rounded-xl p-4 active:bg-zinc-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{session.title || 'Untitled'}</h3>
                      <p className="text-zinc-500 text-xs mt-1">
                        {relativeTime(session.started_at)}
                        {session.ended_at && (
                          <> • {formatDuration(session.started_at, session.ended_at)}</>
                        )}
                      </p>
                    </div>
                    {stats && (
                      <div className="text-right">
                        <p className="text-white font-medium">{stats.count} sets</p>
                        <p className="text-zinc-500 text-xs">{stats.volume.toLocaleString()} lb</p>
                      </div>
                    )}
                  </div>
                </Link>
              )
            })
          )}

          {sessionsHasMore && sessions.length > 0 && (
            <button
              onClick={handleLoadMoreSessions}
              disabled={sessionsLoadingMore}
              className="w-full h-12 bg-zinc-800 rounded-xl text-zinc-300 font-medium active:bg-zinc-700 transition-colors disabled:opacity-50"
            >
              {sessionsLoadingMore ? 'Loading...' : 'Load More'}
            </button>
          )}
        </div>
      ) : (
        /* Sets list */
        <>
          {/* Filters */}
          <div className="space-y-3">
            {/* User filter chips */}
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

            <div className="flex gap-2">
              {/* Search */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search exercise..."
                className="flex-1 h-10 px-4 bg-zinc-800 rounded-xl text-white placeholder-zinc-500 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {/* Hide warmups toggle */}
              <button
                onClick={() => setHideWarmups(!hideWarmups)}
                className={`px-3 h-10 rounded-xl text-xs font-medium transition-colors ${
                  hideWarmups
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {hideWarmups ? 'Warmups hidden' : 'Show all'}
              </button>
            </div>
          </div>

          {/* Results */}
          {filteredSets.length === 0 ? (
            <div className="text-zinc-500 text-center py-8">
              No sets found
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSets.map((set) => {
                const isExpanded = expandedId === set.id
                return (
                  <div
                    key={set.id}
                    className={`bg-zinc-800 rounded-xl p-4 space-y-2 ${set.is_warmup ? 'opacity-60' : ''}`}
                  >
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : set.id)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-white flex items-center gap-2">
                            {set.exercise}
                            {set.is_warmup && (
                              <span className="text-xs text-amber-500 bg-amber-500/20 px-1.5 py-0.5 rounded">
                                warmup
                              </span>
                            )}
                          </div>
                          <div className="text-zinc-400 text-sm">
                            {set.weight_lb} lb × {set.reps}
                            <span className="text-zinc-500"> ({lbToKg(set.weight_lb)} kg)</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-zinc-500 text-xs">{set.user_name}</div>
                          <div className="text-zinc-600 text-xs">
                            {isExpanded ? formatTimestamp(set.created_at) : relativeTime(set.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <button
                        onClick={() => handleCopy(set)}
                        className="w-full h-10 bg-zinc-700 rounded-lg text-green-400 text-sm font-medium active:bg-zinc-600 transition-colors"
                      >
                        Copy to Log
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Load more */}
          {setsHasMore && filteredSets.length > 0 && userFilter === 'All' && !searchQuery && (
            <button
              onClick={handleLoadMoreSets}
              disabled={setsLoadingMore}
              className="w-full h-12 bg-zinc-800 rounded-xl text-zinc-300 font-medium active:bg-zinc-700 transition-colors disabled:opacity-50"
            >
              {setsLoadingMore ? 'Loading...' : 'Load More'}
            </button>
          )}
        </>
      )}
    </div>
  )
}
