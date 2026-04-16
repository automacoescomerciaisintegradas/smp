"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"
import {
  Image,
  Video,
  LayoutGrid,
  Upload,
  X,
  Calendar,
  Send,
  Sparkles,
  Save,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Zap,
  Clock
} from "lucide-react"
import { CarouselPreview } from "@/components/publisher/CarouselPreview"
import { CaptionEditor } from "@/components/publisher/CaptionEditor"
import { MediaUploader } from "@/components/publisher/MediaUploader"
import { SchedulePicker } from "@/components/publisher/SchedulePicker"
import { appConfig } from "@/config/app-config"

type MediaType = "IMAGE" | "VIDEO" | "CAROUSEL"
type PostStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "FAILED"

interface MediaItem {
  id: string
  url: string
  mediaType: "IMAGE" | "VIDEO"
  order: number
}

export default function PublisherPage() {
  const [mediaType, setMediaType] = useState<MediaType>("IMAGE")
  const [caption, setCaption] = useState("")
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0)
  const [posts, setPosts] = useState<any[]>([])
  const [showPostsList, setShowPostsList] = useState(false)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      const response = await fetch("/api/posts?limit=20")
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error("Erro ao carregar posts:", error)
    }
  }

  const handleMediaUpload = (urls: { url: string; type: string }[]) => {
    const newItems: MediaItem[] = urls.map((item, index) => ({
      id: `temp-${Date.now()}-${index}`,
      url: item.url,
      mediaType: item.type.startsWith("video") ? "VIDEO" : "IMAGE",
      order: mediaItems.length + index,
    }))

    setMediaItems([...mediaItems, ...newItems])
    if (mediaType === "IMAGE" && mediaItems.length + newItems.length > 1) {
      setMediaType("CAROUSEL")
    }
  }

  const removeMediaItem = (id: string) => {
    const updated = mediaItems.filter((item) => item.id !== id).map((item, index) => ({
      ...item,
      order: index,
    }))
    setMediaItems(updated)
    if (mediaType === "CAROUSEL" && updated.length <= 1) {
      setMediaType("IMAGE")
    }
  }

  const generateCaptionWithAI = async () => {
    toast.loading(`IA ${appConfig.shortProductName} gerando legenda...`, { id: "ai-gen" })
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const captions = [
      `✨ Potencialize seus resultados com a automação inteligente do ${appConfig.productName}! 🚀\n\n👉 Clique no link da bio para saber mais.\n#VendasOnline #Automacao #Instagram`,
      "🎯 O futuro da criação de conteúdo chegou. A IA que realmente faz as coisas.\n\n✅ Eficiência Máxima\n✅ Escala Global\n✅ Controle Total\n\n#ShopeeEngine #MarketingDigital",
      `🔥 Automatize atendimento e comentários com o ${appConfig.productName}.\n\n🔗 Descubra como no link exclusivo.\n#InstagramAutomation #ComentarioAutomatico`,
    ]

    setCaption(captions[Math.floor(Math.random() * captions.length)])
    toast.dismiss("ai-gen")
    toast.success("Legenda otimizada gerada!")
  }

  const handleSave = async (postStatus: PostStatus) => {
    if (mediaType === "CAROUSEL" && mediaItems.length < 2) {
      toast.error("Carrossel requer pelo menos 2 mídias")
      return
    }
    if (mediaItems.length === 0) {
      toast.error("Adicione pelo menos 1 mídia")
      return
    }
    if (postStatus === "SCHEDULED" && !scheduledAt) {
      toast.error("Selecione uma data para agendar")
      return
    }

    setLoading(true)
    try {
      const payload = {
        caption,
        mediaType,
        mediaUrl: mediaItems.length === 1 ? mediaItems[0].url : undefined,
        mediaItems: mediaType === "CAROUSEL" ? mediaItems : undefined,
        scheduledAt: scheduledAt?.toISOString(),
        status: postStatus,
      }

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error("Erro ao salvar post")

      toast.success(postStatus === "DRAFT" ? "Rascunho salvo!" : "Post agendado!")
      resetForm()
      loadPosts()
    } catch (error) {
      toast.error("Erro na operação")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setMediaType("IMAGE")
    setCaption("")
    setMediaItems([])
    setScheduledAt(null)
    setActiveCarouselIndex(0)
  }

  return (
    <div className="space-y-10 min-h-screen bg-[#F9FAFB] p-8 -m-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-orange-50 rounded-xl border border-orange-100 shadow-sm">
                <Send className="text-[#E54D42]" size={24} />
             </div>
             <h1 className="text-3xl font-black tracking-tight text-[#111827]">Publisher</h1>
          </div>
          <p className="text-[#6B7280] font-medium mt-2">Crie, agende e publique com precisão cirúrgica.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-[#E5E7EB] shadow-sm">
           <button 
             onClick={() => setShowPostsList(false)}
             className={`px-6 py-2.5 rounded-lg font-bold text-[11px] uppercase tracking-widest transition-all ${!showPostsList ? 'bg-[#111827] text-white shadow-md' : 'text-[#6B7280]'}`}
           >
             Novo Post
           </button>
           <button 
             onClick={() => setShowPostsList(true)}
             className={`px-6 py-2.5 rounded-lg font-bold text-[11px] uppercase tracking-widest transition-all ${showPostsList ? 'bg-[#111827] text-white shadow-md' : 'text-[#6B7280]'}`}
           >
             Fila de Postagem ({posts.length})
           </button>
        </div>
      </header>

      {!showPostsList ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Media Type Selector */}
            <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-sm">
              <h3 className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-4">Escolha o Formato</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: "IMAGE" as MediaType, label: "Imagem Única", icon: Image },
                  { id: "VIDEO" as MediaType, label: "Vídeo / Reel", icon: Video },
                  { id: "CAROUSEL" as MediaType, label: "Carrossel Social", icon: LayoutGrid },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setMediaType(type.id)}
                    className={`flex flex-col items-center gap-3 p-6 rounded-2xl font-bold transition-all border ${
                      mediaType === type.id
                        ? "bg-orange-50 border-[#E54D42] text-[#E54D42] shadow-sm"
                        : "bg-white border-[#E5E7EB] text-[#6B7280] hover:border-orange-200 hover:bg-orange-50/30"
                    }`}
                  >
                    <type.icon size={20} />
                    <span className="text-[11px] uppercase tracking-tight">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Media Upload Area */}
            <div className="bg-white border border-[#E5E7EB] rounded-3xl p-8 shadow-sm">
              <h3 className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-6 px-1">Upload de Ativos</h3>
              <MediaUploader
                mediaType={mediaType}
                mediaItems={mediaItems}
                onUpload={handleMediaUpload}
                onRemove={removeMediaItem}
              />
              
              <AnimatePresence>
                {mediaItems.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 border-t border-[#F3F4F6] pt-8"
                  >
                    {mediaType === "CAROUSEL" ? (
                      <CarouselPreview
                        items={mediaItems}
                        activeIndex={activeCarouselIndex}
                        onIndexChange={setActiveCarouselIndex}
                      />
                    ) : (
                      <div className="relative group max-w-sm mx-auto">
                        <div className="aspect-square bg-[#F9FAFB] rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-inner flex items-center justify-center">
                          {mediaItems[0].mediaType === "IMAGE" ? (
                            <img src={mediaItems[0].url} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <video src={mediaItems[0].url} controls className="w-full h-full" />
                          )}
                        </div>
                        <button
                          onClick={() => removeMediaItem(mediaItems[0].id)}
                          className="absolute -top-3 -right-3 p-2 bg-white border border-[#E5E7EB] text-red-500 hover:bg-red-50 rounded-full shadow-lg transition-all"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Caption Editor */}
            <div className="bg-white border border-[#E5E7EB] rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest px-1">Composição da Legenda</h3>
                <button
                  onClick={generateCaptionWithAI}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-50 hover:bg-orange-100 text-[#E54D42] rounded-xl transition-all text-[11px] font-black uppercase tracking-widest border border-orange-100 shadow-sm"
                >
                  <Sparkles size={14} />
                  Otimizar com IA
                </button>
              </div>
              <CaptionEditor value={caption} onChange={setCaption} />
            </div>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            <section className="bg-white border border-[#E5E7EB] rounded-3xl p-8 shadow-sm">
              <h3 className="text-[10px] font-black text-[#111827] uppercase tracking-widest mb-6 flex items-center gap-2">
                <Calendar size={14} className="text-[#E54D42]" />
                Cronograma Meta
              </h3>
              <SchedulePicker value={scheduledAt} onChange={setScheduledAt} />
            </section>

            <section className="bg-[#111827] rounded-3xl p-8 shadow-xl text-white space-y-4">
               <h3 className="text-[10px] font-black text-[#E54D42] uppercase tracking-[0.2em] mb-6">Ações de Comando</h3>
               
               <button
                 onClick={() => handleSave("DRAFT")}
                 disabled={loading}
                 className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl font-bold transition-all text-xs uppercase tracking-widest"
               >
                 <Save size={18} />
                 Salvar Rascunho
               </button>

               <button
                 onClick={() => handleSave("SCHEDULED")}
                 disabled={loading || !scheduledAt}
                 className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#E54D42] hover:bg-[#D43D32] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold transition-all text-xs uppercase tracking-widest shadow-lg active:scale-95"
               >
                 <Clock size={18} />
                 Agendar Agora
               </button>

               <button
                 onClick={resetForm}
                 className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-transparent text-[#6B7280] hover:text-red-400 rounded-2xl font-bold transition-all text-[10px] uppercase tracking-widest"
               >
                 <Trash2 size={16} />
                 Limpar Sessão
               </button>

               <div className="pt-4 border-t border-white/10 mt-6">
                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                     <Zap size={16} className="text-[#E54D42]" />
                     <p className="text-[10px] font-medium text-slate-400 leading-relaxed uppercase tracking-tight">Sincronização Meta Graph v20.0 Ativa.</p>
                  </div>
               </div>
            </section>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-3xl overflow-hidden shadow-sm">
          <div className="p-8 border-b border-[#E5E7EB] flex items-center justify-between">
             <h2 className="text-xl font-bold text-[#111827]">Sua Fila de Conteúdo</h2>
             <span className="px-3 py-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[10px] font-black text-[#6B7280] uppercase tracking-widest">{posts.length} Ativos</span>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {posts.length === 0 ? (
              <div className="p-20 text-center space-y-4">
                 <Loader2 className="mx-auto text-[#E5E7EB]" size={48} />
                 <p className="text-[#6B7280] font-medium">Nenhum post encontrado na fila.</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="p-6 flex items-center justify-between hover:bg-[#F9FAFB] transition-all group">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-[#F3F4F6] rounded-xl overflow-hidden border border-[#E5E7EB]">
                       <img src={post.mediaUrl || (post.mediaItems?.[0]?.url)} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                    </div>
                    <div>
                       <div className="flex items-center gap-3 mb-1">
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#E54D42]">{post.mediaType}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                            post.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            post.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                            post.status === 'FAILED' ? 'bg-red-50 text-red-600 border-red-100' :
                            'bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]'
                          }`}>
                            {post.status}
                          </span>
                       </div>
                       <p className="text-[14px] font-bold text-[#111827] line-clamp-1">{post.caption || 'Sem legenda'}</p>
                       <p className="text-[11px] text-[#9CA3AF] mt-1 font-medium">{post.scheduledAt ? new Date(post.scheduledAt).toLocaleString('pt-BR') : 'Sem data'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                     <button className="p-3 bg-white border border-[#E5E7EB] rounded-xl text-[#6B7280] hover:text-[#E54D42] hover:border-orange-100 transition-all shadow-sm"><Trash2 size={18} /></button>
                     <button className="p-3 bg-[#111827] text-white rounded-xl hover:bg-[#E54D42] transition-all shadow-md"><Send size={18} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
