import { NextRequest, NextResponse } from 'next/server'
import { updatePool } from '@/lib/store'
import { verifyAdminToken } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  // Verify admin authentication via cookie
  const token = req.cookies.get('ciq_admin')?.value ?? ''
  const isAuthenticated = token ? await verifyAdminToken(token) : false

  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { poolId, updates } = await req.json()

  if (!poolId || !updates) {
    return NextResponse.json({ error: 'Missing poolId or updates' }, { status: 400 })
  }

  const success = updatePool(poolId, updates)

  if (!success) {
    return NextResponse.json({ error: 'Pool not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } })
}
