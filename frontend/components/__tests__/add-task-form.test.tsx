import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddTaskForm } from '../add-task-form'
import type { CreateTaskInput } from '@/lib/types'

describe('AddTaskForm', () => {
  const mockOnAddTask = jest.fn()

  beforeEach(() => {
    mockOnAddTask.mockClear()
  })

  it('should render collapsed state by default', () => {
    render(<AddTaskForm onAddTask={mockOnAddTask} />)

    expect(screen.getByText('Add New Task')).toBeInTheDocument()
    expect(screen.getByText('Plan your next study session')).toBeInTheDocument()
  })

  it('should expand form when clicking Add New Task button', async () => {
    const user = userEvent.setup()
    render(<AddTaskForm onAddTask={mockOnAddTask} />)

    const addButton = screen.getByText('Add New Task')
    await user.click(addButton)

    expect(screen.getByText('New Study Task')).toBeInTheDocument()
    expect(screen.getByLabelText(/Task Title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Subject/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Est. Minutes/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Difficulty/i)).toBeInTheDocument()
  })

  it('should collapse form when clicking close button', async () => {
    const user = userEvent.setup()
    render(<AddTaskForm onAddTask={mockOnAddTask} />)

    // Expand form
    await user.click(screen.getByText('Add New Task'))

    // Close form
    const closeButton = screen.getByRole('button', { name: '' })
    await user.click(closeButton)

    expect(screen.queryByText('New Study Task')).not.toBeInTheDocument()
    expect(screen.getByText('Add New Task')).toBeInTheDocument()
  })

  it('should submit form with valid data', async () => {
    const user = userEvent.setup()
    mockOnAddTask.mockResolvedValueOnce(undefined)

    render(<AddTaskForm onAddTask={mockOnAddTask} />)

    // Expand form
    await user.click(screen.getByText('Add New Task'))

    // Fill form
    const titleInput = screen.getByLabelText(/Task Title/i)
    const subjectInput = screen.getByLabelText(/Subject/i)
    const minutesInput = screen.getByLabelText(/Est. Minutes/i)
    const difficultySelect = screen.getByLabelText(/Difficulty/i)

    await user.type(titleInput, 'Complete Algebra Homework')
    await user.type(subjectInput, 'Math')
    await user.type(minutesInput, '60')
    await user.selectOptions(difficultySelect, 'hard')

    // Submit
    const submitButton = screen.getByText('Create Task')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnAddTask).toHaveBeenCalledWith({
        title: 'Complete Algebra Homework',
        subject: 'Math',
        estimatedMinutes: 60,
        difficulty: 'hard',
      })
    })
  })

  it('should reset form and collapse after successful submission', async () => {
    const user = userEvent.setup()
    mockOnAddTask.mockResolvedValueOnce(undefined)

    render(<AddTaskForm onAddTask={mockOnAddTask} />)

    // Expand and fill form
    await user.click(screen.getByText('Add New Task'))
    await user.type(screen.getByLabelText(/Task Title/i), 'Test Task')
    await user.type(screen.getByLabelText(/Subject/i), 'Science')
    await user.type(screen.getByLabelText(/Est. Minutes/i), '30')

    // Submit
    await user.click(screen.getByText('Create Task'))

    await waitFor(() => {
      expect(screen.queryByText('New Study Task')).not.toBeInTheDocument()
      expect(screen.getByText('Add New Task')).toBeInTheDocument()
    })
  })

  it('should show loading state during submission', async () => {
    const user = userEvent.setup()
    let resolveSubmit: (value: void | PromiseLike<void>) => void
    const submitPromise = new Promise<void>((resolve) => {
      resolveSubmit = resolve
    })
    mockOnAddTask.mockReturnValue(submitPromise)

    render(<AddTaskForm onAddTask={mockOnAddTask} />)

    // Expand and fill form
    await user.click(screen.getByText('Add New Task'))
    await user.type(screen.getByLabelText(/Task Title/i), 'Test')
    await user.type(screen.getByLabelText(/Subject/i), 'Math')
    await user.type(screen.getByLabelText(/Est. Minutes/i), '45')

    // Submit
    await user.click(screen.getByText('Create Task'))

    // Check loading state
    expect(screen.getByText('Adding...')).toBeInTheDocument()

    // Resolve the promise
    resolveSubmit!()

    await waitFor(() => {
      expect(screen.queryByText('Adding...')).not.toBeInTheDocument()
    })
  })

  it('should not submit with empty fields', async () => {
    const user = userEvent.setup()
    render(<AddTaskForm onAddTask={mockOnAddTask} />)

    // Expand form
    await user.click(screen.getByText('Add New Task'))

    // Try to submit without filling
    const submitButton = screen.getByText('Create Task')
    await user.click(submitButton)

    expect(mockOnAddTask).not.toHaveBeenCalled()
  })

  it('should not submit with invalid minutes', async () => {
    const user = userEvent.setup()
    render(<AddTaskForm onAddTask={mockOnAddTask} />)

    // Expand and fill form with invalid minutes
    await user.click(screen.getByText('Add New Task'))
    await user.type(screen.getByLabelText(/Task Title/i), 'Test')
    await user.type(screen.getByLabelText(/Subject/i), 'Math')
    await user.type(screen.getByLabelText(/Est. Minutes/i), '0')

    // Try to submit
    await user.click(screen.getByText('Create Task'))

    expect(mockOnAddTask).not.toHaveBeenCalled()
  })

  it('should handle form input changes correctly', async () => {
    const user = userEvent.setup()
    render(<AddTaskForm onAddTask={mockOnAddTask} />)

    await user.click(screen.getByText('Add New Task'))

    const titleInput = screen.getByLabelText(/Task Title/i) as HTMLInputElement
    const subjectInput = screen.getByLabelText(/Subject/i) as HTMLInputElement
    const minutesInput = screen.getByLabelText(/Est. Minutes/i) as HTMLInputElement

    await user.type(titleInput, 'My Task')
    await user.type(subjectInput, 'History')
    await user.type(minutesInput, '90')

    expect(titleInput.value).toBe('My Task')
    expect(subjectInput.value).toBe('History')
    expect(minutesInput.value).toBe('90')
  })

  it('should default to medium difficulty', async () => {
    const user = userEvent.setup()
    render(<AddTaskForm onAddTask={mockOnAddTask} />)

    await user.click(screen.getByText('Add New Task'))

    const difficultySelect = screen.getByLabelText(/Difficulty/i) as HTMLSelectElement
    expect(difficultySelect.value).toBe('medium')
  })

  it('should have all difficulty options available', async () => {
    const user = userEvent.setup()
    render(<AddTaskForm onAddTask={mockOnAddTask} />)

    await user.click(screen.getByText('Add New Task'))

    const difficultySelect = screen.getByLabelText(/Difficulty/i)
    const options = Array.from(difficultySelect.querySelectorAll('option'))

    expect(options).toHaveLength(3)
    expect(options[0]).toHaveTextContent('Easy')
    expect(options[1]).toHaveTextContent('Medium')
    expect(options[2]).toHaveTextContent('Hard')
  })
})
