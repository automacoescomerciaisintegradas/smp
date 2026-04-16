"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, MessageCircle } from "lucide-react"
import type { WhatsAppConversationSummary } from "@/types/social-api"

interface ConversationListProps {
  selectedId?: string
  onSelect: (conversation: WhatsAppConversationSummary) => void
}

export function ConversationList({ selectedId, onSelect }: ConversationListProps) {
  const [conversations, setConversations] = useState<WhatsAppConversationSummary[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/whatsapp/conversations?limit=50", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })
      
      if (!res.ok) {
        console.error("Erro na resposta da API:", res.status, res.statusText)
        return
      }
      
      const json = await res.json()
      if (json.success) {
        setConversations(json.data)
      } else {
        console.error("Resposta da API sem sucesso:", json)
      }
    } catch (err) {
      console.error("Erro ao carregar conversas:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConversations()
    const interval = setInterval(fetchConversations, 5000)
    return () => clearInterval(interval)
  }, [fetchConversations])

  const filtered = conversations.filter((c) => {
    const q = search.toLowerCase()
    return (
      c.contactName?.toLowerCase().includes(q) ||
      c.contactPhone?.includes(q) ||
      c.lastMessageText?.toLowerCase().includes(q)
    )
  })

  function formatTime(dateStr: string) {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    if (diffDays === 1) return "Ontem"
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.length === 0 ? (
        <div className="p-12 text-center">
           <p className="text-[var(--text-muted)] text-sm font-medium">Nenhuma conversa encontrada</p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--surface-border)]/50">
          {conversations.map((conv, index) => (
            <motion.button
              key={conv.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect(conv.id)}
              className={`w-full flex items-center gap-4 p-5 transition-all text-left relative overflow-hidden group ${
                selectedId === conv.id 
                  ? "bg-[var(--surface-glass)] border-l-4 border-[var(--text-accent)]" 
                  : "hover:bg-[var(--bg-card-hover)]"
              }`}
            >
              {/* Avatar com Gradiente ACI */}
              <div className="relative shrink-0">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-lg shadow-lg border-2 border-[var(--surface-border)] ${
                  selectedId === conv.id ? 'bg-[var(--gradient-avatar)]' : 'bg-[var(--gradient-card)]'
                }`}>
                  {conv.contactName.charAt(0).toUpperCase()}
                </div>
                {conv.unreadCount && conv.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-[var(--text-brand)] text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-[var(--bg-darkest)] shadow-lg animate-bounce">
                    {conv.unreadCount}
                  </div>
                )}
              </div>

              {/* Info Conversa */}
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className={`text-sm font-bold truncate ${selectedId === conv.id ? 'text-[var(--text-accent)]' : 'text-[var(--text-primary)]'}`}>
                    {conv.contactName}
                  </h3>
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tight">
                    {conv.lastMessageTime || "Ontem"}
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5 overflow-hidden">
                   {index % 2 === 0 ? (
                     <CheckCheck size={14} className="text-blue-400 shrink-0" />
                   ) : (
                     <Clock size={14} className="text-[var(--text-muted)] shrink-0" />
                   )}
                   <p className="text-xs text-[var(--text-secondary)] truncate font-medium group-hover:text-[var(--text-primary)] transition-colors">
                     {conv.lastMessage || "Nenhuma mensagem recente"}
                   </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}
