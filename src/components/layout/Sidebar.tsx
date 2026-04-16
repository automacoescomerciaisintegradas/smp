"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  MessageSquare, 
  ShoppingBag, 
  Share2, 
  Settings, 
  LogOut,
  Zap,
  Search,
  Cpu,
  Folder,
  UserSearch,
  ImagePlus,
  MessageCircle
} from "lucide-react"
import { motion } from "framer-motion"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { appConfig } from "@/config/app-config"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: MessageSquare, label: "Comando", href: "/chat" },
  { icon: MessageCircle, label: "WhatsApp", href: "/whatsapp" },
  { icon: Search, label: "Busca Semântica", href: "/search" },
  { icon: Share2, label: "Instagram AI", href: "/automation/instagram" },
  { icon: UserSearch, label: "IG Tools", href: "/automation/instagram-tools" },
  { icon: ImagePlus, label: "Publisher", href: "/automation/publisher" },
  { icon: LayoutDashboard, label: "Shopee Engine", href: "/offers" },
  { icon: Cpu, label: "Automações", href: "/automation" },
  { icon: Folder, label: "Arquivos", href: "/assets" },
  { icon: Settings, label: "Configurações", href: "/settings" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-[240px] h-full bg-[#F3F4F6] border-r border-[#E5E7EB] flex flex-col pt-8 pb-4">
      <div className="px-6 mb-10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden border border-[#E5E7EB] bg-white shadow-sm">
          <img src="/logo.png" alt={appConfig.shortProductName} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-[#111827] leading-none uppercase">{appConfig.productName}</span>
          <span className="text-[10px] font-bold text-[#E54D42] tracking-widest uppercase mt-1">{appConfig.companyShortName}</span>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-200",
                isActive 
                  ? "text-[#E54D42] bg-[#FEE2E2] shadow-sm" 
                  : "text-[#6B7280] hover:text-[#111827] hover:bg-[#E5E7EB]/50"
              )}
            >
              <item.icon size={18} className={cn("transition-colors", isActive ? "text-[#E54D42]" : "group-hover:text-[#111827]")} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 mt-auto">
        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[#6B7280] hover:text-rose-600 hover:bg-rose-50 rounded-lg text-[14px] font-medium transition-all duration-200">
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </div>
  )
}
