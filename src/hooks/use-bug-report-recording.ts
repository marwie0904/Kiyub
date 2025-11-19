import { useRef, useCallback } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { stopSessionRecording, getSessionReplayUrl, getSessionId } from '@/lib/analytics/posthog'
import { analytics } from '@/lib/analytics/events'
import { toast } from 'sonner'

export function useBugReportRecording() {
  const startTimeRef = useRef<number | null>(null)
  const updateSessionRecording = useMutation(api.bugReports.updateSessionRecording)

  const handleStartRecording = useCallback(() => {
    startTimeRef.current = Date.now()
  }, [])

  const handleStopRecording = useCallback(async (bugReportId: string, onClose: () => void) => {
    const duration = startTimeRef.current
      ? Math.floor((Date.now() - startTimeRef.current) / 1000)
      : 0

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

    // Reset start time
    startTimeRef.current = null

    // Close widget
    onClose()
  }, [])

  return { handleStartRecording, handleStopRecording }
}
