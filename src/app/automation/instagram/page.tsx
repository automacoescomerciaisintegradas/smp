"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ShieldCheck, 
  Zap, 
  MessageSquare, 
  Activity, 
  Key, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  Share2, 
  Send,
  Sparkles,
  RefreshCw,
  Search,
  ChevronRight,
  Smartphone,
  Layout,
  ExternalLink,
  BookOpen,
  Video
} from "lucide-react"
import { OnboardingAccordion } from "@/components/onboarding/OnboardingAccordion"
import { appConfig } from "@/config/app-config"
import { MetaHealthCheckResult } from "@/lib/meta-api"
import toast from "react-hot-toast"

export default function InstagramFullDashboard() {
  // State: Health/Validation
  const [token, setToken] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [healthStatus, setHealthStatus] = useState<MetaHealthCheckResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // State: AI Tester
  const [testComment, setTestComment] = useState("")
  const [testResponse, setTestResponse] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  // Handlers
  const handleHealthCheck = async () => {
    if (!token) return
    setIsChecking(true)
    setErrorMessage(null)
    try {
      const res = await fetch("/api/onboarding/health-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      if (res.ok) {
        setHealthStatus(data)
        toast.success("Saúde da API validada!")
      } else {
        setErrorMessage(data.error || "Token inválido")
      }
    } catch (err) {
      setErrorMessage("Erro de conexão")
    } finally {
      setIsChecking(false)
    }
  }

  const handleTestAI = async () => {
    if (!testComment) return
    setIsGenerating(true)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: testComment, username: "cliente_teste" })
      })
      const data = await res.json()
      setTestResponse(data.message)
    } catch (err) {
      toast.error("Erro ao gerar resposta da IA")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-12 min-h-screen bg-[#F9FAFB] p-8 -m-8">
      {/* 1. HEADER SECTON - FULL WIDTH */}
      <header className="flex flex-col gap-4 border-b border-[#E5E7EB] pb-8">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-orange-50 rounded-2xl border border-orange-100 shadow-sm">
              <Share2 className="text-[#E54D42]" size={32} />
           </div>
           <div>
              <h1 className="text-4xl font-black tracking-tight text-[#111827]">Centro de Comando Instagram</h1>
              <p className="text-[#6B7280] font-medium mt-1">Valide tokens, opere automações e monitore a saúde da sua integração Meta.</p>
           </div>
        </div>
      </header>

      {/* 2. VALIDATION & CONFIGURATION - THE CORE SYSTEM */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-8">
           <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-10 shadow-sm space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                 <div className="flex items-center gap-4">
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                        <Key className="text-[#E54D42]" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-[#111827]">Conexão Meta API</h2>
                        <p className="text-sm text-[#6B7280]">Gestão centralizada do Instagram Business Token</p>
                    </div>
                 </div>
                 <div className="flex gap-3">
                    <button 
                      onClick={handleHealthCheck}
                      disabled={isChecking || !token}
                      className="px-8 py-4 bg-[#111827] text-white rounded-2xl font-bold text-sm hover:bg-black transition-all flex items-center gap-2 shadow-lg disabled:bg-gray-200"
                    >
                       {isChecking ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                       Validar Saúde
                    </button>
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-widest text-[#6B7280] ml-1">Access Token Geral</label>
                 <input 
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Cole seu token EAA... aqui"
                  className="w-full bg-[#F3F4F6] border border-[#E5E7EB] rounded-2xl px-6 py-5 text-sm font-mono focus:border-[#E54D42] outline-none shadow-inner"
                 />
              </div>

              {healthStatus && (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className={`p-6 rounded-[24px] border ${healthStatus.status === 'healthy' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                   <div className="flex items-start gap-4">
                      {healthStatus.status === 'healthy' ? <CheckCircle2 className="text-green-600" size={24} /> : <AlertCircle className="text-red-600" size={24} />}
                      <div>
                         <p className="text-sm font-black uppercase tracking-widest text-[#111827]">
                            {healthStatus.status === 'healthy' ? 'Conexão Estabelecida!' : 'Erro na Conexão'}
                         </p>
                         <p className="text-sm text-gray-600 mt-1">
                            {healthStatus.status === 'healthy' 
                              ? `Autenticado como @${healthStatus.details.business_account.username}. Seu ambiente está operacional.`
                              : `Houve um problema ao validar o token na Meta API.`}
                         </p>
                      </div>
                   </div>
                </motion.div>
              )}
           </div>

           <div className="space-y-6">
              <h3 className="text-xl font-bold text-[#111827] flex items-center gap-2 px-2">
                 <BookOpen className="text-[#6B7280]" size={20} />
                 Guia de Configuração Meta API
              </h3>
              <OnboardingAccordion />
           </div>
        </div>

        {/* SIDE STATUS PANEL */}
        <div className="xl:col-span-4 space-y-8">
           <div className="bg-[#111827] rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden h-fit">
              <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldCheck size={80} /></div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#E54D42] mb-8">Status de Permissões</h4>
              
              <ul className="space-y-5">
                {[
                  "instagram_business_basic",
                  "instagram_business_manage_messages",
                  "instagram_business_manage_comments",
                  "pages_read_engagement"
                ].map((perm) => {
                  const isMissing = healthStatus?.details.permissions.missing.includes(perm);
                  const isHealthy = healthStatus && !isMissing;
                  return (
                    <li key={perm} className="flex items-center justify-between group">
                      <span className={`text-[12px] font-bold ${isHealthy ? "text-white" : isMissing ? "text-red-400" : "text-gray-500"}`}>
                        {perm}
                      </span>
                      {isHealthy ? (
                        <CheckCircle2 size={16} className="text-green-400" />
                      ) : isMissing ? (
                        <XCircle size={16} className="text-red-400" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-700" />
                      )}
                    </li>
                  )
                })}
              </ul>
              
              <div className="mt-10 pt-8 border-t border-white/10 space-y-4">
                 <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-400 uppercase">Saúde Operacional</span>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full ${healthStatus?.status === 'healthy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                       {healthStatus?.status === 'healthy' ? 'EXCELENTE' : 'VERIFICAR'}
                    </span>
                 </div>
              </div>
           </div>

           <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-8 shadow-sm space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-[#111827]">Recursos Oficiais</h3>
              <div className="space-y-3">
                 <a href="https://developers.facebook.com/docs/instagram-api" target="_blank" className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-2xl hover:bg-[#F3F4F6] transition-all group">
                    <div className="flex items-center gap-3">
                       <Video className="text-red-500" size={18} />
                       <span className="text-xs font-bold text-[#111827]">Tutorial Meta</span>
                    </div>
                    <ExternalLink className="text-[#9CA3AF] group-hover:text-[#E54D42]" size={14} />
                 </a>
              </div>
           </div>
        </div>
      </section>

      {/* 3. AUTOMATION FEATURES - AI SIMULATOR */}
      <section className="bg-white border border-[#E5E7EB] rounded-[40px] p-12 shadow-sm space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div>
              <div className="flex items-center gap-3 mb-2">
                 <Sparkles className="text-blue-500" size={28} />
                 <h2 className="text-3xl font-black text-[#111827]">Automações e IA</h2>
              </div>
              <p className="text-[#6B7280] font-medium">Configure e teste como a inteligência artificial interage com seu público.</p>
           </div>
           <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black border border-blue-100 uppercase tracking-widest">
              Gerente de Estilo Ativo
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           {/* IA TESTER */}
           <div className="space-y-6">
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-widest text-[#6B7280] ml-1">Simular Comentário do Cliente</label>
                 <div className="flex gap-4">
                    <input 
                      value={testComment}
                      onChange={(e) => setTestComment(e.target.value)}
                      placeholder="Ex: 'Quais os valores do serviço?'"
                      className="flex-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-6 py-4 text-sm font-bold text-[#111827] outline-none focus:border-blue-500"
                    />
                    <button 
                      onClick={handleTestAI}
                      disabled={isGenerating || !testComment}
                      className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-black transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
                    >
                       {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                       Testar IA
                    </button>
                 </div>
              </div>

              {testResponse && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 bg-[#F3F4F6] rounded-[32px] border border-[#E5E7EB] relative">
                   <div className="absolute -top-3 left-6 px-3 py-1 bg-[#111827] text-white rounded-full text-[9px] font-black uppercase tracking-widest">Resposta Gerada</div>
                   <p className="text-[15px] font-medium text-[#111827] leading-relaxed italic">"{testResponse}"</p>
                   <div className="mt-4 flex justify-end">
                      <button className="text-[10px] font-black uppercase text-blue-600 hover:underline">Ajustar Contexto</button>
                   </div>
                </motion.div>
              )}
           </div>

           {/* AUTOMATION STATUS FLOW */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[32px] group hover:border-[#E54D42] transition-all">
                 <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#E54D42] mb-6 shadow-sm group-hover:bg-[#E54D42] group-hover:text-white transition-all">
                    <MessageSquare size={24} />
                 </div>
                 <h3 className="text-lg font-bold text-[#111827]">Comentários</h3>
                 <p className="text-sm text-[#6B7280] mt-2 leading-relaxed">Resposta automática configurada para todos os posts via Módulo 3.</p>
              </div>
              <div className="p-8 bg-[#F3F4F6] border border-[#E5E7EB] rounded-[32px] group hover:border-blue-500 transition-all">
                 <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-500 mb-6 shadow-sm group-hover:bg-blue-500 group-hover:text-white transition-all">
                    <Smartphone size={24} />
                 </div>
                 <h3 className="text-lg font-bold text-[#111827]">Integração DM</h3>
                 <p className="text-sm text-[#6B7280] mt-2 leading-relaxed">Fluxo de mensagens ativado para novos seguidores via Webhook.</p>
              </div>
           </div>
        </div>
      </section>

      {/* 4. ACTIVITY MONITOR (AUDITORIA) - FULL WIDTH */}
      <section className="bg-[#111827] rounded-[40px] p-12 text-white overflow-hidden relative shadow-2xl">
         <div className="absolute top-0 right-0 p-8 opacity-5"><Activity size={200} /></div>
         <div className="flex items-center gap-4 mb-10">
            <Activity className="text-[#E54D42]" size={32} />
            <h2 className="text-3xl font-black">Auditoria Operacional</h2>
         </div>
         <div className="border border-white/10 rounded-[32px] p-12 text-center bg-white/5 backdrop-blur-sm">
            <Loader2 className="animate-spin mx-auto text-gray-600 mb-6" size={40} />
            <p className="text-xl font-bold text-gray-400">Sincronizando log de eventos em tempo real...</p>
            <p className="text-sm text-gray-500 mt-2 italic">Aguardando gatilhos do Módulo 4.</p>
         </div>
      </section>
    </div>
  )
}
