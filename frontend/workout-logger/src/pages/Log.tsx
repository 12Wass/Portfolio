import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { UserPicker, USERS } from '../components/UserPicker'
import { NumberStepper } from '../components/NumberStepper'
import { ExerciseChips, useFavoriteExercises } from '../components/ExerciseChips'
import { Toast, useToast } from '../components/Toast'
import { SessionBanner } from '../components/SessionBanner'
import { RestTimerPill } from '../components/RestTimerPill'
import { Modal } from '../components/Modal'
import { useSession } from '../contexts/SessionContext'
import { getGroupId, getLastUser, setLastUser, getLastDefaults, setLastDefaults } from '../lib/storage'
import { insertSet, fetchRecentExercises } from '../lib/supabase'
import { lbToKg, calculatePlates } from '../lib/units'
import { normalizeExerciseKey } from '../lib/normalize'

interface LogProps {
  prefill?: {
    user?: string
    exercise?: string
    weightLb?: number
    reps?: number
  }
  onPrefillConsumed?: () => void
}

export function Log({ prefill, onPrefillConsumed }: LogProps) {
  const [searchParams] = useSearchParams()
  const groupId = getGroupId() || ''
  const defaults = getLastDefaults()
  
  const { activeSession, sessionSets, loading: sessionLoading, startSession, refreshSets } = useSession()

  // Form state
  const [user, setUser] = useState(() => prefill?.user || getLastUser() || USERS[0])
  const [exercise, setExercise] = useState(() => prefill?.exercise || searchParams.get('exercise') || defaults.exercise)
  const [weightLb, setWeightLb] = useState(() => prefill?.weightLb ?? defaults.weightLb)
  const [reps, setReps] = useState(() => prefill?.reps ?? defaults.reps)
  const [isWarmup, setIsWarmup] = useState(false)
  const [kgDecimals, setKgDecimals] = useState<1 | 2>(1)

  // UI state
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [recentExercises, setRecentExercises] = useState<{ key: string; name: string }[]>([])
  const [loadingExercises, setLoadingExercises] = useState(true)
  const [showRestTimer, setShowRestTimer] = useState(false)
  const [showPlateCalc, setShowPlateCalc] = useState(false)
  const [, setFavoritesVersion] = useState(0)

  const { toast, showToast, hideToast } = useToast()
  const exerciseInputRef = useRef<HTMLInputElement>(null)

  // Get favorites
  const favoriteExercises = useFavoriteExercises(recentExercises)

  // Listen for favorites changes
  useEffect(() => {
    const handler = () => setFavoritesVersion(v => v + 1)
    window.addEventListener('favorites-changed', handler)
    return () => window.removeEventListener('favorites-changed', handler)
  }, [])

  // Handle prefill from History copy
  useEffect(() => {
    if (prefill) {
      if (prefill.user) setUser(prefill.user)
      if (prefill.exercise) setExercise(prefill.exercise)
      if (prefill.weightLb !== undefined) setWeightLb(prefill.weightLb)
      if (prefill.reps !== undefined) setReps(prefill.reps)
      onPrefillConsumed?.()
    }
  }, [prefill, onPrefillConsumed])

  // Handle URL exercise param
  useEffect(() => {
    const exerciseParam = searchParams.get('exercise')
    if (exerciseParam) {
      setExercise(exerciseParam)
    }
  }, [searchParams])

  // Load recent exercises
  useEffect(() => {
    if (!groupId) return
    setLoadingExercises(true)
    fetchRecentExercises(groupId)
      .then(setRecentExercises)
      .catch(console.error)
      .finally(() => setLoadingExercises(false))
  }, [groupId])

  // Save user selection
  const handleUserChange = (newUser: string) => {
    setUser(newUser)
    setLastUser(newUser)
  }

  // Handle exercise selection from chips
  const handleExerciseSelect = (name: string, _key: string) => {
    setExercise(name)
  }

  // Handle start session
  const handleStartSession = async () => {
    try {
      await startSession()
      showToast('Session started! 💪')
    } catch {
      showToast('Failed to start session')
    }
  }

  // Validation
  const isValid = exercise.trim().length > 0 && weightLb >= 0 && reps >= 0

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || saving) return

    setError('')
    setSaving(true)

    try {
      const exerciseKey = normalizeExerciseKey(exercise)
      
      await insertSet({
        group_id: groupId,
        user_name: user,
        exercise: exercise.trim(),
        exercise_key: exerciseKey,
        weight_lb: weightLb,
        reps: reps,
        is_warmup: isWarmup,
        session_id: activeSession?.id || null,
      })

      // Persist defaults
      setLastDefaults({
        exercise: exercise.trim(),
        weightLb,
        reps,
      })

      // Refresh recent exercises
      fetchRecentExercises(groupId).then(setRecentExercises).catch(console.error)
      
      // Refresh session sets if in a session
      if (activeSession) {
        refreshSets()
      }

      showToast('Saved ✅')
      
      // Show rest timer (only for working sets)
      if (!isWarmup) {
        setShowRestTimer(true)
      }

      // Reset warmup toggle
      setIsWarmup(false)
    } catch (err) {
      console.error('Save failed:', err)
      setError('Failed to save. Check connection.')
    } finally {
      setSaving(false)
    }
  }

  // Plate calculator
  const { plates, remainder } = calculatePlates(weightLb)

  return (
    <div className="p-4 space-y-6">
      <Toast message={toast.message} visible={toast.visible} onHide={hideToast} />
      <RestTimerPill active={showRestTimer} onDismiss={() => setShowRestTimer(false)} />

      {/* Session Banner */}
      <SessionBanner
        session={activeSession}
        sessionSets={sessionSets}
        onStartSession={handleStartSession}
        loading={sessionLoading}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Picker */}
        <div className="space-y-2">
          <label className="block text-sm text-zinc-400">Who's lifting?</label>
          <UserPicker value={user} onChange={handleUserChange} />
        </div>

        {/* Exercise */}
        <div className="space-y-2">
          <label className="block text-sm text-zinc-400">Exercise</label>
          <input
            ref={exerciseInputRef}
            type="text"
            value={exercise}
            onChange={(e) => setExercise(e.target.value)}
            placeholder="e.g., Bench Press"
            autoComplete="off"
            autoCapitalize="words"
            className="w-full h-14 px-4 bg-zinc-800 rounded-xl text-white placeholder-zinc-500 text-lg border-0 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <ExerciseChips
            recentExercises={recentExercises}
            favoriteExercises={favoriteExercises}
            onSelect={handleExerciseSelect}
            loading={loadingExercises}
          />
        </div>

        {/* Weight */}
        <div className="space-y-1">
          <NumberStepper
            label="Weight (lbs)"
            value={weightLb}
            onChange={setWeightLb}
            step={5}
            min={0}
            subtitle={
              <div className="flex items-center gap-2">
                <span>{weightLb} lb = {lbToKg(weightLb, kgDecimals)} kg</span>
                <button
                  type="button"
                  onClick={() => setKgDecimals(kgDecimals === 1 ? 2 : 1)}
                  className="text-zinc-600 text-xs underline"
                >
                  {kgDecimals === 1 ? '.0' : '.00'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPlateCalc(true)}
                  className="text-zinc-600 text-xs underline ml-2"
                >
                  plates
                </button>
              </div>
            }
          />
        </div>

        {/* Reps */}
        <NumberStepper
          label="Reps"
          value={reps}
          onChange={setReps}
          step={1}
          min={0}
        />

        {/* Warmup toggle */}
        <button
          type="button"
          onClick={() => setIsWarmup(!isWarmup)}
          className={`
            w-full h-12 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2
            ${isWarmup 
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
              : 'bg-zinc-800 text-zinc-400 border border-transparent'
            }
          `}
        >
          {isWarmup ? '🔥 Warmup Set' : '💪 Working Set (tap to toggle)'}
        </button>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!isValid || saving}
          className={`
            w-full h-14 rounded-xl font-semibold text-lg transition-all
            ${isValid && !saving
              ? 'bg-green-500 text-white active:bg-green-600'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }
          `}
        >
          {saving ? 'Saving...' : 'Save Set'}
        </button>
      </form>

      {/* Plate Calculator Modal */}
      <Modal
        open={showPlateCalc}
        onClose={() => setShowPlateCalc(false)}
        title="Plate Calculator"
      >
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-white">{weightLb} lb</p>
            <p className="text-zinc-500 text-sm">with 45 lb bar</p>
          </div>
          
          {weightLb > 45 ? (
            <div className="space-y-3">
              <p className="text-zinc-400 text-sm text-center">Each side:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {plates.map((plate, i) => (
                  <div
                    key={i}
                    className={`
                      px-4 py-2 rounded-lg font-bold text-lg
                      ${plate === 45 ? 'bg-blue-500 text-white' :
                        plate === 35 ? 'bg-yellow-500 text-black' :
                        plate === 25 ? 'bg-green-500 text-white' :
                        plate === 10 ? 'bg-zinc-600 text-white' :
                        plate === 5 ? 'bg-zinc-500 text-white' :
                        'bg-zinc-400 text-black'
                      }
                    `}
                  >
                    {plate}
                  </div>
                ))}
              </div>
              {remainder > 0 && (
                <p className="text-amber-400 text-sm text-center">
                  +{remainder * 2} lb remaining (need smaller plates)
                </p>
              )}
            </div>
          ) : (
            <p className="text-zinc-500 text-center">Just the bar!</p>
          )}
        </div>
      </Modal>
    </div>
  )
}
