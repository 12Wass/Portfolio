/**
 * Normalize exercise name to a consistent key for grouping stats
 * Rules: trim, lowercase, collapse spaces, remove surrounding punctuation
 */
export function normalizeExerciseKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/^[^\w]+|[^\w]+$/g, '')
}

/**
 * Get display name from a list of sets with the same exercise_key
 * Returns the most recent exercise name (preserves user formatting)
 */
export function getDisplayName(sets: { exercise: string; created_at: string }[]): string {
  if (sets.length === 0) return ''
  const sorted = [...sets].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  return sorted[0].exercise
}

