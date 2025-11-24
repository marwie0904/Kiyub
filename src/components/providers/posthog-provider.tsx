'use client'

import { useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { initPostHog, posthog } from '@/lib/analytics/posthog'
import { PostHogSurveys } from '@/components/analytics/surveys'

function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Don't track pageviews on waitlist page
    if (pathname === '/waitlist') {
      return
    }

    if (pathname && posthog) {
      let url = window.origin + pathname
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`
      }
      posthog.capture('$pageview', {
        $current_url: url,
      })
    }
  }, [pathname, searchParams])

  return null
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    // Don't initialize PostHog on waitlist page
    if (pathname === '/waitlist') {
      return
    }
    initPostHog()
  }, [pathname])

  // On waitlist page, just render children without PostHog
  if (pathname === '/waitlist') {
    return <>{children}</>
  }

  return (
    <>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      <PostHogSurveys />
      {children}
    </>
  )
}
