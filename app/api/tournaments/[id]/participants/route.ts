import { createServerComponentClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/tournaments/[id]/participants
 * Fetch manual participants for a tournament
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerComponentClient()

    // Verify user is the tournament organizer
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if tournament belongs to this organizer
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('organizer')
      .eq('id', id)
      .single()

    if (tournamentError || !tournament || tournament.organizer !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch participants
    const { data: participants, error: participantsError } = await supabase
      .from('tournament_participants')
      .select('*')
      .eq('tournament_id', id)
      .order('created_at', { ascending: false })

    if (participantsError) {
      throw participantsError
    }

    return NextResponse.json({ participants })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch participants'
    console.error('Error fetching participants:', error)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/tournaments/[id]/participants/[participantId]
 * Delete a manual participant
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const participantId = searchParams.get('participantId')

    if (!participantId) {
      return NextResponse.json(
        { error: 'Missing participantId parameter' },
        { status: 400 }
      )
    }

    const supabase = await createServerComponentClient()

    // Verify user is the tournament organizer
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if tournament belongs to this organizer
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('organizer')
      .eq('id', id)
      .single()

    if (tournamentError || !tournament || tournament.organizer !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete participant
    const { error: deleteError } = await supabase
      .from('tournament_participants')
      .delete()
      .eq('id', participantId)
      .eq('tournament_id', id)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete participant'
    console.error('Error deleting participant:', error)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
