# Authentication Setup Guide

This guide explains how to set up authentication for the chat application using Convex Auth.

## Overview

The application uses [@convex-dev/auth](https://labs.convex.dev/auth) for authentication with:
- Email & Password authentication

## Environment Variables

### Required Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=<your-convex-url>
```

That's it! No additional environment variables are required for basic email/password authentication.

## Authentication Flow

### Sign Up Flow

1. User visits `/auth/sign-up`
2. User enters:
   - Email address
   - Password (minimum 8 characters)
   - Password confirmation
3. Password validation:
   - Must be at least 8 characters
   - Passwords must match
4. Upon successful registration, user is redirected to the main application

### Sign In Flow

1. User visits `/auth/sign-in`
2. User enters:
   - Email address
   - Password
3. Upon successful authentication, user is redirected to the main application

### Protected Routes

All routes except `/auth/*` are protected with authentication:
- Main chat interface: `/`
- Canvas pages: `/canvas/*`
- Projects: `/projects/*`
- Tests: `/tests/*`
- Admin: `/admin/*`
- Chats: `/chats`

Unauthenticated users attempting to access protected routes are automatically redirected to `/auth/sign-in`.

## Components

### Auth Components

- `SignIn` (`src/components/auth/sign-in.tsx`): Sign-in form with Google OAuth and email/password
- `SignUp` (`src/components/auth/sign-up.tsx`): Sign-up form with Google OAuth and email/password
- `UserMenu` (`src/components/auth/user-menu.tsx`): User dropdown menu with sign-out
- `AuthGuard` (`src/components/auth/auth-guard.tsx`): Route protection component
- `ProtectedLayout` (`src/components/auth/protected-layout.tsx`): Layout wrapper for protected pages

### Usage Example

```tsx
import { ProtectedLayout } from "@/components/auth/protected-layout";

export default function MyProtectedPage() {
  return (
    <ProtectedLayout>
      {/* Your page content */}
    </ProtectedLayout>
  );
}
```

## Data Isolation

All database tables include a `userId` field and are indexed by user:
- Users can only access their own data
- All queries are filtered by `userId`
- All mutations verify ownership before modifying data

### Backend Authorization Pattern

```typescript
import { getCurrentUserOrThrow } from "./lib/auth";

export const myQuery = query({
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);

    return await ctx.db
      .query("myTable")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});
```

## UI Design

The authentication pages feature a split-screen design:

**Left Side (Desktop only):**
- Tagline: "Built for students, By Students"
- Animated cube loader
- Faded gradient circle at the bottom

**Right Side:**
- Clean, minimal sign-in/sign-up form
- Email and password fields
- Large, accessible input fields (48px height)
- Clear call-to-action buttons

## Troubleshooting

### Users Not Being Redirected

- Check browser console for errors
- Verify `NEXT_PUBLIC_CONVEX_URL` is set correctly
- Ensure Convex deployment is running

### Authentication Errors

- Verify password meets minimum requirements (8 characters)
- Check that email format is valid
- Ensure Convex auth tables are properly configured

## Additional Resources

- [Convex Auth Documentation](https://labs.convex.dev/auth)
