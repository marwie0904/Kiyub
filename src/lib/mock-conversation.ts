export const mockConversation = [
  {
    role: "user" as const,
    content: "What's the difference between TypeScript and JavaScript?",
  },
  {
    role: "assistant" as const,
    content: "TypeScript is a superset of JavaScript that adds static typing. The main differences are:\n\n1. **Type Safety** - TypeScript catches errors at compile time\n2. **Better IDE Support** - Enhanced autocomplete and refactoring\n3. **Modern Features** - Access to latest ECMAScript features\n\nAll TypeScript code compiles down to plain JavaScript.",
    reasoning: "The user is asking a fundamental question about programming languages. I should provide a clear, concise comparison focusing on the key benefits of TypeScript.",
  },
  {
    role: "user" as const,
    content: "Should I use it for my next project?",
  },
  {
    role: "assistant" as const,
    content: "It depends on your project size and team. I'd recommend TypeScript if:\n\n• Your project will have **more than 1000 lines of code**\n• You're working with a **team**\n• You want better **maintainability** long-term\n\nFor small scripts or prototypes, vanilla JavaScript is often sufficient.",
    reasoning: "The follow-up question requires practical advice. I should consider project scale and team dynamics to give actionable recommendations.",
  },
];
