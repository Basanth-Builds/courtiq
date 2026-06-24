// ============================================================
// Court IQ — Database Seed Script
// Creates sample tournament, teams, and users for dev/demo
// ============================================================

import { PrismaClient, Role, TournamentStatus, MatchFormat, MatchStage, MatchStatus, ApprovalStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('\ud83c� Seeding Court IQ database...\n')

  // --- Cleanup ---
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.approvalEvent.deleteMany(),
    prisma.matchScore.deleteMany(),
    prisma.match.deleteMany(),
    prisma.poolTeam.deleteMany(),
    prisma.pool.deleteMany(),
    prisma.teamMember.deleteMany(),
    prisma.team.deleteMany(),
    prisma.tournament.deleteMany(),
    prisma.otpSession.deleteMany(),
    prisma.user.deleteMany(),
  ])

  // --- Users ---
  const admin = await prisma.user.create({
    data: { phone: '+919999000001', name: 'Raj Admin', role: Role.ADMIN },
  })
  const referee = await prisma.user.create({
    data: { phone: '+919999000002', name: 'Priya Referee', role: Role.REFEREE },
  })
  const umpire = await prisma.user.create({
    data: { phone: '+919999000003', name: 'Sam Umpire', role: Role.UMPIRE },
  })

  const playerData = [
    { phone: '+919001000001', name: 'Arjun Sharma', duprId: 'DUPR001', duprRating: 4.5 },
    { phone: '+919001000002', name: 'Vikram Nair', duprId: 'DUPR002', duprRating: 4.2 },
    { phone: '+919001000003', name: 'Ravi Kulkarni', duprId: 'DUPR003', duprRating: 3.9 },
    { phone: '+919001000004', name: 'Deepak Menon', duprId: 'DUPR004', duprRating: 4.0 },
    { phone: '+919001000005', name: 'Kiran Patel', duprId: 'DUPR005', duprRating: 3.7 },
    { phone: '+919001000006', name: 'Suresh Iyer', duprId: 'DUPR006', duprRating: 4.1 },
    { phone: '+919001000007', name: 'Anil Bose', duprId: 'DUPR007', duprRating: 3.5 },
    { phone: '+919001000008', name: 'Nikhil Das', duprId: 'DUPR008', duprRating: 3.8 },
  ]

  const players = await Promise.all(
    playerData.map((p) =>
      prisma.user.create({ data: { ...p, role: Role.SPECTATOR } })
    )
  )

  console.log(`✅ Created ${players.length + 3} users`)

  // --- Tournament ---
  const tournament = await prisma.tournament.create({
    data: {
      name: 'Court IQ Open 2026',
      slug: 'court-iq-open-2026',
      status: TournamentStatus.ACTIVE,
      format: MatchFormat.DOUBLES,
      venue: 'Pickleball Arena Mumbai',
      city: 'Mumbai',
      date: new Date('2026-07-15'),
      poolCount: 2,
      advancersPerPool: 2,
      bracketSize: 4,
      description: 'The inaugural Court IQ Open tournament for pickleball enthusiasts.',
      organizerId: admin.id,
    },
  })
  console.log(`✅ Created tournament: ${tournament.name}`)

  // --- Teams (4 doubles teams) ---
  const teamsData = [
    { name: 'Smash Bros', player1: players[0], player2: players[1], avgRating: (4.5 + 4.2) / 2 },
    { name: 'Net Ninjas', player1: players[2], player2: players[3], avgRating: (3.9 + 4.0) / 2 },
    { name: 'Dink Kings', player1: players[4], player2: players[5], avgRating: (3.7 + 4.1) / 2 },
    { name: 'Drop Shot Duo', player1: players[6], player2: players[7], avgRating: (3.5 + 3.8) / 2 },
  ]

  const teams = await Promise.all(
    teamsData.map(async (t) => {
      const team = await prisma.team.create({
        data: {
          name: t.name,
          tournamentId: tournament.id,
          duprRating: t.avgRating,
        },
      })
      await prisma.teamMember.createMany({
        data: [
          { teamId: team.id, userId: t.player1.id },
          { teamId: team.id, userId: t.player2.id },
        ],
      })
      return team
    })
  )
  console.log(`✅ Created ${teams.length} teams`)

  // --- Pools ---
  const poolA = await prisma.pool.create({
    data: {
      name: 'Pool A',
      tournamentId: tournament.id,
      teams: {
        create: [
          { teamId: teams[0].id, seed: 1 },
          { teamId: teams[3].id, seed: 2 },
        ],
      },
    },
  })

  const poolB = await prisma.pool.create({
    data: {
      name: 'Pool B',
      tournamentId: tournament.id,
      teams: {
        create: [
          { teamId: teams[1].id, seed: 1 },
          { teamId: teams[2].id, seed: 2 },
        ],
      },
    },
  })

  console.log(`✅ Created 2 pools (Pool A, Pool B)`)

  // --- Matches ---
  const match1 = await prisma.match.create({
    data: {
      tournamentId: tournament.id,
      poolId: poolA.id,
      stage: MatchStage.POOL,
      team1Id: teams[0].id,
      team2Id: teams[3].id,
      courtNumber: 1,
      scheduledAt: new Date('2026-07-15T09:00:00'),
      status: MatchStatus.CONFIRMED,
      approvalStatus: ApprovalStatus.APPROVED,
      umpireId: umpire.id,
      refereeId: referee.id,
      duprEligible: true,
      duprSubmitted: false,
      completedAt: new Date('2026-07-15T09:30:00'),
      scores: {
        create: {
          team1Points: 11,
          team2Points: 7,
          isComplete: true,
          recordedById: umpire.id,
        },
      },
    },
  })

  const match2 = await prisma.match.create({
    data: {
      tournamentId: tournament.id,
      poolId: poolB.id,
      stage: MatchStage.POOL,
      team1Id: teams[1].id,
      team2Id: teams[2].id,
      courtNumber: 2,
      scheduledAt: new Date('2026-07-15T09:00:00'),
      status: MatchStatus.PENDING_REVIEW,
      approvalStatus: ApprovalStatus.PENDING_REFEREE,
      umpireId: umpire.id,
      duprEligible: true,
      duprSubmitted: false,
    },
  })

  console.log(`✅ Created ${2} sample matches`)

  // --- Approval Events ---
  await prisma.approvalEvent.create({
    data: {
      matchId: match1.id,
      actorId: umpire.id,
      actorRole: Role.UMPIRE,
      action: 'UMPIRE_SUBMITTED',
    },
  })
  await prisma.approvalEvent.create({
    data: {
      matchId: match1.id,
      actorId: referee.id,
      actorRole: Role.REFEREE,
      action: 'REFEREE_APPROVED',
    },
  })

  console.log(`\n\ud83c� Seed complete! Court IQ database is ready for dev.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
