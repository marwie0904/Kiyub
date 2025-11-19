import { posthog, startSessionRecording } from './posthog'

/**
 * Custom event tracking utilities
 * Use these functions to track user interactions throughout the app
 */

export const analytics = {
  /**
   * Track when a user sends a message
   */
  messageSent: (data: {
    conversationId: string
    messageLength: number
    hasAttachments: boolean
    model?: string
  }) => {
    if (!posthog) return
    posthog.capture('message_sent', data)
  },

  /**
   * Track when a conversation is created
   */
  conversationCreated: (data: { conversationId: string; projectId?: string }) => {
    if (!posthog) return
    posthog.capture('conversation_created', data)
  },

  /**
   * Track web search usage
   */
  webSearchUsed: (data: { query: string; resultsCount: number }) => {
    if (!posthog) return
    posthog.capture('web_search_used', data)
  },

  /**
   * Track when a project is created
   */
  projectCreated: (data: { projectId: string; projectName: string }) => {
    if (!posthog) return
    posthog.capture('project_created', data)
  },

  /**
   * Track when a test is generated
   */
  testGenerated: (data: {
    conversationId: string
    testCount: number
    success: boolean
  }) => {
    if (!posthog) return
    posthog.capture('test_generated', data)
  },

  /**
   * Track canvas creation
   */
  canvasCreated: (data: { canvasId: string; cardCount: number }) => {
    if (!posthog) return
    posthog.capture('canvas_created', data)
  },

  /**
   * Track when a canvas card is added
   */
  canvasCardAdded: (data: { canvasId: string; cardType: string }) => {
    if (!posthog) return
    posthog.capture('canvas_card_added', data)
  },

  /**
   * Track file uploads
   */
  fileUploaded: (data: {
    fileType: string
    fileSize: number
    conversationId?: string
  }) => {
    if (!posthog) return
    posthog.capture('file_uploaded', data)
  },

  /**
   * Track errors and automatically start session recording
   */
  errorOccurred: (data: {
    errorMessage: string
    errorType: string
    page: string
    userId?: string
  }) => {
    if (!posthog) return

    // Start recording when error occurs to capture the session
    startSessionRecording()

    posthog.capture('error_occurred', {
      ...data,
      session_recording_started: true,
    })
  },

  /**
   * Track feature usage
   */
  featureUsed: (featureName: string, metadata?: Record<string, any>) => {
    if (!posthog) return
    posthog.capture('feature_used', {
      feature: featureName,
      ...metadata,
    })
  },

  /**
   * Track bug report submission
   */
  bugReportSubmitted: (data: {
    bugReportId: string
    title: string
    sessionId?: string
  }) => {
    if (!posthog) return
    posthog.capture('bug_report_submitted', data)
  },

  /**
   * Track bug report recording started
   */
  bugReportRecordingStarted: (data: { bugReportId: string }) => {
    if (!posthog) return
    posthog.capture('bug_report_recording_started', data)
  },

  /**
   * Track bug report recording stopped
   */
  bugReportRecordingStopped: (data: {
    bugReportId: string
    duration: number
    sessionUrl?: string
  }) => {
    if (!posthog) return
    posthog.capture('bug_report_recording_stopped', data)
  },

  /**
   * Identify a user
   */
  identify: (userId: string, properties?: Record<string, any>) => {
    if (!posthog) return
    posthog.identify(userId, properties)
  },

  /**
   * Reset user identity (on logout)
   */
  reset: () => {
    if (!posthog) return
    posthog.reset()
  },
}

/**
 * Example usage in components:
 *
 * import { analytics } from '@/lib/analytics/events'
 *
 * // When user sends a message
 * analytics.messageSent({
 *   conversationId: conversation.id,
 *   messageLength: message.length,
 *   hasAttachments: attachments.length > 0,
 *   model: selectedModel,
 * })
 *
 * // When an error occurs
 * analytics.errorOccurred({
 *   errorMessage: error.message,
 *   errorType: error.name,
 *   page: window.location.pathname,
 * })
 *
 * // Identify user (e.g., after login)
 * analytics.identify(user.id, {
 *   email: user.email,
 *   name: user.name,
 *   createdAt: user.createdAt,
 * })
 */
