import type { SetRecord } from './supabase'

/**
 * Calculate estimated 1RM using Epley formula
 * e1RM = weight × (1 + reps/30)
 */
export function calculateE1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0
  if (reps === 1) return weight
  return weight * (1 + reps / 30)
}

/**
 * Get ISO week string (YYYY-WW) from a date
 */
export function getISOWeek(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const startOfYear = new Date(year, 0, 1)
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
  const week = Math.ceil((days + startOfYear.getDay() + 1) / 7)
  return `${year}-W${week.toString().padStart(2, '0')}`
}

/**
 * Group sets by ISO week and find max e1RM per week
 */
export function groupSetsByWeek(sets: SetRecord[]): { week: string; e1rm: number; date: string }[] {
  const weekMap = new Map<string, { e1rm: number; date: string }>()
  
  for (const set of sets) {
    if (set.is_warmup) continue
    
    const week = getISOWeek(set.created_at)
    const e1rm = calculateE1RM(set.weight_lb, set.reps)
    
    const existing = weekMap.get(week)
    if (!existing || e1rm > existing.e1rm) {
      weekMap.set(week, { e1rm, date: set.created_at })
    }
  }
  
  return Array.from(weekMap.entries())
    .map(([week, data]) => ({ week, ...data }))
    .sort((a, b) => a.week.localeCompare(b.week))
}

/**
 * Calculate total volume (sum of weight × reps), excluding warmups
 */
export function calculateVolume(sets: SetRecord[]): number {
  return sets
    .filter(s => !s.is_warmup)
    .reduce((sum, set) => sum + set.weight_lb * set.reps, 0)
}

/**
 * Calculate volume including warmups
 */
export function calculateTotalVolume(sets: SetRecord[]): number {
  return sets.reduce((sum, set) => sum + set.weight_lb * set.reps, 0)
}

/**
 * Find PRs from a set of records (excluding warmups)
 */
export interface PRs {
  bestWeight: { weight: number; reps: number; date: string } | null
  bestE1RM: { e1rm: number; weight: number; reps: number; date: string } | null
  bestVolume: { volume: number; weight: number; reps: number; date: string } | null
}

export function findPRs(sets: SetRecord[]): PRs {
  const workingSets = sets.filter(s => !s.is_warmup)
  
  let bestWeight: PRs['bestWeight'] = null
  let bestE1RM: PRs['bestE1RM'] = null
  let bestVolume: PRs['bestVolume'] = null
  
  for (const set of workingSets) {
    const e1rm = calculateE1RM(set.weight_lb, set.reps)
    const volume = set.weight_lb * set.reps
    
    if (!bestWeight || set.weight_lb > bestWeight.weight) {
      bestWeight = { weight: set.weight_lb, reps: set.reps, date: set.created_at }
    }
    
    if (!bestE1RM || e1rm > bestE1RM.e1rm) {
      bestE1RM = { e1rm, weight: set.weight_lb, reps: set.reps, date: set.created_at }
    }
    
    if (!bestVolume || volume > bestVolume.volume) {
      bestVolume = { volume, weight: set.weight_lb, reps: set.reps, date: set.created_at }
    }
  }
  
  return { bestWeight, bestE1RM, bestVolume }
}

/**
 * Group sets by exercise_key and calculate volume
 */
export function groupByExercise(sets: SetRecord[]): Map<string, { sets: SetRecord[]; volume: number; displayName: string }> {
  const groups = new Map<string, { sets: SetRecord[]; volume: number; displayName: string }>()
  
  for (const set of sets) {
    const key = set.exercise_key || set.exercise.toLowerCase().trim()
    const existing = groups.get(key)
    
    if (existing) {
      existing.sets.push(set)
      if (!set.is_warmup) {
        existing.volume += set.weight_lb * set.reps
      }
      // Update display name to most recent
      if (new Date(set.created_at) > new Date(existing.sets[0].created_at)) {
        existing.displayName = set.exercise
      }
    } else {
      groups.set(key, {
        sets: [set],
        volume: set.is_warmup ? 0 : set.weight_lb * set.reps,
        displayName: set.exercise,
      })
    }
  }
  
  return groups
}

/**
 * Get top exercises by volume
 */
export function getTopExercisesByVolume(
  sets: SetRecord[],
  limit: number = 5
): { exerciseKey: string; displayName: string; volume: number }[] {
  const groups = groupByExercise(sets)
  
  return Array.from(groups.entries())
    .map(([exerciseKey, data]) => ({
      exerciseKey,
      displayName: data.displayName,
      volume: data.volume,
    }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, limit)
}

