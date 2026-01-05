import { useState } from 'react'

interface GroupGateProps {
  onSubmit: (groupId: string) => void
}

export function GroupGate({ onSubmit }: GroupGateProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = code.trim()
    if (!trimmed) {
      setError('Please enter a group code')
      return
    }
    if (trimmed.length < 3) {
      setError('Code must be at least 3 characters')
      return
    }
    onSubmit(trimmed)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-950">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo/Title */}
        <div className="text-center space-y-2">
          <div className="text-5xl">🏋️</div>
          <h1 className="text-2xl font-bold text-white">Workout Logger</h1>
          <p className="text-zinc-500">Enter your group code to get started</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setError('')
              }}
              placeholder="Group code"
              autoFocus
              autoComplete="off"
              autoCapitalize="off"
              className="w-full h-14 px-4 bg-zinc-800 rounded-xl text-white placeholder-zinc-500 text-lg text-center font-mono tracking-wider border-0 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full h-14 bg-green-500 text-white font-semibold rounded-xl text-lg active:bg-green-600 transition-colors"
          >
            Join Group
          </button>
        </form>

        {/* Info */}
        <p className="text-xs text-zinc-600 text-center">
          Share the same code with your friends to log workouts together.
          <br />
          Or use <code className="text-zinc-500">?g=CODE</code> in the URL.
        </p>
      </div>
    </div>
  )
}

