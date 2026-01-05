import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  visible: boolean
  onHide: () => void
  duration?: number
}

export function Toast({ message, visible, onHide, duration = 2000 }: ToastProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (visible) {
      setShow(true)
      const timer = setTimeout(() => {
        setShow(false)
        setTimeout(onHide, 200) // Wait for animation
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [visible, duration, onHide])

  if (!visible && !show) return null

  return (
    <div
      className={`
        fixed top-20 left-1/2 -translate-x-1/2 z-50
        px-4 py-3 rounded-xl bg-green-500 text-white font-medium shadow-lg
        transition-all duration-200
        ${show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
    >
      {message}
    </div>
  )
}

// Hook for easy toast management
export function useToast() {
  const [toast, setToast] = useState({ visible: false, message: '' })

  const showToast = (message: string) => {
    setToast({ visible: true, message })
  }

  const hideToast = () => {
    setToast({ visible: false, message: '' })
  }

  return { toast, showToast, hideToast }
}

