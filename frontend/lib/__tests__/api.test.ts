import { fetchTasks, createTask, updateTaskStatus, deleteTask } from '../api'
import type { CreateTaskInput, TaskStatus } from '../types'

// Mock fetch globally
global.fetch = jest.fn()

describe('API Module', () => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

  beforeEach(() => {
    mockFetch.mockClear()
  })

  describe('fetchTasks', () => {
    it('should fetch tasks successfully', async () => {
      const mockTasks = [
        {
          id: '1',
          title: 'Study Math',
          subject: 'Math',
          estimatedMinutes: 60,
          status: 'todo' as TaskStatus,
          createdAt: '2024-01-01T00:00:00Z',
        },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasks,
      } as Response)

      const tasks = await fetchTasks()

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/tasks')
      expect(tasks).toEqual(mockTasks)
    })

    it('should throw error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response)

      await expect(fetchTasks()).rejects.toThrow('Failed to fetch tasks')
    })
  })

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const input: CreateTaskInput = {
        title: 'Study Science',
        subject: 'Science',
        estimatedMinutes: 45,
      }

      const mockResponse = {
        id: '2',
        ...input,
        status: 'todo' as TaskStatus,
        createdAt: '2024-01-01T00:00:00Z',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const task = await createTask(input)

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      })
      expect(task).toEqual(mockResponse)
    })

    it('should throw error when creation fails', async () => {
      const input: CreateTaskInput = {
        title: 'Study Science',
        subject: 'Science',
        estimatedMinutes: 45,
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response)

      await expect(createTask(input)).rejects.toThrow('Failed to create task')
    })
  })

  describe('updateTaskStatus', () => {
    it('should update task status successfully', async () => {
      const taskId = '1'
      const newStatus: TaskStatus = 'done'

      const mockResponse = {
        id: taskId,
        title: 'Study Math',
        subject: 'Math',
        estimatedMinutes: 60,
        status: newStatus,
        createdAt: '2024-01-01T00:00:00Z',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const task = await updateTaskStatus(taskId, newStatus)

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/tasks/1', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })
      expect(task).toEqual(mockResponse)
    })

    it('should update task status with funRating', async () => {
      const taskId = '1'
      const newStatus: TaskStatus = 'done'
      const funRating = 5

      const mockResponse = {
        id: taskId,
        title: 'Study Math',
        subject: 'Math',
        estimatedMinutes: 60,
        status: newStatus,
        funRating: funRating,
        createdAt: '2024-01-01T00:00:00Z',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const task = await updateTaskStatus(taskId, newStatus, funRating)

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/tasks/1', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus, funRating: funRating }),
      })
      expect(task).toEqual(mockResponse)
    })

    it('should throw error when update fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response)

      await expect(updateTaskStatus('1', 'done')).rejects.toThrow('Failed to update task')
    })
  })

  describe('deleteTask', () => {
    it('should delete task successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      } as Response)

      await deleteTask('1')

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/tasks/1', {
        method: 'DELETE',
      })
    })

    it('should throw error when deletion fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response)

      await expect(deleteTask('1')).rejects.toThrow('Failed to delete task')
    })
  })
})
