'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Play, Eye } from 'lucide-react'
import Link from 'next/link'
import CreateMatchDialog from './create-match-dialog'

interface Match {
  id: string
  team1_players: string[]
  team2_players: string[]
  referee: string | null
  scheduled_at: string
  status: 'scheduled' | 'live' | 'completed'
  score_team1: number
  score_team2: number
  profiles?: { name: string } | null
}

interface Player {
  id: string
  name: string
}

interface TournamentMatchesProps {
  matches: Match[]
  players: Player[]
  tournamentId: string
  isOrganizer?: boolean
}

export default function TournamentMatches({ 
  matches, 
  players, 
  tournamentId, 
  isOrganizer = false 
}: TournamentMatchesProps) {
  const [showCreateMatch, setShowCreateMatch] = useState(false)

  const getPlayerName = (playerId: string) => {
    return players.find(p => p.id === playerId)?.name || 'Unknown Player'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-neon/20 text-neon'
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Matches</CardTitle>
            <CardDescription>Tournament fixtures and results</CardDescription>
          </div>
          {isOrganizer && (
            <Button 
              onClick={() => setShowCreateMatch(true)}
              className="athletic-button"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Match
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {matches.length > 0 ? (
          <div className="space-y-4">
            {matches.map((match) => (
              <div key={match.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(match.status)}>
                      {match.status.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(match.scheduled_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {match.status === 'live' && (
                      <Link href={`/audience/match/${match.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Watch Live
                        </Button>
                      </Link>
                    )}
                    {isOrganizer && match.status === 'scheduled' && (
                      <Button variant="outline" size="sm">
                        <Play className="h-4 w-4 mr-1" />
                        Start Match
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  {/* Team 1 */}
                  <div className="text-center">
                    <div className="font-semibold mb-1">Team 1</div>
                    <div className="text-sm space-y-1">
                      {match.team1_players.map((playerId) => (
                        <div key={playerId}>{getPlayerName(playerId)}</div>
                      ))}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-center">
                    {match.status !== 'scheduled' ? (
                      <div className="text-2xl font-bold">
                        <span className={match.score_team1 > match.score_team2 ? 'neon-glow' : ''}>
                          {match.score_team1}
                        </span>
                        <span className="mx-2">-</span>
                        <span className={match.score_team2 > match.score_team1 ? 'neon-glow' : ''}>
                          {match.score_team2}
                        </span>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">vs</div>
                    )}
                  </div>

                  {/* Team 2 */}
                  <div className="text-center">
                    <div className="font-semibold mb-1">Team 2</div>
                    <div className="text-sm space-y-1">
                      {match.team2_players.map((playerId) => (
                        <div key={playerId}>{getPlayerName(playerId)}</div>
                      ))}
                    </div>
                  </div>
                </div>

                {match.profiles?.name && (
                  <div className="mt-3 text-center text-sm text-muted-foreground">
                    Referee: {match.profiles.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No matches yet</h3>
            <p className="text-muted-foreground mb-4">Create your first match to get started</p>
            {isOrganizer && (
              <Button 
                onClick={() => setShowCreateMatch(true)}
                className="athletic-button"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Match
              </Button>
            )}
          </div>
        )}
      </CardContent>

      {showCreateMatch && (
        <CreateMatchDialog
          tournamentId={tournamentId}
          players={players}
          onClose={() => setShowCreateMatch(false)}
        />
      )}
    </Card>
  )
}