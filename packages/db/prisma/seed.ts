import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Court IQ database...')

  // Admin user
  const admin = await prisma.user.upsert({
    where: { phone: '+919999999999' },
    update: {},
    create: {
      phone: '+919999999999',
      name: 'Tournament Admin',
      role: 'ADMIN',
      duprId: 'ADM001',
      duprRating: 4.5,
    },
  })

  // Sample referee
  const referee = await prisma.user.upsert({
    where: { phone: '+919888888888' },
    update: {},
    create: {
      phone: '+919888888888',
      name: 'Head Referee',
      role: 'REFEREE',
    },
  })

  // Sample umpire
  const umpire = await prisma.user.upsert({
    where: { phone: '+919777777777' },
    update: {},
    create: {
      phone: '+919777777777',
      name: 'Court Umpire 1',
      role: 'UMPIRE',
    },
  })

  // Sample tournament
  const tournament = await prisma.tournament.upsert({
    where: { slug: 'court-iq-open-2026' },
    update: {},
    create: {
      name: 'Court IQ Open 2026',
      slug: 'court-iq-open-2026',
      status: 'DRAFT',
      format: 'DOUBLES',
      location: 'Mumbai, India',
      startDate: new Date('2026-08-01'),
      endDate: new Date('2026-08-03'),
      createdById: admin.id,
    },
  })

  // Courts
  await prisma.court.createMany({
    data: [
      { name: 'Court 1', tournamentId: tournament.id },
      { name: 'Court 2', tournamentId: tournament.id },
      { name: 'Court 3', tournamentId: tournament.id },
      { name: 'Court 4', tournamentId: tournament.id },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Seed complete')
  console.log({ admin: admin.phone, referee: referee.phone, umpire: umpire.phone })
  console.log({ tournament: tournament.name })
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
