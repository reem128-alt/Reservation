interface ChatMessage {
  id: number
  conversationId: number
  senderId: number
  content: string
  isRead: boolean
  createdAt: string
  sender?: {
    id: number
    email: string
    name: string
    role: string
  }
}

interface ChatConversation {
  id: number
  userId: number
  status: "ACTIVE" | "CLOSED"
  lastMessageAt: string
  createdAt: string
  updatedAt: string
  user?: {
    id: number
    email: string
    name: string
  }
  messages?: ChatMessage[]
  unreadCount?: number
}

interface SendMessageRequest {
  conversationId?: number
  content: string
  userId?: number
}

interface UpdateConversationRequest {
  status: "ACTIVE" | "CLOSED"
}
