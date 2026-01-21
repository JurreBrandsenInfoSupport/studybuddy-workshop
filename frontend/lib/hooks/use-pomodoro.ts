"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { TimerState, SessionType } from "../types"
import {
  loadTimerState,
  saveTimerState,
  clearTimerState,
  getInitialTimerState,
  getNextSessionType,
  getSessionDuration,
} from "../timer-utils"
import { startTimerSession, completeTimerSession } from "../api"

export function usePomodoro(taskId: string) {
  const [timerState, setTimerState] = useState<TimerState>(() => {
    return loadTimerState(taskId) || getInitialTimerState()
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const completionCallbackRef = useRef<(() => void) | null>(null)

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (timerState.isActive || timerState.isPaused) {
      saveTimerState(taskId, timerState)
    }
  }, [taskId, timerState])

  // Countdown effect
  useEffect(() => {
    if (!timerState.isActive || timerState.isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => {
      setTimerState((prev) => {
        const now = Date.now()
        const newTimeRemaining = prev.timeRemaining - 1

        if (newTimeRemaining <= 0) {
          // Session complete
          if (completionCallbackRef.current) {
            completionCallbackRef.current()
          }
          return prev
        }

        return {
          ...prev,
          timeRemaining: newTimeRemaining,
          lastTick: now,
        }
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [timerState.isActive, timerState.isPaused])

  const start = useCallback(async () => {
    try {
      await startTimerSession(taskId, timerState.sessionType)

      setTimerState((prev) => ({
        ...prev,
        isActive: true,
        isPaused: false,
        lastTick: Date.now(),
        sessionStartedAt: new Date().toISOString(),
      }))
    } catch (error) {
      console.error("Failed to start timer:", error)
      alert("Failed to start timer. Please try again.")
    }
  }, [taskId, timerState.sessionType])

  const pause = useCallback(() => {
    setTimerState((prev) => ({
      ...prev,
      isPaused: true,
    }))
  }, [])

  const resume = useCallback(() => {
    setTimerState((prev) => ({
      ...prev,
      isPaused: false,
      lastTick: Date.now(),
    }))
  }, [])

  const stop = useCallback(() => {
    setTimerState(getInitialTimerState())
    clearTimerState(taskId)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [taskId])

  const complete = useCallback(
    async (sessionType: SessionType, durationMinutes: number) => {
      try {
        await completeTimerSession(taskId, sessionType, durationMinutes)
      } catch (error) {
        console.error("Failed to record completed session:", error)
        // Don't block the UI - session is complete locally
      }
    },
    [taskId]
  )

  const handleSessionComplete = useCallback(async () => {
    const { sessionType, pomodoroCount } = timerState
    const duration = Math.ceil(getSessionDuration(sessionType) / 60) // Convert to minutes

    // Record completion in backend
    await complete(sessionType, duration)

    // Determine next session
    let nextSessionType: SessionType
    let nextPomodoroCount = pomodoroCount

    if (sessionType === "work") {
      nextPomodoroCount++
      nextSessionType = getNextSessionType(nextPomodoroCount)
    } else if (sessionType === "long-break") {
      nextPomodoroCount = 0
      nextSessionType = "work"
    } else {
      nextSessionType = "work"
    }

    // Show alert
    if (sessionType === "work") {
      const breakType = nextSessionType === "long-break" ? "long" : "short"
      alert(`Pomodoro complete! Time for a ${breakType} break.`)
    } else {
      alert("Break complete! Time to focus.")
    }

    // Update state for next session
    setTimerState({
      sessionType: nextSessionType,
      timeRemaining: getSessionDuration(nextSessionType),
      pomodoroCount: nextPomodoroCount,
      isActive: false,
      isPaused: false,
      lastTick: Date.now(),
      sessionStartedAt: new Date().toISOString(),
    })
  }, [timerState, complete])

  // Set completion callback
  useEffect(() => {
    completionCallbackRef.current = handleSessionComplete
  }, [handleSessionComplete])

  return {
    timerState,
    start,
    pause,
    resume,
    stop,
  }
}
