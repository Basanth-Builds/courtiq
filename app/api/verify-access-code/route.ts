import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { role, code } = await request.json()

    // Get access codes from environment variables
    const organizerCode = process.env.ORGANIZER_ACCESS_CODE
    const refereeCode = process.env.REFEREE_ACCESS_CODE

    let isValid = false

    switch (role) {
      case 'organizer':
        isValid = code === organizerCode
        break
      case 'referee':
        isValid = code === refereeCode
        break
      default:
        isValid = false
    }

    return NextResponse.json({ valid: isValid })
  } catch (error) {
    console.error('Access code verification error:', error)
    return NextResponse.json({ valid: false }, { status: 400 })
  }
}