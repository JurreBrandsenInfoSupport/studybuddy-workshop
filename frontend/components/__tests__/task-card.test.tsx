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

  it('should show fun rating selector when clicking Complete button', async () => {
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
    expect(mockOnStatusChange).not.toHaveBeenCalled()
  })

  it('should complete task with fun rating when rating is selected', async () => {
    const user = userEvent.setup()
    render(
      <TaskCard
        task={baseMockTask}
        onStatusChange={mockOnStatusChange}
        onDelete={mockOnDelete}
        isUpdating={false}
      />
    )

    // Click Complete to show fun rating selector
    await user.click(screen.getByText('Complete'))
    
    // Select a fun rating (click on the button containing the star)
    const ratingButtons = screen.getAllByRole('button')
    const rating3Button = ratingButtons.find(btn => btn.getAttribute('title') === '3 stars')
    if (rating3Button) {
      await user.click(rating3Button)
    }
    
    // Click the Complete button in the fun rating selector
    const completeButtons = screen.getAllByText('Complete')
    await user.click(completeButtons[completeButtons.length - 1])
    
    expect(mockOnStatusChange).toHaveBeenCalledWith('1', 'done', 3)
  })

  it('should cancel fun rating selection', async () => {
    const user = userEvent.setup()
    render(
      <TaskCard
        task={baseMockTask}
        onStatusChange={mockOnStatusChange}
        onDelete={mockOnDelete}
        isUpdating={false}
      />
    )

    // Click Complete to show fun rating selector
    await user.click(screen.getByText('Complete'))
    expect(screen.getByText('How fun was this task?')).toBeInTheDocument()
    
    // Click Cancel
    await user.click(screen.getByText('Cancel'))
    
    // Should go back to normal buttons
    expect(screen.queryByText('How fun was this task?')).not.toBeInTheDocument()
    expect(screen.getByText('Complete')).toBeInTheDocument()
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

  it('should display fun rating for completed tasks', () => {
    const doneTask = { ...baseMockTask, status: 'done' as TaskStatus, funRating: 4 as const }
    render(
      <TaskCard
        task={doneTask}
        onStatusChange={mockOnStatusChange}
        onDelete={mockOnDelete}
        isUpdating={false}
      />
    )

    expect(screen.getByText('4/5 fun')).toBeInTheDocument()
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
})
