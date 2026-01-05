interface NumberStepperProps {
  label: string
  value: number
  onChange: (value: number) => void
  step?: number
  min?: number
  max?: number
  subtitle?: React.ReactNode
}

export function NumberStepper({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  max = 9999,
  subtitle,
}: NumberStepperProps) {
  const decrement = () => {
    const newValue = Math.max(min, value - step)
    onChange(newValue)
  }

  const increment = () => {
    const newValue = Math.min(max, value + step)
    onChange(newValue)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '')
    const parsed = parseFloat(raw)
    if (!isNaN(parsed)) {
      onChange(Math.max(min, Math.min(max, parsed)))
    } else if (raw === '') {
      onChange(0)
    }
  }

  return (
    <div className="space-y-1">
      <label className="block text-sm text-zinc-400">{label}</label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={decrement}
          className="w-14 h-14 rounded-xl bg-zinc-800 text-2xl font-bold text-zinc-300 active:bg-zinc-700 transition-colors flex items-center justify-center"
        >
          −
        </button>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleInputChange}
          className="flex-1 h-14 bg-zinc-800 rounded-xl text-center text-2xl font-bold text-white border-0 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="button"
          onClick={increment}
          className="w-14 h-14 rounded-xl bg-zinc-800 text-2xl font-bold text-zinc-300 active:bg-zinc-700 transition-colors flex items-center justify-center"
        >
          +
        </button>
      </div>
      {subtitle && <div className="text-sm text-zinc-500">{subtitle}</div>}
    </div>
  )
}

