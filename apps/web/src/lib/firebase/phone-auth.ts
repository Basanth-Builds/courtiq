'use client'

import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth'
import { getFirebaseAuth } from './client'

let recaptchaVerifier: RecaptchaVerifier | null = null
let recaptchaReady: Promise<RecaptchaVerifier> | null = null

export function formatPhoneE164(phone: string, countryCode = '+91'): string {
  const digits = phone.replace(/\D/g, '')

  if (phone.startsWith('+')) {
    return `+${digits}`
  }

  const local = digits.startsWith('0') ? digits.slice(1) : digits
  const cc = countryCode.replace(/\D/g, '')
  return `+${cc}${local}`
}

function useVisibleRecaptcha(): boolean {
  // Visible reCAPTCHA is more reliable on localhost and with Firefox tracking protection.
  return process.env.NODE_ENV === 'development'
}

export async function ensureRecaptcha(containerId: string): Promise<RecaptchaVerifier> {
  if (recaptchaVerifier) {
    return recaptchaVerifier
  }

  if (recaptchaReady) {
    return recaptchaReady
  }

  recaptchaReady = (async () => {
    const auth = getFirebaseAuth()
    const container = document.getElementById(containerId)
    if (!container) {
      throw new Error('reCAPTCHA container not found')
    }

    // Clear stale widgets if hot-reload left any behind.
    container.innerHTML = ''

    const verifier = new RecaptchaVerifier(auth, container, {
      size: useVisibleRecaptcha() ? 'normal' : 'invisible',
      callback: () => {},
      'expired-callback': () => {
        resetRecaptcha()
      },
    })

    await verifier.render()
    recaptchaVerifier = verifier
    return verifier
  })()

  try {
    return await recaptchaReady
  } catch (error) {
    recaptchaReady = null
    throw error
  }
}

export async function sendPhoneOtp(
  phone: string,
  containerId: string
): Promise<{ confirmation: ConfirmationResult; formattedPhone: string }> {
  const formattedPhone = formatPhoneE164(phone)
  const verifier = await ensureRecaptcha(containerId)
  const auth = getFirebaseAuth()
  const confirmation = await signInWithPhoneNumber(auth, formattedPhone, verifier)

  return { confirmation, formattedPhone }
}

export function resetRecaptcha(): void {
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear()
    } catch {
      // ignore — widget may already be torn down
    }
    recaptchaVerifier = null
  }
  recaptchaReady = null
}

export function mapFirebaseAuthError(error: unknown): string {
  if (error instanceof Error && error.message && !('code' in error)) {
    return error.message
  }

  const firebaseError = error as { code?: string; message?: string }
  const code = firebaseError?.code
  const message = firebaseError?.message

  switch (code) {
    case 'auth/invalid-phone-number':
      return 'Invalid phone number. Use a valid mobile number.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait and try again.'
    case 'auth/captcha-check-failed':
      return 'Security check failed. Complete the reCAPTCHA and try again.'
    case 'auth/invalid-verification-code':
      return 'Invalid code. Please try again.'
    case 'auth/code-expired':
      return 'Code expired. Request a new one.'
    case 'auth/missing-verification-code':
      return 'Enter the 6-digit verification code.'
    case 'auth/operation-not-allowed':
      return 'Phone sign-in is not enabled. Enable it in Firebase Console → Authentication → Sign-in method.'
    case 'auth/invalid-app-credential':
    case 'auth/app-not-authorized':
      return 'App not authorized. Add localhost to Firebase authorized domains and check your API key restrictions.'
    case 'auth/quota-exceeded':
      return 'SMS quota exceeded. Try again later or use a Firebase test phone number.'
    case 'auth/billing-not-enabled':
      return 'Firebase billing must be enabled for phone auth on this project.'
    default:
      if (process.env.NODE_ENV === 'development' && message) {
        return message
      }
      return 'Something went wrong. Please try again.'
  }
}
