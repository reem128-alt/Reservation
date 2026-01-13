import { useEffect, useRef, useState, useCallback } from "react"
import { io, Socket } from "socket.io-client"
import { useStore } from "@/lib/store/store"
import type { ChatMessage } from "@/app/types/chat"

interface UseChatSocketOptions {
  onNewMessage?: (message: ChatMessage) => void
  onMessagesRead?: (data: { conversationId: number }) => void
  onUserTyping?: (data: { conversationId: number; userId: number; isTyping: boolean }) => void
  onConnect?: () => void
  onDisconnect?: () => void
}

export function useChatSocket(options: UseChatSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const optionsRef = useRef(options)
  const profile = useStore((state) => state.profile)
  const hasConnectedRef = useRef(false)

  useEffect(() => {
    optionsRef.current = options
  }, [options])

  const connect = useCallback(() => {
    if (!profile || socketRef.current?.connected || hasConnectedRef.current) return

    hasConnectedRef.current = true
    const SOCKET_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

    const socket = io(`${SOCKET_URL}/chat`, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      auth: {
        token: token,
      },
    })

    socket.on("connect", () => {
      setIsConnected(true)
      setIsAuthenticated(false)
      
      socket.emit("authenticate", {
        userId: profile.id,
        email: profile.email,
        role: profile.role,
      }, (response: { success?: boolean; error?: string; message?: string }) => {
        if (response?.success) {
          setIsAuthenticated(true)
        } else {
          console.error("Authentication failed:", response?.error)
        }
      })
      
      optionsRef.current.onConnect?.()
    })

    socket.on("disconnect", () => {
      setIsConnected(false)
      setIsAuthenticated(false)
      optionsRef.current.onDisconnect?.()
    })

    socket.on("newMessage", (message: ChatMessage) => {
      optionsRef.current.onNewMessage?.(message)
    })
    
    socket.on("connect_error", (error) => {
      console.error("Connection error:", error.message)
    })

    socket.on("messagesRead", (data: { conversationId: number }) => {
      optionsRef.current.onMessagesRead?.(data)
    })

    socket.on("userTyping", (data: { conversationId: number; userId: number; isTyping: boolean }) => {
      optionsRef.current.onUserTyping?.(data)
    })

    socketRef.current = socket
  }, [profile])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      setIsConnected(false)
      setIsAuthenticated(false)
      hasConnectedRef.current = false
    }
  }, [])

  const sendMessage = useCallback(
    (data: { conversationId?: number; content: string; userId?: number }) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("sendMessage", data)
      } else {
        console.error("Cannot send - socket not connected")
      }
    },
    []
  )

  const markAsRead = useCallback((conversationId: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("markAsRead", { conversationId })
    }
  }, [])

  const sendTyping = useCallback((conversationId: number, isTyping: boolean) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("typing", { conversationId, isTyping })
    }
  }, [])

  useEffect(() => {
    if (profile && !hasConnectedRef.current) {
      connect()
    }

    return () => {
      if (socketRef.current?.connected) {
        disconnect()
      }
    }
  }, [profile, connect, disconnect])

  return {
    isConnected,
    isAuthenticated,
    sendMessage,
    markAsRead,
    sendTyping,
    connect,
    disconnect,
  }
}
