'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'

interface FacebookLoginButtonProps {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export function FacebookLoginButton({ onSuccess, onError }: FacebookLoginButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    try {
      setLoading(true)
      const result = await signIn('facebook', {
        callbackUrl: '/',
      })

      if (result?.error) {
        onError?.(result.error)
      } else {
        onSuccess?.()
      }
    } catch (error) {
      console.error('Facebook login error:', error)
      onError?.(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogin}
      disabled={loading}
      className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#1877F2] hover:bg-[#166FE5] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Entrar com Facebook
        </>
      )}
    </button>
  )
}
