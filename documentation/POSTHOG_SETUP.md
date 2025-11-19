# PostHog Analytics Integration

This document describes the PostHog analytics integration for tracking LLM usage, session replay, and user surveys.

## Features

✅ **LLM Tracking**: Track token usage, costs, latency, and performance
✅ **Session Replay**: Record user sessions for debugging and UX improvements
✅ **Surveys**: Feature requests, bug reports, and satisfaction surveys
✅ **Custom Events**: Track user interactions and behaviors
✅ **Error Tracking**: Capture and track errors

## Setup Instructions

### 1. Get PostHog API Keys

1. Sign up at [PostHog](https://app.posthog.com)
2. Create a new project
3. Navigate to Project Settings
4. Copy your **Project API Key** (for client-side tracking)
5. Copy your **Personal API Key** (for server-side tracking)

### 2. Configure Environment Variables

Update `.env.local` with your PostHog credentials:

```env
# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_your_project_api_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
POSTHOG_API_KEY=phx_your_personal_api_key_here
```

### 3. Enable Session Recording

Session recording is **conditionally enabled** (only on errors). To configure:

1. Go to PostHog Dashboard → Project Settings → Session Recording
2. Enable "Record user sessions"
3. Configure privacy settings (default: mask passwords only)

**Current behavior:** Sessions are NOT recorded automatically. Recording only starts when:
- An error occurs (via `analytics.errorOccurred()`)
- You manually call `startSessionRecording()`
- User submits a bug report

See `SESSION_RECORDING_GUIDE.md` for detailed configuration options.

### 4. Create Surveys

PostHog surveys are configured in the dashboard. Create these three surveys:

#### Survey 1: Feature Request
- **Name**: Feature Request
- **Type**: Open text
- **Trigger**: After 5 messages sent
- **Question**: "What features would you like to see in this app?"
- **Targeting**: All users

#### Survey 2: Bug Report
- **Name**: Bug Report
- **Type**: Multiple questions
  - Q1: "What went wrong?" (Open text)
  - Q2: "How would you rate your experience?" (Rating 1-5)
- **Trigger**: Custom event `error_occurred`
- **Targeting**: Users who experienced errors

#### Survey 3: Satisfaction (NPS)
- **Name**: Satisfaction Survey
- **Type**: Rating (0-10)
- **Trigger**: After 10 messages or weekly
- **Question**: "How likely are you to recommend this app to a friend?"
- **Targeting**: Active users

## LLM Tracking

### What's Tracked

For every LLM API call, we track:

- **Model**: Which model was used (e.g., `gpt-oss-20b`)
- **Provider**: Provider name (`openrouter`)
- **Token Usage**:
  - Prompt tokens
  - Completion tokens
  - Total tokens
- **Cost**: Calculated based on model pricing
- **Performance**:
  - Latency (ms)
  - Success/failure status
- **Context**:
  - Conversation ID
  - Message ID
  - Reasoning level (low/medium/high)
  - Tools used (e.g., `webSearch`)
- **Errors**: Error messages if the call failed

### Viewing LLM Metrics in PostHog

1. **Token Usage Over Time**:
   - Go to Insights → New Insight
   - Event: `llm_call`
   - Aggregate: Sum of `total_tokens`
   - Chart type: Line chart

2. **Cost Analysis**:
   - Event: `llm_call`
   - Aggregate: Sum of `cost`
   - Breakdown: By `model`

3. **Model Performance**:
   - Event: `llm_call`
   - Aggregate: Average of `latency_ms`
   - Breakdown: By `model`

4. **Success Rate**:
   - Event: `llm_call`
   - Filter: `success = true`
   - Chart: Conversion rate

5. **Tool Usage**:
   - Event: `llm_call`
   - Filter: Where `tools_used` exists
   - Breakdown: By `tools_used`

### Example Queries

```sql
-- Total tokens used per model
SELECT
  properties.model,
  SUM(properties.total_tokens) as total_tokens,
  SUM(properties.cost) as total_cost
FROM events
WHERE event = 'llm_call'
GROUP BY properties.model

-- Average latency by reasoning level
SELECT
  properties.reasoning_level,
  AVG(properties.latency_ms) as avg_latency
FROM events
WHERE event = 'llm_call'
GROUP BY properties.reasoning_level
```

## Session Replay

### Viewing Replays

1. Go to PostHog Dashboard → Session Replay
2. Filter by:
   - Date range
   - User properties
   - Events (e.g., users who sent messages)
   - Console errors

### Privacy & Masking

By default:
- ✅ Password fields are masked
- ✅ Input fields are recorded (to see user queries)
- ❌ Cross-origin iframes are not recorded

To change masking behavior, edit `src/lib/analytics/posthog.ts`:

```typescript
session_recording: {
  maskAllInputs: true, // Mask all input fields
  maskInputOptions: {
    password: true,
    email: true, // Also mask email fields
  },
}
```

## Custom Event Tracking

### Track Custom Events

Use the PostHog SDK to track custom events:

```typescript
import { posthog } from '@/lib/analytics/posthog'

// Track a custom event
posthog.capture('custom_event_name', {
  property1: 'value1',
  property2: 123,
})

// Track user properties
posthog.identify('user_id', {
  email: 'user@example.com',
  name: 'John Doe',
})
```

### Useful Events to Track

Add these to your application:

```typescript
// When user sends a message
posthog.capture('message_sent', {
  conversation_id: conversationId,
  message_length: message.length,
  has_attachments: attachments.length > 0,
})

// When web search is used
posthog.capture('web_search_used', {
  query: searchQuery,
  results_count: results.length,
})

// When user creates a project
posthog.capture('project_created', {
  project_name: name,
})

// When error occurs
posthog.capture('error_occurred', {
  error_message: error.message,
  error_type: error.name,
  page: window.location.pathname,
})
```

## Dashboards

### Recommended Dashboards

Create these dashboards in PostHog:

#### 1. LLM Performance Dashboard
- Total tokens used (trend)
- Total cost (trend)
- Average latency by model
- Success rate
- Most used models
- Tools usage breakdown

#### 2. User Engagement Dashboard
- Active users (DAU/WAU/MAU)
- Messages per user
- Conversations created
- Session duration
- Feature usage

#### 3. Error Monitoring Dashboard
- Error rate over time
- Top errors by message
- Errors by page
- Users affected by errors

## Cost Optimization

### Monitor Costs

The integration calculates costs based on OpenRouter pricing:

| Model | Prompt (per 1M tokens) | Completion (per 1M tokens) |
|-------|----------------------|---------------------------|
| GPT-OSS-405B | $1.00 | $1.00 |
| GPT-OSS-70B | $0.25 | $0.25 |
| DeepSeek Chat | $0.14 | $0.28 |
| Gemini 2.0 Flash | $0.00 | $0.00 |
| Gemini Flash 1.5 | $0.075 | $0.30 |

Update prices in `src/lib/analytics/llm-tracking.ts` as needed.

### Set Up Alerts

1. Go to PostHog → Insights → Your Cost Dashboard
2. Click "Alerts"
3. Create alert:
   - Metric: Sum of `cost`
   - Threshold: $10 per day
   - Notification: Email or Slack

## Troubleshooting

### PostHog Not Tracking

1. Check browser console for errors
2. Verify environment variables are set correctly
3. Check PostHog dashboard → Live Events
4. Enable debug mode: `posthog.debug()`

### Session Replay Not Recording

1. Verify session recording is enabled in PostHog settings
2. Check that `opt_in_site_apps: true` in config
3. Ensure ad blockers are not blocking PostHog

### LLM Tracking Not Working

1. Check server logs for PostHog errors
2. Verify `POSTHOG_API_KEY` is set (server-side key)
3. Check that token usage is being captured by AI SDK

## Files Modified

- `src/lib/analytics/posthog.ts` - PostHog initialization
- `src/lib/analytics/llm-tracking.ts` - LLM tracking utilities
- `src/components/providers/posthog-provider.tsx` - Provider component
- `src/components/analytics/surveys.tsx` - Survey component
- `src/app/layout.tsx` - Added PostHog provider
- `src/app/api/chat/route.ts` - LLM tracking integration
- `.env.local` - PostHog environment variables

## Next Steps

1. Add environment variables to `.env.local`
2. Test PostHog integration in development
3. Create surveys in PostHog dashboard
4. Set up dashboards for monitoring
5. Configure alerts for cost and errors
6. Add custom event tracking as needed

## Resources

- [PostHog Documentation](https://posthog.com/docs)
- [PostHog Session Replay](https://posthog.com/docs/session-replay)
- [PostHog Surveys](https://posthog.com/docs/surveys)
- [OpenRouter Pricing](https://openrouter.ai/models)
