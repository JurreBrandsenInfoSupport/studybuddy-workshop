import { fetchTasks, createTask, updateTaskStatus, deleteTask, fetchTaskById, startTimer, stopTimer, getActiveTimer, getTimerSessions } from '../api'
import type { CreateTaskInput, TaskStatus, TimerMode } from '../types'

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

  describe('fetchTaskById', () => {
    it('should fetch a single task successfully', async () => {
      const mockTask = {
        id: '1',
        title: 'Study React',
        subject: 'Computer Science',
        estimatedMinutes: 120,
        status: 'in-progress' as TaskStatus,
        createdAt: '2024-01-01T00:00:00Z',
        actualMinutes: 10,
        timerSessions: [],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTask,
      } as Response)

      const task = await fetchTaskById('1')

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/tasks/1')
      expect(task).toEqual(mockTask)
    })

    it('should throw error when task fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response)

      await expect(fetchTaskById('999')).rejects.toThrow('Failed to fetch task')
    })
  })

  describe('startTimer', () => {
    it('should start timer in normal mode', async () => {
      const mockSession = {
        id: 's1',
        taskId: '1',
        startedAt: '2024-01-01T10:00:00Z',
        endedAt: null,
        durationSeconds: 0,
        mode: 'normal' as const,
        pomodoroIntervals: 0,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSession,
      } as Response)

      const session = await startTimer('1', 'normal')

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/tasks/1/timer/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'normal' }),
      })
      expect(session).toEqual(mockSession)
    })

    it('should start timer in Pomodoro mode', async () => {
      const mockSession = {
        id: 's1',
        taskId: '1',
        startedAt: '2024-01-01T10:00:00Z',
        endedAt: null,
        durationSeconds: 0,
        mode: 'pomodoro' as const,
        pomodoroIntervals: 0,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSession,
      } as Response)

      const session = await startTimer('1', 'pomodoro')

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/tasks/1/timer/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'pomodoro' }),
      })
      expect(session).toEqual(mockSession)
    })

    it('should throw error when start timer fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response)

      await expect(startTimer('1', 'normal')).rejects.toThrow('Failed to start timer')
    })
  })

  describe('stopTimer', () => {
    it('should stop timer successfully', async () => {
      const mockSession = {
        id: 's1',
        taskId: '1',
        startedAt: '2024-01-01T10:00:00Z',
        endedAt: '2024-01-01T10:25:00Z',
        durationSeconds: 1500,
        mode: 'normal' as const,
        pomodoroIntervals: 0,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSession,
      } as Response)

      const session = await stopTimer('1')

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/tasks/1/timer/stop', {
        method: 'POST',
      })
      expect(session).toEqual(mockSession)
    })

    it('should throw error when no active timer exists', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response)

      await expect(stopTimer('1')).rejects.toThrow('Failed to stop timer')
    })
  })

  describe('getActiveTimer', () => {
    it('should get active timer when it exists', async () => {
      const mockSession = {
        id: 's1',
        taskId: '1',
        startedAt: '2024-01-01T10:00:00Z',
        endedAt: null,
        durationSeconds: 0,
        mode: 'normal' as const,
        pomodoroIntervals: 0,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSession,
      } as Response)

      const session = await getActiveTimer('1')

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/tasks/1/timer/active')
      expect(session).toEqual(mockSession)
    })

    it('should return null when no active timer exists', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response)

      const session = await getActiveTimer('1')

      expect(session).toBeNull()
    })

    it('should throw error on other API failures', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response)

      await expect(getActiveTimer('1')).rejects.toThrow('Failed to get active timer')
    })
  })

  describe('getTimerSessions', () => {
    it('should get timer sessions list', async () => {
      const mockSessions = [
        {
          id: 's1',
          taskId: '1',
          startedAt: '2024-01-01T10:00:00Z',
          endedAt: '2024-01-01T10:30:00Z',
          durationSeconds: 1800,
          mode: 'normal' as const,
          pomodoroIntervals: 0,
        },
        {
          id: 's2',
          taskId: '1',
          startedAt: '2024-01-01T11:00:00Z',
          endedAt: '2024-01-01T11:15:00Z',
          durationSeconds: 900,
          mode: 'pomodoro' as const,
          pomodoroIntervals: 1,
        },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSessions,
      } as Response)

      const sessions = await getTimerSessions('1')

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/tasks/1/timer/sessions')
      expect(sessions).toEqual(mockSessions)
    })

    it('should return empty array when no sessions exist', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response)

      const sessions = await getTimerSessions('1')

      expect(sessions).toEqual([])
    })

    it('should throw error when fetching sessions fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response)

      await expect(getTimerSessions('1')).rejects.toThrow('Failed to get timer sessions')
    })
  })
})
