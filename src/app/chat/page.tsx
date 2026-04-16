"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Plus, MessageSquare, Bot, User, Sparkles, Command, ShieldCheck, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { appConfig } from "@/config/app-config"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([
    { role: "assistant", content: `Olá! Sou o assistente ${appConfig.productName}. Como posso ajudar com suas automações e estratégias de conteúdo hoje?` }
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = { role: "user", content: input }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      // Mock para manter a UI ativa
        setTimeout(() => {
          setMessages(prev => [...prev, { 
          role: "assistant", 
          content: `Compreendo sua solicitação. Estou analisando as melhores práticas do ${appConfig.productName} para otimizar seus resultados e garantir uma operação mais previsível.` 
        }])
        setIsTyping(false)
      }, 1500)
    } catch (error) {
      console.error(error)
      setIsTyping(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-[#F9FAFB] p-8 -m-8">
      <header className="mb-8 flex items-end justify-between border-b border-[#E5E7EB] pb-8">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-[#111827] flex items-center gap-3 uppercase">
            <Bot className="text-[#E54D42]" size={24} />
            Central de Inteligência
          </h1>
          <p className="text-[#6B7280] text-[14px] mt-1">Orquestre seus agentes e valide estratégias em tempo real.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#E54D42] hover:bg-[#D43D32] text-white rounded-[6px] font-bold text-[12px] uppercase transition-all shadow-sm">
          <Plus size={16} />
          Nova Sessão
        </button>
      </header>

      <div className="flex-1 flex gap-8 min-h-0">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white border border-[#E5E7EB] rounded-[8px] overflow-hidden shadow-sm">
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-[#E5E7EB]">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-4",
                    msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border",
                    msg.role === 'user' 
                      ? "bg-[#F3F4F6] border-[#E5E7EB] text-[#6B7280]" 
                      : "bg-[#E54D42]/10 border-[#E54D42]/20 text-[#E54D42]"
                  )}>
                    {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  <div className={cn(
                    "max-w-[70%] px-6 py-4 rounded-[12px] text-[14px] leading-relaxed shadow-sm",
                    msg.role === 'user' 
                      ? "bg-[#111827] text-white rounded-tr-none" 
                      : "bg-white text-[#111827] border border-[#E5E7EB] rounded-tl-none"
                  )}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#E54D42]/10 border border-[#E54D42]/20 text-[#E54D42]">
                    <Sparkles size={18} className="animate-pulse" />
                  </div>
                  <div className="bg-white border border-[#E5E7EB] px-6 py-4 rounded-[12px] rounded-tl-none shadow-sm">
                    <div className="flex gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#E54D42] rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-[#E54D42] rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-[#E54D42] rounded-full animate-bounce" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input Area */}
          <div className="p-8 bg-[#F9FAFB] border-t border-[#E5E7EB]">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Solicite uma automação ou análise estratégica..."
                className="w-full bg-white border border-[#E5E7EB] focus:border-[#E54D42]/30 rounded-[8px] py-4 pl-6 pr-16 text-[14px] font-medium transition-all outline-none shadow-sm"
              />
              <button
                onClick={sendMessage}
                className="absolute right-3 p-2.5 bg-[#E54D42] hover:bg-[#D43D32] text-white rounded-[6px] transition-all shadow-md active:scale-95"
              >
                <Send size={18} />
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-2">
                <span className="text-[10px] uppercase font-bold text-[#9CA3AF] bg-white border border-[#E5E7EB] px-2 py-1 rounded-[4px] flex items-center gap-1.5">
                  <Zap size={10} className="text-[#E54D42]" /> Resposta Instantânea
                </span>
              </div>
              <p className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-widest">
                Modelo: Agent-GPT-4o (Premium)
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Contextual */}
        <div className="w-80 space-y-6 hidden xl:block">
          <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-8 shadow-sm">
            <h3 className="font-bold text-[12px] uppercase tracking-widest text-[#111827] mb-6 flex items-center gap-2">
              <ShieldCheck className="text-[#10B981]" size={16} /> Status dos Agentes
            </h3>
            <div className="space-y-4">
              {[
                { name: "Shopee Specialist", status: "Online", desc: "Expert em ofertas e conversão" },
                { name: "Meta Social Master", status: "Online", desc: "Gestão de Ads e Publicações" },
                { name: "Copywriter AI", status: "Standby", desc: "Geração de textos persuasivos" },
              ].map((agent) => (
                <div key={agent.name} className="p-4 rounded-[6px] hover:bg-[#F9FAFB] border border-transparent hover:border-[#E5E7EB] transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-[#111827] uppercase group-hover:text-[#E54D42] transition-colors">{agent.name}</span>
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      agent.status === 'Online' ? 'bg-[#10B981]' : 'bg-[#9CA3AF]'
                    )} />
                  </div>
                  <p className="text-[11px] text-[#6B7280] leading-relaxed">{agent.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-[#E54D42]/5 border border-[#E54D42]/10 rounded-[8px]">
             <p className="text-[11px] font-bold text-[#E54D42] uppercase tracking-widest leading-relaxed">
               As conversas são privadas e locais, garantindo a soberania dos seus dados.
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}
