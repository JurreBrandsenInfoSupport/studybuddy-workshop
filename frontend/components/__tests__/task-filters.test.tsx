import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskFilters } from '../task-filters'
import type { FilterType, SortDirection } from '@/lib/types'

describe('TaskFilters', () => {
  const mockOnFilterChange = jest.fn()
  const mockOnSortChange = jest.fn()

  beforeEach(() => {
    mockOnFilterChange.mockClear()
    mockOnSortChange.mockClear()
  })

  it('should render all filter buttons', () => {
    render(
      <TaskFilters
        currentFilter="all"
        onFilterChange={mockOnFilterChange}
        sortDirection="desc"
        onSortChange={mockOnSortChange}
      />
    )

    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('To Do')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('should highlight the current filter', () => {
    render(
      <TaskFilters
        currentFilter="todo"
        onFilterChange={mockOnFilterChange}
        sortDirection="desc"
        onSortChange={mockOnSortChange}
      />
    )

    const todoButton = screen.getByText('To Do')
    expect(todoButton).toHaveClass('bg-slate-900')
    expect(todoButton).toHaveClass('text-white')
  })

  it('should call onFilterChange when clicking a filter button', async () => {
    const user = userEvent.setup()
    render(
      <TaskFilters
        currentFilter="all"
        onFilterChange={mockOnFilterChange}
        sortDirection="desc"
        onSortChange={mockOnSortChange}
      />
    )

    await user.click(screen.getByText('To Do'))
    expect(mockOnFilterChange).toHaveBeenCalledWith('todo')
  })

  it('should display correct sort direction text', () => {
    const { rerender } = render(
      <TaskFilters
        currentFilter="all"
        onFilterChange={mockOnFilterChange}
        sortDirection="desc"
        onSortChange={mockOnSortChange}
      />
    )

    expect(screen.getByText('Longest First')).toBeInTheDocument()

    rerender(
      <TaskFilters
        currentFilter="all"
        onFilterChange={mockOnFilterChange}
        sortDirection="asc"
        onSortChange={mockOnSortChange}
      />
    )

    expect(screen.getByText('Shortest First')).toBeInTheDocument()
  })

  it('should call onSortChange when clicking sort button', async () => {
    const user = userEvent.setup()
    render(
      <TaskFilters
        currentFilter="all"
        onFilterChange={mockOnFilterChange}
        sortDirection="desc"
        onSortChange={mockOnSortChange}
      />
    )

    await user.click(screen.getByText('Longest First').closest('button')!)
    expect(mockOnSortChange).toHaveBeenCalled()
  })

  it('should show check icon on active filter', () => {
    render(
      <TaskFilters
        currentFilter="in-progress"
        onFilterChange={mockOnFilterChange}
        sortDirection="desc"
        onSortChange={mockOnSortChange}
      />
    )

    const inProgressButton = screen.getByText('In Progress')
    expect(inProgressButton.querySelector('svg')).toBeInTheDocument()
  })

  it('should handle all filter types correctly', async () => {
    const user = userEvent.setup()
    render(
      <TaskFilters
        currentFilter="all"
        onFilterChange={mockOnFilterChange}
        sortDirection="desc"
        onSortChange={mockOnSortChange}
      />
    )

    await user.click(screen.getByText('All'))
    expect(mockOnFilterChange).toHaveBeenCalledWith('all')

    await user.click(screen.getByText('To Do'))
    expect(mockOnFilterChange).toHaveBeenCalledWith('todo')

    await user.click(screen.getByText('In Progress'))
    expect(mockOnFilterChange).toHaveBeenCalledWith('in-progress')

    await user.click(screen.getByText('Done'))
    expect(mockOnFilterChange).toHaveBeenCalledWith('done')
  })

  it('should render sort label', () => {
    render(
      <TaskFilters
        currentFilter="all"
        onFilterChange={mockOnFilterChange}
        sortDirection="desc"
        onSortChange={mockOnSortChange}
      />
    )

    expect(screen.getByText('Sort by time:')).toBeInTheDocument()
  })
})
