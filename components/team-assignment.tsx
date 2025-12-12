'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Users, ArrowRight, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface Participant {
  id: string
  name: string
}

interface TeamWithPlayers {
  id: string
  team_number: number
  pool: number
  team_players: Array<{
    id: string
    player_name: string
  }>
}

interface TeamAssignmentProps {
  tournamentId: string
  onTeamsConfigured?: () => void
}

export default function TeamAssignment({ tournamentId, onTeamsConfigured }: TeamAssignmentProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [teams, setTeams] = useState<TeamWithPlayers[]>([])
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open])

  const fetchData = async () => {
    try {
      // Fetch participants
      const { data: partsData, error: partsError } = await supabase
        .from('tournament_participants')
        .select('id, name')
        .eq('tournament_id', tournamentId)

      if (partsError) throw partsError
      setParticipants(partsData || [])

      // Fetch or create teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select(`
          id,
          team_number,
          pool,
          team_players(id, player_name)
        `)
        .eq('tournament_id', tournamentId)
        .order('team_number', { ascending: true })

      if (teamsError) throw teamsError

      if (!teamsData || teamsData.length === 0) {
        // Create 6 teams (2 pools of 3 teams each)
        const newTeams = []
        for (let i = 1; i <= 6; i++) {
          const pool = i <= 3 ? 1 : 2
          newTeams.push({
            tournament_id: tournamentId,
            team_number: i,
            pool,
            name: `Team ${i}`,
          })
        }

        const { data: createdTeams, error: createError } = await supabase
          .from('teams')
          .insert(newTeams)
          .select(`
            id,
            team_number,
            pool,
            team_players(id, player_name)
          `)

        if (createError) throw createError
        setTeams((createdTeams as unknown as TeamWithPlayers[]) || [])
      } else {
        setTeams((teamsData as unknown as TeamWithPlayers[]) || [])
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data'
      console.error('Error fetching data:', error)
      toast.error(errorMessage)
    }
  }

  const handleAddPlayersToTeam = async (teamId: string) => {
    if (selectedPlayers.length === 0) {
      toast.error('Please select at least one player')
      return
    }

    setLoading(true)
    try {
      const teamPlayersToAdd = selectedPlayers.map(participantId => ({
        team_id: teamId,
        participant_id: participantId,
        player_name: participants.find(p => p.id === participantId)?.name || '',
      }))

      const { error } = await supabase
        .from('team_players')
        .insert(teamPlayersToAdd)

      if (error) throw error

      toast.success(`Added ${selectedPlayers.length} players to team`)
      setSelectedPlayers([])
      setSelectedTeamId(null)
      await fetchData()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add players'
      console.error('Error adding players:', error)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleRemovePlayerFromTeam = async (teamPlayerId: string) => {
    try {
      const { error } = await supabase
        .from('team_players')
        .delete()
        .eq('id', teamPlayerId)

      if (error) throw error

      toast.success('Player removed from team')
      await fetchData()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove player'
      console.error('Error removing player:', error)
      toast.error(errorMessage)
    }
  }

  const isPoolConfigured = (pool: number) => {
    const poolTeams = teams.filter(t => t.pool === pool)
    return poolTeams.every(t => t.team_players && t.team_players.length > 0)
  }

  const canStartTournament = teams.length === 6 && isPoolConfigured(1) && isPoolConfigured(2)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Users className="h-4 w-4" />
          Assign Players to Teams
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Team Assignment</DialogTitle>
          <DialogDescription>
            Assign manual participants to Team 1-6 (2 pools of 3 teams each)
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Players List */}
          <div className="space-y-3">
            <h3 className="font-semibold">Available Players ({participants.length})</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto border rounded-lg p-3">
              {participants.map(participant => (
                <div
                  key={participant.id}
                  className={`flex items-center gap-2 p-2 border rounded cursor-pointer transition-colors ${
                    selectedPlayers.includes(participant.id)
                      ? 'bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => {
                    setSelectedPlayers(prev =>
                      prev.includes(participant.id)
                        ? prev.filter(id => id !== participant.id)
                        : [...prev, participant.id]
                    )
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedPlayers.includes(participant.id)}
                    readOnly
                  />
                  <span className="flex-1">{participant.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Teams List */}
          <div className="space-y-3">
            <h3 className="font-semibold">Teams</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {/* Pool 1 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-medium text-sm">
                  <Badge>Pool 1</Badge>
                  {isPoolConfigured(1) && <Badge variant="outline" className="text-green-600">✓ Ready</Badge>}
                </div>
                {teams
                  .filter(t => t.pool === 1)
                  .map(team => (
                    <Card key={team.id} className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="font-medium">Team {team.team_number}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {team.team_players && team.team_players.length > 0 ? (
                              <div className="space-y-1">
                                {team.team_players.map((player: { id: string; player_name: string }) => (
                                  <div key={player.id} className="flex items-center justify-between">
                                    <span>{player.player_name}</span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleRemovePlayerFromTeam(player.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs">No players assigned</span>
                            )}
                          </div>
                        </div>
                        {selectedTeamId === team.id ? (
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAddPlayersToTeam(team.id)}
                              disabled={loading || selectedPlayers.length === 0}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add {selectedPlayers.length}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedTeamId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedTeamId(team.id)}
                          >
                            Assign
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
              </div>

              {/* Pool 2 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-medium text-sm">
                  <Badge>Pool 2</Badge>
                  {isPoolConfigured(2) && <Badge variant="outline" className="text-green-600">✓ Ready</Badge>}
                </div>
                {teams
                  .filter(t => t.pool === 2)
                  .map(team => (
                    <Card key={team.id} className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="font-medium">Team {team.team_number}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {team.team_players && team.team_players.length > 0 ? (
                              <div className="space-y-1">
                                {team.team_players.map((player: { id: string; player_name: string }) => (
                                  <div key={player.id} className="flex items-center justify-between">
                                    <span>{player.player_name}</span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleRemovePlayerFromTeam(player.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs">No players assigned</span>
                            )}
                          </div>
                        </div>
                        {selectedTeamId === team.id ? (
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAddPlayersToTeam(team.id)}
                              disabled={loading || selectedPlayers.length === 0}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add {selectedPlayers.length}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedTeamId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedTeamId(team.id)}
                          >
                            Assign
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center border-t pt-4 mt-6">
          <div className="text-sm text-muted-foreground">
            {canStartTournament ? (
              <span className="text-green-600 font-medium">✓ All teams configured. Ready to start tournament!</span>
            ) : (
              <span>Configure both pools before starting tournament</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setOpen(false)
                onTeamsConfigured?.()
              }}
              disabled={!canStartTournament}
              className="gap-2"
            >
              <ArrowRight className="h-4 w-4" />
              Start Tournament
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
