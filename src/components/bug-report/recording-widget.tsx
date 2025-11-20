'use client'

import { useState, useEffect, useRef } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Id } from '../../../convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { X, GripVertical } from 'lucide-react'
import { stopSessionRecording, getSessionReplayUrl, getSessionId } from '@/lib/analytics/posthog'
import { analytics } from '@/lib/analytics/events'
import { toast } from 'sonner'

interface RecordingWidgetProps {
  bugReportId: string
  onClose: () => void
}

const MAX_RECORDING_TIME = 120 // 120 seconds = 2 minutes

export function RecordingWidget({ bugReportId, onClose }: RecordingWidgetProps) {
  const [seconds, setSeconds] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const startTimeRef = useRef(Date.now())
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null)

  const updateSessionRecording = useMutation(api.bugReports.updateSessionRecording)

  // Load saved position from localStorage
  useEffect(() => {
    const savedPosition = localStorage.getItem('bugReportWidgetPosition')
    if (savedPosition) {
      try {
        setPosition(JSON.parse(savedPosition))
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, [])

  // Timer effect
  useEffect(() => {
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      setSeconds(elapsed)

      // Auto-stop at 120 seconds
      if (elapsed >= MAX_RECORDING_TIME) {
        handleStop()
      }
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const handleStop = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000)

    try {
      // Stop PostHog recording
      stopSessionRecording()

      // Note: We don't update the session recording URL here because it was already
      // saved with the timestamp when the bug report was submitted. Updating it again
      // would overwrite the timestamped URL with one without a timestamp.

      // Track recording stopped
      analytics.bugReportRecordingStopped({
        bugReportId,
        duration,
        sessionUrl: undefined, // URL already saved in bug report
      })

      toast.success('Recording stopped. Thank you for your feedback!')
    } catch (error) {
      console.error('Failed to stop recording:', error)
      toast.error('Failed to save recording. Please try again.')
    }

    // Close widget
    onClose()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progressPercent = (seconds / MAX_RECORDING_TIME) * 100

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true)
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startPosX: position.x,
        startPosY: position.y,
      }
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && dragRef.current) {
        const deltaX = e.clientX - dragRef.current.startX
        const deltaY = e.clientY - dragRef.current.startY
        const newPosition = {
          x: dragRef.current.startPosX + deltaX,
          y: dragRef.current.startPosY + deltaY,
        }
        setPosition(newPosition)
      }
    }

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false)
        localStorage.setItem('bugReportWidgetPosition', JSON.stringify(position))
      }
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, position])

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging ? 'grabbing' : 'default',
        boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)',
      }}
      className="z-50 w-[320px] bg-background border-2 border-destructive rounded-lg shadow-2xl"
    >
        {/* Header with drag handle */}
        <div className="drag-handle flex items-center justify-between px-4 py-2 bg-destructive/10 border-b border-destructive/20 cursor-move">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <div className="relative flex items-center">
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                </span>
              </div>
              <span className="text-sm font-medium">Recording</span>
            </div>
          </div>
          <button
            onClick={handleStop}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Stop recording"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Timer */}
          <div className="text-center">
            <div className="text-3xl font-mono font-bold tabular-nums">
              {formatTime(seconds)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              / {formatTime(MAX_RECORDING_TIME)}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div
              className="bg-destructive h-full transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Stop button */}
          <Button
            onClick={handleStop}
            variant="destructive"
            className="w-full"
            size="sm"
          >
            Stop Recording
          </Button>

          {/* Privacy note */}
          <div className="text-xs text-muted-foreground bg-muted/30 rounded-md p-3 leading-relaxed">
            <p className="font-medium mb-1">🔒 Privacy Notice</p>
            <p>
              Only the Freire app is being recorded to maintain your privacy while helping us understand the issue.
            </p>
          </div>
        </div>
      </div>
  )
}
