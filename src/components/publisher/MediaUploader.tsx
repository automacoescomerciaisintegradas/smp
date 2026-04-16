'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image, Video, FileText, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface MediaUploaderProps {
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL'
  mediaItems: Array<{
    id: string
    url: string
    mediaType: 'IMAGE' | 'VIDEO'
    order: number
  }>
  onUpload: (urls: { url: string; type: string }[]) => void
  onRemove: (id: string) => void
}

export function MediaUploader({ mediaType, mediaItems, onUpload, onRemove }: MediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const maxFiles = mediaType === 'CAROUSEL' ? 10 : 1
  const currentFiles = mediaItems.length
  const canAddMore = currentFiles < maxFiles

  const handleFiles = async (files: FileList | File[]) => {
    if (!canAddMore) {
      toast.error(`Limite de ${maxFiles} ${maxFiles === 1 ? 'arquivo' : 'arquivos'} atingido`)
      return
    }

    const filesArray = Array.from(files)
    
    // Valida tipos
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime']
    const invalidFiles = filesArray.filter(f => !validTypes.includes(f.type))
    
    if (invalidFiles.length > 0) {
      toast.error('Formato de arquivo não suportado pelo Instagram')
      return
    }

    // Valida tamanhos (10MB cada para otimização)
    const maxSize = 10 * 1024 * 1024
    const oversizedFiles = filesArray.filter(f => f.size > maxSize)
    
    if (oversizedFiles.length > 0) {
      toast.error('Arquivos devem ter no máximo 10MB')
      return
    }

    setIsUploading(true)
    const loadingToast = toast.loading('Sincronizando arquivos...')

    try {
      const uploadedUrls: { url: string; type: string }[] = []

      for (const file of filesArray) {
        if (uploadedUrls.length >= maxFiles - currentFiles) {
          toast.error(`Limite de ${maxFiles} arquivos atingido`)
          break
        }

        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Falha no processamento')
        }

        const data = await response.json()
        uploadedUrls.push({ url: data.url, type: file.type })
      }

      if (uploadedUrls.length > 0) {
        onUpload(uploadedUrls)
        toast.dismiss(loadingToast)
        toast.success(`${uploadedUrls.length} ${uploadedUrls.length === 1 ? 'mídia vinculada' : 'mídias vinculadas'}`)
      }
    } catch (error: any) {
      toast.dismiss(loadingToast)
      toast.error(error.message || 'Erro no processamento de mídia')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files)
  }

  const acceptedFileTypes = mediaType === 'VIDEO' 
    ? 'video/mp4,video/quicktime'
    : mediaType === 'CAROUSEL'
    ? 'image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/quicktime'
    : 'image/jpeg,image/jpg,image/png,image/webp'

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      {canAddMore && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? 'border-[#E54D42] bg-orange-50 ring-4 ring-orange-500/5'
              : 'border-[#E5E7EB] hover:border-orange-200 bg-[#F9FAFB] hover:bg-orange-50/20'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFileTypes}
            multiple={mediaType === 'CAROUSEL'}
            onChange={handleFileInput}
            className="hidden"
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                 <div className="w-16 h-16 border-4 border-orange-100 border-t-[#E54D42] rounded-full animate-spin" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <Upload size={20} className="text-[#E54D42]" />
                 </div>
              </div>
              <p className="text-[#E54D42] font-black text-xs uppercase tracking-widest">Processando Ativos...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 group">
              <div className="p-4 bg-white border border-[#E5E7EB] rounded-2xl text-[#6B7280] group-hover:text-[#E54D42] group-hover:border-orange-100 transition-all shadow-sm">
                <Upload size={32} />
              </div>
              <div>
                <p className="text-[#111827] font-black text-sm uppercase tracking-tight mb-1">
                  Clique ou arraste a mídia
                </p>
                <p className="text-[11px] text-[#9CA3AF] font-medium uppercase tracking-wide">
                  {mediaType === 'IMAGE' && 'JPEG, PNG ou WebP (máx. 10MB)'}
                  {mediaType === 'VIDEO' && 'MP4 ou MOV (máx. 10MB)'}
                  {mediaType === 'CAROUSEL' && 'Imagens ou vídeos (máx. 10 arquivos)'}
                </p>
              </div>
              {mediaType === 'CAROUSEL' && (
                <div className="mt-2 px-3 py-1 bg-white border border-[#E5E7EB] rounded-full shadow-sm">
                  <p className="text-[10px] font-black text-[#E54D42] uppercase tracking-[0.1em]">
                    {currentFiles} de {maxFiles} slots ocupados
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Uploaded Files List */}
      {mediaItems.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">
              Ativos Vinculados ({mediaItems.length}/{maxFiles})
            </h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mediaItems.map((item) => (
              <div
                key={item.id}
                className="relative group bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden p-2 shadow-sm hover:shadow-md transition-all"
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-[#F9FAFB] border border-[#F3F4F6] relative">
                  {item.mediaType === 'IMAGE' ? (
                    <img
                      src={item.url}
                      alt="Uploaded"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-[#111827]/10">
                        <Video size={24} className="text-white" />
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg border border-[#E5E7EB] shadow-sm">
                    <span className="text-[10px] text-[#111827] font-black">#{item.order + 1}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemove(item.id)
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-white border border-[#E5E7EB] text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                  >
                    <X size={14} />
                  </button>
                </div>
                
                <div className="mt-2 pb-1 px-1 flex items-center justify-between">
                   <span className="text-[9px] font-black text-[#9CA3AF] uppercase tracking-widest">
                     {item.mediaType}
                   </span>
                   {item.id && <CheckCircle2 size={12} className="text-[#10B981]" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Constraints Box */}
      <div className="flex items-start gap-4 p-5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl">
        <div className="p-2 bg-white rounded-xl border border-[#E5E7EB] text-[#E54D42] shadow-sm">
           <FileText size={18} />
        </div>
        <div className="space-y-1">
          <h5 className="text-[11px] font-black text-[#111827] uppercase tracking-widest">Protocolo Meta Graph</h5>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1">
             <p className="text-[10px] text-[#6B7280] font-medium">• Imagem: JPEG/PNG (1:1 ou 4:5)</p>
             <p className="text-[10px] text-[#6B7280] font-medium">• Carrossel: 2 a 10 itens</p>
             <p className="text-[10px] text-[#6B7280] font-medium">• Vídeo: MP4 (Máx. 60s)</p>
             <p className="text-[10px] text-[#6B7280] font-medium">• Tamanho: Máx 10MB p/ item</p>
          </div>
        </div>
      </div>
    </div>
  )
}
