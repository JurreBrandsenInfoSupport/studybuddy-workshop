"use client"
import type { StudyTask, TaskStatus, TaskDifficulty, FunRating } from "@/lib/types"
import { Clock, BookOpen, Trash2, Signal, Smile } from "lucide-react"
import { useState } from "react"

interface TaskCardProps {
  task: StudyTask
  onStatusChange: (id: string, status: TaskStatus, funRating?: FunRating) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isUpdating: boolean
}

export function TaskCard({ task, onStatusChange, onDelete, isUpdating }: TaskCardProps) {
  const [showFunRating, setShowFunRating] = useState(false)

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

  const handleCompleteClick = () => {
    setShowFunRating(true)
  }

  const handleFunRatingSelect = async (rating: FunRating) => {
    setShowFunRating(false)
    await onStatusChange(task.id, "done", rating)
  }

  const handleSkipRating = async () => {
    setShowFunRating(false)
    await onStatusChange(task.id, "done")
  }

  const handleDialogClose = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleSkipRating()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleSkipRating()
    }
  }

  return (
    <>
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
            {task.status === "done" && task.funRating && (
              <div className="flex items-center gap-1.5">
                <Smile className="h-4 w-4 text-amber-500" />
                <span className="font-medium text-amber-700">
                  {"⭐".repeat(task.funRating)}
                </span>
              </div>
            )}
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
                onClick={handleCompleteClick}
                className="flex-1 rounded-lg border border-emerald-200 bg-emerald-50 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                Complete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Fun Rating Dialog */}
      {showFunRating && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={handleDialogClose}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-labelledby="fun-rating-title"
          aria-describedby="fun-rating-description"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                <Smile className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 id="fun-rating-title" className="text-lg font-bold text-slate-900">How fun was this task?</h3>
                <p id="fun-rating-description" className="text-sm text-slate-500">Rate your experience</p>
              </div>
            </div>

            <div className="flex justify-center gap-3 my-6">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleFunRatingSelect(rating as FunRating)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-slate-200 hover:border-amber-400 hover:bg-amber-50 transition-all duration-200"
                  aria-label={`Rate ${rating} star${rating > 1 ? 's' : ''}`}
                >
                  <span className="text-2xl">{"⭐".repeat(rating)}</span>
                  <span className="text-xs font-semibold text-slate-600">{rating}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleSkipRating}
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Skip rating
            </button>
          </div>
        </div>
      )}
    </>
  )
}
