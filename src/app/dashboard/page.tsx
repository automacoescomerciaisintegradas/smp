"use client"

import {
  TrendingUp,
  Users,
  MousePointer2,
  DollarSign,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Award,
  ShoppingCart,
  Gift,
  BookOpen
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { appConfig } from "@/config/app-config"

const stats = [
  { label: "Receita Afiliado", value: "R$ 12.450,00", change: "+12.5%", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "Cliques em Ofertas", value: "45.203", change: "+8.2%", icon: MousePointer2, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Alcance Social", value: "1.2M", change: "+24.3%", icon: Users, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { label: "Taxa de Conversão", value: "3.24%", change: "+1.2%", icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10" },
]

const quickActions = [
  { 
    title: "Gerenciar Turmas", 
    description: "Crie e gerencie turmas, blocos e valores",
    href: "/dashboard/classes",
    icon: Calendar,
    color: "from-purple-500 to-purple-600",
    metrics: "5 turmas ativas"
  },
  { 
    title: "Programa de Fidelidade", 
    description: "Recompensas e pontos para clientes",
    href: "/dashboard/loyalty",
    icon: Award,
    color: "from-indigo-500 to-indigo-600",
    metrics: "2.450 pontos distribuídos"
  },
  { 
    title: "Inscrições", 
    description: "Gerencie inscrições e pagamentos",
    href: "/dashboard/enrollments",
    icon: ShoppingCart,
    color: "from-green-500 to-green-600",
    metrics: "23 inscrições este mês"
  },
  { 
    title: "Base de Conhecimento", 
    description: "Treine sua IA com dados do negócio",
    href: "/dashboard/knowledge",
    icon: BookOpen,
    color: "from-blue-500 to-blue-600",
    metrics: "Módulo 2 ativo"
  },
  { 
    title: "Recompensas", 
    description: "Catálogo de recompensas disponíveis",
    href: "/dashboard/loyalty",
    icon: Gift,
    color: "from-orange-500 to-orange-600",
    metrics: "12 recompensas ativas"
  }
]

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <header className="relative space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-3xl bg-white border border-zinc-100 shadow-sm p-12"
        >
          <div className="absolute top-0 right-0 p-8">
             <img src="/icon.png" alt="" className="w-24 h-24 object-contain opacity-20 filter grayscale brightness-200" />
          </div>
                    <div className="max-w-3xl space-y-6 relative z-10">
            <div className="flex items-center gap-3">
               <h2 className="text-[#E54D42] font-bold uppercase tracking-[0.2em] text-[12px] flex items-center gap-2">
                 {appConfig.productName}
                 <span className="w-10 h-px bg-[#E54D42]/20" />
               </h2>
               <div className="px-3 py-1 rounded-[6px] border border-[#E5E7EB] bg-[#F9FAFB] text-[10px] font-bold tracking-tight text-[#6B7280] shadow-sm">
                  {`{[ ${appConfig.productName}  ${appConfig.socialHandle} ]}`}
               </div>
            </div>
            <h1 className="text-[24px] font-bold tracking-tight text-[#111827] leading-tight">
              Bem-vindo(a) ao Futuro da <br/>
              <span className="text-[#E54D42]">
                Criação de Conteúdo! 🤖✨
              </span>
            </h1>
            <p className="text-[#6B7280] text-[14px] max-w-xl leading-relaxed">
              Ative integrações, conhecimento e automações do <span className="text-[#E54D42] font-semibold">{appConfig.productName}</span> com controle operacional centralizado.
            </p>
            <p className="text-[#9CA3AF] text-[12px] font-medium tracking-tight mt-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              Foco em Soberania Digital e Automação Local.
            </p>
          </div>
        </motion.div>
      </header>

      {/* Quick Actions - Marketing & Loyalty */}
      <section>
        <h2 className="text-xl font-bold mb-4">Marketing e Fidelização</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <Link
              key={i}
              href={action.href}
              className="group block bg-white border border-[#E5E7EB] rounded-[8px] p-[16px] hover:shadow-lg transition-all shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] hover:border-purple-200"
            >
              <div className={`bg-gradient-to-br ${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <action.icon size={24} className="text-white" />
              </div>
              <h3 className="text-[14px] font-bold text-[#111827] mb-1">{action.title}</h3>
              <p className="text-[12px] text-[#6B7280] mb-3">{action.description}</p>
              <div className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full inline-block">
                {action.metrics}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white border border-[#E5E7EB] p-[16px] rounded-[8px] hover:shadow-md transition-all shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-[#F3F4F6] rounded-[6px] text-[#E54D42]">
                <stat.icon size={18} />
              </div>
              <div className="flex items-center gap-1 text-[#10B981] text-[12px] font-bold bg-[#10B981]/10 px-2 py-0.5 rounded-full">
                {stat.change}
                <ArrowUpRight size={10} />
              </div>
            </div>
            <div>
              <p className="text-[#6B7280] text-[12px] font-medium uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-[#111827]">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white border border-[#E5E7EB] rounded-[8px] p-[24px] h-[360px] flex flex-col shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[14px] font-bold text-[#111827] flex items-center gap-2 uppercase tracking-wide">
              <BarChart3 className="text-[#E54D42]" size={16} />
              Performance Global
            </h2>
            <div className="flex gap-1 bg-[#F3F4F6] p-1 rounded-[6px]">
              <button className="px-4 py-1.5 text-[12px] font-medium text-[#6B7280]">7 Dias</button>
              <button className="px-4 py-1.5 text-[12px] font-bold bg-white text-[#E54D42] rounded-[4px] shadow-sm">30 Dias</button>
            </div>
          </div>
          <div className="flex-1 border-b border-l border-[#E5E7EB] relative mb-2">
             <div className="absolute inset-0 flex items-end gap-3 px-6 pb-0">
                {[40, 60, 45, 80, 55, 90, 70, 85, 60, 95, 80, 100].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.2 + i * 0.02, duration: 0.8 }}
                    className="flex-1 bg-[#E54D42]/80 hover:bg-[#E54D42] rounded-t-[2px] transition-colors group relative"
                  >
                  </motion.div>
                ))}
             </div>
          </div>
          <div className="flex justify-between px-6 text-[10px] font-bold text-[#9CA3AF] uppercase pt-2">
             <span>Jan</span><span>Mar</span><span>Mai</span><span>Jul</span><span>Set</span><span>Nov</span>
          </div>
        </div>

        {/* Live Logs / Activity */}
        <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-[24px] flex flex-col shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]">
          <h2 className="text-[14px] font-bold text-[#111827] mb-6 uppercase tracking-wide">Atividade Recente</h2>
          <div className="space-y-4 flex-1 overflow-y-auto">
            {[
              { type: 'offer', text: 'Novo link afiliado gerado: iPhone 15 Pro', time: 'Há 2 min' },
              { type: 'campaign', text: 'Campanha "Saldao" publicada no Instagram', time: 'Há 15 min' },
              { type: 'agent', text: 'Agente "Sales" respondeu 4 leads no WhatsApp', time: 'Há 1 hora' },
              { type: 'system', text: 'Relatório semanal processado', time: 'Há 3 horas' },
              { type: 'enrollment', text: 'Nova inscrição: Maria Silva - Turma Python', time: 'Há 5 horas' },
              { type: 'loyalty', text: 'João resgatou recompensa: Desconto 20%', time: 'Há 6 horas' },
            ].map((activity, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="W-1.5 h-1.5 rounded-full bg-[#E54D42] mt-1.5" />
                <div>
                  <p className="text-[13px] font-medium text-[#111827] leading-tight">{activity.text}</p>
                  <p className="text-[10px] font-medium text-[#9CA3AF] mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-6 w-full py-2.5 text-[12px] font-bold text-[#6B7280] hover:text-[#E54D42] transition-colors border-t border-[#E5E7EB] pt-4">
            RELATÓRIO COMPLETO
          </button>
        </div>
      </div>
    </div>
  )
}
