// ============================================================
// Court IQ — OTP Generation & Sending
// Uses Twilio Verify or falls back to console in development
// ============================================================

import { z } from 'zod'

const phoneSchema = z.string().min(10).max(15)

/**
 * Generate a 6-digit OTP code.
 */
export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Send OTP to a phone number.
 * In production: uses Twilio Verify.
 * In development: logs code to console.
 */
export async function sendOtp(phone: string): Promise<{ success: boolean; error?: string }> {
  const parsed = phoneSchema.safeParse(phone)
  if (!parsed.success) {
    return { success: false, error: 'Invalid phone number' }
  }

  const code = generateOtpCode()

  if (process.env.NODE_ENV === 'development' || !process.env.TWILIO_ACCOUNT_SID) {
    // Dev mode: log OTP to console
    console.log(`\n📱 Court IQ OTP for ${phone}: ${code}\n`)
    await storeDevelopmentOtp(phone, code)
    return { success: true }
  }

  // Production: Twilio Verify
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID!
    const authToken = process.env.TWILIO_AUTH_TOKEN!
    const verifySid = process.env.TWILIO_VERIFY_SID!

    const response = await fetch(
      `https://verify.twilio.com/v2/Services/${verifySid}/Verifications`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        },
        body: new URLSearchParams({ To: phone, Channel: 'sms' }),
      }
    )

    if (!response.ok) {
      const err = await response.json() as { message?: string }
      return { success: false, error: err.message ?? 'Failed to send OTP' }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'OTP service unavailable' }
  }
}

/**
 * Store OTP in DB for development/fallback flow.
 * In production with Twilio Verify, verification is handled by Twilio directly.
 */
async function storeDevelopmentOtp(phone: string, code: string): Promise<void> {
  const { userRepository } = await import('@court-iq/db')
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  await userRepository.createOtpSession(phone, code, expiresAt)
}
