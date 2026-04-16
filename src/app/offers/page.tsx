"use client"

import { useState } from "react"
import {
  ShoppingBag,
  Link as LinkIcon,
  Sparkles,
  Plus,
  Trash2,
  ExternalLink,
  Tag,
  X,
  MessageCircle,
  Copy,
  Check,
  Image as ImageIcon,
  Palette,
  Type,
  Download,
  Send,
  Loader2,
  Zap,
  TrendingUp,
  Target
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Offer {
  id: string
  title: string
  price: number
  imageUrl: string
  affiliateUrl: string
  status: string
}

interface PostTemplate {
  id: string
  name: string
  platform: string
  icon: any
  gradient: string
}

const postTemplates: PostTemplate[] = [
  { id: "urgency", name: "Urgência", platform: "Instagram", icon: Send, gradient: "from-[#E54D42] to-[#FF8C00]" },
  { id: "promo", name: "Promoção Flash", platform: "Instagram", icon: Send, gradient: "from-[#111827] to-[#374151]" },
  { id: "launch", name: "Lançamento VIP", platform: "Instagram", icon: Sparkles, gradient: "from-[#E54D42] via-[#FF8C00] to-[#E54D42]" },
  { id: "tutorial", name: "Dica Especial", platform: "Instagram", icon: Palette, gradient: "from-[#F9FAFB] to-[#E5E7EB]" },
  { id: "review", name: "Review Real", platform: "WhatsApp", icon: MessageCircle, gradient: "from-[#10B981] to-[#059669]" },
]

const postCopies: Record<string, (offer: Offer) => string> = {
  urgency: (offer) => `🔥 URGENTE! Oferta Social Flow por tempo limitado!
  
${offer.title}
De R$ ${(offer.price * 1.5).toFixed(2)} por apenas R$ ${offer.price.toFixed(2)}!

⏰ Corre que o estoque está voando!
👇 Garanta o seu agora no link oficial:
${offer.affiliateUrl}

#SocialFlow #Oferta #ShopeeBrasil #Promoção`,

  launch: (offer) => `🚀 EXCLUSIVO: Automação que vende enquanto você dorme!

🎯 VOCÊ NÃO VAI ACREDITAR NO QUE O SOCIAL FLOW FAZ!

🛠️ O que essa função faz por você?
✅ Respostas automáticas para todos os comentários.
✅ DMs inteligentes com botões de compra.
✅ Funil de vendas direto no Instagram.

🎯 Comece agora sua transformação digital!
🔗 Link na bio: ${offer.affiliateUrl}

⏰ Só hoje! #SocialFlow #Automação #VendasOnline`,

  promo: (offer) => `💥 PROMOÇÃO RELÂMPAGO SOCIAL FLOW!

${offer.title}
✨ Apenas R$ ${offer.price.toFixed(2)}
🎁 Frete Grátis Liberado + Garantia ACI

📲 Aproveite o link direto agora:
${offer.affiliateUrl}

⚡ Válido enquanto durar o estoque! #Shopee #Promo #SocialFlow`,

  tutorial: (offer) => `🔥 VENDA NO PILOTO AUTOMÁTICO COM O SOCIAL FLOW! 🚀

É simples começar a lucrar mais hoje:

1️⃣ Selecione seu produto campeão.
2️⃣ Ative a resposta automática Social Flow.
3️⃣ Configure o funil de DM com seus links de afiliado.

🎯 Simples assim. Comece AGORA!
👇 Escolha seu plano:
${offer.affiliateUrl}

#Automação #VendasOnline #SocialFlow #SocialMediaPessoal`,

  review: (offer) => `⭐ Review Real: Aprovado pelo Social Flow!

${offer.title}
💰 Preço imbatível: R$ ${offer.price.toFixed(2)}
✅ Qualidade verificada por fco_de_queiroz
🚀 Entrega recorde no seu endereço

👉 Link direto de compra:
${offer.affiliateUrl}

Dúvidas? Mande um Direct! 😊`,
}

export default function ShopeeFlowPage() {
  const [url, setUrl] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [offers, setOffers] = useState<Offer[]>([])
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string>("urgency")
  const [copied, setCopied] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishStatus, setPublishStatus] = useState<"idle" | "success" | "error">("idle")
  const [publishMessage, setPublishMessage] = useState("")

  const handleProcessUrl = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setIsProcessing(true)
    try {
      const response = await fetch("/api/shopee-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });

      const result = await response.json();

      if (result.success) {
        setOffers([result.data, ...offers]);
        setUrl("");
      } else {
        alert(result.error || "Erro ao processar URL");
      }
    } catch (error) {
      alert("Erro de conexão");
    } finally {
      setIsProcessing(false)
    }
  }

  const openPostCreator = (offer: Offer) => {
    setSelectedOffer(offer)
    setSelectedTemplate("urgency")
    setPublishStatus("idle")
  }

  const closePostCreator = () => {
    setSelectedOffer(null)
  }

  const handleCopy = () => {
    if (!selectedOffer) return
    const copy = postCopies[selectedTemplate](selectedOffer)
    navigator.clipboard.writeText(copy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePublishToInstagram = async () => {
    if (!selectedOffer) return
    
    setIsPublishing(true)
    setPublishStatus("idle")
    setPublishMessage("")

    try {
      const caption = postCopies[selectedTemplate](selectedOffer)
      
      const response = await fetch("/api/ig-publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrls: [selectedOffer.imageUrl],
          caption: caption,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setPublishStatus("success")
        setPublishMessage(`Publicado com sucesso!`)
      } else {
        setPublishStatus("error")
        setPublishMessage(data.error || "Erro ao publicar")
      }
    } catch (error) {
      setPublishStatus("error")
      setPublishMessage("Erro de conexão ao publicar")
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="space-y-12 max-w-6xl mx-auto bg-[#F9FAFB] min-h-screen p-8 -m-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E5E7EB] pb-10">
        <div className="space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E54D42]/10 border border-[#E54D42]/20 text-[#E54D42]">
            <ShoppingBag size={14} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Shopee Flow Engine v2.0</span>
          </div>
          <h1 className="text-[40px] font-black tracking-tight text-[#111827] uppercase leading-none">Vendas Automáticas</h1>
          <p className="text-[#6B7280] text-[15px] font-medium max-w-lg leading-relaxed">Converta links da Shopee em anúncios de alta performance em segundos.</p>
        </div>

        <div className="flex bg-white p-1 rounded-[8px] border border-[#E5E7EB] shadow-sm">
          <button className="px-6 py-2.5 bg-[#111827] text-white rounded-[6px] font-bold text-[11px] uppercase tracking-widest shadow-lg transition-all">Sessão Ativa</button>
          <button className="px-6 py-2.5 text-[#6B7280] hover:text-[#E54D42] transition-colors font-bold text-[11px] uppercase tracking-widest">Histórico</button>
        </div>
      </header>

      {/* URL Input Area */}
      <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-8 shadow-sm">
        <form onSubmit={handleProcessUrl} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Cole o link do produto Shopee aqui..."
              className="w-full bg-[#F9FAFB] border border-[#E5E7EB] focus:border-[#E54D42]/30 rounded-[8px] px-12 py-4 outline-none transition-all placeholder:text-[#9CA3AF] text-[15px] font-medium text-[#111827]"
            />
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={20} />
          </div>
          <button
            type="submit"
            disabled={isProcessing}
            className="bg-[#E54D42] hover:bg-[#D43D32] disabled:opacity-50 text-white px-10 py-4 rounded-[6px] font-bold text-[12px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg whitespace-nowrap"
          >
            {isProcessing ? (
               <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <Zap size={18} />
                Gerar Oferta
              </>
            )}
          </button>
        </form>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {offers.map((offer) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="group bg-white border border-[#E5E7EB] rounded-[8px] overflow-hidden hover:border-[#E54D42]/30 transition-all shadow-sm hover:shadow-xl hover:shadow-[#111827]/5"
            >
              <div className="aspect-square bg-[#F9FAFB] relative overflow-hidden">
                <img src={offer.imageUrl} alt={offer.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-4 right-4">
                  <button className="p-2 bg-white/90 backdrop-blur-md rounded-[6px] text-[#E54D42] hover:bg-[#E54D42] hover:text-white transition-all shadow-sm">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <h3 className="font-bold text-[#111827] text-[16px] line-clamp-1 truncate uppercase tracking-tight">{offer.title}</h3>
                  <div className="flex items-center gap-2 text-[#E54D42] font-black text-[24px]">
                    <Tag size={20} />
                    R$ {offer.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#F3F4F6]">
                  <button
                    onClick={() => openPostCreator(offer)}
                    className="w-full py-4 bg-[#111827] text-white rounded-[6px] font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-[#1f2937] transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    <Sparkles size={16} />
                    Criar Post Criativo
                  </button>
                  <a
                    href={offer.affiliateUrl}
                    target="_blank"
                    className="w-full py-3 text-[#6B7280] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] font-bold text-[11px] uppercase tracking-widest hover:bg-[#F3F4F6] transition-all flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={16} />
                    Link de Afiliado
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {offers.length === 0 && !isProcessing && (
          <div className="col-span-full py-24 text-center space-y-6 bg-white border border-dashed border-[#E5E7EB] rounded-[8px]">
            <div className="w-20 h-20 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px] flex items-center justify-center mx-auto text-[#9CA3AF]">
               <ShoppingBag size={32} />
            </div>
            <div className="space-y-2">
              <p className="text-[#111827] font-black uppercase text-[14px] tracking-widest">Nenhuma oferta gerada</p>
              <p className="text-[#6B7280] text-[12px] font-medium">Cole o link de um produto Shopee para iniciar o fluxo.</p>
            </div>
          </div>
        )}
      </div>

      {/* Post Creator Modal */}
      <AnimatePresence>
        {selectedOffer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#111827]/60 backdrop-blur-md z-50 flex items-center justify-center p-6"
            onClick={closePostCreator}
          >
            <motion.div
              initial={{ scale: 0.98, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.98, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-[#E5E7EB] rounded-[12px] w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl shadow-black/20"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-8 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-[#E54D42]/10 rounded-[6px] text-[#E54D42]">
                      <Sparkles size={24} />
                   </div>
                   <div>
                      <h2 className="text-[20px] font-black text-[#111827] uppercase tracking-tight">Post Criativo</h2>
                      <p className="text-[#6B7280] text-[12px] font-medium font-mono truncate max-w-sm mt-0.5">{selectedOffer.title}</p>
                   </div>
                </div>
                <button onClick={closePostCreator} className="p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] hover:bg-[#F3F4F6] rounded-full transition-all">
                  <X size={20} className="text-[#111827]" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-10">
                {/* Left Column - Controls */}
                <div className="space-y-8">
                  <div>
                    <h3 className="text-[11px] font-black text-[#111827] uppercase tracking-widest mb-6 flex items-center gap-2">
                       Estratégia do Post
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {postTemplates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => setSelectedTemplate(template.id)}
                          className={`p-5 rounded-[8px] border transition-all text-left group ${
                            selectedTemplate === template.id
                              ? "border-[#E54D42] bg-[#E54D42]/5 ring-1 ring-[#E54D42]/20"
                              : "border-[#E5E7EB] hover:border-[#E54D42]/30 bg-white"
                          }`}
                        >
                          <div className={`w-full h-12 rounded-[4px] bg-gradient-to-br ${template.gradient} mb-4 flex items-center justify-center shadow-lg shadow-black/5`}>
                            <template.icon size={20} className="text-white" />
                          </div>
                          <p className={`text-[12px] font-bold uppercase tracking-tight ${selectedTemplate === template.id ? 'text-[#E54D42]' : 'text-[#111827]'}`}>{template.name}</p>
                          <p className="text-[10px] text-[#9CA3AF] uppercase font-bold mt-1 tracking-tighter">{template.platform}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[11px] font-black text-[#111827] uppercase tracking-widest mb-4 flex items-center gap-2">
                       Copy Otimizada Social Flow
                    </h3>
                    <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] p-6 shadow-inner">
                      <pre className="text-[13px] text-[#111827] whitespace-pre-wrap font-medium leading-relaxed">
                        {postCopies[selectedTemplate](selectedOffer)}
                      </pre>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <button onClick={handleCopy} className="py-4 bg-white border border-[#E5E7EB] text-[#111827] rounded-[6px] font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#F9FAFB] transition-all">
                          {copied ? <><Check size={16} className="text-[#10B981]" /> Copiado</> : <><Copy size={16} /> Copiar Copy</>}
                        </button>
                        <button onClick={handlePublishToInstagram} disabled={isPublishing} className="py-4 bg-[#E54D42] text-white rounded-[6px] font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#D43D32] transition-all shadow-lg active:scale-95 disabled:opacity-50">
                          {isPublishing ? <Loader2 size={16} className="animate-spin" /> : <><Send size={16} /> Publicar Agora</>}
                        </button>
                    </div>

                    {publishStatus !== "idle" && (
                      <div className={`mt-4 p-4 rounded-[6px] border ${publishStatus === "success" ? "bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]" : "bg-[#E54D42]/10 border-[#E54D42]/30 text-[#E54D42]"} text-[12px] font-bold flex items-center gap-2`}>
                        {publishStatus === "success" ? <Check size={14} /> : <X size={14} />}
                        {publishMessage}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Preview */}
                <div className="space-y-6">
                  <h3 className="text-[11px] font-black text-[#111827] uppercase tracking-widest mb-6">Preview Instagram</h3>
                  
                  <div className="bg-black rounded-[8px] overflow-hidden shadow-2xl max-w-[340px] mx-auto border border-[#E5E7EB]">
                      <div className="flex items-center gap-3 p-4 bg-white border-b border-[#F3F4F6]">
                         <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E54D42] to-[#FF8C00] flex items-center justify-center text-white text-[10px] font-bold">SF</div>
                         <div>
                            <p className="text-[12px] font-bold text-[#111827]">socialmediapessoal</p>
                            <p className="text-[10px] text-[#9CA3AF] uppercase font-bold tracking-tighter">Patrocinado</p>
                         </div>
                      </div>
                      <div className="aspect-square bg-[#F9FAFB] relative flex items-center justify-center">
                         <img src={selectedOffer.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="p-4 bg-white text-[#111827]">
                         <p className="text-[13px] leading-relaxed line-clamp-4">
                            <span className="font-bold mr-2">socialmediapessoal</span>
                            {postCopies[selectedTemplate](selectedOffer)}
                         </p>
                         <div className="flex items-center justify-between pt-4 border-t border-[#F3F4F6] mt-4">
                            <div className="flex gap-4">
                               <TrendingUp size={18} className="text-[#6B7280]" />
                               <MessageCircle size={18} className="text-[#6B7280]" />
                               <Send size={18} className="text-[#6B7280]" />
                            </div>
                            <Target size={18} className="text-[#6B7280]" />
                         </div>
                      </div>
                  </div>

                  <div className="p-6 bg-[#F3F4F6] rounded-[8px] text-center">
                     <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-widest">A ferramenta de automação Social Flow gera posts baseados em dados de conversão reais.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
