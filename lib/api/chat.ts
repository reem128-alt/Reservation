import { apiClient } from "./axios"

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
    const response = await apiClient.get<{ count: number }>("/chat/unread-count")
    return response.data.count
  },
}
