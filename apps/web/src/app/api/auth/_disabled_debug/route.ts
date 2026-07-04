// DEBUG ROUTE — remove before deploying to production
// Hit GET /api/auth/debug to confirm env vars and Firebase Admin are working
import { NextResponse } from 'next/server'

export async function GET() {
  const checks: Record<string, any> = {
    AUTH_SECRET:           !!process.env.AUTH_SECRET,
    FIREBASE_PROJECT_ID:   !!process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY:  !!process.env.FIREBASE_PRIVATE_KEY,
    privateKeyLength:      process.env.FIREBASE_PRIVATE_KEY?.length ?? 0,
    privateKeyHasNewlines: process.env.FIREBASE_PRIVATE_KEY?.includes('\n') ?? false,
    privateKeyHasEscaped:  process.env.FIREBASE_PRIVATE_KEY?.includes('\\n') ?? false,
  }

  try {
    const { getApps, initializeApp, cert } = await import('firebase-admin/app')
    const { getAuth } = await import('firebase-admin/auth')
    const rawKey = process.env.FIREBASE_PRIVATE_KEY!
    const privateKey = rawKey.includes('\\n') ? rawKey.replace(/\\n/g, '\n') : rawKey
    const app = getApps().length > 0
      ? getApps()[0]
      : initializeApp({ credential: cert({
          projectId:   process.env.FIREBASE_PROJECT_ID!,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
          privateKey,
        })})
    // Just verify the app is set up — don't call any auth methods
    checks.firebaseAdminInit = 'OK'
    checks.firebaseProjectId = app.options.projectId
  } catch (e: any) {
    checks.firebaseAdminInit = 'FAILED'
    checks.firebaseAdminError = e?.message
  }

  return NextResponse.json(checks)
}
