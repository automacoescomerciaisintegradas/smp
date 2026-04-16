"use client"

import { useState, useCallback } from "react"
import { MessageCircle, Smartphone } from "lucide-react"
import { ConversationList } from "@/components/whatsapp/ConversationList"
import { ContactHeader } from "@/components/whatsapp/ContactHeader"
import { MessageThread } from "@/components/whatsapp/MessageThread"
import { MessageInput } from "@/components/whatsapp/MessageInput"
import { TemplatePickerModal } from "@/components/whatsapp/TemplatePickerModal"
import { PixOrderModal } from "@/components/whatsapp/PixOrderModal"
import { InstanceManager } from "@/components/whatsapp/InstanceManager"
import type { WhatsAppConversationSummary } from "@/types/social-api"

export default function WhatsAppPage() {
  const [selectedConversation, setSelectedConversation] = useState<WhatsAppConversationSummary | null>(null)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showPixModal, setShowPixModal] = useState(false)
  const [showInstances, setShowInstances] = useState(false)
  const [hasConversations, setHasConversations] = useState(true) // Assumir true até checar
  const [refreshKey, setRefreshKey] = useState(0)

  const handleMessageSent = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  return (
    <div className="flex h-screen bg-[var(--bg-dark)] text-[var(--text-primary)] overflow-hidden -m-8">
      {/* Sidebar - Visual Moderno */}
      <div className="w-96 border-r border-[var(--surface-border)] bg-[var(--bg-darkest)] flex flex-col shadow-2xl">
        <header className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[var(--gradient-cta)] rounded-lg shadow-[var(--shadow-cta)]">
                <Zap size={18} className="text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight font-display">WhatsApp AI</h1>
            </div>
            <div className="flex items-center gap-1">
               <button className="p-2 hover:bg-[var(--surface-glass)] rounded-xl transition-all text-[var(--text-secondary)] hover:text-[var(--text-accent)]">
                  <Settings2 size={20} />
               </button>
               <button 
                  onClick={() => setViewState(viewState === "chat" ? "management" : "chat")}
                  className={`p-2 rounded-xl transition-all ${viewState === 'management' ? 'bg-[var(--text-accent)] text-white' : 'hover:bg-[var(--surface-glass)] text-[var(--text-secondary)] hover:text-[var(--text-accent)]'}`}
               >
                  <Smartphone size={20} />
               </button>
            </div>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--text-accent)] transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Buscar conversas..."
              className="w-full bg-[var(--surface-glass)] border border-[var(--surface-border)] rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[var(--text-accent)] transition-all font-medium"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
             <button className="px-4 py-1.5 bg-[var(--surface-glass)] border border-[var(--surface-border)] rounded-full text-[10px] font-black uppercase tracking-widest hover:border-[var(--text-accent)] transition-all whitespace-nowrap">Todas</button>
             <button className="px-4 py-1.5 bg-[var(--surface-glass)] border border-[var(--surface-border)] rounded-full text-[10px] font-black uppercase tracking-widest hover:border-[var(--text-accent)] transition-all whitespace-nowrap">Não Lidas</button>
             <button className="px-4 py-1.5 bg-[var(--surface-glass)] border border-[var(--surface-border)] rounded-full text-[10px] font-black uppercase tracking-widest hover:border-[var(--text-accent)] transition-all whitespace-nowrap">Grupos</button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--surface-border)]">
          <ConversationList 
            selectedId={selectedConversationId} 
            onSelect={setSelectedConversationId} 
          />
        </div>
      </div>


      {showPixModal && selectedConversation && (
        <PixOrderModal
          contactPhone={selectedConversation.contactPhone}
          onClose={() => setShowPixModal(false)}
          onSent={handleMessageSent}
        />
      )}
    </div>
  )
}
