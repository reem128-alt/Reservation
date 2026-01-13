export interface ChatMessage {
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

export interface ChatConversation {
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

export interface SendMessageRequest {
  conversationId?: number
  content: string
  userId?: number
}

export interface UpdateConversationRequest {
  status: "ACTIVE" | "CLOSED"
}
