import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { tournamentRepository } from '@court-iq/db'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tournaments = await tournamentRepository.findAll()
  return NextResponse.json({ tournaments })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const {
    name,
    slug,
    format,
    venue,
    city,
    date,
    poolCount,
    advancersPerPool,
    bracketSize,
    description,
  } = body

  const tournament = await tournamentRepository.create({
    name,
    slug,
    format,
    venue,
    city,
    date: new Date(date),
    poolCount: poolCount ?? 2,
    advancersPerPool: advancersPerPool ?? 2,
    bracketSize: bracketSize ?? 8,
    organizerId: session.user.id as string,
    description,
  })

  return NextResponse.json({ tournament }, { status: 201 })
}
