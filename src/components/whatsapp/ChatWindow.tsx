"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ContactHeader } from "./ContactHeader"
import { MessageThread } from "./MessageThread"
import { MessageInput } from "./MessageInput"
import { TemplatePickerModal } from "./TemplatePickerModal"
import { PixOrderModal } from "./PixOrderModal"

interface ChatWindowProps {
  conversationId: string
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
  const [refreshKey, setRefreshKey] = useState(0)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showPixModal, setShowPixModal] = useState(false)
  
  // Mock ou fetch real baseado no session/context anterior
  const contact = {
    name: "João Silva",
    phone: "5511999999999"
  }

  const handleMessageSent = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none"></div>
      
      <ContactHeader 
        contactName={contact.name} 
        contactPhone={contact.phone} 
      />

      <div className="flex-1 overflow-hidden flex flex-col">
        <MessageThread 
          key={`${conversationId}-${refreshKey}`}
          conversationId={conversationId} 
        />
      </div>

      <div className="p-6 bg-gradient-to-t from-[var(--bg-darkest)] to-transparent">
        <MessageInput 
          conversationId={conversationId}
          contactPhone={contact.phone}
          onMessageSent={handleMessageSent}
          onOpenTemplateModal={() => setShowTemplateModal(true)}
          onOpenPixModal={() => setShowPixModal(true)}
        />
      </div>

      {showTemplateModal && (
        <TemplatePickerModal
          contactPhone={contact.phone}
          onClose={() => setShowTemplateModal(false)}
          onSent={handleMessageSent}
        />
      )}

      {showPixModal && (
        <PixOrderModal
          contactPhone={contact.phone}
          onClose={() => setShowPixModal(false)}
        />
      )}
    </div>
  )
}
