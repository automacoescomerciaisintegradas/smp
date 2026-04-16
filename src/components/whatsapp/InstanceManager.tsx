"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle2,
  Loader2,
  LogOut,
  Plus,
  QrCode,
  RefreshCw,
  Smartphone,
  Trash2,
  TriangleAlert,
  Wifi,
  WifiOff,
  X,
  XCircle,
  Zap,
  Activity
} from "lucide-react"

type EvolutionInstance = {
  id: string
  name: string
  connected: boolean
  connectionStatus: string
  qrCode?: string
  pairingCode?: string
  clientName?: string
  osName?: string
  profileName?: string
  createdAt?: string
}

type QrSession = {
  name: string
  qrCode: string | null
  pairingCode: string | null
}

function formatInstanceDate(value?: string) {
  if (!value) return "sem data"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "sem data"
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function formatConnectionStatus(status?: string) {
  const normalized = (status || "unknown").toLowerCase()
  if (["open", "connected"].includes(normalized)) return "Conectado"
  if (["connecting", "pairing", "qrcode"].includes(normalized)) return "Aguardando leitura"
  if (["close", "closed", "disconnected"].includes(normalized)) return "Desconectado"
  return status || "Status indefinido"
}

export function InstanceManager() {
  const [instances, setInstances] = useState<EvolutionInstance[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [instanceName, setInstanceName] = useState("")
  const [busyInstanceName, setBusyInstanceName] = useState<string | null>(null)
  const [qrSession, setQrSession] = useState<QrSession | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const disconnectedCount = useMemo(
    () => instances.filter((instance) => !instance.connected).length,
    [instances]
  )

  const fetchInstances = async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!silent) setLoading(true)
    try {
      const response = await fetch("/api/whatsapp/instances", { cache: "no-store" })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Erro ao carregar instâncias")
      setInstances(Array.isArray(data.instances) ? data.instances : [])
      if (!silent) setErrorMsg(null)
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Erro desconhecido")
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const fetchSingleInstance = async (name: string) => {
    const response = await fetch(`/api/whatsapp/instances/${name}`, { cache: "no-store" })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || "Erro ao buscar instância")
    return data.instance as EvolutionInstance
  }

  useEffect(() => {
    fetchInstances()
  }, [])

  useEffect(() => {
    if (!qrSession?.name) return
    const interval = window.setInterval(async () => {
      try {
        const instance = await fetchSingleInstance(qrSession.name)
        setInstances((current) => current.map((item) => (item.name === instance.name ? instance : item)))
        if (instance.connected) {
          setQrSession(null)
          setSuccessMsg(`Instância "${instance.name}" conectada com sucesso.`)
        }
      } catch {}
    }, 4500)
    return () => window.clearInterval(interval)
  }, [qrSession])

  useEffect(() => {
    if (!successMsg) return
    const timeout = window.setTimeout(() => setSuccessMsg(null), 5000)
    return () => window.clearTimeout(timeout)
  }, [successMsg])

  const handleLogout = async (name: string) => {
    setBusyInstanceName(name)
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      const response = await fetch(`/api/whatsapp/instances/${name}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      })
      if (!response.ok) throw new Error("Erro ao desconectar")
      await fetchInstances({ silent: true })
      setSuccessMsg(`Instância "${name}" desconectada.`)
    } catch (error) {
      setErrorMsg("Erro ao desconectar instância")
    } finally {
      setBusyInstanceName(null)
    }
  }

  const handleCreate = async () => {
    if (!instanceName.trim()) return
    setIsCreating(true)
    setErrorMsg(null)
    try {
      const response = await fetch("/api/whatsapp/instances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: instanceName }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Erro ao criar instância")
      setInstanceName("")
      await fetchInstances({ silent: true })
      if (data.normalizedName) await handleConnect(data.normalizedName)
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Erro ao criar instância")
    } finally {
      setIsCreating(false)
    }
  }

  const handleConnect = async (name: string) => {
    setBusyInstanceName(name)
    setErrorMsg(null)
    setQrSession({ name, qrCode: null, pairingCode: null }) // Show loading immediately
    try {
      const response = await fetch(`/api/whatsapp/instances/${name}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "connect" }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Erro ao gerar QR code")
      setQrSession({ name, qrCode: data.qrCode, pairingCode: data.pairingCode })
      await fetchInstances({ silent: true })
    } catch (error) {
      setQrSession(null)
      setErrorMsg(error instanceof Error ? error.message : "Erro ao gerar QR code")
    } finally {
      setBusyInstanceName(null)
    }
  }

  const handleDelete = async (name: string) => {
    if (!confirm(`Excluir permanentemente a instância "${name}"?`)) return
    setBusyInstanceName(name)
    try {
      const response = await fetch(`/api/whatsapp/instances?name=${name}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Erro ao excluir")
      await fetchInstances({ silent: true })
      if (qrSession?.name === name) setQrSession(null)
    } catch (error) {
      setErrorMsg("Erro ao remover instância")
    } finally {
      setBusyInstanceName(null)
    }
  }

  return (
    <div className="space-y-10">
      {/* Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           <div className="p-4 bg-[var(--surface-glass)] border border-[var(--surface-border)] rounded-2xl shadow-lg">
              <Activity className="text-[var(--text-accent)]" size={28} />
           </div>
           <div>
              <h3 className="text-2xl font-black font-display tracking-tight">Status Operacional</h3>
              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">
                 {instances.length} Instâncias Operando · {instances.filter(i => i.connected).length} Online
              </p>
           </div>
        </div>
        <div className="flex gap-2">
           <button 
              onClick={() => fetchInstances()} 
              className="p-3 bg-[var(--surface-glass)] border border-[var(--surface-border)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
           >
              <RefreshCw className={loading ? "animate-spin" : ""} size={20} />
           </button>
        </div>
      </div>

      <AnimatePresence>
        {qrSession && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col lg:flex-row gap-8 bg-[var(--bg-darkest)] border border-[var(--surface-border)] rounded-[40px] p-10 shadow-[var(--shadow-glow)] overflow-hidden relative group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5"><Zap size={180} /></div>
            
            <div className="flex-1 space-y-6">
               <div className="flex justify-between items-start">
                  <span className="badge">Configuração de Pareamento</span>
                  <button onClick={() => setQrSession(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all">
                     <X size={20} />
                  </button>
               </div>
               <h4 className="text-4xl font-black font-display tracking-tighter">Conectar {qrSession.name}</h4>
               <p className="text-[var(--text-secondary)] max-w-sm font-medium leading-relaxed">
                  Escaneie o QR Code ao lado usando seu aplicativo WhatsApp para ativar este terminal.
               </p>
               <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3 text-xs font-bold text-[var(--text-accent)]">
                     <CheckCircle2 size={16} /> 1. Abra o WhatsApp no seu celular
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-[var(--text-accent)]">
                     <CheckCircle2 size={16} /> 2. Vá em Configurações &gt; Aparelhos Conectados
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-[var(--text-accent)]">
                     <CheckCircle2 size={16} /> 3. Clique em Conectar um Aparelho
                  </div>
               </div>
            </div>

            <div className="bg-white p-6 rounded-[32px] shadow-2xl flex items-center justify-center min-w-[320px] min-h-[320px] relative overflow-hidden">
               {qrSession.qrCode ? (
                 <img src={qrSession.qrCode} alt="WhatsApp QR" className="w-full relative z-10" />
               ) : (
                 <div className="text-center space-y-4">
                    <Loader2 className="animate-spin text-[var(--text-accent)] mx-auto" size={48} />
                    <p className="text-xs font-black uppercase tracking-widest text-[#111827]">Gerando Par de Chaves...</p>
                 </div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
        {instances.map((instance) => {
          const isBusy = busyInstanceName === instance.name
          return (
            <motion.div
              layout
              key={instance.id}
              className="group bg-[var(--bg-card)] border border-[var(--surface-border)] rounded-[32px] p-8 hover:bg-[var(--bg-card-hover)] hover:border-[var(--surface-border-hover)] transition-all shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-8">
                 <div className={`p-4 rounded-2xl border ${instance.connected ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-orange-500/10 border-orange-500/20 text-orange-400'}`}>
                    {instance.connected ? <Wifi size={24} /> : <WifiOff size={24} />}
                 </div>
                 <div className="flex gap-1">
                    <button 
                      onClick={() => handleDelete(instance.name)}
                      className="p-2 opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-red-500 transition-all"
                    >
                       <Trash2 size={18} />
                    </button>
                 </div>
              </div>

              <div className="space-y-1 mb-8">
                 <h4 className="text-xl font-black font-display tracking-tight group-hover:text-[var(--text-accent)] transition-colors line-clamp-1">
                    {instance.name}
                 </h4>
                 <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                    {formatConnectionStatus(instance.connectionStatus)}
                 </p>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center justify-between text-[11px] font-bold text-[var(--text-muted)] border-t border-[var(--surface-border)] pt-6">
                    <span>CRIADO EM</span>
                    <span className="text-[var(--text-primary)]">{formatInstanceDate(instance.createdAt)}</span>
                 </div>
                 
                 <div className="flex gap-3">
                    {!instance.connected ? (
                      <button
                        onClick={() => handleConnect(instance.name)}
                        disabled={isBusy}
                        className="flex-1 py-4 bg-[var(--text-accent)] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[var(--shadow-glow)]"
                      >
                         {isBusy ? <Loader2 className="animate-spin" size={16} /> : <QrCode size={16} />}
                         Parear Agora
                      </button>
                    ) : (
                      <button
                        onClick={() => handleLogout(instance.name)}
                        disabled={isBusy}
                        className="flex-1 py-4 bg-[var(--surface-glass)] border border-[var(--surface-border)] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[var(--text-brand)] transition-all"
                      >
                         Desconectar
                      </button>
                    )}
                 </div>
              </div>
            </motion.div>
          )
        })}

        {/* Create Card */}
        <div className="bg-[var(--surface-glass)] border-2 border-dashed border-[var(--surface-border)] rounded-[32px] p-8 flex flex-col items-center justify-center text-center space-y-6 hover:border-[var(--text-accent)] group transition-all min-h-[340px]">
           <div className="p-4 bg-[var(--bg-darkest)] rounded-2xl border border-[var(--surface-border)] text-[var(--text-muted)] group-hover:text-[var(--text-accent)] group-hover:border-[var(--text-accent)] transition-all">
              <Plus size={32} />
           </div>
           <div className="space-y-2">
              <h4 className="font-bold text-lg">Nova Instância</h4>
              <p className="text-xs text-[var(--text-muted)] max-w-[180px]">Expanda sua operação conectando mais aparelhos.</p>
           </div>
           <div className="w-full space-y-3">
              <input 
                 value={instanceName}
                 onChange={e => setInstanceName(e.target.value)}
                 placeholder="ID da Instância"
                 className="w-full bg-[var(--bg-darkest)] border border-[var(--surface-border)] rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-[var(--text-accent)] transition-all"
              />
              <button 
                 onClick={handleCreate}
                 disabled={!instanceName || isCreating}
                 className="w-full py-3 bg-[var(--text-accent)] text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
              >
                 {isCreating ? <Loader2 className="animate-spin mx-auto" size={14} /> : "Provisionar Terminal"}
              </button>
           </div>
        </div>
      </div>
    </div>
  )
}
