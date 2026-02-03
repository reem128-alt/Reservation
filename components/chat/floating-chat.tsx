"use client"

import { useState, memo } from "react"
import { MessageSquare } from "lucide-react"
import { ChatWindow } from "./chat-window"
import { Button } from "@/components/ui/button"

export const FloatingChat = memo(function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[700px] h-[600px] shadow-2xl">
          <ChatWindow onClose={() => setIsOpen(false)} className="w-full" />
        </div>
      )}

      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="fixed bottom-6 right-6 z-50 rounded-full w-16 h-16 shadow-xl hover:scale-110 transition-transform bg-primary text-primary-foreground hover:bg-primary/90 p-0 flex items-center justify-center"
        >
          <MessageSquare className="h-7 w-7" strokeWidth={2} />
        </Button>
      )}
    </>
  )
})
