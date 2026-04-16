/**
 * Utilitário CLI para configurar manualmente uma conta do Instagram
 * 
 * Uso:
 * npx ts-node scripts/setup-instagram-manual.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface SetupConfig {
  userId: string
  instagramId: string
  username: string
  accessToken: string
  expiresAt?: Date
}

async function main() {
  console.log('===============================================')
  console.log('  Configuração Manual do Instagram')
  console.log('===============================================\n')

  // Dados da Página 1: Automacoescomerciais
  const page1: SetupConfig = {
    userId: 'COLE_SEU_USER_ID_AQUI', // Substitua pelo ID real do usuário
    instagramId: 'COLE_INSTAGRAM_ID_AQUI', // Será obtido após verificar
    username: 'automacoescomerciais',
    accessToken: 'EAA0ZCSdRLI3EBRIPDZCydCuj91HU2hiHOTqfOdOyCLRMRdVWZBZCHRXK0YIgtFVrgBMaIMJnPNF7RqAEYZAaoQ2Vj12YJffeZC1vhv4yT6e6ZAyBRmmWxt9wWvi3y4E5OCStlljcn33lv3npeNssV9om7SASjjR2ZAJRnu5MH2Fqy9AryAvqMnxlicW798hErqVKqWsjhGZAoynPD4Cf0pZBLNFd3B2oiWLLjoqzufdgohifAZD',
    expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 dias
  }

  // Dados da Página 2: Automações Comerciais Integradas
  const page2: SetupConfig = {
    userId: 'COLE_SEU_USER_ID_AQUI',
    instagramId: 'COLE_INSTAGRAM_ID_AQUI',
    username: 'automacoes_comerciais_integradas',
    accessToken: 'EAA0ZCSdRLI3EBRJWlfA7sDAk5zZCFEObJsvvg3QOjCUkm6fMexLNhxi3mYhNYwuDLjNdBvZAXA7coMbqFjPJUjBuelfborOtguMvLxybv9yot1Hvb4CRE7BSZCepi6rwVOm9gxkYqfNoWoZBEFIZBL8O25CpTNJCG0izN4FpMOVEVMzZAoi6afnieYXeUyZASh2MsZAv3Yxy8gwyCRWy8KlNS46YPOKqwGTysKcqL1HTdQIMZD',
    expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
  }

  // Primeiro, busque o ID do usuário
  console.log('Buscando usuário no banco...')
  const user = await prisma.user.findFirst({
    orderBy: { id: 'desc' },
  })

  if (!user) {
    console.error('❌ Nenhum usuário encontrado. Crie um usuário primeiro.')
    return
  }

  console.log(`✅ Usuário encontrado: ${user.email} (ID: ${user.id})\n`)

  // Atualiza os configs com o user ID correto
  page1.userId = user.id
  page2.userId = user.id

  // Pergunta qual página configurar
  console.log('Escolha a página para configurar:')
  console.log('1. Automacoescomerciais')
  console.log('2. Automações Comerciais Integradas')
  console.log('3. Ambas')
  
  // Como não temos input interativo fácil, configure manualmente aqui:
  let escolha: '1' | '2' | '3' = (process.env.SETUP_PAGE_CHOICE as '1' | '2' | '3') || '1'

  if (escolha === '1' || escolha === '3') {
    console.log('\n📝 Configurando Página 1: Automacoescomerciais')
    console.log('⚠️  Você precisa informar o Instagram Business Account ID')
    console.log('   Execute o script verify-pages.ps1 para obter este ID\n')

    // Aqui você coloca o ID que obteve do script
    const instagramId = process.env.INSTAGRAM_ID_PAGE1 || ''
    
    if (!instagramId) {
      console.log('⚠️  Instagram ID não fornecido. Pulando...')
    } else {
      page1.instagramId = instagramId

      await prisma.instagramAccount.upsert({
        where: { instagramId: page1.instagramId },
        update: {
          accessToken: page1.accessToken,
          expiresAt: page1.expiresAt,
          username: page1.username,
        },
        create: {
          userId: page1.userId,
          instagramId: page1.instagramId,
          accessToken: page1.accessToken,
          expiresAt: page1.expiresAt,
          username: page1.username,
          profilePictureUrl: null,
          followersCount: 0,
        },
      })

      console.log(`✅ Página 1 configurada com sucesso!`)
      console.log(`   Instagram: @${page1.username}`)
      console.log(`   Token válido até: ${page1.expiresAt?.toISOString()}`)
    }
  }

  if (escolha === '3') {
    console.log('\n📝 Configurando Página 2: Automações Comerciais Integradas')
    
    const instagramId = process.env.INSTAGRAM_ID_PAGE2 || ''
    
    if (!instagramId) {
      console.log('⚠️  Instagram ID não fornecido. Pulando...')
    } else {
      page2.instagramId = instagramId

      await prisma.instagramAccount.upsert({
        where: { instagramId: page2.instagramId },
        update: {
          accessToken: page2.accessToken,
          expiresAt: page2.expiresAt,
          username: page2.username,
        },
        create: {
          userId: page2.userId,
          instagramId: page2.instagramId,
          accessToken: page2.accessToken,
          expiresAt: page2.expiresAt,
          username: page2.username,
          profilePictureUrl: null,
          followersCount: 0,
        },
      })

      console.log(`✅ Página 2 configurada com sucesso!`)
      console.log(`   Instagram: @${page2.username}`)
      console.log(`   Token válido até: ${page2.expiresAt?.toISOString()}`)
    }
  }

  // Mostra contas configuradas
  console.log('\n===============================================')
  console.log('  Contas Configuradas')
  console.log('===============================================\n')

  const accounts = await prisma.instagramAccount.findMany({
    where: { userId: user.id },
  })

  if (accounts.length === 0) {
    console.log('Nenhuma conta configurada.')
  } else {
    for (const acc of accounts) {
      const daysLeft = acc.expiresAt
        ? Math.floor((acc.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 'N/A'

      console.log(`📸 @${acc.username || 'unknown'}`)
      console.log(`   ID: ${acc.instagramId}`)
      console.log(`   Token expira em: ${daysLeft} dias`)
      console.log('')
    }
  }

  console.log('✅ Configuração concluída!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
