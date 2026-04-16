"use client"

import { Check, CheckCheck, Clock, AlertCircle, Download, Play } from "lucide-react"

interface MessageBubbleProps {
  direction: "inbound" | "outbound"
  type: string
  content: string
  mediaUrl?: string | null
  status: string
  createdAt: string
  metadata?: string | null
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "pending":
      return <Clock size={14} className="text-[#9CA3AF]" />
    case "sent":
      return <Check size={14} className="text-[#6B7280]" />
    case "delivered":
      return <CheckCheck size={14} className="text-[#6B7280]" />
    case "read":
      return <CheckCheck size={14} className="text-[#10B981]" />
    case "failed":
      return <AlertCircle size={14} className="text-[#991B1B]" />
    default:
      return null
  }
}

function MediaContent({ type, mediaUrl, content }: { type: string; mediaUrl?: string | null; content: string }) {
  if (!mediaUrl) return null

  switch (type) {
    case "image":
      return (
        <div className="mb-1">
          <img src={mediaUrl} alt={content || "Imagem"} className="max-w-[280px] rounded-lg" />
          {content && <p className="mt-1 text-[13px]">{content}</p>}
        </div>
      )
    case "video":
      return (
        <div className="mb-1">
          <div className="relative max-w-[280px] rounded-lg overflow-hidden bg-black/10">
            <video src={mediaUrl} className="w-full rounded-lg" controls />
          </div>
          {content && <p className="mt-1 text-[13px]">{content}</p>}
        </div>
      )
    case "audio":
      return (
        <div className="mb-1">
          <audio src={mediaUrl} controls className="max-w-[240px]" />
        </div>
      )
    case "document":
      return (
        <a
          href={mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 bg-black/5 rounded-lg mb-1 hover:bg-black/10 transition-colors"
        >
          <Download size={16} />
          <span className="text-[13px] truncate max-w-[200px]">{content || "Documento"}</span>
        </a>
      )
    default:
      return null
  }
}

export function MessageBubble({ direction, type, content, mediaUrl, status, createdAt, metadata }: MessageBubbleProps) {
  const isOutbound = direction === "outbound"
  const time = new Date(createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })

  const parsedMeta = metadata ? (() => { try { return JSON.parse(metadata) } catch { return null } })() : null

  return (
    <div className={`flex ${isOutbound ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-[70%] px-3 py-2 rounded-xl shadow-sm ${
          isOutbound
            ? "bg-[#111827] text-white rounded-tr-none"
            : "bg-white text-[#111827] border border-[#E5E7EB] rounded-tl-none"
        }`}
      >
        {type === "template" && parsedMeta?.templateName && (
          <div className={`text-[11px] font-medium mb-1 ${isOutbound ? "text-[#9CA3AF]" : "text-[#6B7280]"}`}>
            Template: {parsedMeta.templateName}
          </div>
        )}

        {type === "interactive" && (
          <div className={`text-[11px] font-medium mb-1 ${isOutbound ? "text-[#9CA3AF]" : "text-[#6B7280]"}`}>
            Mensagem interativa
          </div>
        )}

        {["image", "video", "audio", "document"].includes(type) ? (
          <MediaContent type={type} mediaUrl={mediaUrl} content={content} />
        ) : (
          <p className="text-[14px] whitespace-pre-wrap break-words">{content}</p>
        )}

        <div className={`flex items-center justify-end gap-1 mt-1 ${isOutbound ? "text-[#9CA3AF]" : "text-[#9CA3AF]"}`}>
          <span className="text-[11px]">{time}</span>
          {isOutbound && <StatusIcon status={status} />}
        </div>
      </div>
    </div>
  )
}
