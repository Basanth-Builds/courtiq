// ============================================================
// Court IQ — Tournament Repository
// All DB operations for tournaments
// ============================================================

import { prisma } from '../client'
import type { TournamentStatus } from '@prisma/client'

export const tournamentRepository = {
  async findAll() {
    return prisma.tournament.findMany({
      orderBy: { date: 'desc' },
      include: { organizer: { select: { id: true, name: true } }, _count: { select: { teams: true, matches: true } } },
    })
  },

  async findBySlug(slug: string) {
    return prisma.tournament.findUnique({
      where: { slug },
      include: {
        organizer: { select: { id: true, name: true, phone: true } },
        pools: { include: { teams: { include: { team: true } } } },
        teams: { include: { members: { include: { user: true } } } },
        matches: {
          include: {
            team1: true,
            team2: true,
            scores: true,
            umpire: { select: { id: true, name: true } },
            referee: { select: { id: true, name: true } },
          },
          orderBy: { scheduledAt: 'asc' },
        },
      },
    })
  },

  async findById(id: string) {
    return prisma.tournament.findUnique({ where: { id } })
  },

  async create(data: {
    name: string
    slug: string
    format: 'SINGLES' | 'DOUBLES' | 'MIXED_DOUBLES'
    venue: string
    city?: string
    date: Date
    poolCount: number
    advancersPerPool: number
    bracketSize: number
    organizerId: string
    description?: string
  }) {
    return prisma.tournament.create({ data })
  },

  async updateStatus(id: string, status: TournamentStatus) {
    return prisma.tournament.update({ where: { id }, data: { status } })
  },

  async delete(id: string) {
    return prisma.tournament.delete({ where: { id } })
  },
}
