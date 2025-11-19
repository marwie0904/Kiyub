# AI Chat UI

A modern AI chat interface built with Next.js, TypeScript, and shadcn/ui.

## Features

- **Dark Theme**: Beautiful dark color scheme with purple accent (#867cd9)
- **Responsive Design**: Collapsible sidebar on mobile devices
- **Clean Interface**: Minimalist design focused on the chat experience
- **Mock Data**: Fully functional with sample conversations and user data

## Tech Stack

- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: High-quality component library
- **Lucide React**: Icon library

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx       # Root layout with dark theme
│   ├── page.tsx         # Home page with sidebar and chat area
│   └── globals.css      # Global styles and theme variables
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── sidebar.tsx      # Left sidebar navigation
│   └── chat-area.tsx    # Main chat interface
└── lib/
    ├── utils.ts         # Utility functions
    └── mock-data.ts     # Sample data for UI
```

## Customization

### Theme Colors

The primary purple accent color (#867cd9) is defined in `src/app/globals.css`:

```css
.dark {
  --primary: 263 58% 67%;  /* #867cd9 */
}
```

### Mock Data

Edit `src/lib/mock-data.ts` to customize:
- Starred chats
- Recent conversations
- User profile
- Model options

## Components

### Sidebar
- New chat button
- Navigation menu (Chats, Projects, Artifacts, Code)
- Starred section
- Recents section with scrolling
- User profile with dropdown

### Chat Area
- Welcome message
- Large text input with toolbar
- Model selector dropdown
- Submit button
