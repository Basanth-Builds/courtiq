// ============================================================
// Court IQ — Match Repository
// All DB operations for matches, scores, approvals
// ============================================================

import { prisma } from '../client'
import type { MatchStatus, ApprovalStatus, Role } from '@prisma/client'

export const matchRepository = {
  async findByTournament(tournamentId: string) {
    return prisma.match.findMany({
      where: { tournamentId },
      include: {
        team1: { include: { members: { include: { user: true } } } },
        team2: { include: { members: { include: { user: true } } } },
        scores: { orderBy: { recordedAt: 'desc' }, take: 1 },
        umpire: { select: { id: true, name: true } },
        referee: { select: { id: true, name: true } },
        approvalEvents: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { scheduledAt: 'asc' },
    })
  },

  async findById(id: string) {
    return prisma.match.findUnique({
      where: { id },
      include: {
        team1: { include: { members: { include: { user: true } } } },
        team2: { include: { members: { include: { user: true } } } },
        scores: { orderBy: { recordedAt: 'desc' } },
        approvalEvents: { orderBy: { createdAt: 'asc' } },
        umpire: true,
        referee: true,
      },
    })
  },

  async submitScore(data: {
    matchId: string
    team1Points: number
    team2Points: number
    isComplete: boolean
    umpireId: string
  }) {
    const { matchId, team1Points, team2Points, isComplete, umpireId } = data
    return prisma.$transaction(async (tx) => {
      const score = await tx.matchScore.create({
        data: { matchId, team1Points, team2Points, isComplete, recordedById: umpireId },
      })
      const updatedMatch = await tx.match.update({
        where: { id: matchId },
        data: {
          status: isComplete ? 'PENDING_REVIEW' : 'IN_PROGRESS',
          approvalStatus: isComplete ? 'PENDING_REFEREE' : 'PENDING_UMPIRE',
          umpireId,
          ...(isComplete ? { completedAt: new Date() } : {}),
        },
      })
      if (isComplete) {
        await tx.approvalEvent.create({
          data: {
            matchId,
            actorId: umpireId,
            actorRole: 'UMPIRE' as Role,
            action: 'UMPIRE_SUBMITTED',
          },
        })
      }
      return { score, match: updatedMatch }
    })
  },

  async refereeApprove(data: {
    matchId: string
    refereeId: string
    duprEligible: boolean
    duprExclusionReason?: string
    note?: string
  }) {
    const { matchId, refereeId, duprEligible, duprExclusionReason, note } = data
    return prisma.$transaction(async (tx) => {
      const match = await tx.match.update({
        where: { id: matchId },
        data: {
          status: 'CONFIRMED',
          approvalStatus: 'APPROVED',
          refereeId,
          duprEligible,
          duprExclusionReason: duprExclusionReason ?? null,
        },
      })
      await tx.approvalEvent.create({
        data: {
          matchId,
          actorId: refereeId,
          actorRole: 'REFEREE' as Role,
          action: 'REFEREE_APPROVED',
          note,
        },
      })
      await tx.auditLog.create({
        data: {
          entityType: 'match',
          entityId: matchId,
          action: 'REFEREE_APPROVED',
          actorId: refereeId,
          matchId,
        },
      })
      return match
    })
  },

  async refereeReject(data: {
    matchId: string
    refereeId: string
    note: string
  }) {
    const { matchId, refereeId, note } = data
    return prisma.$transaction(async (tx) => {
      const match = await tx.match.update({
        where: { id: matchId },
        data: {
          status: 'DISPUTED',
          approvalStatus: 'REJECTED',
          refereeId,
        },
      })
      await tx.approvalEvent.create({
        data: {
          matchId,
          actorId: refereeId,
          actorRole: 'REFEREE' as Role,
          action: 'REFEREE_REJECTED',
          note,
        },
      })
      return match
    })
  },

  async markDuprSubmitted(matchId: string) {
    return prisma.match.update({
      where: { id: matchId },
      data: { duprSubmitted: true },
    })
  },

  async getPendingRefereeReview(tournamentId: string) {
    return prisma.match.findMany({
      where: { tournamentId, approvalStatus: 'PENDING_REFEREE' },
      include: {
        team1: true,
        team2: true,
        scores: { orderBy: { recordedAt: 'desc' }, take: 1 },
        umpire: { select: { id: true, name: true } },
      },
    })
  },

  async getConfirmedNotSubmitted(tournamentId: string) {
    return prisma.match.findMany({
      where: { tournamentId, status: 'CONFIRMED', duprEligible: true, duprSubmitted: false },
      include: {
        team1: { include: { members: { include: { user: true } } } },
        team2: { include: { members: { include: { user: true } } } },
        scores: { orderBy: { recordedAt: 'desc' }, take: 1 },
      },
    })
  },
}
