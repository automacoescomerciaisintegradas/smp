"use client"

import { Sidebar } from "./Sidebar"
import { Footer } from "./Footer"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Não exibe a sidebar apenas na página de login
  const isMarketingPage = pathname === "/login" || pathname === "/landing"
  const isFullPage = pathname === "/whatsapp" || pathname === "/chat" || pathname.startsWith("/automation/instagram")

  if (isMarketingPage) return <>{children}</>

  return (
    <div className="flex h-screen bg-[var(--background)] text-[var(--foreground)] overflow-hidden font-sans selection:bg-rose-100 selection:text-rose-900">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Design System v1.0.0 Surface */}
        <div className="absolute inset-0 bg-[var(--background)] pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white/80 to-transparent pointer-events-none" />

        <div className={`flex-1 overflow-y-auto relative flex flex-col ${isFullPage ? '' : 'px-8 py-8'}`}>
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`mx-auto w-full h-full ${isFullPage ? 'max-w-none' : 'max-w-7xl'}`}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
          <Footer />
        </div>
      </main>
    </div>
  )
}
