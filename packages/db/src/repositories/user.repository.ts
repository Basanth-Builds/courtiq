// ============================================================
// Court IQ — User Repository
// Auth, role management, OTP
// ============================================================

import { prisma } from '../client'
import type { Role } from '@prisma/client'

export const userRepository = {
  async findByPhone(phone: string) {
    return prisma.user.findUnique({ where: { phone } })
  },

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } })
  },

  async upsertByPhone(phone: string, name?: string) {
    return prisma.user.upsert({
      where: { phone },
      update: { ...(name ? { name } : {}) },
      create: { phone, name, role: 'SPECTATOR' },
    })
  },

  async updateRole(id: string, role: Role) {
    return prisma.user.update({ where: { id }, data: { role } })
  },

  async updateDUPR(id: string, duprId: string, duprRating?: number) {
    return prisma.user.update({
      where: { id },
      data: { duprId, ...(duprRating !== undefined ? { duprRating } : {}) },
    })
  },

  // OTP Sessions
  async createOtpSession(phone: string, code: string, expiresAt: Date) {
    return prisma.otpSession.create({ data: { phone, code, expiresAt } })
  },

  async verifyOtpSession(phone: string, code: string) {
    const session = await prisma.otpSession.findFirst({
      where: {
        phone,
        code,
        verified: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })
    if (!session) return null
    await prisma.otpSession.update({ where: { id: session.id }, data: { verified: true } })
    return session
  },

  async cleanExpiredOtpSessions() {
    return prisma.otpSession.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    })
  },

  async listByRole(role: Role) {
    return prisma.user.findMany({ where: { role }, orderBy: { name: 'asc' } })
  },
}
