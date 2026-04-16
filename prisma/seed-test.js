// Script para criar dados de teste
const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function main() {
  console.log("Criando usuário de teste...")
  
  // Cria um usuário de teste
  const user = await prisma.user.upsert({
    where: { email: "teste@creao.com" },
    update: {},
    create: {
      email: "teste@creao.com",
      name: "Usuário Teste",
    },
  })
  
  console.log("Usuário criado:", user.id)
  
  // Cria algumas campanhas de exemplo
  const now = new Date()
  const campaigns = [
    {
      userId: user.id,
      name: "Promoção de Páscoa",
      platform: "instagram",
      status: "scheduled",
      scheduledAt: new Date(now.getTime() + 2 * 60 * 60 * 1000), // +2 horas
      content: "🐰 Feliz Páscoa! Aproveite nossas ofertas especiais de chocolates e ovos de páscoa com até 50% OFF! #Pascoa #Ofertas #Chocolate",
    },
    {
      userId: user.id,
      name: "Black Friday Antecipada",
      platform: "facebook",
      status: "active",
      scheduledAt: new Date(now.getTime() - 1 * 60 * 60 * 1000), // -1 hora (já começou)
      content: "🔥 BLACK FRIDAY ANTECIPADA! Descontos incríveis em todos os produtos. Corra, é por tempo limitado!",
    },
    {
      userId: user.id,
      name: "Grupo VIP WhatsApp",
      platform: "whatsapp",
      status: "scheduled",
      scheduledAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // +1 dia
      content: "Entre no nosso grupo VIP e receba ofertas exclusivas antes de todo mundo! Clique no link para participar.",
    },
  ]
  
  for (const campaign of campaigns) {
    await prisma.campaign.create({
      data: campaign,
    })
    console.log("Campanha criada:", campaign.name)
  }
  
  console.log("Dados de teste criados com sucesso!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
