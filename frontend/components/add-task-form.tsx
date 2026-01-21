"use client"

import type React from "react"
import { useState } from "react"
import type { CreateTaskInput } from "@/lib/types"
import { Plus, Loader2, X } from "lucide-react"

interface AddTaskFormProps {
  onAddTask: (task: CreateTaskInput) => Promise<void>
}

export function AddTaskForm({ onAddTask }: AddTaskFormProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    estimatedMinutes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.subject || !formData.estimatedMinutes) return

    const minutes = Number.parseInt(formData.estimatedMinutes)
    if (isNaN(minutes) || minutes <= 0) return

    setIsSubmitting(true)
    try {
      await onAddTask({
        title: formData.title,
        subject: formData.subject,
        estimatedMinutes: minutes,
      })

      // Reset and close
      setFormData({ title: "", subject: "", estimatedMinutes: "" })
      setIsExpanded(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="group flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-4 text-left transition-all hover:border-indigo-500 hover:bg-indigo-50/50"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 transition-transform group-hover:scale-110">
          <Plus className="h-6 w-6" />
        </div>
        <div>
          <p className="font-semibold text-slate-700 group-hover:text-indigo-900">Add New Task</p>
          <p className="text-sm text-slate-500">Plan your next study session</p>
        </div>
      </button>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-lg ring-4 ring-slate-50 animate-in fade-in slide-in-from-top-2">
      <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-bold text-slate-800">New Study Task</h3>
        <button
          onClick={() => setIsExpanded(false)}
          className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="title" className="mb-1.5 block text-sm font-semibold text-slate-700">
            Task Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            required
            placeholder="e.g., Complete Calculus Problem Set"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="subject" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              id="subject"
              type="text"
              required
              list="subjects-list"
              placeholder="Select or type..."
              value={formData.subject}
              onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <datalist id="subjects-list">
              <option value="Math" />
              <option value="Science" />
              <option value="History" />
              <option value="Literature" />
              <option value="Computer Science" />
              <option value="Languages" />
            </datalist>
          </div>

          <div>
            <label htmlFor="minutes" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Est. Minutes <span className="text-red-500">*</span>
            </label>
            <input
              id="minutes"
              type="number"
              required
              min="1"
              placeholder="45"
              value={formData.estimatedMinutes}
              onChange={(e) => setFormData((prev) => ({ ...prev, estimatedMinutes: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            "Create Task"
          )}
        </button>
      </form>
    </div>
  )
}
