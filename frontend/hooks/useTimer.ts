import { useState, useEffect, useCallback, useRef } from "react"
import type { TimerState, PomodoroPhase, TimerMode } from "@/lib/types"

const POMODORO_FOCUS = 25 * 60 // 25 minutes in seconds
const POMODORO_BREAK = 5 * 60  // 5 minutes in seconds

interface UseTimerOptions {
  taskId: string
  mode: TimerMode
  onComplete?: () => void
  onPhaseChange?: (phase: PomodoroPhase) => void
}

export function useTimer({ taskId, mode, onComplete, onPhaseChange }: UseTimerOptions) {
  const [state, setState] = useState<TimerState>("idle")
  const [seconds, setSeconds] = useState(0)
  const [phase, setPhase] = useState<PomodoroPhase>("focus")
  const [intervals, setIntervals] = useState(0)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)
  
  // Calculate target duration based on mode and phase
  const targetDuration = mode === "pomodoro" 
    ? (phase === "focus" ? POMODORO_FOCUS : POMODORO_BREAK)
    : 0 // No limit for normal mode
  
  const start = useCallback(() => {
    setState("running")
    startTimeRef.current = Date.now() - (seconds * 1000)
  }, [seconds])
  
  const pause = useCallback(() => {
    setState("paused")
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])
  
  const stop = useCallback(() => {
    setState("idle")
    setSeconds(0)
    setPhase("focus")
    setIntervals(0)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    startTimeRef.current = null
  }, [])
  
  const reset = useCallback(() => {
    setSeconds(0)
    startTimeRef.current = Date.now()
  }, [])
  
  // Timer tick effect
  useEffect(() => {
    if (state === "running") {
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
          setSeconds(elapsed)
          
          // Pomodoro mode: Check if phase is complete
          if (mode === "pomodoro" && elapsed >= targetDuration) {
            if (phase === "focus") {
              setPhase("break")
              setIntervals(prev => prev + 1)
              onPhaseChange?.("break")
              reset()
            } else {
              setPhase("focus")
              onPhaseChange?.("focus")
              reset()
            }
          }
        }
      }, 1000)
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [state, mode, phase, targetDuration, onPhaseChange, reset])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])
  
  return {
    state,
    seconds,
    phase,
    intervals,
    targetDuration,
    start,
    pause,
    stop,
    reset,
  }
}
