'use client'

import { ChevronLeft, ChevronRight, Video, ImageIcon } from 'lucide-react'

interface CarouselPreviewProps {
  items: Array<{
    id: string
    url: string
    mediaType: 'IMAGE' | 'VIDEO'
    order: number
  }>
  activeIndex: number
  onIndexChange: (index: number) => void
}

export function CarouselPreview({ items, activeIndex, onIndexChange }: CarouselPreviewProps) {
  const goToPrevious = () => {
    onIndexChange(activeIndex > 0 ? activeIndex - 1 : items.length - 1)
  }

  const goToNext = () => {
    onIndexChange(activeIndex < items.length - 1 ? activeIndex + 1 : 0)
  }

  if (items.length === 0) return null

  return (
    <div className="space-y-6">
      {/* Main Preview */}
      <div className="relative group max-w-sm mx-auto">
        <div className="aspect-square bg-[#F9FAFB] rounded-3xl overflow-hidden border border-[#E5E7EB] shadow-inner shadow-black/5">
          {items[activeIndex].mediaType === 'IMAGE' ? (
            <img
              src={items[activeIndex].url}
              alt={`Slide ${activeIndex + 1}`}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
          ) : (
            <video
              src={items[activeIndex].url}
              controls
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Navigation Arrows */}
        {items.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-md hover:bg-white text-[#111827] rounded-2xl opacity-0 group-hover:opacity-100 transition-all border border-[#E5E7EB] shadow-lg active:scale-90"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-md hover:bg-white text-[#111827] rounded-2xl opacity-0 group-hover:opacity-100 transition-all border border-[#E5E7EB] shadow-lg active:scale-90"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Counter Badge */}
        <div className="absolute top-4 right-4 px-4 py-2 bg-white/90 backdrop-blur-md text-[#111827] text-[11px] font-black rounded-xl border border-[#E5E7EB] shadow-sm uppercase tracking-widest">
          {activeIndex + 1} <span className="text-[#9CA3AF] px-1">/</span> {items.length}
        </div>

        {/* Media Type Badge */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 px-4 py-2 bg-[#111827]/80 backdrop-blur-md text-white text-[10px] font-black rounded-xl border border-white/10 shadow-lg uppercase tracking-[0.1em]">
          {items[activeIndex].mediaType === 'VIDEO' ? (
            <><Video size={12} className="text-[#E54D42]" /> Reel</>
          ) : (
            <><ImageIcon size={12} className="text-[#E54D42]" /> Post</>
          )}
        </div>
      </div>

      {/* Thumbnails */}
      {items.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-4 px-1 scrollbar-hide">
          {items.map((item, index) => (
            <button
              key={item.id}
              onClick={() => onIndexChange(index)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                index === activeIndex
                  ? 'border-[#E54D42] ring-4 ring-orange-500/10 scale-105'
                  : 'border-[#E5E7EB] opacity-60 hover:opacity-100 grayscale-[50%] hover:grayscale-0'
              }`}
            >
              {item.mediaType === 'IMAGE' ? (
                <img
                  src={item.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="relative w-full h-full">
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-[#111827]/20">
                    <Video size={16} className="text-white" />
                  </div>
                </div>
              )}
              
              <div className="absolute bottom-0 left-0 right-0 bg-[#111827]/40 backdrop-blur-sm text-white text-[9px] font-black text-center py-0.5 uppercase tracking-widest">
                #{index + 1}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Footer Info */}
      <div className="flex items-center justify-center gap-2">
         <div className="w-1.5 h-1.5 rounded-full bg-orange-200" />
         <span className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.2em]">
           {items.length} {items.length === 1 ? 'CAMADA ATIVA' : 'CAMADAS VINCULADAS'}
         </span>
         <div className="w-1.5 h-1.5 rounded-full bg-orange-200" />
      </div>
    </div>
  )
}
