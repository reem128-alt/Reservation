"use client"

import { useState, useEffect } from "react"
import { MessageSquare, X } from "lucide-react"
import { chatApi} from "@/lib/api/chat"
import { useStore } from "@/lib/store/store"
import { formatDistanceToNow } from "@/lib/utils/format"
import { cn } from "@/lib/utils"

interface ConversationListProps {
  selectedConversationId?: number
  onSelectConversation: (conversation: ChatConversation) => void
  onClose?: () => void
}

export function ConversationList({
  selectedConversationId,
  onSelectConversation,
  onClose,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [loading, setLoading] = useState(true)
  const profile = useStore((state) => state.profile)

  const loadConversations = async () => {
    try {
      setLoading(true)
      const data = await chatApi.getConversations("ACTIVE")
      setConversations(data)
    } catch (error) {
      console.error("Failed to load conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConversations()
  }, [])

  const getConversationTitle = (conversation: ChatConversation) => {
    if (profile?.role === "ADMIN") {
      return conversation.user?.name || conversation.user?.email || `User ${conversation.userId}`
    }
    return "Support Chat"
  }

  const getLastMessagePreview = (conversation: ChatConversation) => {
    if (!conversation.messages || conversation.messages.length === 0) {
      return "No messages yet"
    }
    const lastMessage = conversation.messages[conversation.messages.length - 1]
    return lastMessage.content.length > 50
      ? `${lastMessage.content.substring(0, 50)}...`
      : lastMessage.content
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-muted-foreground">Loading conversations...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Conversations</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No conversations yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className={cn(
                  "w-full p-4 text-left hover:bg-accent transition-colors",
                  selectedConversationId === conversation.id && "bg-accent"
                )}
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-medium text-sm">
                    {getConversationTitle(conversation)}
                  </h3>
                  {conversation.unreadCount && conversation.unreadCount > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                  {getLastMessagePreview(conversation)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(conversation.lastMessageAt)}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
