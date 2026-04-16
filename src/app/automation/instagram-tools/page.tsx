"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Send,
  Users,
  CheckCircle2,
  XCircle,
  Loader2,
  Key,
  UserSearch,
  MessageCircle,
  Copy,
  Shield,
  Zap,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

interface LookedUpUser {
  id: string;
  username: string;
  full_name: string;
  profile_pic_url?: string;
  followers?: number;
  following?: number;
  posts_count?: number;
  is_private?: boolean;
  is_verified?: boolean;
  biography?: string;
}

interface DmTarget {
  id: string;
  username: string;
  full_name: string;
}

interface DmResult {
  targetId: string;
  ok: boolean;
  text: string;
}

interface CookieValidation {
  valid: boolean;
  missing: string[];
  present: string[];
}

export default function InstagramToolsPage() {
  // Session
  const [sessionCookie, setSessionCookie] = useState('');
  const [sessionSaved, setSessionSaved] = useState(false);
  const [showCookie, setShowCookie] = useState(false);
  const [cookieStatus, setCookieStatus] = useState<'checking' | 'saved' | 'missing'>('checking');
  const [cookieValidation, setCookieValidation] = useState<CookieValidation | null>(null);
  const [savingCookie, setSavingCookie] = useState(false);

  // Lookup
  const [lookupInput, setLookupInput] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookedUpUser, setLookedUpUser] = useState<LookedUpUser | null>(null);
  const [lookupError, setLookupError] = useState('');

  // DM Targets
  const [dmTargets, setDmTargets] = useState<DmTarget[]>([]);
  const [dmMessage, setDmMessage] = useState('');
  const [dmSending, setDmSending] = useState(false);
  const [dmResults, setDmResults] = useState<DmResult[]>([]);

  useEffect(() => {
    checkSavedCookies();
  }, []);

  const checkSavedCookies = async () => {
    try {
      const res = await fetch('/api/instagram/cookies');
      if (res.ok) {
        const data = await res.json();
        if (data.hasCookies && data.validation) {
          setCookieStatus('saved');
          setCookieValidation(data.validation);
          if (data.validation.valid) {
            setSessionCookie('[✓ Cookies salvos e validados]');
          }
        } else {
          setCookieStatus('missing');
        }
      } else {
        setCookieStatus('missing');
      }
    } catch (error) {
      console.error('Erro ao verificar cookies:', error);
      setCookieStatus('missing');
    }
  };

  const saveSession = async () => {
    if (!sessionCookie.trim() || sessionCookie.startsWith('[✓')) return;
    setSavingCookie(true);
    try {
      const res = await fetch('/api/instagram/cookies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookieString: sessionCookie }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSessionSaved(true);
        setCookieStatus('saved');
        setCookieValidation(data.validation);
        setTimeout(() => setSessionSaved(false), 3000);
      } else {
        alert(`Erro ao salvar: ${data.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao salvar cookies:', error);
      alert('Falha ao salvar cookies');
    } finally {
      setSavingCookie(false);
    }
  };

  const deleteSavedCookies = async () => {
    if (!confirm('Tem certeza que deseja remover os cookies salvos?')) return;
    try {
      const res = await fetch('/api/instagram/cookies', { method: 'DELETE' });
      if (res.ok) {
        setSessionCookie('');
        setCookieStatus('missing');
        setCookieValidation(null);
        setSessionSaved(false);
      }
    } catch (error) {
      console.error('Erro ao remover cookies:', error);
    }
  };

  const validateCookiePreview = (cookie: string) => {
    const pairs = cookie.split(';').map(p => p.trim()).filter(p => p.includes('='));
    const cookies: Record<string, string> = {};
    for (const pair of pairs) {
      const [key, ...valueParts] = pair.split('=');
      if (key && valueParts.length > 0) cookies[key.trim()] = valueParts.join('=');
    }
    const required = ['csrftoken', 'sessionid', 'ds_user_id', 'ig_did', 'mid', 'datr'];
    const missing = required.filter(name => !cookies[name]);
    const present = required.filter(name => cookies[name]);
    return { valid: missing.length === 0, missing, present };
  };

  const liveValidation = validateCookiePreview(sessionCookie);

  const lookupUser = useCallback(async () => {
    if (!lookupInput.trim() || !sessionCookie.trim()) return;
    setLookupLoading(true);
    setLookupError('');
    setLookedUpUser(null);
    try {
      const res = await fetch('/api/ig-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: lookupInput, sessionCookie }),
      });
      const json = await res.json();
      if (json.success) {
        setLookedUpUser(json.data);
      } else {
        setLookupError(json.error || 'Usuário não encontrado');
      }
    } catch {
      setLookupError('Falha na requisição');
    } finally {
      setLookupLoading(false);
    }
  }, [lookupInput, sessionCookie]);

  const addToDmList = () => {
    if (lookedUpUser && !dmTargets.find(t => t.id === lookedUpUser.id)) {
      setDmTargets(prev => [...prev, {
        id: lookedUpUser.id,
        username: lookedUpUser.username,
        full_name: lookedUpUser.full_name,
      }]);
    }
  };

  const addManualTarget = (id: string) => {
    if (id && !dmTargets.find(t => t.id === id)) {
      setDmTargets(prev => [...prev, { id, username: `ID:${id}`, full_name: 'Manual' }]);
    }
  };

  const copyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
    } catch (error) {
      console.error('Erro ao copiar ID:', error);
    }
  };

  const removeTarget = (id: string) => {
    setDmTargets(prev => prev.filter(t => t.id !== id));
  };

  const sendDMs = async () => {
    if (!dmTargets.length || !dmMessage.trim() || !sessionCookie.trim()) return;
    setDmSending(true);
    setDmResults([]);
    const results: DmResult[] = [];
    for (const target of dmTargets) {
      try {
        const res = await fetch('/api/ig-send-dm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipientIds: [target.id], text: dmMessage, sessionCookie }),
        });
        const json = await res.json();
        results.push({
          targetId: target.id,
          ok: json.success === true,
          text: json.success 
            ? `✅ @${target.username} — Enviado com sucesso` 
            : `❌ @${target.username} — ${json.error}`,
        });
      } catch (err) {
        results.push({
          targetId: target.id,
          ok: false,
          text: `❌ @${target.username} — Erro de conexão`,
        });
      }
      await new Promise(r => setTimeout(r, 2000 + Math.random() * 2000));
    }
    setDmResults(results);
    setDmSending(false);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] p-8 space-y-8 font-sans">
      {/* Header */}
      <header className="flex flex-col gap-2">
         <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-50 rounded-xl border border-orange-100 shadow-sm">
                <UserSearch className="text-[#E54D42]" size={24} />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-[#111827]">Instagram Tools</h1>
         </div>
         <p className="text-[#6B7280] font-medium max-w-2xl">
            Lookup de usuários, Auto Direct Message e análise detalhada via Private API.
         </p>
      </header>

      {/* Session Cookie */}
      <section className="bg-white border border-[#E5E7EB] rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Key size={20} className="text-amber-500" />
          <h2 className="font-bold text-xl text-[#111827]">Sessão do Instagram</h2>
          <div className={`ml-auto px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
            cookieStatus === 'saved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
          }`}>
            {cookieStatus === 'saved' ? '✓ Configurado' : 'Pendente'}
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={sessionCookie}
              onChange={(e) => setSessionCookie(e.target.value)}
              placeholder="csrftoken=xxx; sessionid=xxx; ds_user_id=xxx..."
              rows={2}
              className="w-full bg-[#F3F4F6] border border-[#E5E7EB] rounded-2xl px-5 py-4 text-xs outline-none focus:border-[#E54D42] transition-colors font-mono resize-none pr-12 text-[#111827]"
            />
            <button
              onClick={() => setShowCookie(!showCookie)}
              className="absolute right-4 top-4 text-[#6B7280] hover:text-[#111827]"
            >
              {showCookie ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={saveSession}
              disabled={savingCookie || !sessionCookie.trim() || sessionCookie.startsWith('[✓')}
              className="px-8 py-3 bg-[#E54D42] hover:bg-[#D43D32] disabled:bg-[#F3F4F6] disabled:text-[#9CA3AF] text-white rounded-2xl text-sm font-bold transition-all flex items-center gap-2 shadow-sm"
            >
              {savingCookie ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
              {sessionSaved ? 'Salvo com Sucesso' : 'Salvar Sessão'}
            </button>

            {cookieStatus === 'saved' && (
              <button
                onClick={deleteSavedCookies}
                className="px-6 py-3 text-red-500 hover:bg-red-50 rounded-2xl text-sm font-bold transition-all border border-transparent hover:border-red-100"
              >
                Remover Cookies
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LOOKUP */}
        <section className="bg-white border border-[#E5E7EB] rounded-3xl p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
             <Search size={20} className="text-blue-500" />
             <h2 className="font-bold text-xl text-[#111827]">Buscar Perfil</h2>
          </div>

          <div className="flex gap-3">
            <input
              value={lookupInput}
              onChange={(e) => setLookupInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && lookupUser()}
              placeholder="@username"
              className="flex-1 bg-[#F3F4F6] border border-[#E5E7EB] rounded-2xl px-5 py-3 text-sm outline-none focus:border-blue-500 transition-colors font-medium"
            />
            <button
              onClick={lookupUser}
              disabled={lookupLoading || !lookupInput.trim()}
              className="px-6 bg-[#111827] hover:bg-black text-white rounded-2xl text-sm font-bold transition-all"
            >
              {lookupLoading ? <Loader2 size={16} className="animate-spin" /> : 'Buscar'}
            </button>
          </div>

          <AnimatePresence>
            {lookedUpUser && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-3xl p-6 space-y-6"
              >
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <img src={lookedUpUser.profile_pic_url} alt="" className="w-20 h-20 rounded-full border-4 border-white shadow-md bg-white" />
                    {lookedUpUser.is_verified && (
                        <div className="absolute -right-1 bottom-0 bg-blue-500 text-white rounded-full p-1 border-2 border-white">
                            <CheckCircle2 size={12} fill="currentColor" />
                        </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#111827]">@{lookedUpUser.username}</h3>
                    <p className="text-[#6B7280] font-medium">{lookedUpUser.full_name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 text-center">
                    <p className="text-lg font-black text-[#111827]">{lookedUpUser.posts_count?.toLocaleString() || '0'}</p>
                    <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-widest">Posts</p>
                  </div>
                  <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 text-center">
                    <p className="text-lg font-black text-[#111827]">{lookedUpUser.followers?.toLocaleString() || '0'}</p>
                    <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-widest">Seguidores</p>
                  </div>
                  <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 text-center">
                    <p className="text-lg font-black text-[#111827]">{lookedUpUser.following?.toLocaleString() || '0'}</p>
                    <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-widest">Seguindo</p>
                  </div>
                </div>

                <div className="flex gap-2">
                   <button onClick={() => addToDmList()} className="flex-1 py-3 bg-white border border-[#E5E7EB] hover:bg-[#F3F4F6] rounded-2xl text-xs font-bold text-[#111827] flex items-center justify-center gap-2 transition-all">
                      <Plus size={14} /> Adicionar à Lista
                   </button>
                   <button onClick={() => copyId(lookedUpUser.id)} className="px-4 py-3 bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-2xl text-xs font-bold text-[#6B7280] flex items-center justify-center gap-2 transition-all">
                      <Copy size={14} /> ID
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* AUTO DM */}
        <section className="bg-white border border-[#E5E7EB] rounded-3xl p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
             <MessageCircle size={20} className="text-[#E54D42]" />
             <h2 className="font-bold text-xl text-[#111827]">Auto Direct Message</h2>
             <span className="ml-auto px-3 py-1 bg-orange-50 text-[#E54D42] border border-orange-100 rounded-full text-[10px] font-black uppercase tracking-widest">
                {dmTargets.length} Alvos
             </span>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
             {dmTargets.length === 0 ? (
                <div className="border-2 border-dashed border-[#F3F4F6] rounded-3xl p-8 text-center">
                   <Users className="mx-auto text-[#D1D5DB] mb-3" size={32} />
                   <p className="text-[#6B7280] text-xs font-medium">Nenhum alvo selecionado</p>
                </div>
             ) : (
                dmTargets.map(t => (
                   <div key={t.id} className="flex items-center justify-between bg-[#F9FAFB] border border-[#E5E7EB] px-4 py-3 rounded-2xl">
                      <div className="flex items-center gap-2">
                         <span className="font-bold text-sm text-[#111827]">@{t.username}</span>
                      </div>
                      <button onClick={() => removeTarget(t.id)} className="text-[#9CA3AF] hover:text-[#E54D42] transition-colors">
                         <Trash2 size={16} />
                      </button>
                   </div>
                ))
             )}
          </div>

          <textarea
            value={dmMessage}
            onChange={(e) => setDmMessage(e.target.value)}
            placeholder="Digite sua mensagem automática..."
            rows={3}
            className="w-full bg-[#F3F4F6] border border-[#E5E7EB] rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:border-[#E54D42] resize-none text-[#111827]"
          />

          <button
            onClick={sendDMs}
            disabled={dmSending || !dmTargets.length || !dmMessage.trim()}
            className="w-full py-4 bg-[#E54D42] hover:bg-[#D43D32] disabled:bg-[#F3F4F6] disabled:text-[#9CA3AF] text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-sm active:scale-95 flex items-center justify-center gap-3"
          >
            {dmSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            {dmSending ? 'Enviando Mensagens...' : 'Iniciar Disparo Automático'}
          </button>

          <footer className="pt-2 text-center">
             <div className="inline-flex items-center gap-2 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">
                <Zap size={12} className="text-amber-500" />
                Intervalo Inteligente: 2s - 4s
             </div>
          </footer>
        </section>
      </div>

      {/* Results Display */}
      {dmResults.length > 0 && (
         <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-[#E5E7EB] rounded-3xl p-8 shadow-sm"
         >
            <h3 className="font-black text-sm text-[#111827] uppercase tracking-widest mb-6 px-1">Relatórios de Envio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dmResults.map((r, i) => (
                    <div key={i} className={`p-4 rounded-2xl border ${r.ok ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'} text-xs font-bold`}>
                        {r.text}
                    </div>
                ))}
            </div>
         </motion.section>
      )}
    </div>
  );
}
