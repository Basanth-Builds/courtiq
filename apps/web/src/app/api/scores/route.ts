import { NextRequest, NextResponse } from 'next/server'
import { getTournamentStore } from '@/lib/store'

// GET all tournament data - PUBLIC (no auth needed)
export async function GET() {
  const tournaments = getTournamentStore()
  return NextResponse.json({ tournaments }, { headers: { 'Cache-Control': 'no-store' } })
}
