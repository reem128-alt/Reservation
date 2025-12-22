"use client"

import { ChatWindow } from "@/components/chat/chat-window"

export default function UserSupportPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Support Chat</h1>
        <p className="text-muted-foreground mt-2">
          Chat with our support team for assistance
        </p>
      </div>

      <ChatWindow className="w-full max-w-5xl mx-auto" />
    </div>
  )
}
