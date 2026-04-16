'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, CheckCircle, AlertCircle, XCircle, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

interface TokenStatus {
  instagramId: string
  username: string
  expiresAt: string | null
  isExpired: boolean
  isExpiringSoon: boolean
  daysUntilExpiry: number | null
}

interface TokenManagerProps {
  onTokenRenewed?: () => void
}

export function TokenManager({ onTokenRenewed }: TokenManagerProps) {
  const [tokenStatus, setTokenStatus] = useState<TokenStatus[]>([])
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    checkTokensStatus()
  }, [])

  const checkTokensStatus = async () => {
    setChecking(true)
    try {
      const response = await fetch('/api/instagram/renew-tokens')
      if (response.ok) {
        const data = await response.json()
        setTokenStatus(data.accounts || [])
      }
    } catch (error) {
      console.error('Erro ao verificar tokens:', error)
    } finally {
      setChecking(false)
    }
  }

  const handleRenewTokens = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/instagram/renew-tokens', {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        
        const successCount = data.results?.filter((r: any) => r.success).length || 0
        const totalCount = data.results?.length || 0

        if (successCount > 0) {
          toast.success(`${successCount}/${totalCount} token(s) renovado(s) com sucesso!`)
        } else {
          toast.error('Nenhum token pôde ser renovado. Reconecte sua conta.')
        }

        onTokenRenewed?.()
      } else {
        toast.error('Erro ao renovar tokens')
      }
    } catch (error) {
      toast.error('Erro ao renovar tokens')
    } finally {
      setLoading(false)
      checkTokensStatus()
    }
  }

  if (tokenStatus.length === 0 && !checking) {
    return null
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield size={24} className="text-blue-400" />
          <div>
            <h3 className="text-lg font-bold text-white">Gerenciador de Tokens</h3>
            <p className="text-sm text-slate-400">
              {tokenStatus.length} {tokenStatus.length === 1 ? 'conta conectada' : 'contas conectadas'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={checkTokensStatus}
            disabled={checking}
            className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-lg transition-colors"
            title="Verificar status"
          >
            <RefreshCw size={18} className={checking ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleRenewTokens}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Renovando...
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                Renovar Tokens
              </>
            )}
          </button>
        </div>
      </div>

      {/* Token Status List */}
      <div className="space-y-3">
        {tokenStatus.map((token) => (
          <div
            key={token.instagramId}
            className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Status Icon */}
                {token.isExpired ? (
                  <XCircle size={20} className="text-red-400" />
                ) : token.isExpiringSoon ? (
                  <AlertCircle size={20} className="text-yellow-400" />
                ) : (
                  <CheckCircle size={20} className="text-green-400" />
                )}

                <div>
                  <p className="font-bold text-white">@{token.username || 'unknown'}</p>
                  <p className="text-xs text-slate-400">
                    ID: {token.instagramId}
                  </p>
                </div>
              </div>

              <div className="text-right">
                {token.daysUntilExpiry !== null ? (
                  <>
                    <p className={`text-sm font-bold ${
                      token.isExpired
                        ? 'text-red-400'
                        : token.isExpiringSoon
                        ? 'text-yellow-400'
                        : 'text-green-400'
                    }`}>
                      {token.isExpired
                        ? 'Expirado'
                        : `${token.daysUntilExpiry} dias restantes`}
                    </p>
                    <p className="text-xs text-slate-500">
                      Expira em: {new Date(token.expiresAt!).toLocaleDateString('pt-BR')}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-slate-400">Sem expiração</p>
                )}
              </div>
            </div>

            {/* Warning/Error Messages */}
            {token.isExpired && (
              <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-xs text-red-400 font-bold">
                  ⚠️ Token expirado. Reconecte sua conta do Instagram.
                </p>
              </div>
            )}

            {token.isExpiringSoon && !token.isExpired && (
              <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-xs text-yellow-400 font-bold">
                  ⚠️ Token expirando em breve. Clique em "Renovar Tokens" abaixo.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
