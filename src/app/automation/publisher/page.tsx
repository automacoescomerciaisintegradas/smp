"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ImagePlus,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  Trash2,
  Plus,
  Eye,
  Sparkles,
  GalleryHorizontalEnd,
  Image as ImageIcon,
  Hash,
  Type,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Upload,
  X,
  Calendar,
  Clock,
  FileText,
  Save,
  FolderOpen,
  RefreshCw,
  Key,
  ShieldCheck,
  Share2,
} from 'lucide-react';

interface PublishResult {
  success: boolean;
  type?: string;
  data?: { media_id: string; slides?: number };
  error?: string;
}

interface CaptionTemplate {
  name: string;
  icon: string;
  template: string;
}

const CAPTION_TEMPLATES: CaptionTemplate[] = [
  {
    name: 'Educativo',
    icon: '📚',
    template: [
      '🪝 [GANCHO: Uma frase impactante que prende atenção]',
      '',
      '📝 [DESENVOLVIMENTO: Explique o conceito em 2-3 parágrafos]',
      '',
      '💡 [DICA BÔNUS: Insight valioso extra]',
      '',
      '❓ [CTA: Pergunta para engajar nos comentários]',
      '',
      '📌 Salve este post para consultar depois!',
      '',
      '#hashtag1 #hashtag2 #hashtag3',
    ].join('\n'),
  },
  {
    name: 'Storytelling',
    icon: '📖',
    template: [
      'Há [X tempo], eu [situação inicial]...',
      '',
      'Hoje, [situação atual/resultados]',
      '',
      'Aqui está o que eu aprendi no caminho:',
      '',
      '1️⃣ [Lição 1]',
      '2️⃣ [Lição 2]',
      '3️⃣ [Lição 3]',
      '',
      'Se isso ressoou com você, compartilhe com alguém que precisa ouvir isso. 🚀',
      '',
      '#storytelling #crescimento #mindset',
    ].join('\n'),
  },
  {
    name: 'Promoção',
    icon: '🎯',
    template: [
      '🚨 [ANÚNCIO: O que está sendo lançado/oferecido]',
      '',
      '✨ Benefício 1',
      '✨ Benefício 2',
      '✨ Benefício 3',
      '',
      '⏰ [URGENCIA: Por tempo limitado/vagas limitadas]',
      '',
      '🔗 Link na bio para saber mais!',
      '',
      '#lançamento #oportunidade #promoção',
    ].join('\n'),
  },
  {
    name: 'Lista/Dicas',
    icon: '📝',
    template: [
      '✅ Dica 1',
      '✅ Dica 2',
      '✅ Dica 3',
      '✅ Dica 4',
      '✅ Dica 5',
      '',
      'Comente "EU QUERO" para receber o guia completo! 👇',
      '',
      '#lista #dicas #aprendizado',
    ].join('\n'),
  },
];

interface AccountInfo {
  id: string;
  username: string;
  name?: string;
  profile_picture_url?: string;
  followers_count?: number;
  media_count?: number;
  token_expires_at?: number;
  token_data_access_expires_at?: number;
}

type ConnectionStatus = 'checking' | 'connected' | 'expired';

const MAX_MEDIA_ITEMS = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png'];

const mergeUrls = (previous: string[], newUrls: string[]) => {
  const next = [...previous];
  let urlIndex = 0;

  for (let i = 0; i < next.length && urlIndex < newUrls.length; i++) {
    if (!next[i].trim()) {
      next[i] = newUrls[urlIndex];
      urlIndex += 1;
    }
  }

  return [...next, ...newUrls.slice(urlIndex)].slice(0, MAX_MEDIA_ITEMS);
};

const isLocalHostUrl = (url: string) => {
  try {
    const hostname = new URL(url).hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
  } catch {
    return false;
  }
};

const convertLocalToApiUrl = (url: string) => {
  const brainPath = 'C:\\Users\\autom\\.gemini\\antigravity\\brain';
  if (url.startsWith(brainPath)) {
    const relative = url.slice(brainPath.length).replace(/\\/g, '/');
    return `/api/brain-images${relative}`;
  }
  return url;
};

const META_VALIDATION_URL =
  'https://developers.facebook.com/apps/3728761024095089/instagram-business/API-Setup/?business_id=683441871527387';
const INSTAGRAM_TOKEN_VALIDATION_URL =
  'https://www.instagram.com/consent/?flow=ig_biz_login_oauth&params_json=%7B%22client_id%22%3A%221089163016219900%22%2C%22redirect_uri%22%3A%22https%3A%5C%2F%5C%2Fdevelopers.facebook.com%5C%2Finstagram%5C%2Ftoken_generator%5C%2Foauth%5C%2F%22%2C%22response_type%22%3A%22code%22%2C%22state%22%3A%22%7B%5C%22app_id%5C%22%3A%5C%221089163016219900%5C%22%2C%5C%22f3_request_id%5C%22%3A%5C%22c1673264-dccb-4358-841b-abc22ab933f6%5C%22%2C%5C%22nonce%5C%22%3A%5C%22r7IKl8cg8mUizQvo%5C%22%2C%5C%22requested_permissions%5C%22%3A%5C%22instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights%5C%22%2C%5C%22user_id%5C%22%3A%5C%2217841405894866058%5C%22%7D%22%2C%22scope%22%3A%22instagram_business_basic-instagram_business_manage_comments-instagram_business_manage_messages-instagram_business_content_publish-instagram_business_manage_insights%22%2C%22logger_id%22%3A%22c1673264-dccb-4358-841b-abc22ab933f6%22%2C%22app_id%22%3A%221089163016219900%22%2C%22platform_app_id%22%3A%221089163016219900%22%7D&source=oauth_permissions_page_www';

const isTokenExpiredError = (message: string) => {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('session has expired') ||
    normalized.includes('token expirad') ||
    normalized.includes('error validating access token') ||
    normalized.includes('oauthexception')
  );
};

export default function PublisherPage() {
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [caption, setCaption] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [publishStep, setPublishStep] = useState('');
  const [result, setResult] = useState<PublishResult | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('checking');
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [tokenExpiry, setTokenExpiry] = useState<{ expiresAt: number; daysLeft: number } | null>(null);
  
  const [showTemplates, setShowTemplates] = useState(false);
  const [savedPosts, setSavedPosts] = useState<Array<{id: string, caption: string, urls: string[], date: string}>>([]);
  const [showSavedPosts, setShowSavedPosts] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const [tempToken, setTempToken] = useState('');
  const [tokenStatus, setTokenStatus] = useState<{success?: boolean, message?: string} | null>(null);
  const [isTokenLoading, setIsTokenLoading] = useState(false);
  const [showTokenConfig, setShowTokenConfig] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('publisher_drafts');
    if (saved) {
      try { setSavedPosts(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
    void validateConnection();
  }, []);

  const validUrls = imageUrls.filter(u => u.trim().length > 0);
  const isCarousel = validUrls.length > 1;
  const captionLength = caption.length;
  const maxCaption = 2200;

  const uploadFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    setUploadError(null);
    const filledCount = imageUrls.filter((url) => url.trim()).length;
    const availableSlots = MAX_MEDIA_ITEMS - filledCount;
    if (availableSlots <= 0) {
      setUploadError(`Limite de ${MAX_MEDIA_ITEMS} imagens atingido.`);
      return;
    }
    const filesToUpload = files.slice(0, availableSlots);
    const invalidType = filesToUpload.find((file) => !ACCEPTED_IMAGE_TYPES.includes(file.type));
    if (invalidType) {
      setUploadError('Formato não suportado. Use JPG ou PNG.');
      return;
    }
    const oversized = filesToUpload.find((file) => file.size > MAX_FILE_SIZE);
    if (oversized) {
      setUploadError('Alguns arquivos excedem 10MB.');
      return;
    }
    setUploadLoading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!response.ok) throw new Error('Erro no upload.');
        const data = await response.json();
        if (data?.url) uploadedUrls.push(data.url);
      }
      if (uploadedUrls.length > 0) setImageUrls(prev => mergeUrls(prev, uploadedUrls));
    } catch (error) {
      setUploadError('Erro no upload.');
    } finally { setUploadLoading(false); }
  }, [imageUrls]);

  const validateConnection = async (token?: string) => {
    setConnectionStatus('checking');
    try {
      const res = await fetch('/api/social/validate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: token || undefined }),
      });
      const json = await res.json();
      if (res.ok && json?.success && json.data?.id) {
        setAccount(json.data);
        if (json.data?.token_expires_at) {
          const expiresAt = Number(json.data.token_expires_at);
          const daysLeft = Math.ceil((expiresAt * 1000 - Date.now()) / (1000 * 60 * 60 * 24));
          setTokenExpiry({ expiresAt, daysLeft });
        }
        setConnectionStatus('connected');
        return;
      }
      setConnectionStatus('expired');
    } catch { setConnectionStatus('expired'); }
  };

  const publish = async () => {
    if (!validUrls.length || !caption.trim()) return;
    setPublishing(true);
    setResult(null);
    try {
      setPublishStep(isCarousel ? 'Criando carrossel...' : 'Enviando imagem...');
      const baseUrl = window.location.origin;
      const publishUrls = validUrls.map(url => {
        const converted = convertLocalToApiUrl(url);
        if (converted.startsWith('http')) return converted;
        return `${baseUrl}${converted}`;
      });
      const res = await fetch('/api/ig-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrls: publishUrls, caption }),
      });
      const json = await res.json();
      if (json.success) setResult(json);
      else setResult({ success: false, error: json.error || 'Erro na publicação' });
    } catch (err) { setResult({ success: false, error: 'Erro de rede' }); }
    finally { setPublishing(false); setPublishStep(''); }
  };

  const saveToken = async () => {
    if (!tempToken.trim()) return;
    setIsTokenLoading(true);
    try {
      const res = await fetch('/api/ig-config/save-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tempToken }),
      });
      const data = await res.json();
      if (data.success) {
        setTokenStatus({ success: true, message: 'Token salvo!' });
        setTempToken('');
        await validateConnection();
        setTimeout(() => setShowTokenConfig(false), 2000);
      } else setTokenStatus({ success: false, message: data.error });
    } catch { setTokenStatus({ success: false, message: 'Erro' }); }
    finally { setIsTokenLoading(false); }
  };

  const addImageSlot = () => imageUrls.length < MAX_MEDIA_ITEMS && setImageUrls(prev => [...prev, '']);
  const removeImageSlot = (i: number) => imageUrls.length > 1 && setImageUrls(prev => prev.filter((_, idx) => idx !== i));
  const updateImageUrl = (i: number, val: string) => setImageUrls(prev => prev.map((u, idx) => idx === i ? val : u));
  const clearForm = () => { setCaption(''); setImageUrls(['']); setActiveSlide(0); setResult(null); };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] p-8 pb-20 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-[#E5E7EB] pb-8">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-[#111827] flex items-center gap-3 uppercase">
            <ImagePlus className="text-[#E54D42]" size={24} />
            Publisher
          </h1>
          <p className="text-[#6B7280] text-[14px] mt-1">Publique conteúdo otimizado via Graph API.</p>
        </div>
        <div className="flex gap-4">
           {connectionStatus === 'connected' && account && (
             <div className="flex items-center gap-3 bg-white border border-[#E5E7EB] px-4 py-2 rounded-[6px] shadow-sm">
                <img src={account.profile_picture_url || ''} className="w-6 h-6 rounded-full border border-[#E5E7EB]" alt="" />
                <span className="text-[12px] font-bold text-[#111827]">@{account.username}</span>
                <div className="w-2 h-2 rounded-full bg-[#10B981]" />
             </div>
           )}
           <button onClick={() => setShowTokenConfig(!showTokenConfig)} className="p-2 bg-white border border-[#E5E7EB] rounded-[6px] text-[#6B7280] hover:text-[#E54D42] transition-colors shadow-sm">
             <Key size={18} />
           </button>
        </div>
      </div>

      <AnimatePresence>
        {showTokenConfig && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="bg-white border border-[#E54D42]/20 rounded-[8px] p-6 shadow-sm mb-8">
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#111827] mb-4">Configurar Access Token</h3>
              <div className="flex gap-3">
                <input type="password" value={tempToken} onChange={e => setTempToken(e.target.value)} placeholder="Cole o IGAAP token aqui..." 
                       className="flex-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] px-4 py-3 text-[13px] outline-none font-mono focus:border-[#E54D42]/30" />
                <button onClick={saveToken} disabled={isTokenLoading || !tempToken} className="px-6 py-3 bg-[#E54D42] text-white rounded-[6px] text-[12px] font-bold uppercase hover:bg-[#D43D32] transition-all flex items-center gap-2">
                  {isTokenLoading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                  Ativar
                </button>
              </div>
              {tokenStatus && <p className={`mt-3 text-[11px] font-bold ${tokenStatus.success ? 'text-[#10B981]' : 'text-[#E54D42]'}`}>{tokenStatus.message}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {connectionStatus === 'expired' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-lg shadow-sm mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-amber-100 rounded-full">
                  <AlertTriangle className="text-amber-600" size={24} />
               </div>
               <div>
                  <h3 className="text-[16px] font-bold text-amber-900">Sessão da Meta API Expirada</h3>
                  <p className="text-[13px] text-amber-700">Seu token de acesso expirou. Você precisa validar sua conexão novamente para continuar publicando.</p>
               </div>
            </div>
            <a href="/onboarding" className="px-6 py-3 bg-amber-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-amber-700 transition-all shadow-md">
               Renovar Conexão
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Editor */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-8 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-[14px] font-bold uppercase tracking-wide text-[#111827] flex items-center gap-2">
                  <ImageIcon className="text-[#E54D42]" size={18} /> Slides do Post
                </h2>
                <span className="text-[11px] font-bold text-[#9CA3AF] uppercase">{validUrls.length}/10</span>
             </div>
             
             <div className="space-y-3">
               {imageUrls.map((url, i) => (
                 <div key={i} className="flex gap-3 items-center group">
                    <span className="w-5 text-[11px] font-bold text-[#9CA3AF]">{i+1}.</span>
                    <input value={url} onChange={e => updateImageUrl(i, e.target.value)} placeholder="URL da imagem (http...)" 
                           className="flex-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] px-4 py-3 text-[13px] outline-none focus:border-[#E54D42]/30 font-mono" />
                    {url.trim() && <div className="w-10 h-10 rounded-[4px] border border-[#E5E7EB] overflow-hidden shrink-0 shadow-sm"><img src={convertLocalToApiUrl(url)} className="w-full h-full object-cover" alt="" /></div>}
                    <button onClick={() => removeImageSlot(i)} disabled={imageUrls.length <= 1} className="p-2 text-[#9CA3AF] hover:text-[#E54D42] disabled:opacity-20"><Trash2 size={16} /></button>
                 </div>
               ))}
             </div>
             
             <button onClick={addImageSlot} disabled={imageUrls.length >= 10} className="mt-6 w-full py-3 border border-dashed border-[#E5E7EB] rounded-[6px] text-[11px] font-bold text-[#6B7280] hover:border-[#E54D42]/40 hover:text-[#E54D42] transition-all flex items-center justify-center gap-2">
               <Plus size={14} /> Novo Slide
             </button>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-8 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-[14px] font-bold uppercase tracking-wide text-[#111827] flex items-center gap-2">
                  <Type className="text-[#E54D42]" size={18} /> Legenda
                </h2>
                <div className="flex gap-2">
                   {CAPTION_TEMPLATES.map(t => (
                     <button key={t.name} onClick={() => setCaption(t.template)} className="p-1.5 bg-[#F3F4F6] rounded-[4px] text-[12px] hover:bg-[#E5E7EB]" title={t.name}>{t.icon}</button>
                   ))}
                </div>
             </div>
             <textarea value={caption} onChange={e => setCaption(e.target.value)} rows={8} placeholder="Escreva aqui seu conteúdo..." 
                       className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] px-4 py-4 text-[13px] outline-none focus:border-[#E54D42]/30 resize-none leading-relaxed" />
             <div className="flex justify-between mt-2">
                <span className={`text-[10px] font-bold uppercase ${caption.length > 2200 ? 'text-[#E54D42]' : 'text-[#9CA3AF]'}`}>{caption.length}/2200</span>
                <button onClick={clearForm} className="text-[10px] font-bold uppercase text-[#E54D42] hover:underline">Limpar</button>
             </div>
          </div>

          <button onClick={publish} disabled={publishing || !validUrls.length || !caption} 
                  className="w-full py-5 bg-[#111827] text-white rounded-[8px] font-bold text-[14px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#1f2937] disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] transition-all shadow-lg active:scale-[0.99]">
             {publishing ? <Loader2 className="animate-spin" /> : <Send size={20} />}
             {publishing ? publishStep : `Publicar ${isCarousel ? 'Carrossel' : 'Post'}`}
          </button>

          {result && (
            <div className={`p-4 rounded-[8px] border ${result.success ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]' : 'bg-[#E54D42]/10 border-[#E54D42]/30 text-[#E54D42]'} flex items-center gap-3 text-[13px] font-bold animate-in fade-in slide-in-from-top-2`}>
              {result.success ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              {result.success ? 'Sucesso: Publicação concluída!' : result.error}
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          <div className="sticky top-8 space-y-6">
            <div className="bg-white border border-[#E5E7EB] rounded-[8px] p-6 shadow-sm overflow-hidden">
               <h2 className="text-[13px] font-bold uppercase tracking-[0.1em] text-[#9CA3AF] mb-6 flex items-center gap-2">
                 <Eye size={16} /> Preview do Instagram
               </h2>
               
               <div className="bg-black rounded-[4px] overflow-hidden max-w-[320px] mx-auto shadow-2xl">
                  <div className="flex items-center gap-2 p-3 bg-white border-b border-[#E5E7EB]">
                     <div className="w-8 h-8 rounded-full bg-[#E54D42] flex items-center justify-center text-white text-[10px] uppercase font-bold">SF</div>
                     <span className="text-[12px] font-bold text-[#111827]">{account?.username || 'user'}</span>
                  </div>
                  <div className="aspect-square bg-zinc-900 relative">
                     {validUrls.length > 0 ? <img src={convertLocalToApiUrl(validUrls[activeSlide])} className="w-full h-full object-cover" alt="" /> : <div className="h-full w-full flex items-center justify-center opacity-20"><ImageIcon size={40} className="text-white" /></div>}
                     {isCarousel && (
                       <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                          {validUrls.map((_, i) => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === activeSlide ? 'bg-blue-500' : 'bg-white/40'}`} />)}
                       </div>
                     )}
                  </div>
                  <div className="p-3 bg-white text-[#111827]">
                     <p className="text-[12px] leading-relaxed line-clamp-3">
                        <span className="font-bold mr-2">{account?.username || 'user'}</span>
                        {caption || <span className="opacity-30 italic">Sem legenda...</span>}
                     </p>
                  </div>
               </div>
            </div>
            
            <div className="bg-[#E54D42]/5 border border-[#E54D42]/10 rounded-[8px] p-6">
               <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#E54D42] mb-3">Checklist ACI</h3>
               <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-[12px] text-[#6B7280]">
                    <div className={`w-1.5 h-1.5 rounded-full ${validUrls.length > 0 ? 'bg-[#10B981]' : 'bg-[#9CA3AF]'}`} />
                    Mídia selecionada
                  </li>
                  <li className="flex items-center gap-2 text-[12px] text-[#6B7280]">
                    <div className={`w-1.5 h-1.5 rounded-full ${caption ? 'bg-[#10B981]' : 'bg-[#9CA3AF]'}`} />
                    Legenda formatada
                  </li>
                  <li className="flex items-center gap-2 text-[12px] text-[#6B7280]">
                    <div className={`w-1.5 h-1.5 rounded-full ${connectionStatus === 'connected' ? 'bg-[#10B981]' : 'bg-[#E54D42]'}`} />
                    Token operacional
                  </li>
               </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
