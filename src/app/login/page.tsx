"use client"

import { signIn } from "next-auth/react"
import { motion } from "framer-motion"
import { appConfig } from "@/config/app-config"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4 font-sans">
      <div className="max-w-md w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#E5E7EB] p-10 rounded-3xl shadow-xl space-y-10"
        >
          <div className="text-center space-y-3">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden border border-[#E5E7EB] bg-white shadow-sm p-2">
                <img src="/logo.png" alt={appConfig.productName} className="w-full h-full object-contain" />
              </div>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-[#111827] uppercase">
              {appConfig.productName}
            </h1>
            <p className="text-[#6B7280] text-xs font-bold tracking-[0.2em] uppercase">
              {appConfig.tagline}
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-center text-xl font-bold text-[#111827] tracking-tight">
                Acessar sua conta
              </h2>
              <p className="text-center text-[#6B7280] text-sm">
                Conecte-se para configurar integrações e operar suas automações
              </p>
            </div>
            
            <form
              onSubmit={(event) => {
                event.preventDefault()
                void signIn("google")
              }}
            >
              <button
                type="submit"
                className="group relative w-full flex items-center justify-center gap-3 py-4 px-6 bg-white hover:bg-[#F3F4F6] text-[#111827] font-bold rounded-2xl border border-[#E5E7EB] transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5 transition-transform group-hover:rotate-12" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Entrar com Google
              </button>
            </form>
          </div>
          
          <div className="pt-8 text-center border-t border-[#E5E7EB]">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F3F4F6] border border-[#E5E7EB]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-[#6B7280] uppercase tracking-widest font-bold">
                Plataforma operacional ativa
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
