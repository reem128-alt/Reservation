"use client"

import { useEffect, useRef } from "react"
import { useStore } from "@/lib/store/store"
import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/app/types/chat"

interface MessageListProps {
  messages: ChatMessage[]
  isTyping?: boolean
}

export function MessageList({ messages, isTyping }: MessageListProps) {
  const profile = useStore((state) => state.profile)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const isOwnMessage = (message: ChatMessage) => {
    return message.senderId === profile?.id
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="flex-1 overflow-y-auto pl-4 pr-2 py-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                isOwnMessage(message) ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[70%] rounded-lg px-4 py-2",
                  isOwnMessage(message)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {message.sender && !isOwnMessage(message) && (
                  <p className="text-xs font-medium mb-1 opacity-70">
                    {message.sender.name || message.sender.email}
                  </p>
                )}
                <p className="text-sm whitespace-pre-wrap wrap-break-word">{message.content}</p>
                <p
                  className={cn(
                    "text-xs mt-1",
                    isOwnMessage(message) ? "opacity-70" : "text-muted-foreground"
                  )}
                >
                  {formatTime(message.createdAt)}
                </p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
        </>
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}
