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

    // Click Complete button to open dialog
    await user.click(screen.getByText('Complete'))
    
    // Verify dialog is shown
    expect(screen.getByText('How fun was this task?')).toBeInTheDocument()
    
    // Click on a rating (e.g., 5 stars)
    const ratingButtons = screen.getAllByRole('button')
    const fiveStarButton = ratingButtons.find(btn => btn.textContent?.includes('⭐⭐⭐⭐⭐'))
    expect(fiveStarButton).toBeDefined()
    
    await user.click(fiveStarButton!)
    expect(mockOnStatusChange).toHaveBeenCalledWith('1', 'done', 5)
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

  it('should show fun rating dialog when clicking Complete', async () => {
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
    expect(screen.getByText('Rate your experience')).toBeInTheDocument()
    expect(screen.getByText('Skip rating')).toBeInTheDocument()
  })

  it('should allow skipping fun rating', async () => {
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
    await user.click(screen.getByText('Skip rating'))
    
    expect(mockOnStatusChange).toHaveBeenCalledWith('1', 'done')
  })

  it('should display fun rating for completed tasks', () => {
    const completedTask = { 
      ...baseMockTask, 
      status: 'done' as TaskStatus,
      funRating: 4 as const
    }
    render(
      <TaskCard
        task={completedTask}
        onStatusChange={mockOnStatusChange}
        onDelete={mockOnDelete}
        isUpdating={false}
      />
    )

    // Should display 4 stars
    expect(screen.getByText('⭐⭐⭐⭐')).toBeInTheDocument()
  })

  it('should allow selecting different fun ratings', async () => {
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
    
    // Find and click the 3-star rating
    const ratingButtons = screen.getAllByRole('button')
    const threeStarButton = ratingButtons.find(btn => btn.textContent?.includes('⭐⭐⭐') && !btn.textContent?.includes('⭐⭐⭐⭐'))
    expect(threeStarButton).toBeDefined()
    
    await user.click(threeStarButton!)
    expect(mockOnStatusChange).toHaveBeenCalledWith('1', 'done', 3)
  })
})
