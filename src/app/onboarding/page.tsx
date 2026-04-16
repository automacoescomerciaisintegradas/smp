"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Layout, Video, BookOpen, ExternalLink, ShieldCheck, Key, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react"
import { OnboardingAccordion } from "@/components/onboarding/OnboardingAccordion"
import { appConfig } from "@/config/app-config"
import { MetaHealthCheckResult } from "@/lib/meta-api"

export default function OnboardingPage() {
  const [token, setToken] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [healthStatus, setHealthStatus] = useState<MetaHealthCheckResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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
      } else {
        setErrorMessage(data.error || "Erro ao validar token")
      }
    } catch (err) {
      setErrorMessage("Erro de conexão com o servidor")
    } finally {
      setIsChecking(false)
    }
  }

  const handleSaveToken = async () => {
    if (!token || healthStatus?.status !== "healthy") return
    setIsSaving(true)
    setErrorMessage(null)
    try {
      const res = await fetch("/api/onboarding/save-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      if (res.ok) {
        alert("Configuração persistida com sucesso! Redirecionando para o dashboard...")
        window.location.href = "/dashboard"
      } else {
        setErrorMessage(data.error || "Erro ao salvar configuração")
      }
    } catch (err) {
      setErrorMessage("Erro ao salvar no banco de dados")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header Section */}
        <section className="text-center space-y-4">
          <span className="slogan">Configuração do Sistema</span>
          <h1 className="text-5xl glow-title text-[var(--text-primary)]">
            Bem-vindo ao <span className="text-[var(--text-accent)]">{appConfig.productName}</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
            Módulo 1: Vamos configurar sua conexão real com a Meta API para ativar automações inteligentes.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <ShieldCheck className="text-[var(--text-accent)]" />
                Guia de Configuração Meta
              </h2>
              <OnboardingAccordion />
            </div>

            {/* Token Input Section */}
            <div className="card space-y-6 bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-space)]">
              <div className="flex items-center gap-3">
                <div className="p-2 glass rounded-lg">
                  <Key className="w-6 h-6 text-[var(--text-accent)]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Conexão Meta API</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Insira seu User Access Token para validar e ativar o ambiente</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="password"
                    value={token}
                    onChange={(e) => {
                      setToken(e.target.value)
                      setHealthStatus(null)
                    }}
                    placeholder="EAA..."
                    className="w-full bg-[var(--bg-darkest)] border border-[var(--surface-border)] rounded-md px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-accent)] transition-colors terminal-text"
                  />
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={handleHealthCheck}
                    disabled={!token || isChecking || isSaving}
                    className="btn-outline flex-1"
                  >
                    {isChecking ? <Loader2 className="animate-spin" /> : "Validar Conexão"}
                  </button>
                  
                  <button
                    onClick={handleSaveToken}
                    disabled={!token || healthStatus?.status !== "healthy" || isSaving}
                    className="btn-cta flex-1"
                  >
                    {isSaving ? "Persistindo..." : "Salvar e Continuar"}
                  </button>
                </div>

                {/* Health Check Feedback */}
                <AnimatePresence>
                  {healthStatus && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg flex gap-3 ${
                        healthStatus.status === "healthy" ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"
                      }`}
                    >
                      {healthStatus.status === "healthy" ? (
                        <CheckCircle2 className="text-green-500 shrink-0" />
                      ) : (
                        <AlertCircle className="text-red-500 shrink-0" />
                      )}
                      <div className="space-y-1">
                        <p className={`font-bold text-sm ${healthStatus.status === "healthy" ? "text-green-500" : "text-red-500"}`}>
                          {healthStatus.status === "healthy" ? "Conexão Estabelecida!" : "Problemas Identificados"}
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {healthStatus.status === "healthy" 
                            ? `Conectado como @${healthStatus.details.business_account.username}. Todas as permissões foram concedidas.`
                            : `Atenção: ${healthStatus.details.token.status === 'error' ? healthStatus.details.token.message : 'Faltam permissões necessárias.'}`}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-md text-sm flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      {errorMessage}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Layout className="w-5 h-5 text-[var(--text-accent)]" />
                Recursos de Ajuda
              </h3>
              <div className="space-y-3">
                <a href="#" className="flex items-center justify-between p-3 rounded-md hover:bg-[var(--surface-glass)] transition-colors group">
                  <div className="flex items-center gap-3">
                    <Video className="w-4 h-4 text-red-500" />
                    <span className="text-sm">Vídeo Tutorial</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-accent)]" />
                </a>
                <a href="https://developers.facebook.com/docs/instagram-api" target="_blank" className="flex items-center justify-between p-3 rounded-md hover:bg-[var(--surface-glass)] transition-colors group">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Documentação Meta</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-accent)]" />
                </a>
              </div>
            </div>

            <div className="card bg-black/20">
              <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4">
                Status de Permissões
              </h4>
              <ul className="space-y-3 text-sm">
                {[
                  "instagram_basic",
                  "instagram_manage_messages",
                  "instagram_manage_comments",
                  "pages_show_list",
                  "pages_read_engagement"
                ].map((perm) => {
                  const isMissing = healthStatus?.details.permissions.missing.includes(perm);
                  const isHealthy = healthStatus && !isMissing;
                  return (
                    <li key={perm} className="flex items-center gap-2">
                      {isHealthy ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : isMissing ? (
                        <XCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)]" />
                      )}
                      <span className={isHealthy ? "text-[var(--text-primary)]" : isMissing ? "text-red-500" : "text-[var(--text-secondary)]"}>
                        {perm}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
