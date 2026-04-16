/**
 * Cron job para renovar tokens do Instagram automaticamente
 * 
 * Este script deve ser executado periodicamente (ex: diariamente)
 * para manter os tokens sempre válidos.
 * 
 * Em produção, configure um cron job real ou use Vercel Cron Jobs.
 */

import { renewAllExpiringTokens } from '@/lib/instagram-token-manager'

export async function renewTokensCron() {
  console.log('[CRON] Iniciando renovação automática de tokens...')

  try {
    const results = await renewAllExpiringTokens()

    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    console.log(`[CRON] Renovação concluída: ${successCount} sucesso, ${failCount} falhas`)

    return {
      success: true,
      results,
      summary: {
        total: results.length,
        success: successCount,
        failed: failCount,
      },
    }
  } catch (error) {
    console.error('[CRON] Erro na renovação automática:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

// Executa se rodado diretamente
if (require.main === module) {
  renewTokensCron().then((result) => {
    console.log('[CRON] Resultado:', result)
    process.exit(result.success ? 0 : 1)
  })
}
