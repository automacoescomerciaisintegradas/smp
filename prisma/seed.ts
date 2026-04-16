import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample class with blocks
  const class1 = await prisma.class.create({
    data: {
      name: 'Curso de Marketing Digital',
      description: 'Aprenda estratégias avançadas de marketing digital para redes sociais',
      startDate: new Date('2026-05-01T09:00:00'),
      endDate: new Date('2026-06-30T18:00:00'),
      price: 997.00,
      maxStudents: 50,
      status: 'active',
      blocks: {
        create: [
          {
            name: 'Módulo 1: Fundamentos',
            description: 'Base do marketing digital',
            startDate: new Date('2026-05-01T09:00:00'),
            endDate: new Date('2026-05-15T18:00:00'),
            price: 497.00,
            maxStudents: 50,
            order: 0
          },
          {
            name: 'Módulo 2: Instagram Avançado',
            description: 'Estratégias avançadas para Instagram',
            startDate: new Date('2026-05-16T09:00:00'),
            endDate: new Date('2026-06-15T18:00:00'),
            price: 597.00,
            maxStudents: 40,
            order: 1
          },
          {
            name: 'Módulo 3: Tráfego Pago',
            description: 'Facebook Ads e Google Ads',
            startDate: new Date('2026-06-16T09:00:00'),
            endDate: new Date('2026-06-30T18:00:00'),
            price: 697.00,
            maxStudents: 30,
            order: 2
          }
        ]
      },
      promotions: {
        create: [
          {
            code: 'EARLY20',
            discount: 20,
            type: 'percentage',
            maxUses: 10,
            validUntil: new Date('2026-04-30T23:59:59'),
            isActive: true
          },
          {
            code: 'PROMO50',
            discount: 50,
            type: 'fixed',
            maxUses: 5,
            validUntil: new Date('2026-04-20T23:59:59'),
            isActive: true
          }
        ]
      }
    },
    include: {
      blocks: true,
      promotions: true
    }
  })

  console.log(`✅ Class created: ${class1.name}`)

  // Create another class
  const class2 = await prisma.class.create({
    data: {
      name: 'Workshop de Redes Sociais',
      description: 'Workshop intensivo de 2 dias sobre gestão de redes sociais',
      startDate: new Date('2026-05-15T10:00:00'),
      endDate: new Date('2026-05-16T18:00:00'),
      price: 297.00,
      maxStudents: 100,
      status: 'active',
      blocks: {
        create: [
          {
            name: 'Dia 1: Conteúdo e Estratégia',
            startDate: new Date('2026-05-15T10:00:00'),
            endDate: new Date('2026-05-15T18:00:00'),
            price: 147.00,
            order: 0
          },
          {
            name: 'Dia 2: Análise e Otimização',
            startDate: new Date('2026-05-16T10:00:00'),
            endDate: new Date('2026-05-16T18:00:00'),
            price: 147.00,
            order: 1
          }
        ]
      }
    },
    include: {
      blocks: true
    }
  })

  console.log(`✅ Class created: ${class2.name}`)

  // Create loyalty program
  const loyaltyProgram = await prisma.loyaltyProgram.create({
    data: {
      name: 'Programa de Fidelidade - Social Flow',
      description: 'Ganhe pontos ao participar de cursos e promover nossa marca',
      companyId: 'default-company',
      isActive: true,
      rules: JSON.stringify({
        purchase: { points: 100, description: 'Pontos por inscrição' },
        referral: { points: 200, description: 'Pontos por indicação' },
        social_share: { points: 50, description: 'Pontos por postagem em redes sociais' },
        bonus: { points: 150, description: 'Pontos bônus por eventos' }
      })
    }
  })

  console.log(`✅ Loyalty program created: ${loyaltyProgram.name}`)

  // Create rewards
  const rewards = await Promise.all([
    prisma.reward.create({
      data: {
        programId: loyaltyProgram.id,
        name: 'Desconto 20% Próximo Curso',
        description: 'Ganhe 20% de desconto em qualquer curso',
        pointsCost: 500,
        type: 'discount',
        value: 20,
        isActive: true,
        stock: 50
      }
    }),
    prisma.reward.create({
      data: {
        programId: loyaltyProgram.id,
        name: 'Consultoria Individual',
        description: 'Sessão de 1 hora com especialista',
        pointsCost: 1000,
        type: 'experience',
        value: 250,
        isActive: true,
        stock: 10
      }
    }),
    prisma.reward.create({
      data: {
        programId: loyaltyProgram.id,
        name: 'E-book Exclusivo',
        description: 'E-book com estratégias avançadas',
        pointsCost: 300,
        type: 'product',
        value: 47,
        isActive: true,
        stock: 100
      }
    }),
    prisma.reward.create({
      data: {
        programId: loyaltyProgram.id,
        name: 'Cashback R$50',
        description: 'R$50 de cashback na próxima compra',
        pointsCost: 800,
        type: 'cashback',
        value: 50,
        isActive: true,
        stock: 20
      }
    })
  ])

  console.log(`✅ ${rewards.length} rewards created`)

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
