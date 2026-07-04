// In-memory OTP store for development
// Shared between send-otp and verify-otp routes
// Only used when NODE_ENV=development or DATABASE_URL is unset

type OtpEntry = { code: string; expiresAt: number }

// Use globalThis so it persists across hot reloads in Turbopack
const g = globalThis as any
if (!g.__courtIqDevOtpStore) {
  g.__courtIqDevOtpStore = new Map<string, OtpEntry>()
}

export const devOtpStore: Map<string, OtpEntry> = g.__courtIqDevOtpStore
