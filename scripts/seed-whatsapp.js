// Script para criar dados de teste para WhatsApp
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Criando dados de teste para WhatsApp...')

  // Criar contatos de teste
  const contacts = await Promise.all([
    prisma.whatsAppContact.upsert({
      where: { waId: '5588999999999' },
      update: {},
      create: {
        waId: '5588999999999',
        profileName: 'João Silva',
      },
    }),
    prisma.whatsAppContact.upsert({
      where: { waId: '5588988888888' },
      update: {},
      create: {
        waId: '5588988888888',
        profileName: 'Maria Santos',
      },
    }),
    prisma.whatsAppContact.upsert({
      where: { waId: '5588977777777' },
      update: {},
      create: {
        waId: '5588977777777',
        profileName: 'Pedro Oliveira',
      },
    }),
  ])

  console.log('✅ Contatos criados:', contacts.length)

  // Criar conversas para cada contato
  const conversations = await Promise.all(
    contacts.map((contact) =>
      prisma.whatsAppConversation.create({
        data: {
          contactId: contact.id,
          phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || 'test-phone-id',
          lastMessageAt: new Date(),
          unreadCount: Math.floor(Math.random() * 5),
          status: 'open',
        },
      })
    )
  )

  console.log('✅ Conversas criadas:', conversations.length)

  // Criar mensagens de teste
  const messages = []
  for (const conv of conversations) {
    const msgs = await Promise.all([
      prisma.whatsAppMessage.create({
        data: {
          conversationId: conv.id,
          direction: 'inbound',
          type: 'text',
          content: 'Olá! Como posso ajudar?',
          status: 'delivered',
          createdAt: new Date(Date.now() - 3600000),
        },
      }),
      prisma.whatsAppMessage.create({
        data: {
          conversationId: conv.id,
          direction: 'outbound',
          type: 'text',
          content: 'Oi! Preciso de informações sobre os produtos',
          status: 'read',
          createdAt: new Date(Date.now() - 3500000),
        },
      }),
      prisma.whatsAppMessage.create({
        data: {
          conversationId: conv.id,
          direction: 'inbound',
          type: 'text',
          content: 'Claro! Vou enviar o catálogo atualizado',
          status: 'delivered',
          createdAt: new Date(Date.now() - 3400000),
        },
      }),
    ])
    messages.push(...msgs)
  }

  console.log('✅ Mensagens criadas:', messages.length)
  console.log('✨ Dados de teste criados com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
