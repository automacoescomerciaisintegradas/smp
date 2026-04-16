"use client"

import { useState, useEffect } from "react"
import {
  Share2,
  Calendar,
  Clock,
  MessageCircle,
  ChevronRight,
  MoreVertical,
  Play,
  FileText,
  Send,
  Trash2,
  Pause,
  RotateCcw,
  Loader2
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import toast from "react-hot-toast"
import NewCampaignModal from "@/components/campaigns/NewCampaignModal"

interface Campaign {
  id: string
  name: string
  platform: string
  status: string
  scheduledAt: string
  content: string
  imageUrl: string | null
  publishedAt: string | null
  error: string | null
  createdAt: string
  updatedAt: string
}

const platformConfig: Record<string, { color: string; icon: any }> = {
  instagram: { color: "bg-orange-50 text-[#E54D42] border-orange-100", icon: Send },
  facebook: { color: "bg-blue-50 text-blue-600 border-blue-100", icon: MessageCircle },
  whatsapp: { color: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: MessageCircle },
}

const statusConfig: Record<string, { color: string; label: string }> = {
  scheduled: { color: "bg-blue-50 text-blue-600 border-blue-100", label: "Agendado" },
  active: { color: "bg-emerald-50 text-emerald-600 border-emerald-100", label: "Ativo" },
  paused: { color: "bg-amber-50 text-amber-600 border-amber-100", label: "Pausado" },
  completed: { color: "bg-emerald-50 text-emerald-600 border-emerald-100", label: "Concluído" },
  failed: { color: "bg-red-50 text-red-600 border-red-100", label: "Falhou" },
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const hours = diff / (1000 * 60 * 60)
  const days = diff / (1000 * 60 * 60 * 24)

  if (hours < 0) return "Iniciado há " + Math.abs(Math.round(hours)) + "h"
  if (hours < 24) return "Hoje, " + date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  if (days < 2) return "Amanhã, " + date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) + ", " + 
         date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

export default function AutomationPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchCampaigns = async () => {
    try {
      const response = await fetch("/api/campaigns")
      if (!response.ok) throw new Error("Erro ao buscar campanhas")
      const data = await response.json()
      setCampaigns(data)
    } catch (error) {
      console.error(error)
      toast.error("Erro ao carregar campanhas")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta campanha?")) return

    try {
      const response = await fetch(`/api/campaigns?id=${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Erro ao excluir campanha")
      
      toast.success("Campanha excluída com sucesso!")
      fetchCampaigns()
    } catch (error) {
      console.error(error)
      toast.error("Erro ao excluir campanha")
    }
  }

  const handleToggleStatus = async (campaign: Campaign) => {
    try {
      const newStatus = campaign.status === "active" ? "paused" : "active"
      const response = await fetch("/api/campaigns", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: campaign.id,
          status: newStatus,
        }),
      })
      if (!response.ok) throw new Error("Erro ao atualizar campanha")
      
      toast.success(newStatus === "active" ? "Campanha ativada!" : "Campanha pausada!")
      fetchCampaigns()
    } catch (error) {
      console.error(error)
      toast.error("Erro ao atualizar campanha")
    }
  }

  return (
    <div className="space-y-10 min-h-screen bg-[#F9FAFB] p-8 -m-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-orange-50 rounded-xl border border-orange-100 shadow-sm">
                <Share2 className="text-[#E54D42]" size={24} />
             </div>
             <div className="flex flex-col">
               <h1 className="text-3xl font-black tracking-tight text-[#111827]">Portal de Automações</h1>
               <Link href="/onboarding" className="text-[10px] font-bold text-[#E54D42] hover:underline uppercase tracking-widest mt-1">
                 Configurar Meta API (Onboarding)
               </Link>
             </div>
          </div>
          <p className="text-[#6B7280] font-medium mt-2">Orquestração Inteligente de Campanhas Multicanal.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/onboarding"
            className="flex items-center gap-2 px-6 py-3.5 bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#111827] rounded-2xl font-bold text-sm transition-all shadow-sm"
          >
            Configurar API
          </Link>
          <button 
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-8 py-3.5 bg-[#E54D42] hover:bg-[#D43D32] text-white rounded-2xl font-bold text-sm transition-all shadow-md active:scale-95"
          >
          <Calendar size={18} />
          Nova Campanha
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Scheduled Campaigns List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-[#111827] flex items-center gap-2 px-1">
            <Clock className="text-[#6B7280]" size={20} />
            Fluxo Ativo de Postagens
          </h2>

          {loading ? (
            <div className="flex flex-col items-center py-20 bg-white border border-[#E5E7EB] rounded-3xl gap-4">
                <Loader2 className="animate-spin text-[#E54D42]" size={32} />
                <span className="text-sm font-bold text-[#6B7280]">Sincronizando campanhas...</span>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-[#E5E7EB] rounded-3xl py-20 text-center space-y-4">
              <Calendar size={48} className="mx-auto text-[#D1D5DB]" />
              <p className="text-[#6B7280] font-medium">Nenhuma campanha agendada ainda</p>
              <button
                onClick={() => setModalOpen(true)}
                className="px-8 py-3 bg-[#111827] text-white rounded-xl font-bold text-sm transition-all"
              >
                Configurar Primeira Campanha
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((camp, i) => {
                const config = platformConfig[camp.platform] || platformConfig.instagram
                const statusConf = statusConfig[camp.status] || statusConfig.scheduled
                const Icon = config.icon

                return (
                  <motion.div
                    key={camp.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white border border-[#E5E7EB] p-5 rounded-3xl flex items-center justify-between group hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`${config.color} p-4 rounded-2xl border`}>
                        <Icon size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#111827]">{camp.name}</h3>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest bg-[#F3F4F6] px-2 py-0.5 rounded">
                            {camp.platform}
                          </span>
                          <span className="text-[10px] font-black text-[#E54D42] uppercase tracking-widest pr-2 border-r border-[#E5E7EB]">
                            {formatDate(camp.scheduledAt)}
                          </span>
                          <div className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${statusConf.color}`}>
                             {statusConf.label}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleToggleStatus(camp)}
                          className={`p-2.5 rounded-xl transition-all ${camp.status === "active" ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                        >
                          {camp.status === "active" ? <Pause size={18} /> : <Play size={18} />}
                        </button>
                        <button
                          onClick={() => handleDeleteCampaign(camp.id)}
                          className="p-2.5 text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="w-px h-6 bg-[#E5E7EB]" />
                      <button className="p-2.5 bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl text-[#111827] hover:bg-[#E54D42] hover:text-white transition-all">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* Side Panels */}
        <div className="space-y-8">
          <section className="bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-sm">
            <h3 className="font-black text-xs mb-6 text-[#111827] uppercase tracking-widest">Modelos de Estratégia</h3>
            <div className="space-y-3">
              {[
                { name: "Promoção Exclusiva", type: "Vendas", color: "text-orange-500" },
                { name: "Vitrina de News", type: "Awareness", color: "text-blue-500" },
                { name: "Funil de Retenção", type: "Fidelidade", color: "text-emerald-500" },
              ].map((temp) => (
                <div key={temp.name} className="flex items-center justify-between p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] hover:border-[#E54D42] transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <FileText size={16} className={temp.color} />
                    <span className="text-xs font-bold text-[#111827]">{temp.name}</span>
                  </div>
                  <ChevronRight size={14} className="text-[#D1D5DB] group-hover:text-[#E54D42]" />
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3.5 bg-[#F3F4F6] border border-[#E5E7EB] text-[#6B7280] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#111827] hover:text-white transition-all">
              Criar Novo Template
            </button>
          </section>

          <section className="bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center border border-orange-100">
                    <Play className="text-[#E54D42] fill-[#E54D42]" size={14} />
                </div>
                <h3 className="font-black text-xs text-[#111827] uppercase tracking-widest">Status Visual</h3>
             </div>
             <div className="space-y-5">
                <div className="flex justify-between items-center text-xs font-bold">
                   <span className="text-[#6B7280]">Volume de Campanhas</span>
                   <span className="text-[#111827]">{campaigns.length}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-emerald-600">
                   <span>Máquinas Ativas</span>
                   <span>{campaigns.filter(c => c.status === "active").length}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-blue-600">
                   <span>Agendamentos</span>
                   <span>{campaigns.filter(c => c.status === "scheduled").length}</span>
                </div>
                <div className="pt-2">
                    <div className="w-full bg-[#F3F4F6] h-2 rounded-full overflow-hidden">
                       <motion.div
                         initial={{ width: 0 }}
                         animate={{ width: campaigns.length > 0 ? `${((campaigns.filter(c => c.status === "active" || c.status === "scheduled").length) / campaigns.length) * 100}%` : "0%" }}
                         className="h-full bg-gradient-to-r from-[#E54D42] to-orange-400"
                       />
                    </div>
                </div>
                <p className="text-[10px] text-[#9CA3AF] text-center italic font-medium">Sincronização em tempo real com os clusters Sociais.</p>
             </div>
          </section>
        </div>
      </div>

      <NewCampaignModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCampaignCreated={fetchCampaigns}
      />
    </div>
  )
}
