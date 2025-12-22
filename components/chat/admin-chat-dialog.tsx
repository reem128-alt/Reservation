"use client"

import { useState } from "react"
import { MessageSquare } from "lucide-react"
import { chatApi } from "@/lib/api/chat"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface AdminChatDialogProps {
  onConversationCreated?: (conversationId: number) => void
}

export function AdminChatDialog({ onConversationCreated }: AdminChatDialogProps) {
  const [open, setOpen] = useState(false)
  const [userId, setUserId] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || !message.trim()) return

    try {
      setLoading(true)
      const result = await chatApi.sendMessage({
        userId: parseInt(userId),
        content: message.trim(),
      })
      toast.success("Conversation started successfully")
      setOpen(false)
      setUserId("")
      setMessage("")
      onConversationCreated?.(result.conversationId)
    } catch (error) {
      console.error("Failed to start conversation:", error)
      toast.error("Failed to start conversation")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <MessageSquare className="h-4 w-4 mr-2" />
        Start New Chat
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Conversation</DialogTitle>
            <DialogDescription>
              Enter the user ID and your first message to start a new conversation.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                type="number"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter user ID"
                required
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                required
                rows={4}
                className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
