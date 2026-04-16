"use client"

import { 
  Zap, 
  ArrowRight, 
  ChevronRight, 
  Monitor, 
  MessageSquare, 
  ShoppingBag, 
  ShieldCheck,
  Globe,
  Sparkles
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

const loyaltyHighlights = [
  "Programas de pontos, cashback e bônus por indicação em múltiplos canais.",
  "Links únicos para promotores com tracking por turma, bloco e campanha.",
  "Recompensas automáticas para quem divulga a marca nas redes sociais.",
  "Governança com regras antifraude, limites por bloco e aprovação rápida.",
]

const marketingTools = [
  {
    icon: ShoppingBag,
    title: "Checkout Multicanal",
    desc: "Pix, cartão e boleto com links dinâmicos e taxas ajustadas por turma.",
  },
  {
    icon: MessageSquare,
    title: "Indicação Social",
    desc: "Fluxos de convite via DM, WhatsApp e e-mail com CTAs rastreados.",
  },
  {
    icon: ShieldCheck,
    title: "Governança & Compliance",
    desc: "Políticas de recompensa, regras por bloco e proteção antifraude.",
  },
  {
    icon: Globe,
    title: "Publicação Integrada",
    desc: "Calendário social unificado para campanhas e ativações por turma.",
  },
]

const cohorts = [
  {
    name: "Turma Aurora",
    focus: "Fidelização + Indicação Social",
    enrollmentUntil: "03 Mai 2026",
    blocks: [
      {
        label: "Bloco 01 · Fundamentos do Programa",
        date: "06 Mai 2026",
        start: "19:00",
        price: "R$ 590",
        status: "Inscrições abertas",
      },
      {
        label: "Bloco 02 · Incentivos e Recompensas",
        date: "13 Mai 2026",
        start: "19:00",
        price: "R$ 690",
        status: "Últimas vagas",
      },
    ],
  },
  {
    name: "Turma Íris",
    focus: "Automação de Marketing + Pagamentos",
    enrollmentUntil: "10 Mai 2026",
    blocks: [
      {
        label: "Bloco 01 · Checkout e Upsell",
        date: "15 Mai 2026",
        start: "20:00",
        price: "R$ 740",
        status: "Inscrições abertas",
      },
      {
        label: "Bloco 02 · Promoção e Retenção",
        date: "22 Mai 2026",
        start: "20:00",
        price: "R$ 640",
        status: "Vagas limitadas",
      },
    ],
  },
  {
    name: "Turma Atlas",
    focus: "Loyalty B2B + Gestão de Promotores",
    enrollmentUntil: "17 Mai 2026",
    blocks: [
      {
        label: "Bloco 01 · Rede de Promotores",
        date: "21 Mai 2026",
        start: "19:30",
        price: "R$ 820",
        status: "Pré-inscrição",
      },
      {
        label: "Bloco 02 · Automação e Métricas",
        date: "28 Mai 2026",
        start: "19:30",
        price: "R$ 720",
        status: "Pré-inscrição",
      },
    ],
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap size={18} className="fill-current" />
            </div>
            <span className="text-xl font-black tracking-tighter">CREAO</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Funcionalidades</a>
            <a href="#about" className="hover:text-white transition-colors">Sobre</a>
            <a href="#pricing" className="hover:text-white transition-colors">Preços</a>
          </div>

          <Link 
            href="/login"
            className="px-6 py-2.5 bg-white text-black rounded-full font-bold text-sm hover:bg-slate-200 transition-all active:scale-95"
          >
            Acessar Workspace
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20"
            >
              <Sparkles size={14} className="text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">
                A Nova Era do Marketing Direto
              </span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-black tracking-tighter font-display"
            >
              Plataforma de <br />
              <span className="bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent italic">
                Inteligência Criativa
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl font-medium"
            >
              Orquestre um squad de agentes autônomos para dominar tráfego, 
              gerar ofertas irresistíveis e automatizar vendas em escala global.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Link 
                href="/login"
                className="w-full sm:w-auto px-10 py-5 bg-blue-600 hover:bg-blue-700 rounded-2xl font-black text-lg shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
              >
                Iniciar Agora
                <ArrowRight size={20} />
              </Link>
              <button className="w-full sm:w-auto px-10 py-5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl font-black text-lg transition-all">
                Ver Demonstração
              </button>
            </motion.div>
          </div>

          {/* Device Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mt-24 relative max-w-5xl mx-auto"
          >
            <div className="bg-slate-900/50 backdrop-blur-2xl rounded-3xl border border-white/10 p-4 shadow-[0_0_100px_rgba(37,99,235,0.15)]">
              <div className="aspect-video bg-black rounded-2xl overflow-hidden relative">
                 <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent" />
                 <img 
                    src="https://images.unsplash.com/photo-1614332287897-cdc485fa562d?w=1200&q=80" 
                    alt="Creao Interface" 
                    className="w-full h-full object-cover opacity-60"
                 />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                       <Play className="text-white fill-current ml-1" size={32} />
                    </div>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 border-t border-white/5 bg-slate-950/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Monitor} 
              title="Shopee Engine" 
              desc="Extração instantânea de produtos com geração automática de links de afiliado via IA."
            />
            <FeatureCard 
              icon={MessageSquare} 
              title="Agent Swarm" 
              desc="Squad de agentes inteligentes para chat, suporte e fechamento de vendas 24/7."
            />
            <FeatureCard 
              icon={Globe} 
              title="Social Flow" 
              desc="Agendamento e publicação multicanal nos maiores ecossistemas sociais do mundo."
            />
          </div>
        </div>
      </section>

      {/* Loyalty + Payments */}
      <section id="about" className="py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                <Sparkles size={14} className="text-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">
                  Marketing + Pagamentos
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                Fidelização que transforma clientes em promotores da marca
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Ferramentas de marketing e pagamentos para auxiliar nesse processo, permitindo que
                as empresas gerenciem e automatizem programas de fidelização de clientes, oferecendo
                recompensas e incentivos para quem divulga a marca em suas redes sociais e no círculo
                de amigos e familiares.
              </p>
              <div className="space-y-3">
                {loyaltyHighlights.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-slate-300">
                    <ChevronRight size={16} className="text-blue-400 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {marketingTools.map((tool) => (
                <ToolCard key={tool.title} {...tool} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Enrollment */}
      <section id="pricing" className="py-32 border-t border-white/5 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                <ShoppingBag size={14} className="text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                  Inscrições e Checkout
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                Turmas e blocos com valores adaptados por data de início
              </h2>
              <p className="text-slate-400 text-lg">
                Separamos por turma e bloco para você definir calendários, preços e checkouts de
                pagamento com clareza operacional.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/10 text-sm text-slate-300 max-w-sm">
              <p className="font-bold text-white">Checkout pronto em minutos</p>
              <p className="mt-2 text-slate-400">
                Gere botões por bloco e sincronize pagamentos em Pix, cartão ou recorrência.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {cohorts.map((cohort) => (
              <div
                key={cohort.name}
                className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800/60 shadow-[0_0_60px_rgba(15,23,42,0.4)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-blue-400 font-bold">
                      {cohort.name}
                    </p>
                    <h3 className="text-2xl font-bold text-white">{cohort.focus}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase text-slate-500 font-bold">Inscrições até</p>
                    <p className="text-sm font-bold text-slate-200">{cohort.enrollmentUntil}</p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {cohort.blocks.map((block) => (
                    <div
                      key={block.label}
                      className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/70"
                    >
                      <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-widest">
                        <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-300 font-bold">
                          {block.status}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-white">{block.label}</p>
                          <p className="text-xs text-slate-500">
                            Valores e inscrições ajustados por bloco.
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-6 text-sm">
                          <div>
                            <p className="text-[10px] uppercase text-slate-500 font-bold">Data</p>
                            <p className="font-bold text-slate-200">{block.date}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase text-slate-500 font-bold">Início</p>
                            <p className="font-bold text-slate-200">{block.start}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase text-slate-500 font-bold">Valor</p>
                            <p className="font-black text-lg text-white">{block.price}</p>
                          </div>
                        </div>

                        <Link
                          href="/login"
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-widest transition-all"
                        >
                          Checkout
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center">
         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">
            © 2026 Creao System. Sistema Operacional Ativo.
         </p>
      </footer>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="p-8 rounded-3xl bg-slate-900/30 border border-slate-800/50 hover:border-blue-500/30 transition-all hover:bg-slate-900/50">
      <div className="w-12 h-12 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
        <Icon size={24} />
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

function ToolCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800/70 hover:border-blue-500/40 hover:bg-slate-900/50 transition-all">
      <div className="w-10 h-10 bg-blue-600/10 text-blue-400 rounded-xl flex items-center justify-center mb-4">
        <Icon size={20} />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

function Play(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}
