# Session Recording Configuration Guide

## Current Setup: Conditional Recording ✅

**Sessions are NOT recorded by default.** Recording only starts when:
- ❌ An error occurs
- ❌ User submits a bug report
- ❌ You manually trigger it

This saves storage and respects user privacy while still capturing important debugging sessions.

---

## How It Works

### Default Behavior (Current)
```typescript
// src/lib/analytics/posthog.ts
session_recording: {
  sampleRate: 0,  // 0 = No automatic recording
}
```

**What happens:**
1. User visits app → No recording starts
2. Error occurs → `analytics.errorOccurred()` → Recording starts automatically
3. Recording captures the session from that point forward
4. PostHog buffers ~60 seconds of prior activity (retroactive recording)

### Automatic Recording on Errors

When an error is tracked, recording starts automatically:

```typescript
import { analytics } from '@/lib/analytics/events'

try {
  // Your code
} catch (error) {
  // This will start recording AND track the error
  analytics.errorOccurred({
    errorMessage: error.message,
    errorType: error.name,
    page: window.location.pathname,
  })
}
```

---

## Recording Options

### Option 1: Only on Errors (Current - Recommended) ⭐

**Best for:**
- Privacy-conscious apps
- Saving storage costs
- Debugging specific issues

```typescript
// src/lib/analytics/posthog.ts
session_recording: {
  sampleRate: 0, // No automatic recording
}

// Use in code:
analytics.errorOccurred({...}) // Automatically starts recording
```

**Pros:**
- ✅ Minimal storage usage
- ✅ Only records problematic sessions
- ✅ Privacy-friendly
- ✅ PostHog buffers 60s of prior activity

**Cons:**
- ❌ Won't see successful user journeys
- ❌ Can't proactively discover UX issues

---

### Option 2: Sample Recording (e.g., 10% of sessions)

**Best for:**
- Balancing insights with privacy
- Limited PostHog plan

```typescript
// src/lib/analytics/posthog.ts
session_recording: {
  sampleRate: 0.1, // Record 10% of sessions randomly
}
```

**Pros:**
- ✅ See real user behavior
- ✅ Lower storage than 100%
- ✅ Statistical insights

**Cons:**
- ❌ Might miss important error sessions
- ❌ Random selection

---

### Option 3: Always Record (100%)

**Best for:**
- Early stage / beta apps
- Heavy debugging needed
- Generous PostHog plan

```typescript
// src/lib/analytics/posthog.ts
session_recording: {
  sampleRate: 1.0, // Record 100% of sessions
}
```

**Pros:**
- ✅ Complete visibility
- ✅ Never miss anything
- ✅ Best for UX research

**Cons:**
- ❌ High storage costs
- ❌ Privacy concerns
- ❌ Potentially creepy for users

---

### Option 4: Conditional Recording (Advanced)

Record based on user properties or feature flags:

```typescript
// src/lib/analytics/posthog.ts
posthog.init(key, {
  session_recording: {
    sampleRate: 0,
  },
  loaded: (ph) => {
    // Start recording for specific users
    if (ph.getFeatureFlag('enable-session-recording') === true) {
      ph.startSessionRecording()
    }
  },
})
```

**Best for:**
- A/B testing
- Beta users only
- VIP customer support

---

## Manual Recording Control

### Start Recording Manually

```typescript
import { startSessionRecording } from '@/lib/analytics/posthog'

// When user clicks "Report Bug" button
function handleBugReport() {
  startSessionRecording() // Start recording NOW

  // Show bug report form
  // Recording will capture form interaction
}
```

### Stop Recording

```typescript
import { stopSessionRecording } from '@/lib/analytics/posthog'

stopSessionRecording()
```

### Check Recording Status

```typescript
import { isSessionRecording } from '@/lib/analytics/posthog'

if (isSessionRecording()) {
  console.log('Session is being recorded')
}
```

---

## Example Use Cases

### Use Case 1: Bug Report Button

```typescript
// components/BugReportButton.tsx
import { startSessionRecording } from '@/lib/analytics/posthog'
import { analytics } from '@/lib/analytics/events'

export function BugReportButton() {
  const handleClick = () => {
    // Start recording to capture bug reproduction
    startSessionRecording()

    // Track the bug report
    analytics.featureUsed('bug_report_clicked')

    // Show bug report form
    openBugReportModal()
  }

  return <button onClick={handleClick}>Report Bug</button>
}
```

### Use Case 2: Error Boundary

```typescript
// components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react'
import { analytics } from '@/lib/analytics/events'

class ErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: any) {
    // Automatically start recording when error occurs
    analytics.errorOccurred({
      errorMessage: error.message,
      errorType: error.name,
      page: window.location.pathname,
    })
  }

  render() {
    return this.props.children
  }
}
```

### Use Case 3: VIP User Tracking

```typescript
// Track VIP users more closely
import { startSessionRecording } from '@/lib/analytics/posthog'

function identifyUser(user: User) {
  analytics.identify(user.id, {
    email: user.email,
    plan: user.plan,
  })

  // Start recording for VIP/paid users
  if (user.plan === 'pro' || user.plan === 'enterprise') {
    startSessionRecording()
  }
}
```

---

## Privacy Settings

### What Gets Recorded

- ✅ Mouse movements and clicks
- ✅ Scrolling and navigation
- ✅ Page content (text visible on screen)
- ✅ Console logs and errors
- ❌ Passwords (automatically masked)
- ❌ Credit card numbers (can configure)

### Masking Sensitive Data

```typescript
// src/lib/analytics/posthog.ts
session_recording: {
  maskAllInputs: false, // Don't mask all inputs
  maskInputOptions: {
    password: true,     // Mask password fields
    email: false,       // Don't mask email fields
    tel: false,         // Don't mask phone fields
  },
}
```

### Mask All Inputs (Maximum Privacy)

```typescript
session_recording: {
  maskAllInputs: true, // Mask ALL input fields
}
```

### Mask Specific Elements with CSS

Add `ph-no-capture` class to elements:

```tsx
<div className="ph-no-capture">
  Sensitive content here - won't be recorded
</div>
```

---

## Storage & Costs

### PostHog Pricing (as of 2025)

- **Free Tier**: 5,000 recordings/month
- **Paid**: $0.005 per recording after free tier

### Recording Size

Average recording: ~1-5 MB depending on:
- Session duration
- Page complexity
- User interactions

**Example costs:**
- 10,000 recordings/month = $25/month
- 50,000 recordings/month = $225/month
- 100,000 recordings/month = $475/month

### Retention

Configure in PostHog dashboard:
- Default: 21 days
- Can extend to 90 days or custom

---

## Best Practices

### ✅ Do's

1. **Always inform users** (privacy policy)
2. **Mask sensitive data** (passwords, PII)
3. **Use conditional recording** for cost savings
4. **Set retention limits** (e.g., 30 days)
5. **Monitor storage usage** in PostHog

### ❌ Don'ts

1. **Don't record everything** without reason
2. **Don't ignore privacy concerns**
3. **Don't forget to mask PII**
4. **Don't keep recordings forever**
5. **Don't record payment pages** (unless necessary)

---

## Changing Configuration

### Switch to 100% Recording

```typescript
// src/lib/analytics/posthog.ts
session_recording: {
  sampleRate: 1.0, // Record everything
}
```

### Switch to 10% Sampling

```typescript
session_recording: {
  sampleRate: 0.1, // Record 10% randomly
}
```

### Disable Recording Completely

```typescript
session_recording: {
  sampleRate: 0,
},
// AND remove auto-start on errors:
// Comment out startSessionRecording() in analytics.errorOccurred()
```

---

## Viewing Recordings in PostHog

1. **Go to PostHog Dashboard** → Session Replay
2. **Filter by:**
   - Date range
   - User properties
   - Events (e.g., "error_occurred")
   - Console errors
3. **Watch replays:**
   - Play/pause/skip
   - See console logs
   - View network requests
   - Jump to specific events

### Useful Filters

```
# Show sessions with errors
event = "error_occurred"

# Show sessions from specific user
distinct_id = "user_123"

# Show long sessions
session_duration > 5m

# Show sessions with specific page
current_url contains "/chat"
```

---

## FAQ

**Q: When does recording actually start with `sampleRate: 0`?**
A: Never automatically. Only when you call `startSessionRecording()` or when `analytics.errorOccurred()` is called.

**Q: Does PostHog buffer prior activity?**
A: Yes! PostHog buffers ~60 seconds of activity BEFORE recording starts. So when an error occurs, you can see what led to it.

**Q: Can users opt-out?**
A: Yes, implement:
```typescript
posthog.opt_out_capturing()
```

**Q: Does this work on mobile?**
A: Session replay is web-only. Mobile apps need different setup.

**Q: How much storage does this use?**
A: Depends on session length. Average: 1-5 MB per session.

**Q: Can I export recordings?**
A: Yes, from PostHog dashboard you can download as video.

---

## Summary

**Current Setup:**
- ✅ `sampleRate: 0` - No automatic recording
- ✅ Recording starts on errors automatically
- ✅ Privacy-friendly
- ✅ Cost-effective
- ✅ Still captures important debugging sessions

**To change:** Edit `src/lib/analytics/posthog.ts` line 27.
