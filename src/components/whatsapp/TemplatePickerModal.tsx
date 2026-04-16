"use client"

import { useState } from "react"
import { X, Send } from "lucide-react"
import toast from "react-hot-toast"

interface TemplatePickerModalProps {
  contactPhone: string
  onClose: () => void
  onSent: () => void
}

export function TemplatePickerModal({ contactPhone, onClose, onSent }: TemplatePickerModalProps) {
  const [templateName, setTemplateName] = useState("")
  const [language, setLanguage] = useState("pt_BR")
  const [params, setParams] = useState<string[]>([""])
  const [sending, setSending] = useState(false)

  function addParam() {
    setParams([...params, ""])
  }

  function updateParam(index: number, value: string) {
    const updated = [...params]
    updated[index] = value
    setParams(updated)
  }

  function removeParam(index: number) {
    setParams(params.filter((_, i) => i !== index))
  }

  async function handleSend() {
    if (!templateName.trim()) {
      toast.error("Nome do template é obrigatório")
      return
    }

    setSending(true)
    try {
      const filledParams = params.filter((p) => p.trim())
      const components = filledParams.length > 0
        ? [{ type: "body", parameters: filledParams.map((text) => ({ type: "text", text })) }]
        : undefined

      const res = await fetch("/api/whatsapp/template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: contactPhone, templateName, language, components }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success("Template enviado!")
        onSent()
        onClose()
      } else {
        toast.error(json.error?.message || "Erro ao enviar template")
      }
    } catch {
      toast.error("Erro ao enviar template")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-[16px] font-bold text-[#111827]">Enviar Template</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F3F4F6] transition-colors">
            <X size={18} className="text-[#6B7280]" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wide">Nome do Template</label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="hello_world"
              className="w-full mt-1 px-3 py-2 text-[14px] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E54D42]/20 focus:border-[#E54D42]"
            />
          </div>

          <div>
            <label className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wide">Idioma</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-[14px] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E54D42]/20 focus:border-[#E54D42]"
            >
              <option value="pt_BR">Portugues (BR)</option>
              <option value="en_US">English (US)</option>
              <option value="es">Espanol</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wide">Parametros</label>
              <button onClick={addParam} className="text-[12px] text-[#E54D42] font-medium hover:underline">
                + Adicionar
              </button>
            </div>
            {params.map((p, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <span className="text-[12px] text-[#9CA3AF] w-6">{`{{${i + 1}}}`}</span>
                <input
                  type="text"
                  value={p}
                  onChange={(e) => updateParam(i, e.target.value)}
                  placeholder={`Valor do parametro ${i + 1}`}
                  className="flex-1 px-3 py-1.5 text-[13px] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E54D42]/20 focus:border-[#E54D42]"
                />
                {params.length > 1 && (
                  <button onClick={() => removeParam(i)} className="text-[#9CA3AF] hover:text-[#991B1B]">
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-[#E5E7EB]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[14px] font-medium text-[#6B7280] rounded-lg hover:bg-[#F3F4F6] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !templateName.trim()}
            className="flex items-center gap-2 px-4 py-2 text-[14px] font-medium text-white bg-[#E54D42] rounded-lg hover:bg-[#D43D32] transition-colors disabled:opacity-50"
          >
            <Send size={14} />
            {sending ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  )
}
