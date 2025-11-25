import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StudyDashboard } from '../study-dashboard'
import * as api from '@/lib/api'
import type { StudyTask, TaskStatus } from '@/lib/types'

// Mock the API module
jest.mock('@/lib/api')

describe('StudyDashboard', () => {
  const mockFetchTasks = api.fetchTasks as jest.MockedFunction<typeof api.fetchTasks>
  const mockCreateTask = api.createTask as jest.MockedFunction<typeof api.createTask>
  const mockUpdateTaskStatus = api.updateTaskStatus as jest.MockedFunction<typeof api.updateTaskStatus>
  const mockDeleteTask = api.deleteTask as jest.MockedFunction<typeof api.deleteTask>

  const mockTasks: StudyTask[] = [
    {
      id: '1',
      title: 'Study Math',
      subject: 'Mathematics',
      estimatedMinutes: 60,
      status: 'todo',
      difficulty: 'medium',
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      title: 'Read Science Chapter',
      subject: 'Science',
      estimatedMinutes: 45,
      status: 'in-progress',
      difficulty: 'easy',
      createdAt: '2024-01-01T01:00:00Z',
    },
    {
      id: '3',
      title: 'Complete History Essay',
      subject: 'History',
      estimatedMinutes: 90,
      status: 'done',
      difficulty: 'hard',
      createdAt: '2024-01-01T02:00:00Z',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetchTasks.mockResolvedValue([])
  })

  it('should display loading state initially', () => {
    mockFetchTasks.mockImplementation(() => new Promise(() => {}))
    render(<StudyDashboard />)

    expect(screen.getByText('Loading your tasks...')).toBeInTheDocument()
  })

  it('should load and display tasks on mount', async () => {
    mockFetchTasks.mockResolvedValue(mockTasks)
    render(<StudyDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Study Math')).toBeInTheDocument()
      expect(screen.getByText('Read Science Chapter')).toBeInTheDocument()
      expect(screen.getByText('Complete History Essay')).toBeInTheDocument()
    })
  })

  it('should display error message when fetch fails', async () => {
    mockFetchTasks.mockRejectedValue(new Error('Network error'))
    render(<StudyDashboard />)

    await waitFor(() => {
      expect(screen.getByText(/Failed to load tasks/i)).toBeInTheDocument()
    })
  })

  it('should allow retrying after error', async () => {
    mockFetchTasks.mockRejectedValueOnce(new Error('Network error'))
    mockFetchTasks.mockResolvedValueOnce(mockTasks)
    
    render(<StudyDashboard />)

    await waitFor(() => {
      expect(screen.getByText(/Failed to load tasks/i)).toBeInTheDocument()
    })

    const retryButton = screen.getByText('Retry')
    await userEvent.click(retryButton)

    await waitFor(() => {
      expect(screen.getByText('Study Math')).toBeInTheDocument()
    })
  })

  it('should display correct stats', async () => {
    mockFetchTasks.mockResolvedValue(mockTasks)
    render(<StudyDashboard />)

    await waitFor(() => {
      expect(screen.getByText('1 / 3')).toBeInTheDocument() // done / total
    })
  })

  it('should calculate estimated hours remaining correctly', async () => {
    mockFetchTasks.mockResolvedValue(mockTasks)
    render(<StudyDashboard />)

    await waitFor(() => {
      // 60 + 45 = 105 minutes = 1.8 hours (rounded to 1 decimal)
      expect(screen.getByText('1.8 hrs')).toBeInTheDocument()
    })
  })

  it('should filter tasks by status', async () => {
    const user = userEvent.setup()
    mockFetchTasks.mockResolvedValue(mockTasks)
    render(<StudyDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Study Math')).toBeInTheDocument()
    })

    // Get all buttons and find the To Do filter button (not the task action button)
    const allButtons = screen.getAllByRole('button')
    const todoFilterButton = allButtons.find(btn => {
      const text = btn.textContent || ''
      return text === 'To Do' || (text.includes('To Do') && btn.closest('div')?.className.includes('border-b'))
    })
    
    if (todoFilterButton) {
      await user.click(todoFilterButton)
    }

    // Should only show todo tasks
    await waitFor(() => {
      expect(screen.getByText('Study Math')).toBeInTheDocument()
      expect(screen.queryByText('Read Science Chapter')).not.toBeInTheDocument()
      expect(screen.queryByText('Complete History Essay')).not.toBeInTheDocument()
    })
  })

  it('should sort tasks by estimated minutes', async () => {
    const user = userEvent.setup()
    mockFetchTasks.mockResolvedValue(mockTasks)
    render(<StudyDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Study Math')).toBeInTheDocument()
    })

    // Get all task title headings
    const getTaskTitles = () => {
      const allHeadings = screen.getAllByRole('heading', { level: 3 })
      // Filter out the "Your Progress" heading and other non-task headings
      return allHeadings.filter(h => 
        h.textContent === 'Study Math' || 
        h.textContent === 'Read Science Chapter' || 
        h.textContent === 'Complete History Essay'
      )
    }

    // Initial sort is desc (longest first), so should be History (90), Math (60), Science (45)
    let taskCards = getTaskTitles()
    expect(taskCards[0]).toHaveTextContent('Complete History Essay')
    expect(taskCards[1]).toHaveTextContent('Study Math')
    expect(taskCards[2]).toHaveTextContent('Read Science Chapter')

    // Click sort to toggle to asc
    const sortButton = screen.getByText('Longest First').closest('button')!
    await user.click(sortButton)

    await waitFor(() => {
      const updatedTaskCards = getTaskTitles()
      expect(updatedTaskCards[0]).toHaveTextContent('Read Science Chapter')
      expect(updatedTaskCards[1]).toHaveTextContent('Study Math')
      expect(updatedTaskCards[2]).toHaveTextContent('Complete History Essay')
    })
  })

  it('should create a new task', async () => {
    const user = userEvent.setup()
    mockFetchTasks.mockResolvedValue([])
    
    const newTask: StudyTask = {
      id: '4',
      title: 'New Task',
      subject: 'Physics',
      estimatedMinutes: 30,
      status: 'todo',
      difficulty: 'medium',
      createdAt: '2024-01-01T03:00:00Z',
    }
    mockCreateTask.mockResolvedValue(newTask)

    render(<StudyDashboard />)

    await waitFor(() => {
      expect(screen.queryByText('Loading your tasks...')).not.toBeInTheDocument()
    })

    // Expand add task form
    await user.click(screen.getByText('Add New Task'))

    // Fill form
    await user.type(screen.getByLabelText(/Task Title/i), 'New Task')
    await user.type(screen.getByLabelText(/Subject/i), 'Physics')
    await user.type(screen.getByLabelText(/Est. Minutes/i), '30')

    // Submit
    await user.click(screen.getByText('Create Task'))

    await waitFor(() => {
      expect(mockCreateTask).toHaveBeenCalledWith({
        title: 'New Task',
        subject: 'Physics',
        estimatedMinutes: 30,
        difficulty: 'medium',
      })
      expect(screen.getByText('New Task')).toBeInTheDocument()
    })
  })

  it('should update task status', async () => {
    const user = userEvent.setup()
    mockFetchTasks.mockResolvedValue([mockTasks[0]])
    
    const updatedTask = { ...mockTasks[0], status: 'in-progress' as TaskStatus }
    mockUpdateTaskStatus.mockResolvedValue(updatedTask)

    render(<StudyDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Study Math')).toBeInTheDocument()
    })

    // Click Start button
    await user.click(screen.getByText('Start'))

    await waitFor(() => {
      expect(mockUpdateTaskStatus).toHaveBeenCalledWith('1', 'in-progress')
    })
  })

  it('should delete a task', async () => {
    const user = userEvent.setup()
    global.confirm = jest.fn(() => true)
    
    mockFetchTasks.mockResolvedValue([mockTasks[0]])
    mockDeleteTask.mockResolvedValue()

    render(<StudyDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Study Math')).toBeInTheDocument()
    })

    // Click delete button
    const deleteButton = screen.getByTitle('Delete task')
    await user.click(deleteButton)

    await waitFor(() => {
      expect(mockDeleteTask).toHaveBeenCalledWith('1')
      expect(screen.queryByText('Study Math')).not.toBeInTheDocument()
    })
  })

  it('should show empty state when no tasks', async () => {
    mockFetchTasks.mockResolvedValue([])
    render(<StudyDashboard />)

    await waitFor(() => {
      expect(screen.getByText('No tasks found')).toBeInTheDocument()
      expect(screen.getByText(/You're all caught up/i)).toBeInTheDocument()
    })
  })

  it('should show filtered empty state message', async () => {
    const user = userEvent.setup()
    mockFetchTasks.mockResolvedValue([mockTasks[0]]) // Only todo task
    render(<StudyDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Study Math')).toBeInTheDocument()
    })

    // Get all buttons and find the Done filter button
    const allButtons = screen.getAllByRole('button')
    const doneFilterButton = allButtons.find(btn => {
      const text = btn.textContent || ''
      return text === 'Done' && !btn.textContent?.includes('Tasks Done')
    })
    
    if (doneFilterButton) {
      await user.click(doneFilterButton)
    }

    await waitFor(() => {
      expect(screen.getByText('No tasks found')).toBeInTheDocument()
      expect(screen.getByText(/You don't have any done tasks/i)).toBeInTheDocument()
    })
  })

  it('should display progress section', async () => {
    mockFetchTasks.mockResolvedValue(mockTasks)
    render(<StudyDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Study Math')).toBeInTheDocument()
    })
    
    // Check that the Your Progress section exists
    expect(screen.getByText('Your Progress')).toBeInTheDocument()
    
    // Check that progress section has the expected structure with status labels
    const allElements = screen.getAllByText(/To Do|In Progress|Completed/)
    expect(allElements.length).toBeGreaterThan(0)
  })

  it('should render header with app name', async () => {
    mockFetchTasks.mockResolvedValue([])
    render(<StudyDashboard />)

    expect(screen.getByText('StudyBuddy+')).toBeInTheDocument()
    expect(screen.getByText('Task Manager')).toBeInTheDocument()
  })
})
