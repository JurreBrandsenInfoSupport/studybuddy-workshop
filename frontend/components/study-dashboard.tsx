"use client"

import { useState, useEffect } from "react"
import type { StudyTask, FilterType, SortDirection, CreateTaskInput, TaskStatus, FunRating } from "@/lib/types"
import { fetchTasks, createTask, updateTaskStatus, deleteTask } from "@/lib/api"
import { TaskCard } from "./task-card"
import { AddTaskForm } from "./add-task-form"
import { TaskFilters } from "./task-filters"
import { GraduationCap, Loader2, BookOpenCheck, Layout } from "lucide-react"

export function StudyDashboard() {
  // --- STATE ---
  const [tasks, setTasks] = useState<StudyTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filter, setFilter] = useState<FilterType>("all")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [updatingTaskIds, setUpdatingTaskIds] = useState<Set<string>>(new Set())

  // --- INITIAL LOAD ---
  useEffect(() => {
    loadTasks()
  }, [])

  async function loadTasks() {
    try {
      setIsLoading(true)
      const data = await fetchTasks()
      setTasks(data)
      setError(null)
    } catch (err) {
      setError("Failed to load tasks. The server might be down.")
    } finally {
      setIsLoading(false)
    }
  }

  // --- ACTIONS ---
  const handleAddTask = async (input: CreateTaskInput) => {
    try {
      // Optimistic update could go here, but we'll wait for server response
      const newTask = await createTask(input)
      setTasks((prev) => [newTask, ...prev])
    } catch (err) {
      alert("Failed to create task.")
    }
  }

  const handleStatusChange = async (id: string, newStatus: TaskStatus, funRating?: FunRating) => {
    setUpdatingTaskIds((prev) => new Set(prev).add(id))
    try {
      const updatedTask = funRating !== undefined 
        ? await updateTaskStatus(id, newStatus, funRating)
        : await updateTaskStatus(id, newStatus)
      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)))
    } catch (err) {
      console.error(err)
    } finally {
      setUpdatingTaskIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return
    setUpdatingTaskIds((prev) => new Set(prev).add(id))
    try {
      await deleteTask(id)
      setTasks((prev) => prev.filter((t) => t.id !== id))
    } finally {
      setUpdatingTaskIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  // --- FILTERING & SORTING ---
  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true
    return task.status === filter
  })

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortDirection === "asc") {
      return a.estimatedMinutes - b.estimatedMinutes
    }
    return b.estimatedMinutes - a.estimatedMinutes
  })

  // --- STATS ---
  const stats = {
    total: tasks.length,
    done: tasks.filter((t) => t.status === "done").length,
    todo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    minutesLeft: tasks.filter((t) => t.status !== "done").reduce((acc, t) => acc + t.estimatedMinutes, 0),
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* Navbar */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none text-slate-900">StudyBuddy+</h1>
              <p className="text-xs font-medium text-slate-500">Task Manager</p>
            </div>
          </div>

          {/* Desktop Stats */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            <div className="text-right">
              <p className="font-bold text-slate-800">
                {stats.done} / {stats.total}
              </p>
              <p className="text-xs text-slate-500">Tasks Done</p>
            </div>
            <div className="h-8 w-px bg-slate-100"></div>
            <div className="text-right">
              <p className="font-bold text-indigo-600">{Math.round((stats.minutesLeft / 60) * 10) / 10} hrs</p>
              <p className="text-xs text-slate-500">Est. Remaining</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Sidebar: Add Task & Progress */}
          <div className="lg:col-span-4 space-y-6">
            <AddTaskForm onAddTask={handleAddTask} />

            {/* Progress Widget */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-slate-800">
                <Layout className="h-4 w-4 text-slate-400" />
                <h3 className="font-bold text-sm uppercase tracking-wide">Your Progress</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="mb-1 flex justify-between text-xs font-medium">
                    <span className="text-slate-600">To Do</span>
                    <span className="text-slate-900">{stats.todo}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full bg-slate-300 transition-all duration-500"
                      style={{ width: `${(stats.todo / Math.max(stats.total, 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex justify-between text-xs font-medium">
                    <span className="text-blue-600">In Progress</span>
                    <span className="text-blue-900">{stats.inProgress}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-blue-50">
                    <div
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${(stats.inProgress / Math.max(stats.total, 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex justify-between text-xs font-medium">
                    <span className="text-emerald-600">Completed</span>
                    <span className="text-emerald-900">{stats.done}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-50">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${(stats.done / Math.max(stats.total, 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content: Task List */}
          <div className="lg:col-span-8 space-y-6">
            <TaskFilters
              currentFilter={filter}
              onFilterChange={setFilter}
              sortDirection={sortDirection}
              onSortChange={() => setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))}
            />

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 p-4 text-red-600 text-center text-sm">
                {error}{" "}
                <button onClick={loadTasks} className="underline font-bold ml-1">
                  Retry
                </button>
              </div>
            )}

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin mb-4 text-indigo-500" />
                <p>Loading your tasks...</p>
              </div>
            ) : sortedTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-20 text-center">
                <div className="mb-4 rounded-full bg-white p-4 shadow-sm">
                  <BookOpenCheck className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="mb-1 text-lg font-bold text-slate-900">No tasks found</h3>
                <p className="text-slate-500 max-w-xs mx-auto">
                  {filter !== "all"
                    ? `You don't have any ${filter.replace("-", " ")} tasks.`
                    : "You're all caught up! Add a new task to get started."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {sortedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    isUpdating={updatingTaskIds.has(task.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
