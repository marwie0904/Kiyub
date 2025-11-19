export type FeatureStatus = "inbox" | "doing" | "review" | "done";

export interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  status: FeatureStatus;
  userName: string;
  userEmail: string;
  createdAt: Date;
  isPinned?: boolean;
}

export const mockFeatureRequests: FeatureRequest[] = [
  // Inbox
  {
    id: "1",
    title: "Add voice message support",
    description: "It would be great to have the ability to send voice messages in chats, similar to WhatsApp. This would make communication faster and more personal.",
    status: "inbox",
    userName: "Alexandra Smith",
    userEmail: "alex.smith@example.com",
    createdAt: new Date("2024-01-15T11:20:00"),
  },
  {
    id: "2",
    title: "Export conversation history",
    description: "Add a feature to export entire conversation histories as PDF or JSON files. This would be useful for record-keeping and archiving purposes.",
    status: "inbox",
    userName: "Brian Thompson",
    userEmail: "b.thompson@example.com",
    createdAt: new Date("2024-01-15T09:45:00"),
  },
  {
    id: "3",
    title: "Custom themes and colors",
    description: "Allow users to create and save custom color themes beyond just light and dark mode. Let us personalize the interface with our own color schemes.",
    status: "inbox",
    userName: "Catherine Wang",
    userEmail: "c.wang@example.com",
    createdAt: new Date("2024-01-14T15:30:00"),
  },
  {
    id: "4",
    title: "Markdown support in messages",
    description: "Support markdown formatting in messages for better text formatting. Headers, bold, italic, code blocks, etc.",
    status: "inbox",
    userName: "Daniel Foster",
    userEmail: "daniel.f@example.com",
    createdAt: new Date("2024-01-14T13:15:00"),
  },
  {
    id: "5",
    title: "Mobile app version",
    description: "Please develop native mobile apps for iOS and Android. The web version works but a dedicated app would be much better.",
    status: "inbox",
    userName: "Emma Rodriguez",
    userEmail: "emma.rod@example.com",
    createdAt: new Date("2024-01-13T16:00:00"),
  },

  // Doing
  {
    id: "6",
    title: "Conversation folders/labels",
    description: "Add the ability to organize conversations into folders or apply labels/tags for better organization.",
    status: "doing",
    userName: "Frank Mitchell",
    userEmail: "f.mitchell@example.com",
    createdAt: new Date("2024-01-13T10:30:00"),
  },
  {
    id: "7",
    title: "Search within conversations",
    description: "Implement a search feature to find specific messages within a conversation, not just conversation titles.",
    status: "doing",
    userName: "Grace Chen",
    userEmail: "grace.chen@example.com",
    createdAt: new Date("2024-01-12T14:45:00"),
  },
  {
    id: "8",
    title: "Keyboard shortcuts",
    description: "Add keyboard shortcuts for common actions like creating new chat, searching, navigating between conversations, etc.",
    status: "doing",
    userName: "Henry Wilson",
    userEmail: "h.wilson@example.com",
    createdAt: new Date("2024-01-12T11:00:00"),
  },

  // For Review
  {
    id: "9",
    title: "Collaborative conversations",
    description: "Allow multiple users to participate in the same conversation, like a group chat feature.",
    status: "review",
    userName: "Isabella Martinez",
    userEmail: "i.martinez@example.com",
    createdAt: new Date("2024-01-11T15:20:00"),
  },
  {
    id: "10",
    title: "Code syntax highlighting",
    description: "When sharing code snippets in conversations, automatically detect and apply syntax highlighting for better readability.",
    status: "review",
    userName: "Jack Anderson",
    userEmail: "jack.a@example.com",
    createdAt: new Date("2024-01-11T09:30:00"),
  },
  {
    id: "11",
    title: "Conversation templates",
    description: "Create and save conversation templates with pre-filled prompts for common tasks or workflows.",
    status: "review",
    userName: "Karen Lee",
    userEmail: "karen.lee@example.com",
    createdAt: new Date("2024-01-10T16:45:00"),
  },

  // Done
  {
    id: "12",
    title: "Dark mode support",
    description: "Add a dark mode option to reduce eye strain during night-time usage.",
    status: "done",
    userName: "Lucas Brown",
    userEmail: "lucas.b@example.com",
    createdAt: new Date("2024-01-10T10:15:00"),
  },
  {
    id: "13",
    title: "Pin important conversations",
    description: "Allow users to pin their most important or frequently accessed conversations to the top of the list.",
    status: "done",
    userName: "Maria Garcia",
    userEmail: "maria.g@example.com",
    createdAt: new Date("2024-01-09T13:30:00"),
  },
  {
    id: "14",
    title: "Conversation rename feature",
    description: "Add the ability to rename conversations to more meaningful titles instead of auto-generated ones.",
    status: "done",
    userName: "Nathan Taylor",
    userEmail: "nathan.t@example.com",
    createdAt: new Date("2024-01-09T08:45:00"),
  },
  {
    id: "15",
    title: "Better timestamp display",
    description: "Show relative timestamps (like '2 hours ago') instead of just dates for recent messages.",
    status: "done",
    userName: "Olivia White",
    userEmail: "olivia.w@example.com",
    createdAt: new Date("2024-01-08T14:00:00"),
  },
];
