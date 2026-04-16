'use client'

import { useState, useRef } from 'react'

interface CaptionEditorProps {
  value: string
  onChange: (value: string) => void
  maxLength?: number
}

export function CaptionEditor({ value, onChange, maxLength = 2200 }: CaptionEditorProps) {
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const characterCount = value.length
  const remaining = maxLength - characterCount

  const insertHashtag = () => {
    const hashtag = prompt('Digite a hashtag:')
    if (hashtag) {
      const formattedHashtag = hashtag.startsWith('#') ? hashtag : `#${hashtag}`
      onChange(value + (value.endsWith('\n') || value === '' ? '' : ' ') + formattedHashtag)
    }
  }

  const insertEmoji = (emoji: string) => {
    onChange(value + emoji)
    textareaRef.current?.focus()
  }

  const insertLineBreak = () => {
    onChange(value + '\n')
    textareaRef.current?.focus()
  }

  const popularEmojis = [
    '✨', '🔥', '💡', '🚀', '👉', '💬', '✅', '❤️',
    '👇', '💪', '🎯', '⭐', '🎉', '💯', '🙌', '🌟',
  ]

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex p-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl gap-0.5">
          {popularEmojis.slice(0, 8).map((emoji) => (
            <button
              key={emoji}
              onClick={() => insertEmoji(emoji)}
              className="w-9 h-9 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-lg transition-all text-lg"
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
        
        <div className="flex-1" />
        
        <div className="flex gap-2">
          <button
            onClick={insertLineBreak}
            className="px-4 py-2 bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#6B7280] rounded-xl transition-all text-[11px] font-black uppercase tracking-widest shadow-sm"
          >
            ↵ Nova Linha
          </button>
          
          <button
            onClick={insertHashtag}
            className="px-4 py-2 bg-orange-50 border border-orange-100 hover:bg-orange-100 text-[#E54D42] rounded-xl transition-all text-[11px] font-black uppercase tracking-widest shadow-sm"
          >
            # Add Hashtag
          </button>
        </div>
      </div>

      {/* Textarea */}
      <div
        className={`relative border-2 rounded-2xl transition-all ${
          isFocused
            ? 'border-[#E54D42]/30 bg-white ring-4 ring-orange-500/5'
            : 'border-[#E5E7EB] bg-[#F9FAFB]'
        }`}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Narrativa do post... ✨"
          className="w-full h-56 px-6 py-5 bg-transparent text-[#111827] placeholder-[#9CA3AF] resize-none focus:outline-none rounded-2xl font-medium leading-relaxed"
          maxLength={maxLength}
        />
        
        {/* Character Counter */}
        <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className={`text-[11px] font-black tracking-widest uppercase ${
              remaining < 100 ? 'text-[#E54D42]' : 'text-[#9CA3AF]'
            }`}>
              {characterCount}
            </span>
            <span className="text-[10px] text-[#E5E7EB] font-bold">/</span>
            <span className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-widest">{maxLength}</span>
          </div>
          
          <div className="w-24 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                remaining < 100 ? 'bg-[#E54D42]' : 'bg-[#10B981]'
              }`}
              style={{ width: `${(characterCount / maxLength) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Insight */}
      <div className="flex items-center gap-3 p-4 bg-orange-50/30 border border-orange-50 rounded-2xl">
        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#E54D42] border border-orange-100">
           <span className="text-sm">💡</span>
        </div>
        <p className="text-[11px] text-[#6B7280] font-medium leading-relaxed">
          <span className="font-bold text-[#E54D42]">DICA:</span> Legendas entre 150 e 200 caracteres têm mais engajamento. Finalize sempre com uma chamada para ação clara!
        </p>
      </div>
    </div>
  )
}
