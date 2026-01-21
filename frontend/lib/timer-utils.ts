import type { TimerState, SessionType } from "./types"

// Timer constants
export const TIMER_DURATIONS = {
  work: 25 * 60,        // 25 minutes in seconds
  "short-break": 5 * 60, // 5 minutes
  "long-break": 15 * 60  // 15 minutes
} as const

export const POMODOROS_BEFORE_LONG_BREAK = 4

// localStorage key helper
export function getTimerStorageKey(taskId: string): string {
  return `pomodoro-active-${taskId}`
}

// Load timer state from localStorage
export function loadTimerState(taskId: string): TimerState | null {
  if (typeof globalThis.window === "undefined") return null

  try {
    const key = getTimerStorageKey(taskId)
    const data = localStorage.getItem(key)
    if (!data) return null

    const state = JSON.parse(data) as TimerState

    // Calculate elapsed time if timer was active
    if (state.isActive && !state.isPaused) {
      const now = Date.now()
      const elapsed = Math.floor((now - state.lastTick) / 1000)
      state.timeRemaining = Math.max(0, state.timeRemaining - elapsed)
      state.lastTick = now
    }

    return state
  } catch (error) {
    console.error("Failed to load timer state:", error)
    return null
  }
}

// Save timer state to localStorage
export function saveTimerState(taskId: string, state: TimerState): void {
  if (typeof globalThis.window === "undefined") return

  try {
    const key = getTimerStorageKey(taskId)
    localStorage.setItem(key, JSON.stringify(state))
  } catch (error) {
    console.error("Failed to save timer state:", error)
  }
}

// Clear timer state from localStorage
export function clearTimerState(taskId: string): void {
  if (typeof globalThis.window === "undefined") return

  try {
    const key = getTimerStorageKey(taskId)
    localStorage.removeItem(key)
  } catch (error) {
    console.error("Failed to clear timer state:", error)
  }
}

// Get initial state for a new timer
export function getInitialTimerState(): TimerState {
  return {
    sessionType: "work",
    timeRemaining: TIMER_DURATIONS.work,
    pomodoroCount: 0,
    isActive: false,
    isPaused: false,
    lastTick: Date.now(),
    sessionStartedAt: new Date().toISOString()
  }
}

// Determine next session type based on current pomodoro count
export function getNextSessionType(currentCount: number): SessionType {
  if (currentCount >= POMODOROS_BEFORE_LONG_BREAK) {
    return "long-break"
  }
  return "short-break"
}

// Format seconds to MM:SS
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

// Get duration for a session type
export function getSessionDuration(sessionType: SessionType): number {
  return TIMER_DURATIONS[sessionType]
}
