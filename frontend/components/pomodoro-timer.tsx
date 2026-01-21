"use client"

import { Play, Pause, Square } from "lucide-react"
import { usePomodoro } from "@/lib/hooks/use-pomodoro"
import { formatTime } from "@/lib/timer-utils"

interface PomodoroTimerProps {
  taskId: string
}

export function PomodoroTimer({ taskId }: PomodoroTimerProps) {
  const { timerState, start, pause, resume, stop } = usePomodoro(taskId)

  const sessionTypeLabels = {
    work: "Focus",
    "short-break": "Short Break",
    "long-break": "Long Break",
  }

  const sessionTypeColors = {
    work: "bg-blue-500 text-white",
    "short-break": "bg-green-500 text-white",
    "long-break": "bg-purple-500 text-white",
  }

  const isRunning = timerState.isActive && !timerState.isPaused

  return (
    <div className="space-y-3">
      {/* Session Type Badge */}
      <div className="flex items-center justify-between">
        <div
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${sessionTypeColors[timerState.sessionType]}`}
        >
          {sessionTypeLabels[timerState.sessionType]}
        </div>
        <div className="text-xs text-slate-500">
          Pomodoro {timerState.pomodoroCount}/4
        </div>
      </div>

      {/* Timer Display */}
      <div className="text-center">
        <div
          className={`text-4xl font-bold tabular-nums ${
            isRunning ? "text-blue-600" : "text-slate-700"
          }`}
        >
          {formatTime(timerState.timeRemaining)}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {!timerState.isActive ? (
          <button
            onClick={start}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            <Play className="h-4 w-4" />
            Start
          </button>
        ) : timerState.isPaused ? (
          <>
            <button
              onClick={resume}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              <Play className="h-4 w-4" />
              Resume
            </button>
            <button
              onClick={stop}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Square className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={pause}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-amber-500 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
            >
              <Pause className="h-4 w-4" />
              Pause
            </button>
            <button
              onClick={stop}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Square className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
