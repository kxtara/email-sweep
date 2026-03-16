import { useEffect, useState } from 'react'

interface ProgressIndicatorProps {
  isActive: boolean
  statusMessages?: string[]
}

export function ProgressIndicator({ isActive, statusMessages = [] }: ProgressIndicatorProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)

  useEffect(() => {
    if (!isActive || statusMessages.length === 0) return

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % statusMessages.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [isActive, statusMessages])

  if (!isActive) return null

//   const progress = ((currentMessageIndex + 1) / statusMessages.length) * 100

 return (
    <div className="modal-overlay">
      <div className="modal-content text-center">
        <div className="progress-radial-container mb-6">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="364.4" strokeDashoffset="100" className="text-blue-600 transition-all duration-500" />
          </svg>
        </div>
        <p className="text-lg font-medium text-slate-900 animate-pulse-soft">
          {statusMessages[currentMessageIndex]}
        </p>
      </div>
    </div>
  );
}
