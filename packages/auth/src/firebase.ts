export interface FirebaseUserInfo {
  uid: string
  phone: string
}

interface FirebaseLookupResponse {
  users?: Array<{
    localId?: string
    phoneNumber?: string
  }>
  error?: {
    message?: string
  }
}

/**
 * Verify a Firebase ID token via the Identity Toolkit REST API.
 * Works on Node and Cloudflare Workers (no firebase-admin required).
 */
export async function verifyFirebaseIdToken(
  idToken: string
): Promise<FirebaseUserInfo | null> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? process.env.FIREBASE_API_KEY
  if (!apiKey) {
    console.error('[Court IQ] Firebase API key is not configured')
    return null
  }

  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    )

    const data = (await res.json()) as FirebaseLookupResponse
    if (!res.ok) {
      console.error('[Court IQ] Firebase token lookup failed:', data.error?.message)
      return null
    }

    const user = data.users?.[0]
    if (!user?.localId || !user.phoneNumber) {
      return null
    }

    return {
      uid: user.localId,
      phone: user.phoneNumber,
    }
  } catch (error) {
    console.error('[Court IQ] Firebase token verification error:', error)
    return null
  }
}
