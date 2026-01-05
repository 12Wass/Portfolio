const KEYS = {
  GROUP_ID: 'group_id',
  LAST_USER: 'last_user_name',
  LAST_EXERCISE: 'last_exercise',
  LAST_WEIGHT: 'last_weight_lb',
  LAST_REPS: 'last_reps',
  FAVORITES: 'favorite_exercises',
  REST_TIMER_DURATION: 'rest_timer_duration',
} as const

// Group ID
export function getGroupId(): string | null {
  return localStorage.getItem(KEYS.GROUP_ID)
}

export function setGroupId(groupId: string): void {
  localStorage.setItem(KEYS.GROUP_ID, groupId)
}

export function clearGroupId(): void {
  localStorage.removeItem(KEYS.GROUP_ID)
}

// Last user
export function getLastUser(): string | null {
  return localStorage.getItem(KEYS.LAST_USER)
}

export function setLastUser(userName: string): void {
  localStorage.setItem(KEYS.LAST_USER, userName)
}

// Last exercise/weight/reps defaults
export interface LastDefaults {
  exercise: string
  weightLb: number
  reps: number
}

export function getLastDefaults(): LastDefaults {
  return {
    exercise: localStorage.getItem(KEYS.LAST_EXERCISE) || '',
    weightLb: Number(localStorage.getItem(KEYS.LAST_WEIGHT)) || 0,
    reps: Number(localStorage.getItem(KEYS.LAST_REPS)) || 0,
  }
}

export function setLastDefaults(defaults: LastDefaults): void {
  localStorage.setItem(KEYS.LAST_EXERCISE, defaults.exercise)
  localStorage.setItem(KEYS.LAST_WEIGHT, String(defaults.weightLb))
  localStorage.setItem(KEYS.LAST_REPS, String(defaults.reps))
}

// Favorite exercises (stored as exercise_key array)
export function getFavoriteExercises(): string[] {
  try {
    const stored = localStorage.getItem(KEYS.FAVORITES)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function setFavoriteExercises(keys: string[]): void {
  localStorage.setItem(KEYS.FAVORITES, JSON.stringify(keys))
}

export function toggleFavoriteExercise(key: string): boolean {
  const favorites = getFavoriteExercises()
  const index = favorites.indexOf(key)
  
  if (index >= 0) {
    favorites.splice(index, 1)
    setFavoriteExercises(favorites)
    return false // No longer favorite
  } else {
    favorites.unshift(key) // Add to front
    setFavoriteExercises(favorites.slice(0, 10)) // Max 10 favorites
    return true // Now favorite
  }
}

export function isFavoriteExercise(key: string): boolean {
  return getFavoriteExercises().includes(key)
}

// Rest timer duration (seconds)
export function getRestTimerDuration(): number {
  const stored = localStorage.getItem(KEYS.REST_TIMER_DURATION)
  return stored ? Number(stored) : 90 // Default 90 seconds
}

export function setRestTimerDuration(seconds: number): void {
  localStorage.setItem(KEYS.REST_TIMER_DURATION, String(seconds))
}
