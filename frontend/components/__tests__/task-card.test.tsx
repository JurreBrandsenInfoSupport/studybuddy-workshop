import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskCard } from '../task-card'
import type { StudyTask, TaskStatus } from '@/lib/types'

describe('TaskCard', () => {
  const mockOnStatusChange = jest.fn()
  const mockOnDelete = jest.fn()

  const baseMockTask: StudyTask = {
    id: '1',
    title: 'Complete Math Assignment',
    subject: 'Mathematics',
    estimatedMinutes: 60,
    status: 'todo',
    difficulty: 'medium',
    createdAt: '2024-01-01T00:00:00Z',
  }

  beforeEach(() => {
    mockOnStatusChange.mockClear()
    mockOnDelete.mockClear()
  })

  it('should render task information correctly', () => {
    render(
      <TaskCard
        task={baseMockTask}
        onStatusChange={mockOnStatusChange}
        onDelete={mockOnDelete}
        isUpdating={false}
      />
    )

    expect(screen.getByText('Complete Math Assignment')).toBeInTheDocument()
    expect(screen.getByText('Mathematics')).toBeInTheDocument()
    expect(screen.getByText('60 min')).toBeInTheDocument()
    expect(screen.getByText('To Do')).toBeInTheDocument()
  })

  it('should display task difficulty', () => {
    const mockTask: StudyTask = {
      id: '1',
      title: 'Test Task',
      subject: 'Math',
      estimatedMinutes: 60,
      status: 'todo',
      difficulty: 'hard',
      createdAt: new Date().toISOString(),
    }

    render(
      <TaskCard
        task={mockTask}
        onStatusChange={mockOnStatusChange}
        onDelete={mockOnDelete}
        isUpdating={false}
      />
    )

    expect(screen.getByText('Hard')).toBeInTheDocument()
  })

  it('should display correct status badge for todo tasks', () => {
    render(
      <TaskCard
        task={baseMockTask}
        onStatusChange={mockOnStatusChange}
        onDelete={mockOnDelete}
        isUpdating={false}
      />
    )

    expect(screen.getByText('To Do')).toBeInTheDocument()
  })

  it('should display correct status badge for in-progress tasks', () => {
    const inProgressTask = { ...baseMockTask, status: 'in-progress' as TaskStatus }
    render(
      <TaskCard
        task={inProgressTask}
        onStatusChange={mockOnStatusChange}
        onDelete={mockOnDelete}
        isUpdating={false}
      />
    )

    expect(screen.getByText('In Progress')).toBeInTheDocument()
  })

  it('should display correct status badge for done tasks', () => {
    const doneTask = { ...baseMockTask, status: 'done' as TaskStatus }
    render(
      <TaskCard
        task={doneTask}
        onStatusChange={mockOnStatusChange}
        onDelete={mockOnDelete}
        isUpdating={false}
      />
    )

    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('should show Start and Complete buttons for todo tasks', () => {
    render(
      <TaskCard
        task={baseMockTask}
        onStatusChange={mockOnStatusChange}
        onDelete={mockOnDelete}
        isUpdating={false}
      />
    )

    expect(screen.getByText('Start')).toBeInTheDocument()
    expect(screen.getByText('Complete')).toBeInTheDocument()
    expect(screen.queryByText('To Do')).toBeInTheDocument()
  })

  it('should show To Do and Complete buttons for in-progress tasks', () => {
    const inProgressTask = { ...baseMockTask, status: 'in-progress' as TaskStatus }
    render(
      <TaskCard
        task={inProgressTask}
        onStatusChange={mockOnStatusChange}
        onDelete={mockOnDelete}
        isUpdating={false}
      />
    )

    const buttons = screen.getAllByRole('button')
    expect(screen.getByText('To Do')).toBeInTheDocument()
    expect(screen.getByText('Complete')).toBeInTheDocument()
  })

  it('should show To Do and Start buttons for done tasks', () => {
    const doneTask = { ...baseMockTask, status: 'done' as TaskStatus }
    render(
      <TaskCard
        task={doneTask}
        onStatusChange={mockOnStatusChange}
        onDelete={mockOnDelete}
        isUpdating={false}
      />
    )

    expect(screen.getByText('To Do')).toBeInTheDocument()
    expect(screen.getByText('Start')).toBeInTheDocument()
  })

  it('should call onStatusChange when clicking Start button', async () => {
    const user = userEvent.setup()
    render(
      <TaskCard
        task={baseMockTask}
        onStatusChange={mockOnStatusChange}
        onDelete={mockOnDelete}
        isUpdating={false}
      />
    )

    await user.click(screen.getByText('Start'))
    expect(mockOnStatusChange).toHaveBeenCalledWith('1', 'in-progress')
  })

  it('should call onStatusChange when clicking Complete button', async () => {
    const user = userEvent.setup()
    render(
      <TaskCard
        task={baseMockTask}
        onStatusChange={mockOnStatusChange}
        onDelete={mockOnDelete}
        isUpdating={false}
      />
    )

    await user.click(screen.getByText('Complete'))
    // Should show fun rating selector
    expect(screen.getByText('How fun was this task?')).toBeInTheDocument()
    
    // Not called until a rating is selected
    expect(mockOnStatusChange).not.toHaveBeenCalled()
  })

  it('should call onDelete when clicking delete button', async () => {
    const user = userEvent.setup()

    render(
      <TaskCard
        task={baseMockTask}
        onStatusChange={mockOnStatusChange}
        onDelete={mockOnDelete}
        isUpdating={false}
      />
    )

    const deleteButton = screen.getByTitle('Delete task')
    await user.click(deleteButton)

    expect(mockOnDelete).toHaveBeenCalledWith('1')
  })

  it('should call onDelete handler regardless of confirmation', async () => {
    // The confirmation logic is handled by the parent component (StudyDashboard)
    // TaskCard just calls the onDelete prop
    const user = userEvent.setup()
    render(
      <TaskCard
        task={baseMockTask}
        onStatusChange={mockOnStatusChange}
        onDelete={mockOnDelete}
        isUpdating={false}
      />
    )

    const deleteButton = screen.getByTitle('Delete task')
    await user.click(deleteButton)

    expect(mockOnDelete).toHaveBeenCalledWith('1')
  })

  it('should apply line-through style to done task titles', () => {
    const doneTask = { ...baseMockTask, status: 'done' as TaskStatus }
    render(
      <TaskCard
        task={doneTask}
        onStatusChange={mockOnStatusChange}
        onDelete={mockOnDelete}
        isUpdating={false}
      />
    )

    const title = screen.getByText('Complete Math Assignment')
    expect(title).toHaveClass('line-through')
  })

  it('should be disabled when isUpdating is true', () => {
    render(
      <TaskCard
        task={baseMockTask}
        onStatusChange={mockOnStatusChange}
        onDelete={mockOnDelete}
        isUpdating={true}
      />
    )

    const card = screen.getByText('Complete Math Assignment').closest('div')?.parentElement
    expect(card?.className).toContain('opacity-60')
    expect(card?.className).toContain('pointer-events-none')
  })

  describe('Fun Rating Feature', () => {
    it('should show fun rating selector when Complete button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <TaskCard
          task={baseMockTask}
          onStatusChange={mockOnStatusChange}
          onDelete={mockOnDelete}
          isUpdating={false}
        />
      )

      await user.click(screen.getByText('Complete'))
      
      expect(screen.getByText('How fun was this task?')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('should call onStatusChange with rating when a rating is selected', async () => {
      const user = userEvent.setup()
      render(
        <TaskCard
          task={baseMockTask}
          onStatusChange={mockOnStatusChange}
          onDelete={mockOnDelete}
          isUpdating={false}
        />
      )

      await user.click(screen.getByText('Complete'))
      
      // Click on rating 5
      const ratingButtons = screen.getAllByTitle(/Rate \d stars/)
      await user.click(ratingButtons[4]) // Rating 5 (0-indexed)
      
      expect(mockOnStatusChange).toHaveBeenCalledWith('1', 'done', 5)
    })

    it('should hide fun rating selector when Cancel is clicked', async () => {
      const user = userEvent.setup()
      render(
        <TaskCard
          task={baseMockTask}
          onStatusChange={mockOnStatusChange}
          onDelete={mockOnDelete}
          isUpdating={false}
        />
      )

      await user.click(screen.getByText('Complete'))
      expect(screen.getByText('How fun was this task?')).toBeInTheDocument()
      
      await user.click(screen.getByText('Cancel'))
      expect(screen.queryByText('How fun was this task?')).not.toBeInTheDocument()
      expect(mockOnStatusChange).not.toHaveBeenCalled()
    })

    it('should display fun rating for completed tasks', () => {
      const completedTask: StudyTask = {
        ...baseMockTask,
        status: 'done',
        funRating: 4,
      }

      render(
        <TaskCard
          task={completedTask}
          onStatusChange={mockOnStatusChange}
          onDelete={mockOnDelete}
          isUpdating={false}
        />
      )

      expect(screen.getByText('Fun: 4/5')).toBeInTheDocument()
    })

    it('should not display fun rating for completed tasks without a rating', () => {
      const completedTask: StudyTask = {
        ...baseMockTask,
        status: 'done',
      }

      render(
        <TaskCard
          task={completedTask}
          onStatusChange={mockOnStatusChange}
          onDelete={mockOnDelete}
          isUpdating={false}
        />
      )

      expect(screen.queryByText(/Fun:/)).not.toBeInTheDocument()
    })

    it('should allow selecting different ratings', async () => {
      const user = userEvent.setup()
      render(
        <TaskCard
          task={baseMockTask}
          onStatusChange={mockOnStatusChange}
          onDelete={mockOnDelete}
          isUpdating={false}
        />
      )

      await user.click(screen.getByText('Complete'))
      
      const ratingButtons = screen.getAllByTitle(/Rate \d stars/)
      
      // Test rating 1
      await user.click(ratingButtons[0])
      expect(mockOnStatusChange).toHaveBeenCalledWith('1', 'done', 1)
      
      mockOnStatusChange.mockClear()
      
      // Reopen the selector and test rating 3
      await user.click(screen.getByText('Complete'))
      const newRatingButtons = screen.getAllByTitle(/Rate \d stars/)
      await user.click(newRatingButtons[2])
      expect(mockOnStatusChange).toHaveBeenCalledWith('1', 'done', 3)
    })
  })
})
