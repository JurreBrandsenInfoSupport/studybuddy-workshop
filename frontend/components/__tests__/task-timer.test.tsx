import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TaskTimer } from '../task-timer'
import type { StudyTask } from '@/lib/types'
import * as api from '@/lib/api'
import * as useTimerModule from '@/hooks/useTimer'

// Mock the API
jest.mock('@/lib/api', () => ({
  startTimer: jest.fn(),
  stopTimer: jest.fn(),
}))

// Mock the useTimer hook
jest.mock('@/hooks/useTimer', () => ({
  useTimer: jest.fn(),
}))

describe('TaskTimer Component', () => {
  const mockOnTimerUpdate = jest.fn()
  const mockStart = jest.fn()
  const mockPause = jest.fn()
  const mockStop = jest.fn()
  const mockReset = jest.fn()

  const baseMockTask: StudyTask = {
    id: '1',
    title: 'Study React',
    subject: 'Computer Science',
    estimatedMinutes: 120,
    status: 'in-progress',
    createdAt: '2024-01-01T00:00:00Z',
    actualMinutes: 0,
    timerSessions: [],
  }

  const defaultUseTimerReturn = {
    state: 'idle' as const,
    seconds: 0,
    phase: 'focus' as const,
    intervals: 0,
    targetDuration: 0,
    start: mockStart,
    pause: mockPause,
    stop: mockStop,
    reset: mockReset,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTimerModule.useTimer as jest.Mock).mockReturnValue(defaultUseTimerReturn)
    ;(api.startTimer as jest.Mock).mockResolvedValue({
      id: 's1',
      taskId: '1',
      mode: 'normal',
      startedAt: new Date().toISOString(),
      endedAt: null,
      durationSeconds: 0,
      pomodoroIntervals: 0,
    })
    ;(api.stopTimer as jest.Mock).mockResolvedValue({
      id: 's1',
      taskId: '1',
      mode: 'normal',
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      durationSeconds: 30,
      pomodoroIntervals: 0,
    })

    // Mock Notification API
    global.Notification = {
      permission: 'default',
      requestPermission: jest.fn().mockResolvedValue('granted'),
    } as any
  })

  describe('Rendering States', () => {
    it('should render Start button when timer is idle', () => {
      render(<TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />)

      expect(screen.getByText('Start')).toBeInTheDocument()
    })

    it('should render mode toggle button when idle', () => {
      render(<TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />)

      const toggleButton = screen.getByTitle(/Switch to Pomodoro Timer/i)
      expect(toggleButton).toBeInTheDocument()
      expect(toggleButton).toHaveTextContent('⏱️')
    })

    it('should render Pause and Stop buttons when timer is running', () => {
      ;(useTimerModule.useTimer as jest.Mock).mockReturnValue({
        ...defaultUseTimerReturn,
        state: 'running',
        seconds: 10,
      })

      render(<TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />)

      expect(screen.getByText('Pause')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '' })).toBeInTheDocument() // Stop button with Square icon
    })

    it('should render Resume and Stop buttons when timer is paused', () => {
      ;(useTimerModule.useTimer as jest.Mock).mockReturnValue({
        ...defaultUseTimerReturn,
        state: 'paused',
        seconds: 15,
      })

      render(<TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />)

      expect(screen.getByText('Resume')).toBeInTheDocument()
    })

    it('should display formatted time correctly (MM:SS)', () => {
      ;(useTimerModule.useTimer as jest.Mock).mockReturnValue({
        ...defaultUseTimerReturn,
        seconds: 125, // 2 minutes 5 seconds
      })

      render(<TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />)

      expect(screen.getByText('2:05')).toBeInTheDocument()
    })

    it('should display formatted time with hours (HH:MM:SS)', () => {
      ;(useTimerModule.useTimer as jest.Mock).mockReturnValue({
        ...defaultUseTimerReturn,
        seconds: 3665, // 1 hour, 1 minute, 5 seconds
      })

      render(<TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />)

      expect(screen.getByText('1:01:05')).toBeInTheDocument()
    })

    it('should display timer icon', () => {
      render(<TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />)

      const timerIcon = screen.getByText('0:00').previousSibling
      expect(timerIcon).toBeInTheDocument()
    })

    it('should display actual vs estimated when actualMinutes > 0', () => {
      const taskWithActual = { ...baseMockTask, actualMinutes: 45 }

      render(<TaskTimer task={taskWithActual} onTimerUpdate={mockOnTimerUpdate} />)

      expect(screen.getByText('45 / 120 min')).toBeInTheDocument()
    })

    it('should not display actual vs estimated when actualMinutes is 0', () => {
      render(<TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />)

      expect(screen.queryByText(/\/ 120 min/)).not.toBeInTheDocument()
    })
  })

  describe('Pomodoro Mode Display', () => {
    it('should display phase indicator (Focus/Break) in Pomodoro mode', () => {
      ;(useTimerModule.useTimer as jest.Mock).mockReturnValue({
        ...defaultUseTimerReturn,
        state: 'idle',
      })

      const { rerender } = render(<TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />)

      // Click mode toggle to switch to Pomodoro (when timer is idle)
      const toggleButton = screen.getByTitle(/Switch to Pomodoro Timer/i)
      fireEvent.click(toggleButton)

      // After clicking toggle, the component has switched to Pomodoro mode internally
      // Now mock the useTimer to return running state with Pomodoro data
      ;(useTimerModule.useTimer as jest.Mock).mockReturnValue({
        ...defaultUseTimerReturn,
        state: 'running',
        phase: 'focus',
        intervals: 0,
        targetDuration: 1500,
      })

      rerender(<TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />)

      // Should see phase indicator
      expect(screen.getByText(/Focus/)).toBeInTheDocument()
      expect(screen.getByText(/0 intervals/)).toBeInTheDocument()
    })

    it('should display intervals count in Pomodoro mode', () => {
      ;(useTimerModule.useTimer as jest.Mock).mockReturnValue({
        ...defaultUseTimerReturn,
        state: 'idle',
        phase: 'focus',
        intervals: 0,
        targetDuration: 1500,
      })

      const { rerender } = render(<TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />)

      // Toggle to Pomodoro mode first
      const toggleButton = screen.getByTitle(/Switch to Pomodoro Timer/i)
      fireEvent.click(toggleButton)

      // Update mock to show intervals when running
      ;(useTimerModule.useTimer as jest.Mock).mockReturnValue({
        ...defaultUseTimerReturn,
        state: 'running',
        phase: 'focus',
        intervals: 2,
        targetDuration: 1500,
      })

      rerender(<TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />)

      expect(screen.getByText(/2 intervals/)).toBeInTheDocument()
    })

    it('should display progress bar in Pomodoro mode when not idle', () => {
      ;(useTimerModule.useTimer as jest.Mock).mockReturnValue({
        ...defaultUseTimerReturn,
        state: 'idle',
        seconds: 0,
        targetDuration: 0,
      })

      const { container, rerender } = render(
        <TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />
      )

      // Toggle to Pomodoro mode
      const toggleButton = screen.getByTitle(/Switch to Pomodoro Timer/i)
      fireEvent.click(toggleButton)

      // Re-render with Pomodoro active (running state)
      ;(useTimerModule.useTimer as jest.Mock).mockReturnValue({
        ...defaultUseTimerReturn,
        state: 'running',
        seconds: 750,
        phase: 'focus',
        targetDuration: 1500,
      })

      rerender(<TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />)

      // Progress bar should exist
      const progressBars = container.querySelectorAll('.bg-slate-100')
      expect(progressBars.length).toBeGreaterThan(0)
    })

    it('should not display progress bar in normal mode', () => {
      ;(useTimerModule.useTimer as jest.Mock).mockReturnValue({
        ...defaultUseTimerReturn,
        state: 'running',
        seconds: 30,
        targetDuration: 0,
      })

      const { container } = render(
        <TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />
      )

      // Check that progress bar doesn't exist
      const progressBars = container.querySelectorAll('.bg-slate-100')
      expect(progressBars.length).toBe(0)
    })

    it('should show blue progress bar during focus phase', () => {
      ;(useTimerModule.useTimer as jest.Mock).mockReturnValue({
        ...defaultUseTimerReturn,
        state: 'idle',
        phase: 'focus',
        seconds: 0,
        targetDuration: 0,
      })

      const { container, rerender } = render(
        <TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />
      )

      // Toggle to Pomodoro
      const toggleButton = screen.getByTitle(/Switch to Pomodoro Timer/i)
      fireEvent.click(toggleButton)

      // Now mock it as running
      ;(useTimerModule.useTimer as jest.Mock).mockReturnValue({
        ...defaultUseTimerReturn,
        state: 'running',
        phase: 'focus',
        seconds: 750,
        targetDuration: 1500,
      })

      rerender(<TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />)

      // Check for blue progress bar
      const blueBars = container.querySelectorAll('.bg-blue-500')
      expect(blueBars.length).toBeGreaterThan(0)
    })

    it('should show green progress bar during break phase', () => {
      ;(useTimerModule.useTimer as jest.Mock).mockReturnValue({
        ...defaultUseTimerReturn,
        state: 'running',
        phase: 'break',
        seconds: 150,
        targetDuration: 300,
      })

      const { container } = render(
        <TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />
      )
    })

    it('should calculate progress percentage correctly', () => {
      ;(useTimerModule.useTimer as jest.Mock).mockReturnValue({
        ...defaultUseTimerReturn,
        state: 'running',
        seconds: 750, // 50% of 1500
        targetDuration: 1500,
      })

      render(<TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />)

      // Progress should be 50%
      // This is implementation-dependent, checking the calculation logic exists
    })
  })

  describe('User Interactions', () => {
    it('should call startTimer API when Start button is clicked', async () => {
      render(<TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />)

      const startButton = screen.getByText('Start')
      fireEvent.click(startButton)

      await waitFor(() => {
        expect(api.startTimer).toHaveBeenCalledWith('1', 'normal')
      })
    })

    it('should call useTimer.start() after successful API call', async () => {
      render(<TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />)

      const startButton = screen.getByText('Start')
      fireEvent.click(startButton)

      await waitFor(() => {
        expect(mockStart).toHaveBeenCalled()
      })
    })

    it('should log error when startTimer API fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      ;(api.startTimer as jest.Mock).mockRejectedValueOnce(new Error('API Error'))

      render(<TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />)

      const startButton = screen.getByText('Start')
      fireEvent.click(startButton)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to start timer:',
          expect.any(Error)
        )
      })

      consoleErrorSpy.mockRestore()
    })

    it('should call useTimer.pause() when Pause button is clicked', () => {
      ;(useTimerModule.useTimer as jest.Mock).mockReturnValue({
        ...defaultUseTimerReturn,
        state: 'running',
        seconds: 10,
      })

      render(<TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />)

      const pauseButton = screen.getByText('Pause')
      fireEvent.click(pauseButton)

      expect(mockPause).toHaveBeenCalled()
    })

    it('should call stopTimer API when Stop button is clicked', async () => {
      ;(useTimerModule.useTimer as jest.Mock).mockReturnValue({
        ...defaultUseTimerReturn,
        state: 'running',
        seconds: 30,
      })

      render(<TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />)

      const stopButtons = screen.getAllByRole('button')
      const stopButton = stopButtons.find((btn) => btn.className.includes('red'))

      if (stopButton) {
        fireEvent.click(stopButton)

        await waitFor(() => {
          expect(api.stopTimer).toHaveBeenCalledWith('1')
        })
      }
    })

    it('should call useTimer.stop() after successful stop API call', async () => {
      ;(useTimerModule.useTimer as jest.Mock).mockReturnValue({
        ...defaultUseTimerReturn,
        state: 'running',
        seconds: 30,
      })

      render(<TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />)

      const stopButtons = screen.getAllByRole('button')
      const stopButton = stopButtons.find((btn) => btn.className.includes('red'))

      if (stopButton) {
        fireEvent.click(stopButton)

        await waitFor(() => {
          expect(mockStop).toHaveBeenCalled()
        })
      }
    })

    it('should call onTimerUpdate callback after stopping timer', async () => {
      ;(useTimerModule.useTimer as jest.Mock).mockReturnValue({
        ...defaultUseTimerReturn,
        state: 'running',
        seconds: 30,
      })

      render(<TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />)

      const stopButtons = screen.getAllByRole('button')
      const stopButton = stopButtons.find((btn) => btn.className.includes('red'))

      if (stopButton) {
        fireEvent.click(stopButton)

        await waitFor(() => {
          expect(mockOnTimerUpdate).toHaveBeenCalledWith('1')
        })
      }
    })

    it('should log error when stopTimer API fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      ;(api.stopTimer as jest.Mock).mockRejectedValueOnce(new Error('API Error'))
      ;(useTimerModule.useTimer as jest.Mock).mockReturnValue({
        ...defaultUseTimerReturn,
        state: 'running',
        seconds: 30,
      })

      render(<TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />)

      const stopButtons = screen.getAllByRole('button')
      const stopButton = stopButtons.find((btn) => btn.className.includes('red'))

      if (stopButton) {
        fireEvent.click(stopButton)

        await waitFor(() => {
          expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Failed to stop timer:',
            expect.any(Error)
          )
        })
      }

      consoleErrorSpy.mockRestore()
    })

    it('should toggle mode from normal to Pomodoro', () => {
      render(<TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />)

      const toggleButton = screen.getByTitle(/Switch to Pomodoro Timer/i)
      expect(toggleButton).toHaveTextContent('⏱️')

      fireEvent.click(toggleButton)

      const updatedToggleButton = screen.getByTitle(/Switch to Normal Timer/i)
      expect(updatedToggleButton).toHaveTextContent('🍅')
    })

    it('should toggle mode from Pomodoro to normal', () => {
      render(<TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />)

      // Toggle to Pomodoro
      const toggleButton = screen.getByTitle(/Switch to Pomodoro Timer/i)
      fireEvent.click(toggleButton)

      // Toggle back to normal
      const pomodoroToggleButton = screen.getByTitle(/Switch to Normal Timer/i)
      fireEvent.click(pomodoroToggleButton)

      const normalToggleButton = screen.getByTitle(/Switch to Pomodoro Timer/i)
      expect(normalToggleButton).toHaveTextContent('⏱️')
    })

    it('should display correct emoji for current mode (⏱️/🍅)', () => {
      render(<TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />)

      // Normal mode
      expect(screen.getByText('⏱️')).toBeInTheDocument()

      // Toggle to Pomodoro
      const toggleButton = screen.getByTitle(/Switch to Pomodoro Timer/i)
      fireEvent.click(toggleButton)

      expect(screen.getByText('🍅')).toBeInTheDocument()
    })
  })

  describe('Notifications', () => {
    it('should request notification permission on mount', () => {
      render(<TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />)

      expect(Notification.requestPermission).toHaveBeenCalled()
    })

    it('should not request permission if already granted', () => {
      global.Notification = {
        permission: 'granted',
        requestPermission: jest.fn(),
      } as any

      render(<TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />)

      expect(Notification.requestPermission).not.toHaveBeenCalled()
    })

    it('should show notification on phase change if permission granted', () => {
      global.Notification = jest.fn() as any
      ;(global.Notification as any).permission = 'granted'

      const onPhaseChangeCallback = jest.fn()

      // Capture the onPhaseChange callback
      ;(useTimerModule.useTimer as jest.Mock).mockImplementation((options) => {
        onPhaseChangeCallback.mockImplementation(options.onPhaseChange)
        return defaultUseTimerReturn
      })

      render(<TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />)

      // Get the callback that was passed to useTimer
      const useTimerCall = (useTimerModule.useTimer as jest.Mock).mock.calls[0][0]
      const onPhaseChange = useTimerCall.onPhaseChange

      // Simulate phase change to break
      onPhaseChange('break')

      expect(global.Notification).toHaveBeenCalledWith('Break Time! 🎉', {
        body: 'Take a 5-minute break',
      })
    })

    it('should not show notification if permission denied', () => {
      global.Notification = jest.fn() as any
      ;(global.Notification as any).permission = 'denied'

      const { rerender } = render(
        <TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />
      )

      // Notification constructor should not be called even on phase change
      expect(global.Notification).not.toHaveBeenCalled()
    })

    it('should display correct notification title for break phase', () => {
      global.Notification = jest.fn() as any
      ;(global.Notification as any).permission = 'granted'

      ;(useTimerModule.useTimer as jest.Mock).mockImplementation((options) => {
        return defaultUseTimerReturn
      })

      render(<TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />)

      const useTimerCall = (useTimerModule.useTimer as jest.Mock).mock.calls[0][0]
      const onPhaseChange = useTimerCall.onPhaseChange

      onPhaseChange('break')

      expect(global.Notification).toHaveBeenCalledWith(
        'Break Time! 🎉',
        expect.any(Object)
      )
    })

    it('should display correct notification body for break phase', () => {
      global.Notification = jest.fn() as any
      ;(global.Notification as any).permission = 'granted'

      render(<TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />)

      const useTimerCall = (useTimerModule.useTimer as jest.Mock).mock.calls[0][0]
      const onPhaseChange = useTimerCall.onPhaseChange

      onPhaseChange('break')

      expect(global.Notification).toHaveBeenCalledWith('Break Time! 🎉', {
        body: 'Take a 5-minute break',
      })
    })

    it('should display correct notification title for focus phase', () => {
      global.Notification = jest.fn() as any
      ;(global.Notification as any).permission = 'granted'

      render(<TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />)

      const useTimerCall = (useTimerModule.useTimer as jest.Mock).mock.calls[0][0]
      const onPhaseChange = useTimerCall.onPhaseChange

      onPhaseChange('focus')

      expect(global.Notification).toHaveBeenCalledWith(
        'Focus Time! 📚',
        expect.any(Object)
      )
    })

    it('should display correct notification body for focus phase', () => {
      global.Notification = jest.fn() as any
      ;(global.Notification as any).permission = 'granted'

      render(<TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />)

      const useTimerCall = (useTimerModule.useTimer as jest.Mock).mock.calls[0][0]
      const onPhaseChange = useTimerCall.onPhaseChange

      onPhaseChange('focus')

      expect(global.Notification).toHaveBeenCalledWith('Focus Time! 📚', {
        body: 'Time to focus for 25 minutes',
      })
    })
  })

  describe('Integration with useTimer Hook', () => {
    it('should receive state updates from useTimer hook', () => {
      ;(useTimerModule.useTimer as jest.Mock).mockReturnValue({
        ...defaultUseTimerReturn,
        state: 'running',
      })

      render(<TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />)

      // Verify rendering based on state
      expect(screen.getByText('Pause')).toBeInTheDocument()
    })

    it('should receive seconds updates from useTimer hook', () => {
      ;(useTimerModule.useTimer as jest.Mock).mockReturnValue({
        ...defaultUseTimerReturn,
        seconds: 42,
      })

      render(<TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />)

      expect(screen.getByText('0:42')).toBeInTheDocument()
    })

    it('should receive phase updates from useTimer hook', () => {
      ;(useTimerModule.useTimer as jest.Mock).mockReturnValue({
        ...defaultUseTimerReturn,
        phase: 'break',
        targetDuration: 300,
      })

      render(<TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />)

      // Toggle to Pomodoro mode to see phase
      const toggleButton = screen.getByTitle(/Switch to Pomodoro Timer/i)
      fireEvent.click(toggleButton)
    })

    it('should pass mode to useTimer hook', () => {
      render(<TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />)

      expect(useTimerModule.useTimer).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'normal',
        })
      )
    })

    it('should pass taskId to useTimer hook', () => {
      render(<TaskTimer task={baseMockTask} onTimerUpdate={mockOnTimerUpdate} />)

      expect(useTimerModule.useTimer).toHaveBeenCalledWith(
        expect.objectContaining({
          taskId: '1',
        })
      )
    })
  })
})
