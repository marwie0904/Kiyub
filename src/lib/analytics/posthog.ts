import posthog from 'posthog-js'

export function initPostHog() {
  if (typeof window !== 'undefined') {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST

    // Skip initialization if key is missing or is a placeholder
    if (!key || key === 'your_posthog_key_here') {
      console.warn('PostHog key not configured. Analytics will not be initialized.')
      console.warn('To enable PostHog, add NEXT_PUBLIC_POSTHOG_KEY to .env.local')
      return
    }

    try {
      posthog.init(key, {
        api_host: host || 'https://app.posthog.com',
        person_profiles: 'identified_only',
        capture_pageview: false, // We'll manually capture pageviews
        capture_pageleave: true,

        // Session Recording Configuration
        session_recording: {
          maskAllInputs: false,
          maskInputOptions: {
            password: true,
          },
          recordCrossOriginIframes: false,
          // Start recording only when triggered (0% by default)
          sampleRate: 0,
        },

        // Survey Configuration
        opt_in_site_apps: true,

        // Disable console warnings for network errors
        disable_external_dependency_loading: false,

        // Performance
        loaded: (ph) => {
          console.log('PostHog loaded successfully')
          if (process.env.NODE_ENV === 'development') {
            // Don't enable debug in development to reduce noise
            // ph.debug()
          }
        },

        // Suppress remote config errors
        on_xhr_error: (error) => {
          // Silently handle remote config fetch failures
          // These are not critical for basic functionality
        },
      })
    } catch (error) {
      console.warn('PostHog initialization failed - analytics disabled')
      // Silently fail - app will work without PostHog
    }
  }
}

/**
 * Start recording the current session
 * This ensures the session is captured in PostHog
 */
export function startSessionRecording(): void {
  if (!posthog) return

  // Start recording this specific session
  posthog.startSessionRecording()
  console.log('Session recording started')
}

/**
 * Check if session is being recorded
 */
export function isSessionRecording() {
  if (!posthog) return false

  return posthog.sessionRecordingStarted()
}

/**
 * Get the current PostHog session ID
 */
export function getSessionId(): string | null {
  if (!posthog) return null

  return posthog.get_session_id()
}

/**
 * Get the PostHog session replay URL with timestamp pointing to the current moment
 * When a user submits a bug report, this generates a link to that exact moment in the session
 */
export function getSessionReplayUrl(): string | null {
  if (!posthog) return null

  try {
    // Use PostHog's built-in method to get the session replay URL with timestamp
    // This automatically calculates the timestamp from when the session started to now
    const url = posthog.get_session_replay_url({
      withTimestamp: true,
      timestampLookBack: 0  // Link to the exact current moment (no lookback)
    })

    if (url) {
      console.log('Generated PostHog session replay URL with timestamp:', url)
    }

    return url || null
  } catch (error) {
    console.error('Failed to get session replay URL:', error)
    return null
  }
}

/**
 * Extract project ID from PostHog token (if possible)
 * PostHog tokens don't directly contain project ID, so we'll store it separately
 */
function extractProjectId(token: string): string | null {
  // For now, we'll need to set this via env variable
  // or extract from PostHog dashboard URL
  return process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID || null
}

export { posthog }
