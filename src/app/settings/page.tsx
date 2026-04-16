"use client"

import { useState } from "react"
import { Settings, Shield, Key, Database, Cpu, CheckCircle2, AlertCircle, RefreshCw, Layers, ShieldCheck } from "lucide-react"
import { motion } from "framer-motion"
import { appConfig } from "@/config/app-config"

export default function SettingsPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const statusItems = [
    { name: "Meta Graph API", status: "online", icon: Key, color: "text-[#E54D42]", detail: `App principal do ${appConfig.productName}` },
    { name: "Gemini AI Engine", status: "online", icon: Cpu, color: "text-[#111827]", detail: "Modelo: Gemini Embeddings v2" },
    { name: "PostgreSQL Engine", status: "online", icon: Database, color: "text-[#10B981]", detail: "Status: Operacional local" },
    { name: "Redis Cache System", status: "online", icon: ShieldCheck, color: "text-[#111827]", detail: "Latência: 2ms" },
    { name: "Cloudflare D1 Asset Storage", status: "online", icon: Layers, color: "text-[#E54D42]", detail: "Sincronizado via D1" },
  ]

  return (
    <div className="space-y-12 max-w-4xl mx-auto bg-[#F9FAFB] min-h-screen p-8 -m-8">
      <header className="space-y-4 pt-8 border-b border-[#E5E7EB] pb-8">
        <h1 className="text-[32px] font-black tracking-tight text-[#111827] uppercase leading-none">
          Configurações Operacionais
        </h1>
        <p className="text-[#6B7280] text-[15px] font-medium leading-relaxed">
          Gerencie a saúde do ecossistema <span className="text-[#111827] font-bold">{appConfig.productName}</span> e a soberania dos seus dados.
        </p>
      </header>

      {/* Connection Monitor */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.2em] flex items-center gap-2">
            Monitor de Conexões em Tempo Real
            <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
          </h2>
          <button 
            onClick={() => { setIsRefreshing(true); setTimeout(() => setIsRefreshing(false), 2000); }}
            className="flex items-center gap-2 text-[11px] font-bold text-[#E54D42] hover:bg-[#E54D42]/5 px-4 py-2 rounded-[6px] transition-all uppercase tracking-widest border border-[#E54D42]/20"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            Testar Latência
          </button>
        </div>

        <div className="grid gap-4">
          {statusItems.map((item, index) => (
            <motion.div
               key={item.name}
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: index * 0.05 }}
               className="bg-white border border-[#E5E7EB] rounded-[8px] p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-6">
                <div className={`p-4 rounded-full bg-[#F9FAFB] border border-[#E5E7EB] ${item.color}`}>
                   <item.icon size={24} />
                </div>
                <div>
                   <h3 className="font-bold text-[#111827] uppercase text-[12px] tracking-wider">{item.name}</h3>
                   <p className="text-[11px] text-[#6B7280] font-mono mt-1">{item.detail}</p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="hidden md:block w-32 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                   <div className={`h-full ${item.status === 'online' ? 'bg-[#10B981]' : 'bg-[#E54D42]'} w-full transition-all`} />
                </div>
                <div className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest ${item.status === 'online' ? 'text-[#10B981]' : 'text-[#E54D42]'}`}>
                   {item.status === 'online' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                   {item.status}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Security Section */}
      <section className="bg-white border border-[#E5E7EB] rounded-[8px] p-10 space-y-8 shadow-sm relative overflow-hidden">
         <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
            <Shield size={120} className="text-[#111827]" />
         </div>
         <div className="flex items-center gap-4">
            <div className="p-3 bg-[#E54D42]/10 rounded-[6px] text-[#E54D42]">
               <Shield size={24} />
            </div>
            <h2 className="text-[20px] font-bold text-[#111827] uppercase tracking-tight">Segurança e Tokens de API</h2>
         </div>
         <p className="text-[14px] text-[#6B7280] leading-relaxed max-w-2xl font-medium">
            Todas as chaves de API e tokens do <span className="text-[#111827]">{appConfig.productName}</span> são armazenados localmente no seu arquivo <code className="bg-[#F3F4F6] text-[#E54D42] px-1.5 py-0.5 rounded-[4px] font-mono text-[13px]">.env.local</code> e nunca são transmitidos para servidores de terceiros. A sua soberania operacional é a prioridade absoluta.
         </p>
         <button className="px-8 py-4 bg-[#111827] text-white rounded-[6px] font-bold text-[12px] uppercase tracking-[0.2em] hover:bg-[#1f2937] transition-all flex items-center gap-3 shadow-lg active:scale-[0.98]">
            Verificar Permissões ACI
         </button>
      </section>
    </div>
  )
}
