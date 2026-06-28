// ============================================================
// Court IQ — DUPR Export Repository
// Tracks CSV generation, submission status, and audit trail
// ============================================================

import { prisma } from '../client'
import type { ExportStatus } from '@prisma/client'

export const duprRepository = {
  async createExport(data: {
    tournamentId: string
    csvContent: string
    matchCount: number
    excludedCount: number
    exportedById: string
  }) {
    return prisma.duprExport.create({ data })
  },

  async findByTournament(tournamentId: string) {
    return prisma.duprExport.findMany({
      where: { tournamentId },
      orderBy: { exportedAt: 'desc' },
    })
  },

  async updateStatus(id: string, status: ExportStatus, notes?: string) {
    return prisma.duprExport.update({
      where: { id },
      data: { status, ...(status === 'SUBMITTED' ? { submittedAt: new Date() } : {}), notes },
    })
  },

  async getLatest(tournamentId: string) {
    return prisma.duprExport.findFirst({
      where: { tournamentId },
      orderBy: { exportedAt: 'desc' },
    })
  },
}
