import { apiClient } from "./axios"
import type { ChatMessage, ChatConversation, SendMessageRequest, UpdateConversationRequest } from "@/app/types/chat"

export const chatApi = {
  sendMessage: async (data: SendMessageRequest): Promise<ChatMessage> => {
    const response = await apiClient.post<ChatMessage>("/chat/messages", data)
    return response.data
  },

  getConversations: async (status?: "ACTIVE" | "CLOSED"): Promise<ChatConversation[]> => {
    const response = await apiClient.get<ChatConversation[]>("/chat/conversations", {
      params: status ? { status } : undefined,
    })
    return response.data
  },

  getConversation: async (id: number): Promise<ChatConversation> => {
    const response = await apiClient.get<ChatConversation>(`/chat/conversations/${id}`)
    return response.data
  },

  getConversationByUserId: async (userId: number): Promise<ChatConversation | null> => {
    try {
      const response = await apiClient.get<ChatConversation>(`/chat/conversations/user/${userId}`)
      return response.data
    } catch (error: unknown) {
      if ((error as { response?: { status?: number } })?.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  getMessages: async (conversationId: number): Promise<ChatMessage[]> => {
    const response = await apiClient.get<ChatMessage[]>(
      `/chat/conversations/${conversationId}/messages`
    )
    return response.data
  },

  markAsRead: async (conversationId: number): Promise<void> => {
    await apiClient.post(`/chat/conversations/${conversationId}/read`)
  },

  updateConversation: async (
    id: number,
    data: UpdateConversationRequest
  ): Promise<ChatConversation> => {
    const response = await apiClient.patch<ChatConversation>(`/chat/conversations/${id}`, data)
    return response.data
  },

  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await apiClient.get("/chat/unread-count")
      // The API returns {unreadMessages: 2} directly in response.data
      if (response.data && typeof response.data === 'object' && 'unreadMessages' in response.data) {
        return response.data.unreadMessages || 0
      }
      return 0
    } catch (error) {
      console.error("Error fetching unread count:", error)
      return 0
    }
  },

  getUnreadDetails: async (): Promise<{
    totalUnreadConversations: number
    conversations: Array<{
      conversationId: number
      user: {
        id: number
        name: string
        email: string
      }
      unreadCount: number
      lastUnreadMessage?: {
        id: number
        content: string
        senderId: number
        createdAt: string
      }
      lastActivity: string
    }>
  }> => {
    const response = await apiClient.get("/chat/unread-details")
    return response.data
  },
}
