"use client"

import { useState, useRef, useEffect } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MessageInputProps {
  onSendMessage: (content: string) => void
  onTyping?: (isTyping: boolean) => void
  disabled?: boolean
}

export function MessageInput({ onSendMessage, onTyping, disabled }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage("")
      onTyping?.(false)
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }

    if (onTyping) {
      onTyping(true)
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false)
      }, 1000)
    }
  }

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  return (
    <form onSubmit={handleSubmit} className="border-t p-4">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 max-h-32 overflow-y-auto"
        />
        <Button type="submit" size="icon" disabled={!message.trim() || disabled}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
