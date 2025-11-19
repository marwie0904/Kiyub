export type BugPriority = "low" | "medium" | "high" | "critical";
export type BugStatus = "inbox" | "doing" | "review" | "done";

export interface BugReport {
  id: string;
  priority: BugPriority;
  title: string;
  description: string;
  status: BugStatus;
  postHogRecordingUrl?: string;
  userName: string;
  userEmail: string;
  createdAt: Date;
  isPinned?: boolean;
}

export const mockBugReports: BugReport[] = [
  // Inbox
  {
    id: "1",
    priority: "high",
    title: "Chat messages not sending",
    description: "When I try to send a message in the chat, it shows loading but never sends. The error appears after about 30 seconds.",
    status: "inbox",
    postHogRecordingUrl: "https://app.posthog.com/recording/example1",
    userName: "Sarah Johnson",
    userEmail: "sarah.johnson@example.com",
    createdAt: new Date("2024-01-15T10:30:00"),
  },
  {
    id: "2",
    priority: "critical",
    title: "Login page crashes on Safari",
    description: "The login page completely crashes when accessed on Safari browser. Works fine on Chrome and Firefox.",
    status: "inbox",
    postHogRecordingUrl: "https://app.posthog.com/recording/example2",
    userName: "Michael Chen",
    userEmail: "m.chen@example.com",
    createdAt: new Date("2024-01-15T09:15:00"),
  },
  {
    id: "3",
    priority: "medium",
    title: "Dark mode toggle not working",
    description: "Clicking the dark mode toggle in settings does nothing. The theme doesn't change.",
    status: "inbox",
    postHogRecordingUrl: "https://app.posthog.com/recording/example3",
    userName: "Emily Rodriguez",
    userEmail: "emily.r@example.com",
    createdAt: new Date("2024-01-14T16:45:00"),
  },
  {
    id: "4",
    priority: "low",
    title: "Sidebar scroll jumpy on mobile",
    description: "When scrolling through conversations in the sidebar on mobile, the scroll behavior is very jumpy and inconsistent.",
    status: "inbox",
    userName: "David Kim",
    userEmail: "david.kim@example.com",
    createdAt: new Date("2024-01-14T14:20:00"),
  },

  // Doing
  {
    id: "5",
    priority: "high",
    title: "File upload fails for large files",
    description: "Any file larger than 5MB fails to upload. The progress bar reaches 100% but then shows an error.",
    status: "doing",
    postHogRecordingUrl: "https://app.posthog.com/recording/example5",
    userName: "Jessica Taylor",
    userEmail: "j.taylor@example.com",
    createdAt: new Date("2024-01-13T11:30:00"),
  },
  {
    id: "6",
    priority: "critical",
    title: "Database connection timeout",
    description: "Users are experiencing random timeouts when trying to access their data. Happens intermittently.",
    status: "doing",
    postHogRecordingUrl: "https://app.posthog.com/recording/example6",
    userName: "Robert Martinez",
    userEmail: "robert.m@example.com",
    createdAt: new Date("2024-01-13T08:00:00"),
  },
  {
    id: "7",
    priority: "medium",
    title: "Search results not updating",
    description: "After creating a new conversation, it doesn't appear in search results until page refresh.",
    status: "doing",
    userName: "Amanda Wilson",
    userEmail: "amanda.w@example.com",
    createdAt: new Date("2024-01-12T15:30:00"),
  },

  // For Review
  {
    id: "8",
    priority: "high",
    title: "Memory leak in canvas component",
    description: "The canvas component causes memory usage to continuously increase over time, eventually causing browser to slow down.",
    status: "review",
    postHogRecordingUrl: "https://app.posthog.com/recording/example8",
    userName: "Kevin Brown",
    userEmail: "k.brown@example.com",
    createdAt: new Date("2024-01-11T13:00:00"),
  },
  {
    id: "9",
    priority: "medium",
    title: "Avatar images not loading",
    description: "User avatar images show broken image icon instead of the actual profile picture.",
    status: "review",
    postHogRecordingUrl: "https://app.posthog.com/recording/example9",
    userName: "Lisa Anderson",
    userEmail: "lisa.anderson@example.com",
    createdAt: new Date("2024-01-11T10:15:00"),
  },

  // Done
  {
    id: "10",
    priority: "high",
    title: "Conversation list not refreshing",
    description: "New messages don't show up in the conversation list without manually refreshing the page.",
    status: "done",
    postHogRecordingUrl: "https://app.posthog.com/recording/example10",
    userName: "Thomas Lee",
    userEmail: "thomas.lee@example.com",
    createdAt: new Date("2024-01-10T09:30:00"),
  },
  {
    id: "11",
    priority: "medium",
    title: "Timestamp formatting incorrect",
    description: "Message timestamps show incorrect times, seems to be a timezone issue.",
    status: "done",
    userName: "Sophia Garcia",
    userEmail: "sophia.g@example.com",
    createdAt: new Date("2024-01-09T14:45:00"),
  },
  {
    id: "12",
    priority: "low",
    title: "Tooltip positioning off-screen",
    description: "Tooltips on the right edge of the screen appear partially off-screen and are hard to read.",
    status: "done",
    userName: "Daniel White",
    userEmail: "daniel.white@example.com",
    createdAt: new Date("2024-01-09T11:20:00"),
  },
];
