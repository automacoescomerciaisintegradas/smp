"use client"

import { Mail, MessageCircle } from "lucide-react"
import { appConfig } from "@/config/app-config"

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[#E5E7EB] bg-white/80 backdrop-blur-sm py-6 px-8 relative z-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1">
          <h2 className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-widest flex items-center gap-2">
            Desenvolvido por
            <span className="w-1.5 h-1.5 rounded-full bg-[#E54D42] animate-pulse" />
          </h2>
          <p className="text-[#111827] text-sm font-semibold">© {appConfig.companyName} 2026</p>
          <p className="text-[#6B7280] text-[10px] mt-1 uppercase tracking-tighter">Todos os direitos reservados.</p>
        </div>

        <div className="flex gap-6 items-center">
          <a
            href={`mailto:${appConfig.supportEmail}`}
            className="flex items-center gap-2 text-[#6B7280] hover:text-[#E54D42] transition-colors group"
          >
            <div className="p-2 bg-[#F3F4F6] rounded-md group-hover:bg-[#FEE2E2] transition-colors border border-[#E5E7EB]">
              <Mail size={14} />
            </div>
            <span className="text-[12px] font-bold hidden md:inline">E-mail</span>
          </a>
          <a
            href={appConfig.supportWhatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[#6B7280] hover:text-[#10B981] transition-colors group"
          >
            <div className="p-2 bg-[#F3F4F6] rounded-md group-hover:bg-emerald-50 transition-colors border border-[#E5E7EB]">
              <MessageCircle size={14} />
            </div>
            <span className="text-[12px] font-bold hidden md:inline">WhatsApp</span>
          </a>
          <div className="h-8 w-px bg-[#E5E7EB] mx-2" />
          <div className="flex flex-col items-end">
             <span className="text-[10px] font-bold text-[#9CA3AF] tracking-tighter uppercase leading-none mb-1">{appConfig.socialHandle}</span>
             <a href={appConfig.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-[12px] font-black text-[#E54D42] hover:underline">{appConfig.websiteUrl.replace(/^https?:\/\//, "")}</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
