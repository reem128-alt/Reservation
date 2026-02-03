"use client"

import { useState, useEffect, useCallback } from "react"
import { X, Minimize2, Maximize2 } from "lucide-react"
import { useChatSocket } from "@/lib/hooks/use-chat-socket"
import { MessageList } from "./message-list"
import { MessageInput } from "./message-input"
import { useStore } from "@/lib/store/store"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { chatApi } from "@/lib/api/chat"
import type { ChatMessage, ChatConversation } from "@/app/types/chat"

interface ChatWindowProps {
  onClose?: () => void
  initialConversationId?: number
  targetUserId?: number
  targetUser?: { id: number; name: string; email: string }
  className?: string
}

export function ChatWindow({ onClose, initialConversationId, targetUserId, targetUser, className }: ChatWindowProps) {
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const profile = useStore((state) => state.profile)

  const loadMessages = useCallback(async (conversationId: number) => {
    try {
      setLoading(true)
      const data = await chatApi.getMessages(conversationId)
      setMessages(data)
      await chatApi.markAsRead(conversationId)
    } catch (error) {
      console.error("Failed to load messages:", error)
      toast.error("Failed to load messages")
    } finally {
      setLoading(false)
    }
  }, [])

  const handleNewMessage = useCallback((message: ChatMessage) => {
    if (!selectedConversation && message.senderId === profile?.id) {
      chatApi.getConversation(message.conversationId).then((conversation) => {
        setSelectedConversation(conversation)
        setMessages([message])
      }).catch((error) => {
        console.error("Failed to load conversation:", error)
      })
    } else if (selectedConversation && message.conversationId === selectedConversation.id) {
      setMessages((prev) => {
        const exists = prev.some(m => m.id === message.id)
        if (exists) return prev
        return [...prev, message]
      })
      if (message.senderId !== profile?.id) {
        chatApi.markAsRead(message.conversationId).catch(console.error)
      }
    } else {
      toast.info("New message received", {
        description: message.content.substring(0, 50),
      })
    }
  }, [selectedConversation, profile?.id])

  const handleMessagesRead = useCallback((data: { conversationId: number }) => {
    setSelectedConversation((currentConv: ChatConversation | null) => {
      if (currentConv && data.conversationId === currentConv.id) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.conversationId === data.conversationId ? { ...msg, isRead: true } : msg
          )
        )
      }
      return currentConv
    })
  }, [])

  const handleUserTyping = useCallback((data: { conversationId: number; userId: number; isTyping: boolean }) => {
    setSelectedConversation((currentConv: ChatConversation | null) => {
      if (currentConv && data.conversationId === currentConv.id && data.userId !== profile?.id) {
        setIsTyping(data.isTyping)
      }
      return currentConv
    })
  }, [profile?.id])

  const { isConnected, sendMessage, sendTyping } = useChatSocket({
    onNewMessage: handleNewMessage,
    onMessagesRead: handleMessagesRead,
    onUserTyping: handleUserTyping,
  })

  useEffect(() => {
    const loadExistingConversation = async () => {
      if (initialConversationId && profile?.role !== "ADMIN") {
        try {
          const conversation = await chatApi.getConversation(initialConversationId)
          setSelectedConversation(conversation)
          loadMessages(initialConversationId)
        } catch (error) {
          console.error("Failed to load conversation:", error)
        }
      } else if (profile && !selectedConversation) {
        try {
          const conversations = await chatApi.getConversations("ACTIVE")
          if (conversations.length > 0) {
            let conversation
            if (initialConversationId) {
              conversation = conversations.find(c => c.id === initialConversationId)
            } else if (targetUserId) {
              conversation = conversations.find(c => c.userId === targetUserId)
            } else {
              conversation = conversations[0]
            }
            
            if (conversation) {
              setSelectedConversation(conversation)
              loadMessages(conversation.id)
            }
          }
        } catch (error) {
          console.error("Failed to load conversations:", error)
        }
      }
      setInitialLoading(false)
    }

    // Load data asynchronously without blocking UI
    loadExistingConversation()
  }, [initialConversationId, targetUserId, profile, loadMessages])

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    try {
      const isFirstMessage = !selectedConversation
      const userIdForNewConversation = targetUserId || profile?.id
      
      if (isConnected) {
        sendMessage({
          conversationId: selectedConversation?.id,
          content,
          userId: isFirstMessage ? userIdForNewConversation : undefined,
        })
        
        if (isFirstMessage) {
          setTimeout(async () => {
            try {
              const conversations = await chatApi.getConversations("ACTIVE")
              if (conversations.length > 0) {
                const latestConv = targetUserId 
                  ? conversations.find(c => c.userId === targetUserId) || conversations[0]
                  : conversations[0]
                setSelectedConversation(latestConv)
                await loadMessages(latestConv.id)
              }
            } catch (error) {
              console.error("Failed to load conversation:", error)
            }
          }, 1000)
        }
      } else {
        const message = await chatApi.sendMessage({
          conversationId: selectedConversation?.id,
          content,
          userId: isFirstMessage ? userIdForNewConversation : undefined,
        })
        
        setMessages((prev) => [...prev, message])
        
        if (isFirstMessage) {
          const conversation = await chatApi.getConversation(message.conversationId)
          setSelectedConversation(conversation)
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to send message"
      toast.error("Failed to send message", {
        description: errorMessage
      })
    }
  }

  const handleTyping = (typing: boolean) => {
    if (selectedConversation && isConnected) {
      sendTyping(selectedConversation.id, typing)
    }
  }

  const getTitle = () => {
    if (profile?.role === "ADMIN") {
      if (selectedConversation) {
        return selectedConversation.user?.name || selectedConversation.user?.email || "User Chat"
      }
      if (targetUser) {
        return targetUser.name || targetUser.email || "User Chat"
      }
    }
    return "Support Chat"
  }

  return (
    <div
      className={cn(
        "flex flex-col bg-background border rounded-lg shadow-lg overflow-hidden transition-all ",
        isMinimized ? "h-14" : "h-[600px]",
        className
      )}
    >
      <div className="flex items-center justify-between p-4 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">{getTitle()}</h2>
          {isConnected && (
            <span className="w-2 h-2 bg-green-500 rounded-full" title="Connected" />
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-accent rounded-md transition-colors"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-accent rounded-md transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {!isMinimized && (
        <div className="flex flex-1 flex-col overflow-hidden">
          {initialLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Opening chat...</p>
            </div>
          ) : loading ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Loading messages...</p>
            </div>
          ) : (
            <>
              <MessageList messages={messages} isTyping={isTyping} />
              <MessageInput
                onSendMessage={handleSendMessage}
                onTyping={handleTyping}
                disabled={!isConnected && !selectedConversation}
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}
