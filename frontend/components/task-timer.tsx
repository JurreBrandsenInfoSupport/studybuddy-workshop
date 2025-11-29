"use client"

import { useState, useEffect } from "react"
import { Play, Pause, Square, Timer } from "lucide-react"
import { useTimer } from "@/hooks/useTimer"
import type { StudyTask, TimerMode } from "@/lib/types"
import { startTimer, stopTimer } from "@/lib/api"

interface TaskTimerProps {
  task: StudyTask
  onTimerUpdate: (taskId: string) => void
}

export function TaskTimer({ task, onTimerUpdate }: TaskTimerProps) {
  const [mode, setMode] = useState<TimerMode>("normal")
  
  const {
    state,
    seconds,
    phase,
    intervals,
    targetDuration,
    start,
    pause,
    stop,
  } = useTimer({
    taskId: task.id,
    mode,
    onPhaseChange: (newPhase) => {
      // Show notification
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        new Notification(
          newPhase === "break" ? "Break Time! 🎉" : "Focus Time! 📚",
          {
            body: newPhase === "break" 
              ? "Take a 5-minute break" 
              : "Time to focus for 25 minutes",
          }
        )
      }
    },
  })
  
  // Request notification permission
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])
  
  // Sync with backend
  const handleStart = async () => {
    try {
      await startTimer(task.id, mode)
      start()
    } catch (error) {
      console.error("Failed to start timer:", error)
    }
  }
  
  const handleStop = async () => {
    try {
      await stopTimer(task.id)
      stop()
      onTimerUpdate(task.id)
    } catch (error) {
      console.error("Failed to stop timer:", error)
    }
  }
  
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }
  
  const progress = mode === "pomodoro" && targetDuration > 0
    ? (seconds / targetDuration) * 100
    : 0
  
  return (
    <div className="border-t border-slate-100 pt-3 mt-3">
      {/* Timer Display */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-700">
            {formatTime(seconds)}
          </span>
          {mode === "pomodoro" && (
            <span className="text-xs text-slate-500">
              {phase === "focus" ? "Focus" : "Break"} • {intervals} intervals
            </span>
          )}
        </div>
        
        {/* Actual vs Estimated */}
        {task.actualMinutes > 0 && (
          <span className="text-xs text-slate-500">
            {task.actualMinutes} / {task.estimatedMinutes} min
          </span>
        )}
      </div>
      
      {/* Progress Bar (Pomodoro) */}
      {mode === "pomodoro" && state !== "idle" && (
        <div className="w-full h-1 bg-slate-100 rounded-full mb-2 overflow-hidden">
          <div 
            className={`h-full transition-all ${phase === "focus" ? "bg-blue-500" : "bg-emerald-500"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      {/* Controls */}
      <div className="flex gap-2">
        {state === "idle" && (
          <>
            <button
              onClick={handleStart}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
            >
              <Play className="h-3 w-3" />
              Start
            </button>
            <button
              onClick={() => setMode(mode === "normal" ? "pomodoro" : "normal")}
              className="px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50"
              title={mode === "pomodoro" ? "Switch to Normal Timer" : "Switch to Pomodoro Timer"}
            >
              {mode === "pomodoro" ? "🍅" : "⏱️"}
            </button>
          </>
        )}
        
        {state === "running" && (
          <>
            <button
              onClick={pause}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-yellow-500 py-1.5 text-xs font-semibold text-white hover:bg-yellow-600"
            >
              <Pause className="h-3 w-3" />
              Pause
            </button>
            <button
              onClick={handleStop}
              className="px-3 rounded-lg border border-red-200 bg-red-50 text-xs font-semibold text-red-600 hover:bg-red-100"
            >
              <Square className="h-3 w-3" />
            </button>
          </>
        )}
        
        {state === "paused" && (
          <>
            <button
              onClick={start}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
            >
              <Play className="h-3 w-3" />
              Resume
            </button>
            <button
              onClick={handleStop}
              className="px-3 rounded-lg border border-red-200 bg-red-50 text-xs font-semibold text-red-600 hover:bg-red-100"
            >
              <Square className="h-3 w-3" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
