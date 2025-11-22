"use client"
import type { FilterType, SortDirection } from "@/lib/types"
import { ArrowDownUp, Check } from "lucide-react"

interface TaskFiltersProps {
  currentFilter: FilterType
  onFilterChange: (filter: FilterType) => void
  sortDirection: SortDirection
  onSortChange: () => void
}

export function TaskFilters({ currentFilter, onFilterChange, sortDirection, onSortChange }: TaskFiltersProps) {
  const filters: { value: FilterType; label: string }[] = [
    { value: "all", label: "All" },
    { value: "todo", label: "To Do" },
    { value: "in-progress", label: "In Progress" },
    { value: "done", label: "Done" },
  ]

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
      {/* Filters with Scrollbar Hidden via utility classes */}
      <div className="flex items-center gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={`group relative rounded-full px-4 py-1.5 text-sm font-medium transition-all whitespace-nowrap ${
              currentFilter === filter.value
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {filter.label}
            {currentFilter === filter.value && <Check className="ml-1.5 inline-block h-3.5 w-3.5 text-slate-300" />}
          </button>
        ))}
      </div>

      {/* Sort */}
      <button
        onClick={onSortChange}
        className="flex w-fit items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
      >
        <span className="text-slate-400 text-xs uppercase tracking-wider font-medium">Sort by time:</span>
        <div className="flex items-center gap-1">
          {sortDirection === "asc" ? "Shortest First" : "Longest First"}
          <ArrowDownUp className="h-3.5 w-3.5" />
        </div>
      </button>
    </div>
  )
}
