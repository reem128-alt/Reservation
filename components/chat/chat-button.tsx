"use client"

import { useState, useEffect } from "react"
import { MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { chatApi } from "@/lib/api/chat"
import { cn } from "@/lib/utils"

interface ChatButtonProps {
  onClick: () => void
  className?: string
}

export function ChatButton({ onClick, className }: ChatButtonProps) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const count = await chatApi.getUnreadCount()
        setUnreadCount(count)
      } catch (error) {
        console.error("Failed to load unread count:", error)
      }
    }

    loadUnreadCount()
    const interval = setInterval(loadUnreadCount, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Button
      onClick={onClick}
      size="icon"
      className={cn("relative", className)}
      variant="outline"
    >
      <MessageSquare className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Button>
  )
}
