import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if env vars are configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Create client only if configured (will throw otherwise)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Type for the sets table (updated with new columns)
export interface SetRecord {
  id: string
  group_id: string
  user_name: string
  exercise: string
  exercise_key: string | null
  weight_lb: number
  reps: number
  is_warmup: boolean
  session_id: string | null
  created_at: string
}

// Type for the sessions table
export interface SessionRecord {
  id: string
  group_id: string
  started_at: string
  ended_at: string | null
  title: string | null
  note: string | null
  created_at: string
}

// ============ SETS ============

// Insert a new set
export async function insertSet(data: {
  group_id: string
  user_name: string
  exercise: string
  exercise_key: string
  weight_lb: number
  reps: number
  is_warmup?: boolean
  session_id?: string | null
}): Promise<SetRecord> {
  if (!supabase) throw new Error('Supabase not configured')
  
  const { data: result, error } = await supabase
    .from('sets')
    .insert({
      ...data,
      is_warmup: data.is_warmup ?? false,
      session_id: data.session_id ?? null,
    })
    .select()
    .single()
  
  if (error) throw error
  return result as SetRecord
}

// Fetch recent sets for a group
export async function fetchSets(
  groupId: string,
  offset: number = 0,
  limit: number = 50
): Promise<SetRecord[]> {
  if (!supabase) throw new Error('Supabase not configured')
  
  const { data, error } = await supabase
    .from('sets')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  if (error) throw error
  return data as SetRecord[]
}

// Fetch sets for a specific session
export async function fetchSessionSets(sessionId: string): Promise<SetRecord[]> {
  if (!supabase) throw new Error('Supabase not configured')
  
  const { data, error } = await supabase
    .from('sets')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data as SetRecord[]
}

// Fetch sets for stats (with time filter)
export async function fetchSetsForStats(
  groupId: string,
  options: {
    exerciseKey?: string
    userName?: string
    days?: number
    limit?: number
  } = {}
): Promise<SetRecord[]> {
  if (!supabase) throw new Error('Supabase not configured')
  
  let query = supabase
    .from('sets')
    .select('*')
    .eq('group_id', groupId)
  
  if (options.exerciseKey) {
    query = query.eq('exercise_key', options.exerciseKey)
  }
  
  if (options.userName) {
    query = query.eq('user_name', options.userName)
  }
  
  if (options.days) {
    const since = new Date()
    since.setDate(since.getDate() - options.days)
    query = query.gte('created_at', since.toISOString())
  }
  
  query = query.order('created_at', { ascending: false })
  
  if (options.limit) {
    query = query.limit(options.limit)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data as SetRecord[]
}

// Fetch distinct exercises for a group
export async function fetchDistinctExercises(groupId: string): Promise<{ exercise_key: string; exercise: string }[]> {
  if (!supabase) throw new Error('Supabase not configured')
  
  const { data, error } = await supabase
    .from('sets')
    .select('exercise_key, exercise, created_at')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })
    .limit(500)
  
  if (error) throw error
  
  // Get distinct by exercise_key, keeping most recent exercise name
  const seen = new Map<string, string>()
  for (const row of data || []) {
    const key = row.exercise_key || row.exercise.toLowerCase().trim()
    if (!seen.has(key)) {
      seen.set(key, row.exercise)
    }
  }
  
  return Array.from(seen.entries()).map(([exercise_key, exercise]) => ({
    exercise_key,
    exercise,
  }))
}

// Fetch recent exercises for autocomplete (last 30 sets, distinct by exercise_key)
export async function fetchRecentExercises(groupId: string): Promise<{ key: string; name: string }[]> {
  if (!supabase) throw new Error('Supabase not configured')
  
  const { data, error } = await supabase
    .from('sets')
    .select('exercise, exercise_key, created_at')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })
    .limit(30)
  
  if (error) throw error
  
  // Get distinct exercises, preserving order by most recent
  const seen = new Set<string>()
  const exercises: { key: string; name: string }[] = []
  
  for (const row of data || []) {
    const key = row.exercise_key || row.exercise.toLowerCase().trim()
    if (!seen.has(key)) {
      seen.add(key)
      exercises.push({ key, name: row.exercise })
      if (exercises.length >= 8) break
    }
  }
  
  return exercises
}

// Delete a set
export async function deleteSet(setId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured')
  
  const { error } = await supabase
    .from('sets')
    .delete()
    .eq('id', setId)
  
  if (error) throw error
}

// Update a set (for toggling warmup)
export async function updateSet(setId: string, updates: Partial<Pick<SetRecord, 'is_warmup'>>): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured')
  
  const { error } = await supabase
    .from('sets')
    .update(updates)
    .eq('id', setId)
  
  if (error) throw error
}

// ============ SESSIONS ============

// Fetch active session for a group (ended_at is null)
export async function fetchActiveSession(groupId: string): Promise<SessionRecord | null> {
  if (!supabase) throw new Error('Supabase not configured')
  
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('group_id', groupId)
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null // No rows
    throw error
  }
  
  return data as SessionRecord
}

// Fetch sessions for a group
export async function fetchSessions(
  groupId: string,
  offset: number = 0,
  limit: number = 20
): Promise<SessionRecord[]> {
  if (!supabase) throw new Error('Supabase not configured')
  
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('group_id', groupId)
    .order('started_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  if (error) throw error
  return data as SessionRecord[]
}

// Fetch a single session
export async function fetchSession(sessionId: string): Promise<SessionRecord | null> {
  if (!supabase) throw new Error('Supabase not configured')
  
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  
  return data as SessionRecord
}

// Start a new session
export async function startSession(groupId: string, title?: string): Promise<SessionRecord> {
  if (!supabase) throw new Error('Supabase not configured')
  
  const defaultTitle = `Workout ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      group_id: groupId,
      title: title || defaultTitle,
    })
    .select()
    .single()
  
  if (error) throw error
  return data as SessionRecord
}

// End a session
export async function endSession(sessionId: string): Promise<SessionRecord> {
  if (!supabase) throw new Error('Supabase not configured')
  
  const { data, error } = await supabase
    .from('sessions')
    .update({ ended_at: new Date().toISOString() })
    .eq('id', sessionId)
    .select()
    .single()
  
  if (error) throw error
  return data as SessionRecord
}

// Update session (title, note)
export async function updateSession(
  sessionId: string,
  updates: Partial<Pick<SessionRecord, 'title' | 'note'>>
): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured')
  
  const { error } = await supabase
    .from('sessions')
    .update(updates)
    .eq('id', sessionId)
  
  if (error) throw error
}

// Count sessions in last N days
export async function countRecentSessions(groupId: string, days: number): Promise<number> {
  if (!supabase) throw new Error('Supabase not configured')
  
  const since = new Date()
  since.setDate(since.getDate() - days)
  
  const { count, error } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', groupId)
    .gte('started_at', since.toISOString())
  
  if (error) throw error
  return count || 0
}
