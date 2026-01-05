const USERS = ['Wassim', 'Hamza', 'Theo', 'Vince'] as const

interface UserPickerProps {
  value: string
  onChange: (user: string) => void
}

export function UserPicker({ value, onChange }: UserPickerProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {USERS.map((user) => (
        <button
          key={user}
          type="button"
          onClick={() => onChange(user)}
          className={`
            h-12 rounded-xl font-medium text-sm transition-all
            ${value === user
              ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
              : 'bg-zinc-800 text-zinc-300 active:bg-zinc-700'
            }
          `}
        >
          {user}
        </button>
      ))}
    </div>
  )
}

export { USERS }

