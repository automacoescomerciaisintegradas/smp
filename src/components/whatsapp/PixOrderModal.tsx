"use client"

import { useState } from "react"
import { X, CreditCard, Plus, Trash2 } from "lucide-react"
import toast from "react-hot-toast"

interface PixOrderModalProps {
  contactPhone: string
  onClose: () => void
  onSent: () => void
}

interface OrderItem {
  name: string
  quantity: number
  price: string // stored as string for input, converted to cents
}

export function PixOrderModal({ contactPhone, onClose, onSent }: PixOrderModalProps) {
  const [referenceId, setReferenceId] = useState("")
  const [merchantName, setMerchantName] = useState("")
  const [pixKey, setPixKey] = useState("")
  const [pixKeyType, setPixKeyType] = useState<"EVP" | "CPF" | "CNPJ" | "EMAIL" | "PHONE">("CNPJ")
  const [pixCode, setPixCode] = useState("")
  const [items, setItems] = useState<OrderItem[]>([{ name: "", quantity: 1, price: "" }])
  const [sending, setSending] = useState(false)

  function addItem() {
    setItems([...items, { name: "", quantity: 1, price: "" }])
  }

  function removeItem(index: number) {
    if (items.length <= 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  function updateItem(index: number, field: keyof OrderItem, value: string | number) {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  function priceToCents(price: string): number {
    const num = parseFloat(price.replace(",", "."))
    return isNaN(num) ? 0 : Math.round(num * 100)
  }

  async function handleSend() {
    if (!referenceId.trim() || !merchantName.trim() || !pixKey.trim() || !pixCode.trim()) {
      toast.error("Preencha todos os campos obrigatorios")
      return
    }

    const validItems = items.filter((item) => item.name.trim() && priceToCents(item.price) > 0)
    if (validItems.length === 0) {
      toast.error("Adicione pelo menos um item valido")
      return
    }

    setSending(true)
    try {
      const res = await fetch("/api/whatsapp/pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: contactPhone,
          referenceId,
          merchantName,
          pixKey,
          pixKeyType,
          pixCode,
          items: validItems.map((item, i) => ({
            retailer_id: `item_${i + 1}`,
            name: item.name,
            quantity: item.quantity,
            amount: { value: priceToCents(item.price), offset: 100 },
          })),
        }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success("Pedido PIX enviado!")
        onSent()
        onClose()
      } else {
        toast.error(json.error?.message || "Erro ao enviar pedido PIX")
      }
    } catch {
      toast.error("Erro ao enviar pedido PIX")
    } finally {
      setSending(false)
    }
  }

  const total = items.reduce((sum, item) => sum + priceToCents(item.price) * item.quantity, 0) / 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB] sticky top-0 bg-white z-10">
          <h3 className="text-[16px] font-bold text-[#111827]">Enviar Pedido PIX</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F3F4F6] transition-colors">
            <X size={18} className="text-[#6B7280]" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wide">ID Referencia</label>
              <input
                type="text"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                placeholder="pedido-001"
                className="w-full mt-1 px-3 py-2 text-[14px] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E54D42]/20 focus:border-[#E54D42]"
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wide">Nome do Comerciante</label>
              <input
                type="text"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                placeholder="Minha Loja"
                className="w-full mt-1 px-3 py-2 text-[14px] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E54D42]/20 focus:border-[#E54D42]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wide">Chave PIX</label>
              <input
                type="text"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder="12345678000199"
                className="w-full mt-1 px-3 py-2 text-[14px] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E54D42]/20 focus:border-[#E54D42]"
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wide">Tipo da Chave</label>
              <select
                value={pixKeyType}
                onChange={(e) => setPixKeyType(e.target.value as typeof pixKeyType)}
                className="w-full mt-1 px-3 py-2 text-[14px] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E54D42]/20 focus:border-[#E54D42]"
              >
                <option value="CNPJ">CNPJ</option>
                <option value="CPF">CPF</option>
                <option value="EMAIL">Email</option>
                <option value="PHONE">Telefone</option>
                <option value="EVP">Chave Aleatoria</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wide">Codigo PIX (copia e cola)</label>
            <textarea
              value={pixCode}
              onChange={(e) => setPixCode(e.target.value)}
              placeholder="00020101021226700014br.gov.bcb.pix..."
              rows={2}
              className="w-full mt-1 px-3 py-2 text-[13px] font-mono border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E54D42]/20 focus:border-[#E54D42] resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wide">Itens do Pedido</label>
              <button onClick={addItem} className="flex items-center gap-1 text-[12px] text-[#E54D42] font-medium hover:underline">
                <Plus size={12} /> Adicionar item
              </button>
            </div>
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(i, "name", e.target.value)}
                  placeholder="Nome do item"
                  className="flex-1 px-3 py-1.5 text-[13px] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E54D42]/20 focus:border-[#E54D42]"
                />
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(i, "quantity", parseInt(e.target.value) || 1)}
                  min={1}
                  className="w-16 px-2 py-1.5 text-[13px] text-center border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E54D42]/20 focus:border-[#E54D42]"
                />
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[12px] text-[#9CA3AF]">R$</span>
                  <input
                    type="text"
                    value={item.price}
                    onChange={(e) => updateItem(i, "price", e.target.value)}
                    placeholder="0,00"
                    className="w-24 pl-8 pr-2 py-1.5 text-[13px] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E54D42]/20 focus:border-[#E54D42]"
                  />
                </div>
                {items.length > 1 && (
                  <button onClick={() => removeItem(i)} className="p-1 text-[#9CA3AF] hover:text-[#991B1B]">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {total > 0 && (
            <div className="flex items-center justify-between px-3 py-2 bg-[#F3F4F6] rounded-lg">
              <span className="text-[14px] font-medium text-[#111827]">Total</span>
              <span className="text-[16px] font-bold text-[#E54D42]">
                R$ {total.toFixed(2).replace(".", ",")}
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-[#E5E7EB] sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[14px] font-medium text-[#6B7280] rounded-lg hover:bg-[#F3F4F6] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={sending}
            className="flex items-center gap-2 px-4 py-2 text-[14px] font-medium text-white bg-[#E54D42] rounded-lg hover:bg-[#D43D32] transition-colors disabled:opacity-50"
          >
            <CreditCard size={14} />
            {sending ? "Enviando..." : "Enviar PIX"}
          </button>
        </div>
      </div>
    </div>
  )
}
