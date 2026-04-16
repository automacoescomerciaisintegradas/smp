"use client"

import { Phone, MoreVertical } from "lucide-react"

interface ContactHeaderProps {
  contactName: string
  contactPhone: string
  avatarUrl?: string | null
}

export function ContactHeader({ contactName, contactPhone, avatarUrl }: ContactHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB] bg-white">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#E5E7EB] flex items-center justify-center overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt={contactName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[14px] font-bold text-[#6B7280]">
              {contactName?.charAt(0)?.toUpperCase() || "?"}
            </span>
          )}
        </div>
        <div>
          <h3 className="text-[14px] font-semibold text-[#111827]">{contactName || "Desconhecido"}</h3>
          <p className="text-[12px] text-[#6B7280] flex items-center gap-1">
            <Phone size={12} />
            +{contactPhone}
          </p>
        </div>
      </div>
      <button className="p-2 rounded-lg hover:bg-[#F3F4F6] transition-colors">
        <MoreVertical size={18} className="text-[#6B7280]" />
      </button>
    </div>
  )
}
