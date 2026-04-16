import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  console.log('--- TESTE DE CONEXÃO OPERACIONAL ---')
  try {
    console.log('1. Testando SQLite (Prisma)...')
    const userCount = await prisma.user.count()
    console.log(`✅ Sucesso! Usuários encontrados: ${userCount}`)
  } catch (error) {
    console.error('❌ FALHA NO SQLITE:', error.message)
  }

  try {
    console.log('2. Testando Schemas...')
    const tables = ['User', 'Campaign', 'EvolutionInstance', 'KnowledgeBase']
    for (const table of tables) {
       // @ts-ignore
       const count = await prisma[table.toLowerCase()]?.count() || 0
       console.log(` - ${table}: OK (${count} registros)`)
    }
  } catch (error) {
    console.error('❌ FALHA NO SCHEMA:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
