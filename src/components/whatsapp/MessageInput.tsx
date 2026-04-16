"use client"

import { useState, useRef } from "react"
import { Send, Paperclip, FileText, CreditCard, Smile } from "lucide-react"
import toast from "react-hot-toast"

interface MessageInputProps {
  conversationId: string
  contactPhone: string
  onMessageSent: () => void
  onOpenTemplateModal: () => void
  onOpenPixModal: () => void
}

export function MessageInput({
  conversationId,
  contactPhone,
  onMessageSent,
  onOpenTemplateModal,
  onOpenPixModal,
}: MessageInputProps) {
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleSend() {
    if (!text.trim() || sending) return

    setSending(true)
    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "text", to: contactPhone, text: text.trim() }),
      })
      const json = await res.json()
      if (json.success) {
        setText("")
        onMessageSent()
      } else {
        toast.error(json.error?.message || "Erro ao enviar mensagem")
      }
    } catch (err) {
      toast.error("Erro ao enviar mensagem")
    } finally {
      setSending(false)
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setSending(true)
    try {
      // Upload file first
      const formData = new FormData()
      formData.append("file", file)

      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
      const uploadJson = await uploadRes.json()

      if (!uploadRes.ok) {
        toast.error("Erro ao fazer upload do arquivo")
        return
      }

      const mediaUrl = uploadJson.url || uploadJson.data?.url
      const mimeType = file.type
      let mediaType = "document"
      if (mimeType.startsWith("image/")) mediaType = "image"
      else if (mimeType.startsWith("video/")) mediaType = "video"
      else if (mimeType.startsWith("audio/")) mediaType = "audio"

      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "media",
          to: contactPhone,
          mediaType,
          mediaUrl,
          filename: file.name,
        }),
      })
      const json = await res.json()
      if (json.success) {
        onMessageSent()
        toast.success("Mídia enviada!")
      } else {
        toast.error(json.error?.message || "Erro ao enviar mídia")
      }
    } catch (err) {
      toast.error("Erro ao enviar arquivo")
    } finally {
      setSending(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-[#E5E7EB] bg-white px-4 py-3">
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-lg hover:bg-[#F3F4F6] transition-colors text-[#6B7280] hover:text-[#111827]"
          title="Anexar arquivo"
        >
          <Paperclip size={18} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
          onChange={handleFileUpload}
        />
        <button
          onClick={onOpenTemplateModal}
          className="p-2 rounded-lg hover:bg-[#F3F4F6] transition-colors text-[#6B7280] hover:text-[#111827]"
          title="Enviar template"
        >
          <FileText size={18} />
        </button>
        <button
          onClick={onOpenPixModal}
          className="p-2 rounded-lg hover:bg-[#F3F4F6] transition-colors text-[#6B7280] hover:text-[#111827]"
          title="Enviar pedido PIX"
        >
          <CreditCard size={18} />
        </button>
      </div>

      <div className="flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite uma mensagem..."
          rows={1}
          className="flex-1 px-4 py-2.5 text-[14px] bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#E54D42]/20 focus:border-[#E54D42] max-h-[120px]"
          style={{ minHeight: "40px" }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="p-2.5 bg-[#E54D42] text-white rounded-xl hover:bg-[#D43D32] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
