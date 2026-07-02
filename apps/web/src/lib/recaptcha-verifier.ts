'use client'
// Module-level singleton so reCAPTCHA is never initialised twice
// across hot reloads or React strict-mode double-invocations

import type { RecaptchaVerifier as RV } from 'firebase/auth'

declare global {
  interface Window {
    _courtIqRecaptcha?: RV
  }
}

export async function getRecaptchaVerifier(): Promise<RV> {
  // Return existing instance if already rendered
  if (typeof window !== 'undefined' && window._courtIqRecaptcha) {
    return window._courtIqRecaptcha
  }

  const { RecaptchaVerifier } = await import('firebase/auth')
  const { firebaseAuth }      = await import('@/lib/firebase-client')

  // Ensure the anchor div exists
  let anchor = document.getElementById('recaptcha-container')
  if (!anchor) {
    anchor = document.createElement('div')
    anchor.id = 'recaptcha-container'
    document.body.appendChild(anchor)
  }

  const verifier = new RecaptchaVerifier(firebaseAuth, anchor, {
    size: 'invisible',
    callback: () => {},
  })

  await verifier.render()
  window._courtIqRecaptcha = verifier
  return verifier
}

export function clearRecaptchaVerifier() {
  if (typeof window !== 'undefined' && window._courtIqRecaptcha) {
    try { window._courtIqRecaptcha.clear() } catch {}
    delete window._courtIqRecaptcha
  }
}
