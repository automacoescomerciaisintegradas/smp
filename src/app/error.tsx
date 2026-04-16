'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-8">
        <div className="relative">
           <div className="absolute inset-0 bg-red-600/20 blur-3xl rounded-full" />
           <div className="relative bg-slate-900/40 backdrop-blur-2xl border border-red-500/30 rounded-3xl p-10 shadow-2xl">
              <div className="w-16 h-16 bg-red-600/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              
              <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Desvio de Rota Detectado</h2>
              <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">
                Houve uma interrupção na comunicação com o sistema. Isso geralmente ocorre devido a falhas na conexão com o banco de dados.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => reset()}
                  className="w-full py-3 bg-white text-black rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all active:scale-95"
                >
                  <RefreshCw size={18} />
                  Reiniciar Protocolos
                </button>
                
                <Link
                  href="/"
                  className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition-all"
                >
                  <Home size={18} />
                  Voltar ao Início
                </Link>
              </div>
           </div>
        </div>
        
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
          Codename: {error.digest || 'Unknown System Failure'}
        </p>
      </div>
    </div>
  )
}
