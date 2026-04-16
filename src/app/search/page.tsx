"use client"

import { useState } from "react"
import { Search as SearchIcon, Sparkles, Filter, Video, Image as ImageIcon, FileText, ChevronRight, Target } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { appConfig } from "@/config/app-config"

type SearchResult = {
  id: string
  content_type?: string | null
  content_body?: string | null
  asset_url?: string | null
  relevance: number
  tags?: string[]
}

export default function SemanticSearchPage() {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsSearching(true)
    setError(null)
    setWarning(null)
    setHasSearched(true)

    try {
      const res = await fetch("/api/vectors/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Falha ao executar a busca inteligente.")
      }

      setResults(Array.isArray(data.results) ? data.results : [])
      setWarning(typeof data.warning === "string" ? data.warning : null)
    } catch (error) {
      console.error("Erro na busca:", error)
      setResults([])
      setError(error instanceof Error ? error.message : "Falha ao executar a busca inteligente.")
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="space-y-12 max-w-5xl mx-auto bg-[#F9FAFB] min-h-screen p-8 -m-8">
      <header className="text-center space-y-6 pt-8 pb-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E54D42]/10 border border-[#E54D42]/20 text-[#E54D42]"
        >
          <Sparkles size={14} />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Motor semântico {appConfig.shortProductName}</span>
        </motion.div>
        <h1 className="text-[40px] md:text-[48px] font-black tracking-tight text-[#111827] uppercase leading-tight font-display">
          Busca Inteligente
        </h1>
        <p className="text-[#6B7280] text-[16px] font-medium max-w-2xl mx-auto leading-relaxed">
          Encontre ativos de mídia, tendências e insights pesquisando pelo <span className="text-[#111827] font-bold">conceito</span>, não apenas por palavras-chave.
        </p>
      </header>

      {/* Search Bar Container */}
      <div className="relative group max-w-3xl mx-auto">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex: 'Vídeos de bastidores com iluminação quente'..."
            className={`w-full bg-white border-2 rounded-[12px] px-16 py-6 text-[18px] font-medium transition-all outline-none placeholder:text-[#9CA3AF] text-[#111827] shadow-xl shadow-[#111827]/5 ${isSearching ? 'border-[#E54D42] ring-4 ring-[#E54D42]/5' : 'border-[#E5E7EB] focus:border-[#E54D42]/30'}`}
            disabled={isSearching}
          />
          <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={24} />
          <button 
            type="submit"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#111827] hover:bg-[#1f2937] text-white px-8 py-3.5 rounded-[8px] font-bold text-[12px] uppercase tracking-widest transition-all active:scale-95 shadow-lg"
          >
            {isSearching ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Pesquisar"}
          </button>
        </form>
      </div>

      {/* Results Area */}
      <div className="space-y-8 pb-20">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
          <h2 className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.2em] flex items-center gap-2">
            <Target size={14} className="text-[#E54D42]" />
            {results.length > 0 ? `Encontrados ${results.length} ativos` : "Sugestões de Ativos Populares"}
          </h2>
          <button className="flex items-center gap-2 text-[11px] font-bold text-[#6B7280] hover:text-[#E54D42] transition-colors uppercase tracking-widest">
            <Filter size={14} />
            Tipos de Mídia
          </button>
        </div>

        {error ? (
          <div className="rounded-[8px] border border-[#E54D42]/20 bg-[#E54D42]/5 px-4 py-3 text-[14px] text-[#991B1B]">
            {error}
          </div>
        ) : null}

        {warning ? (
          <div className="rounded-[8px] border border-[#F59E0B]/20 bg-[#F59E0B]/5 px-4 py-3 text-[14px] text-[#92400E]">
            {warning}
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {results.length > 0 ? (
              results.map((item, index) => (
                <ResultCard key={item.id} item={item} index={index} />
              ))
            ) : hasSearched ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="col-span-full rounded-[12px] border border-[#E5E7EB] bg-white p-10 text-center shadow-sm"
              >
                <p className="text-[18px] font-bold text-[#111827]">Nenhum ativo encontrado</p>
                <p className="mt-3 text-[14px] leading-relaxed text-[#6B7280]">
                  Tente descrever melhor o conceito, formato ou contexto desejado para ampliar a busca.
                </p>
              </motion.div>
            ) : (
              // Empty initial state placeholders
              [1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-white border border-[#E5E7EB] rounded-[8px] animate-pulse shadow-sm flex items-center justify-center">
                   <ImageIcon size={32} className="text-[#F3F4F6]" />
                </div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function ResultCard({ item, index }: { item: SearchResult; index: number }) {
  const Icon = item.content_type === "video" ? Video : item.content_type === "image" ? ImageIcon : FileText

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group bg-white border border-[#E5E7EB] rounded-[8px] overflow-hidden hover:border-[#E54D42]/30 transition-all cursor-pointer shadow-sm hover:shadow-xl hover:shadow-[#111827]/5"
    >
      <div className="aspect-video bg-[#F9FAFB] relative overflow-hidden">
        {item.asset_url ? (
          <img src={item.asset_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#E5E7EB]">
            <Icon size={48} />
          </div>
        )}
        <div className="absolute top-4 left-4">
           <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md border border-[#E5E7EB] rounded-[4px] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm">
              <Icon size={12} className="text-[#E54D42]" />
              {item.content_type}
           </span>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <p className="text-[14px] font-medium text-[#111827] line-clamp-2 leading-relaxed">{item.content_body}</p>
        <div className="flex items-center justify-between pt-2 border-t border-[#F3F4F6]">
           <span className="text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded-[4px] uppercase tracking-tighter">
              Aderência: {(item.relevance * 100).toFixed(0)}%
           </span>
           <div className="p-1.5 bg-[#F3F4F6] rounded-full group-hover:bg-[#E54D42]/10 group-hover:text-[#E54D42] transition-all">
             <ChevronRight size={14} />
           </div>
        </div>
      </div>
    </motion.div>
  )
}
