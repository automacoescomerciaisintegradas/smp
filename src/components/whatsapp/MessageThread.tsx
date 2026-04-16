"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { MessageBubble } from "./MessageBubble"
import { Loader2 } from "lucide-react"

interface Message {
  id: string
  direction: "inbound" | "outbound"
  type: string
  content: string
  mediaUrl?: string | null
  status: string
  createdAt: string
  metadata?: string | null
}

interface MessageThreadProps {
  conversationId: string
}

export function MessageThread({ conversationId }: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/whatsapp/conversations/${conversationId}/messages?limit=100`)
      const json = await res.json()
      if (json.success) {
        // API returns desc order, reverse to show oldest first
        setMessages(json.data.reverse())
      }
    } catch (err) {
      console.error("Erro ao carregar mensagens:", err)
    } finally {
      setLoading(false)
    }
  }, [conversationId])

  useEffect(() => {
    setLoading(true)
    setMessages([])
    fetchMessages()
  }, [conversationId, fetchMessages])

  // Poll for new messages
  useEffect(() => {
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [fetchMessages])

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F9FAFB]">
        <Loader2 size={24} className="text-[#E54D42] animate-spin" />
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F9FAFB]">
        <p className="text-[14px] text-[#9CA3AF]">Nenhuma mensagem ainda</p>
      </div>
    )
  }

  // Group messages by date
  const grouped: { date: string; msgs: Message[] }[] = []
  let currentDate = ""
  for (const msg of messages) {
    const date = new Date(msg.createdAt).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
    if (date !== currentDate) {
      currentDate = date
      grouped.push({ date, msgs: [] })
    }
    grouped[grouped.length - 1].msgs.push(msg)
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-4 bg-[#F9FAFB]">
      {grouped.map((group) => (
        <div key={group.date}>
          <div className="flex items-center justify-center my-3">
            <span className="text-[11px] text-[#9CA3AF] bg-white px-3 py-1 rounded-full border border-[#E5E7EB] shadow-sm">
              {group.date}
            </span>
          </div>
          {group.msgs.map((msg) => (
            <MessageBubble
              key={msg.id}
              direction={msg.direction as "inbound" | "outbound"}
              type={msg.type}
              content={msg.content}
              mediaUrl={msg.mediaUrl}
              status={msg.status}
              createdAt={msg.createdAt}
              metadata={msg.metadata}
            />
          ))}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
