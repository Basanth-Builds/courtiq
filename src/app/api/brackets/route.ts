import { NextResponse } from 'next/server'
import { TOURNAMENTS, Category, TournamentMatch } from '@/lib/tournament-data'
import { generateBracket, bracketToPlayoffMatches, getBracketVisualization } from '@/lib/bracket-generator'

// POST /api/brackets - Generate bracket for a category
export async function POST(req: Request) {
  try {
    const { categoryId, teamCount = 8 } = await req.json()

    if (!categoryId) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }

    if (![4, 8, 16].includes(teamCount)) {
      return NextResponse.json({ error: 'Team count must be 4, 8, or 16' }, { status: 400 })
    }

    const tournament = TOURNAMENTS[0] // Get first tournament
    const category = tournament.categories.find((c: Category) => c.id === categoryId)

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Generate bracket from pool results
    const bracket = generateBracket(category.pools, teamCount)
    
    // Convert to playoff matches format
    const playoffMatches = bracketToPlayoffMatches(bracket)

    // Update category with playoff matches
    category.playoffMatches = playoffMatches

    return NextResponse.json({
      success: true,
      bracket: getBracketVisualization(bracket),
      message: `Generated ${teamCount}-team bracket successfully`
    })
  } catch (error: unknown) {
    const err = error as Error
    console.error('Bracket generation error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to generate bracket' },
      { status: 500 }
    )
  }
}

// GET /api/brackets?categoryId=xxx - Get existing bracket
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get('categoryId')

    if (!categoryId) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }

    const tournament = TOURNAMENTS[0]
    const category = tournament.categories.find((c: Category) => c.id === categoryId)

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    if (category.playoffMatches.length === 0) {
      return NextResponse.json({ bracket: null, message: 'No bracket generated yet' })
    }

    // Reconstruct bracket visualization from playoff matches
    const rounds: any[] = []
    const stages = ['QUARTERFINAL', 'SEMIFINAL', 'FINAL']
    
    stages.forEach(stage => {
      const matches = category.playoffMatches.filter((m: TournamentMatch) => m.stage === stage)
      if (matches.length > 0) {
        rounds.push({
          name: stage === 'QUARTERFINAL' ? 'Quarterfinals' : stage === 'SEMIFINAL' ? 'Semifinals' : 'Final',
          matches: matches.map((m: TournamentMatch) => ({
            id: m.id,
            team1: m.team1,
            team2: m.team2,
            score1: m.finalScore?.team1,
            score2: m.finalScore?.team2,
            status: m.status
          }))
        })
      }
    })

    const thirdPlaceMatch = category.playoffMatches.find((m: TournamentMatch) => m.stage === 'THIRD_PLACE')
    const thirdPlace = thirdPlaceMatch ? {
      id: thirdPlaceMatch.id,
      team1: thirdPlaceMatch.team1,
      team2: thirdPlaceMatch.team2,
      score1: thirdPlaceMatch.finalScore?.team1,
      score2: thirdPlaceMatch.finalScore?.team2,
      status: thirdPlaceMatch.status
    } : undefined

    return NextResponse.json({
      bracket: { columns: rounds, thirdPlace }
    })
  } catch (error: unknown) {
    const err = error as Error
    console.error('Bracket fetch error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to fetch bracket' },
      { status: 500 }
    )
  }
}
