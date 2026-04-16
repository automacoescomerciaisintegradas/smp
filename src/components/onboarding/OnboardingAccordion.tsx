"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { appConfig } from "@/config/app-config"

interface AccordionItemProps {
  title: string
  content: string | React.ReactNode
  isOpen: boolean
  onClick: () => void
}

const AccordionItem = ({ title, content, isOpen, onClick }: AccordionItemProps) => {
  return (
    <div className="card mb-4 overflow-hidden border-[var(--surface-border)]">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 bg-transparent text-left hover:bg-[var(--surface-glass)] transition-colors"
      >
        <span className="font-semibold text-[var(--text-primary)]">{title}</span>
        <ChevronDown
          className={`w-5 h-5 text-[var(--text-accent)] transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-4 border-t border-[var(--surface-border)] bg-[var(--bg-card-hover)] text-[var(--text-secondary)]">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function OnboardingAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const steps = [
    {
      title: "1. Criar App no Meta for Developers",
      content: (
        <div className="space-y-4">
          <p>Acesse o <a href="https://developers.facebook.com/apps/" target="_blank" className="text-[var(--text-accent)] underline">Meta for Developers</a> e clique em "Criar Aplicativo".</p>
          <ul className="list-disc ml-5 space-y-2">
            <li>Selecione <strong>"Outro"</strong> como tipo de aplicativo.</li>
            <li>Escolha <strong>"Negócios"</strong> como subtipo.</li>
            <li>Dê um nome ao seu app (ex: Social-Flow-Automation).</li>
          </ul>
        </div>
      ),
    },
    {
      title: "2. Adicionar Instagram Graph API",
      content: (
        <div className="space-y-4">
          <p>No painel do seu App, role até "Adicionar produtos" e procure por <strong>Instagram Graph API</strong>.</p>
          <p>Adicione também o produto <strong>Facebook Login for Business</strong>.</p>
        </div>
      ),
    },
    {
      title: "3. Configurar Permissões Necessárias",
      content: (
        <div className="space-y-4">
          <p>Certifique-se de que seu App tenha acesso às seguintes permissões:</p>
          <div className="flex flex-wrap gap-2">
            <span className="badge">instagram_business_basic</span>
            <span className="badge">instagram_business_manage_messages</span>
            <span className="badge">instagram_business_manage_comments</span>
            <span className="badge">pages_read_engagement</span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-2 italic">* Essas permissões são essenciais para que o {appConfig.productName} valide a conta, monitore eventos e automatize respostas.</p>
        </div>
      ),
    },
    {
      title: "4. Obter o User Access Token",
      content: (
        <div className="space-y-4">
          <p>Use o <strong>Graph API Explorer</strong> para gerar um token de curta duração e depois troque-o por um de longa duração (60 dias) ou perpétuo se for um Token de Página.</p>
          <div className="terminal-text p-3 bg-black/30 rounded-md">
            Ferramentas &gt; Explorador da Graph API &gt; Selecionar App &gt; Gerar Token
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="w-full">
      {steps.map((step, index) => (
        <AccordionItem
          key={index}
          title={step.title}
          content={step.content}
          isOpen={openIndex === index}
          onClick={() => setOpenIndex(openIndex === index ? null : index)}
        />
      ))}
    </div>
  )
}
