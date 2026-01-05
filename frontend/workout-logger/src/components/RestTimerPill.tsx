import { useState, useEffect, useCallback } from "react";
import { formatTimer } from "../lib/units";
import { getRestTimerDuration, setRestTimerDuration } from "../lib/storage";

interface RestTimerPillProps {
  active: boolean;
  onDismiss: () => void;
}

export function RestTimerPill({ active, onDismiss }: RestTimerPillProps) {
  const [seconds, setSeconds] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [duration, setDuration] = useState(getRestTimerDuration);

  // Reset timer when activated
  useEffect(() => {
    if (active) {
      setSeconds(duration);
      setPaused(false);
    }
  }, [active, duration]);

  // Countdown logic
  useEffect(() => {
    if (!active || paused || seconds <= 0) return;

    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          // Timer finished - could add vibration here
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [active, paused, seconds]);

  const handleDurationChange = useCallback((newDuration: number) => {
    setDuration(newDuration);
    setRestTimerDuration(newDuration);
    setSeconds(newDuration);
    setShowSettings(false);
  }, []);

  if (!active) return null;

  const isFinished = seconds === 0;
  const progress = duration > 0 ? (seconds / duration) * 100 : 0;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40">
      {showSettings ? (
        <div className="bg-zinc-800 rounded-2xl p-3 shadow-lg flex gap-2">
          {[60, 90, 120, 180].map((s) => (
            <button
              key={s}
              onClick={() => handleDurationChange(s)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                duration === s
                  ? "bg-green-500 text-white"
                  : "bg-zinc-700 text-zinc-300 active:bg-zinc-600"
              }`}
            >
              {s}s
            </button>
          ))}
        </div>
      ) : (
        <div
          className={`
            relative overflow-hidden rounded-full px-5 py-3 shadow-lg
            flex items-center gap-3 cursor-pointer
            ${isFinished ? "bg-green-500" : "bg-zinc-800"}
          `}
          onClick={() => setPaused(!paused)}
        >
          {/* Progress background */}
          {!isFinished && (
            <div
              className="absolute inset-0 bg-green-500/20 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          )}

          {/* Content */}
          <span className="relative text-2xl font-mono font-bold text-white">
            {isFinished ? "✓ GO!" : formatTimer(seconds)}
          </span>

          {!isFinished && (
            <span className="relative text-xs text-zinc-400">
              {paused ? "tap to resume" : "tap to pause"}
            </span>
          )}

          {/* Action buttons */}
          <div className="relative flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSettings(true);
              }}
              className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white"
            >
              ⚙️
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
              className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
