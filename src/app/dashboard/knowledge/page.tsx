"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { BookOpen, Plus, Trash2, Save, FileText, Loader2, Search } from "lucide-react"
import toast from "react-hot-toast"

interface KnowledgeItem {
  id: string
  title: string
  content: string
  updatedAt: string
}

export default function KnowledgeBasePage() {
  const [items, setItems] = useState<KnowledgeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [search, setSearch] = useState("")

  // Form state
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/knowledge")
      if (!res.ok) throw new Error("Falha ao carregar dados")
      const data = await res.json()
      setItems(data)
    } catch (err) {
      toast.error("Erro ao carregar base de conhecimento")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !content) return
    setIsSaving(true)
    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content })
      })
      if (!res.ok) throw new Error("Erro ao salvar")
      toast.success("Informação adicionada à base!")
      setTitle("")
      setContent("")
      setIsAdding(false)
      fetchItems()
    } catch (err) {
      toast.error("Erro ao salvar")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta informação da base?")) return
    try {
      const res = await fetch(`/api/knowledge?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Erro ao excluir")
      toast.success("Removido com sucesso")
      fetchItems()
    } catch (err) {
      toast.error("Erro ao excluir")
    }
  }

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase()) || 
    item.content.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-10 min-h-screen bg-[#F9FAFB] p-8 -m-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100 shadow-sm">
                <BookOpen className="text-blue-600" size={24} />
             </div>
             <h1 className="text-3xl font-black tracking-tight text-[#111827]">Base de Conhecimento</h1>
          </div>
          <p className="text-[#6B7280] font-medium mt-2">Treine sua IA com informações específicas do seu negócio.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-8 py-3.5 bg-[#111827] hover:bg-black text-white rounded-2xl font-bold text-sm transition-all shadow-md active:scale-95"
        >
          {isAdding ? "Fechar" : <><Plus size={18} /> Adicionar Info</>}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor / Form */}
        <div className={`lg:col-span-2 space-y-6 ${isAdding ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[#111827] mb-6 flex items-center gap-2">
              <FileText className="text-blue-600" size={20} />
              {isAdding ? "Nova Informação" : "Central de Inteligência"}
            </h2>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-[#6B7280]">Título do Tópico</label>
                <input 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Política de Reembolso, Horário de Atendimento..."
                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-5 py-4 text-sm font-bold text-[#111827] focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-[#6B7280]">Conteúdo Detalhado</label>
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  placeholder="Descreva aqui as informações que a IA deve saber..."
                  className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-5 py-4 text-sm font-medium text-[#111827] focus:outline-none focus:border-blue-500 transition-all resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={isSaving || !title || !content}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-2xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Salvar na Base de Conhecimento</>}
              </button>
            </form>
          </div>
        </div>

        {/* List of Knowledge */}
        <div className="space-y-6">
          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-sm flex flex-col h-full max-h-[700px]">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={16} />
              <input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar na base..."
                className="w-full bg-[#F3F4F6] border border-transparent focus:bg-white focus:border-blue-300 rounded-xl pl-11 pr-4 py-3 text-xs font-bold text-[#111827] transition-all"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" /></div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-10">
                  <BookOpen size={32} className="mx-auto text-[#D1D5DB] mb-3" />
                  <p className="text-xs font-bold text-[#6B7280]">Nenhuma informação encontrada.</p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div key={item.id} className="group p-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] hover:border-blue-500 hover:bg-white transition-all">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="text-sm font-bold text-[#111827]">{item.title}</h3>
                       <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-[#9CA3AF] hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                       >
                         <Trash2 size={14} />
                       </button>
                    </div>
                    <p className="text-xs text-[#6B7280] line-clamp-3 leading-relaxed">{item.content}</p>
                    <div className="mt-3 pt-3 border-t border-[#E5E7EB] flex justify-between items-center">
                       <span className="text-[10px] font-bold text-[#9CA3AF] uppercase">Atualizado em {new Date(item.updatedAt).toLocaleDateString()}</span>
                       <span className="w-2 h-2 rounded-full bg-blue-500" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
