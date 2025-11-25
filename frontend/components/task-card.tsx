"use client"
import type { StudyTask, TaskStatus, TaskDifficulty } from "@/lib/types"
import { Clock, BookOpen, Trash2, Signal } from "lucide-react"

interface TaskCardProps {
  task: StudyTask
  onStatusChange: (id: string, status: TaskStatus) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isUpdating: boolean
}

export function TaskCard({ task, onStatusChange, onDelete, isUpdating }: TaskCardProps) {
  const statusColors = {
    todo: "bg-white border-slate-200 hover:border-indigo-300",
    "in-progress": "bg-blue-50/50 border-blue-200 hover:border-blue-300",
    done: "bg-emerald-50/50 border-emerald-200 hover:border-emerald-300",
  }

  const badgeColors = {
    todo: "bg-slate-100 text-slate-600",
    "in-progress": "bg-blue-100 text-blue-700",
    done: "bg-emerald-100 text-emerald-700",
  }

  const difficultyConfig = {
    easy: {
      label: "Easy",
      color: "text-emerald-700",
      icon: "text-emerald-500",
    },
    medium: {
      label: "Medium",
      color: "text-amber-700",
      icon: "text-amber-500",
    },
    hard: {
      label: "Hard",
      color: "text-rose-700",
      icon: "text-rose-500",
    },
  }

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-xl border p-5 transition-all duration-200 shadow-sm hover:shadow-md ${statusColors[task.status]} ${isUpdating ? "opacity-60 pointer-events-none" : ""}`}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeColors[task.status]}`}
        >
          {task.status === "todo" && "To Do"}
          {task.status === "in-progress" && "In Progress"}
          {task.status === "done" && "Done"}
        </div>

        <button
          onClick={() => onDelete(task.id)}
          className="text-slate-400 hover:text-red-500 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
          title="Delete task"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div>
        <h3
          className={`mb-2 text-lg font-bold text-slate-800 leading-snug ${task.status === "done" ? "line-through opacity-60" : ""}`}
        >
          {task.title}
        </h3>

        <div className="mb-5 flex flex-wrap gap-3 text-sm text-slate-500">
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-slate-400" />
            <span className="font-medium text-slate-700">{task.subject}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-slate-400" />
            <span>{task.estimatedMinutes} min</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Signal className={`h-4 w-4 ${difficultyConfig[task.difficulty].icon}`} />
            <span className={`font-medium ${difficultyConfig[task.difficulty].color}`}>
              {difficultyConfig[task.difficulty].label}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto pt-3 border-t border-slate-100/50">
        <div className="flex gap-2">
          {task.status !== "todo" && (
            <button
              onClick={() => onStatusChange(task.id, "todo")}
              className="flex-1 rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              To Do
            </button>
          )}
          {task.status !== "in-progress" && (
            <button
              onClick={() => onStatusChange(task.id, "in-progress")}
              className="flex-1 rounded-lg bg-blue-600 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition-colors"
            >
              Start
            </button>
          )}
          {task.status !== "done" && (
            <button
              onClick={() => onStatusChange(task.id, "done")}
              className="flex-1 rounded-lg border border-emerald-200 bg-emerald-50 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
            >
              Complete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
