# Chat Support System - Frontend Implementation

## Overview
A complete real-time chat support system integrated with your Next.js application. Features include:
- Real-time messaging via WebSocket (Socket.IO)
- REST API fallback for reliability
- Separate interfaces for users and admins
- Read receipts and typing indicators
- Unread message notifications
- Responsive design with Tailwind CSS

## Files Created

### API Layer
- **`lib/api/chat.ts`** - REST API client for chat operations
- **`lib/hooks/use-chat-socket.ts`** - WebSocket hook for real-time communication

### Components
- **`components/chat/chat-window.tsx`** - Main chat interface
- **`components/chat/conversation-list.tsx`** - List of conversations (admin view)
- **`components/chat/message-list.tsx`** - Message display with bubbles
- **`components/chat/message-input.tsx`** - Message input with typing indicators
- **`components/chat/chat-button.tsx`** - Chat button with unread count badge
- **`components/chat/floating-chat.tsx`** - Floating chat widget
- **`components/chat/admin-chat-dialog.tsx`** - Admin dialog to start new conversations

### Pages
- **`app/[locale]/dashboard/support/page.tsx`** - Admin support page
- **`app/[locale]/user-dashboard/support/page.tsx`** - User support page

### Utilities
- **`lib/utils/format.ts`** - Added `formatDistanceToNow` function

## Environment Setup

Make sure your `.env` file has the correct backend URL:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

Adjust the URL to match your backend server.

## Usage

### For Users

#### Option 1: Dedicated Support Page
Users can access the support chat at:
```
/[locale]/user-dashboard/support
```

#### Option 2: Floating Chat Widget
Add the floating chat widget to any page:

```tsx
import { FloatingChat } from "@/components/chat/floating-chat"

export default function YourPage() {
  return (
    <div>
      {/* Your page content */}
      <FloatingChat />
    </div>
  )
}
```

### For Admins

#### Access Admin Chat
Admins can access the support dashboard at:
```
/[locale]/dashboard/support
```

Features:
- View all active conversations in a sidebar
- Switch between conversations
- See unread message counts
- Real-time message updates
- Typing indicators

#### Start New Conversation
Admins can proactively start conversations with users:

```tsx
import { AdminChatDialog } from "@/components/chat/admin-chat-dialog"

export default function AdminPage() {
  return (
    <div>
      <AdminChatDialog 
        onConversationCreated={(conversationId) => {
          console.log("New conversation:", conversationId)
        }}
      />
    </div>
  )
}
```

### Add Chat Button to Navigation

Add a chat button with unread count to your navigation:

```tsx
import { ChatButton } from "@/components/chat/chat-button"
import { useRouter } from "next/navigation"

export function Navigation() {
  const router = useRouter()
  
  return (
    <nav>
      {/* Other nav items */}
      <ChatButton onClick={() => router.push("/dashboard/support")} />
    </nav>
  )
}
```

## Component API

### ChatWindow

Main chat interface component.

```tsx
<ChatWindow 
  onClose={() => {}}           // Optional: Called when close button clicked
  initialConversationId={123}  // Optional: Load specific conversation
  className="w-full"           // Optional: Additional CSS classes
/>
```

### ChatButton

Button with unread message badge.

```tsx
<ChatButton 
  onClick={() => {}}           // Required: Click handler
  className="ml-4"             // Optional: Additional CSS classes
/>
```

### FloatingChat

Self-contained floating chat widget.

```tsx
<FloatingChat />
```

### AdminChatDialog

Dialog for admins to start new conversations.

```tsx
<AdminChatDialog 
  onConversationCreated={(id) => {}}  // Optional: Callback with conversation ID
/>
```

## Features

### Real-time Communication
- WebSocket connection automatically established when user is authenticated
- Automatic reconnection on connection loss
- Falls back to REST API if WebSocket unavailable

### Message Status
- Read receipts automatically sent when viewing messages
- Typing indicators show when other party is typing
- Connection status indicator (green dot when connected)

### User Experience
- Auto-scroll to latest message
- Message timestamps
- Sender identification
- Text wrapping for long messages
- Textarea auto-resize
- Enter to send, Shift+Enter for new line

### Admin Features
- Conversation list with unread counts
- Switch between multiple conversations
- Start conversations with any user by ID
- Close conversations
- View user information

## API Integration

The frontend integrates with your backend WebSocket server:

### WebSocket Events

**Client → Server:**
- `authenticate` - Authenticate user on connection
- `sendMessage` - Send a new message
- `markAsRead` - Mark conversation as read
- `typing` - Send typing indicator

**Server → Client:**
- `newMessage` - Receive new message
- `messagesRead` - Messages marked as read
- `userTyping` - Other user is typing

### REST API Endpoints

- `POST /chat/messages` - Send message
- `GET /chat/conversations` - Get all conversations
- `GET /chat/conversations/:id` - Get specific conversation
- `GET /chat/conversations/:id/messages` - Get messages
- `POST /chat/conversations/:id/read` - Mark as read
- `PATCH /chat/conversations/:id` - Update conversation status
- `GET /chat/unread-count` - Get unread count

## Styling

The chat system uses your existing Tailwind CSS configuration and shadcn/ui components:
- Consistent with your app's design system
- Supports light/dark mode
- Responsive design
- Accessible components

## Customization

### Change Colors
Edit the message bubble colors in `message-list.tsx`:

```tsx
// Current user messages
className="bg-primary text-primary-foreground"

// Other user messages
className="bg-muted"
```

### Adjust Chat Window Size
In `floating-chat.tsx`:

```tsx
<div className="w-96 h-[600px]">  // Change width and height
```

### Modify Typing Timeout
In `message-input.tsx`:

```tsx
setTimeout(() => {
  onTyping(false)
}, 1000)  // Change timeout duration (ms)
```

## Troubleshooting

### WebSocket Not Connecting
1. Check `NEXT_PUBLIC_API_BASE_URL` in `.env`
2. Verify backend WebSocket server is running
3. Check browser console for connection errors
4. Ensure CORS is configured on backend

### Messages Not Appearing
1. Check if user is authenticated (token in localStorage)
2. Verify WebSocket connection status (green dot)
3. Check browser console for errors
4. Try refreshing the page

### Unread Count Not Updating
1. Ensure `/chat/unread-count` endpoint is working
2. Check if polling interval is too long (default: 30s)
3. Verify user authentication

## Next Steps

### Recommended Enhancements
1. **Push Notifications** - Add browser notifications for new messages
2. **File Uploads** - Allow sending images/files
3. **Message Search** - Search through conversation history
4. **Emoji Picker** - Add emoji support
5. **Message Reactions** - React to messages
6. **Voice Messages** - Record and send audio
7. **User Presence** - Show online/offline status
8. **Message Delivery Status** - Sent/Delivered/Read indicators

### Performance Optimizations
1. Implement message pagination for long conversations
2. Add virtual scrolling for large message lists
3. Cache conversations in localStorage
4. Debounce typing indicators

## Support

For issues or questions:
1. Check browser console for errors
2. Verify backend is running and accessible
3. Check network tab for failed requests
4. Review backend logs for WebSocket events

## Example: Complete Integration

Here's a complete example of adding chat to your dashboard layout:

```tsx
// app/[locale]/dashboard/layout.tsx
"use client"

import { FloatingChat } from "@/components/chat/floating-chat"

export default function DashboardLayout({ children }) {
  return (
    <div>
      <nav>
        {/* Your navigation */}
      </nav>
      <main>{children}</main>
      <FloatingChat />  {/* Add floating chat */}
    </div>
  )
}
```

That's it! Your chat support system is ready to use.
