const LB_TO_KG = 2.2046226218

/**
 * Convert pounds to kilograms
 * @param lb - Weight in pounds
 * @param decimals - Number of decimal places (1 or 2)
 * @returns Formatted string with kg value
 */
export function lbToKg(lb: number, decimals: 1 | 2 = 1): string {
  const kg = lb / LB_TO_KG
  return kg.toFixed(decimals)
}

/**
 * Format weight display with lb and kg
 * @param lb - Weight in pounds
 * @param decimals - Number of decimal places for kg
 * @returns Formatted string like "135 lb (61.2 kg)"
 */
export function formatWeight(lb: number, decimals: 1 | 2 = 1): string {
  return `${lb} lb (${lbToKg(lb, decimals)} kg)`
}

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
 * Get relative time string (e.g., "2h ago", "3d ago")
 */
export function relativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffWeek = Math.floor(diffDay / 7)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return `${diffWeek}w ago`
}

/**
 * Format exact timestamp
 */
export function formatTimestamp(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Format duration between two dates
 */
export function formatDuration(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffMs = end.getTime() - start.getTime()
  const diffMin = Math.floor(diffMs / (1000 * 60))
  const hours = Math.floor(diffMin / 60)
  const minutes = diffMin % 60
  
  if (hours === 0) return `${minutes}m`
  return `${hours}h ${minutes}m`
}

/**
 * Format time as HH:MM:SS for timer display
 */
export function formatTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Calculate plates needed per side for a given weight
 * Returns array of plate weights per side
 */
export function calculatePlates(
  targetWeight: number,
  barWeight: number = 45
): { plates: number[]; remainder: number } {
  const availablePlates = [45, 35, 25, 10, 5, 2.5]
  const weightPerSide = (targetWeight - barWeight) / 2
  
  if (weightPerSide <= 0) {
    return { plates: [], remainder: 0 }
  }
  
  const plates: number[] = []
  let remaining = weightPerSide
  
  for (const plate of availablePlates) {
    while (remaining >= plate) {
      plates.push(plate)
      remaining -= plate
    }
  }
  
  return { plates, remainder: remaining }
}
