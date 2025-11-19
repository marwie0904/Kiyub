'use client'

import { useEffect } from 'react'
import { posthog } from '@/lib/analytics/posthog'

export function PostHogSurveys() {
  useEffect(() => {
    if (!posthog) return

    // Survey configurations will be created in PostHog dashboard
    // This component ensures surveys are properly loaded
    console.log('PostHog surveys initialized')
  }, [])

  return null
}

/**
 * Trigger a custom survey programmatically
 */
export function triggerSurvey(surveyId: string) {
  if (!posthog) return

  posthog.capture('survey_shown', {
    survey_id: surveyId,
  })
}

/**
 * Survey types to create in PostHog dashboard:
 *
 * 1. Feature Request Survey
 *    - Trigger: After 5 messages sent
 *    - Questions: "What features would you like to see?"
 *    - Type: Open text
 *
 * 2. Bug Report Survey
 *    - Trigger: When error occurs (custom event)
 *    - Questions: "What went wrong?", "What were you trying to do?"
 *    - Type: Open text + Rating
 *
 * 3. Satisfaction Survey (NPS)
 *    - Trigger: After 10 messages or weekly
 *    - Questions: "How likely are you to recommend this to a friend?"
 *    - Type: Rating 0-10
 */
