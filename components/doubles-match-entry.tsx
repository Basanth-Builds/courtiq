'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, Save, X } from 'lucide-react'
import { toast } from 'sonner'

interface TeamPlayer {
  id: string
  player_name: string
}

interface DoublesAssignment {
  id: string
  team_id: string
  team_name: string
  player1_id: string | null
  player2_id: string | null
  player1_name: string
  player2_name: string
}

interface DoublesMatchEntryProps {
  matchId: string
  team1Id: string
  team2Id: string
  team1Name: string
  team2Name: string
  onAssignmentsUpdated?: () => void
}

export default function DoublesMatchEntry({
  matchId,
  team1Id,
  team2Id,
  team1Name,
  team2Name,
  onAssignmentsUpdated,
}: DoublesMatchEntryProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [team1Players, setTeam1Players] = useState<TeamPlayer[]>([])
  const [team2Players, setTeam2Players] = useState<TeamPlayer[]>([])
  const [team1Assignment, setTeam1Assignment] = useState<DoublesAssignment | null>(null)
  const [team2Assignment, setTeam2Assignment] = useState<DoublesAssignment | null>(null)
  const [editingTeam, setEditingTeam] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)

      // Fetch team players
      const [team1Data, team2Data] = await Promise.all([
        supabase
          .from('team_players')
          .select('id, player_name')
          .eq('team_id', team1Id),
        supabase
          .from('team_players')
          .select('id, player_name')
          .eq('team_id', team2Id),
      ])

      if (team1Data.error) throw team1Data.error
      if (team2Data.error) throw team2Data.error

      setTeam1Players(team1Data.data || [])
      setTeam2Players(team2Data.data || [])

      // Fetch existing doubles assignments
      const { data: assignments, error: assignError } = await supabase
        .from('doubles_players')
        .select('*')
        .eq('pool_match_id', matchId)

      if (assignError) throw assignError

      if (assignments && assignments.length > 0) {
        const team1Assign = assignments.find((a: { team_id: string }) => a.team_id === team1Id)
        const team2Assign = assignments.find((a: { team_id: string }) => a.team_id === team2Id)

        if (team1Assign) setTeam1Assignment({ ...team1Assign, team_name: team1Name })
        if (team2Assign) setTeam2Assignment({ ...team2Assign, team_name: team2Name })
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data'
      console.error('Error fetching data:', error)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [matchId, team1Id, team2Id, team1Name, team2Name, supabase])

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open])

  const saveAssignment = async (teamId: string, player1: DoublesAssignment['player1_id'], player2: DoublesAssignment['player2_id'], player1Name: string, player2Name: string) => {
    if (!player1Name.trim() || !player2Name.trim()) {
      toast.error('Both player names are required')
      return
    }

    setLoading(true)
    try {
      const teamAssignment = teamId === team1Id ? team1Assignment : team2Assignment

      if (teamAssignment && teamAssignment.id) {
        // Update existing
        const { error } = await supabase
          .from('doubles_players')
          .update({
            player1_id: player1,
            player2_id: player2,
            player1_name: player1Name,
            player2_name: player2Name,
            updated_at: new Date().toISOString(),
          })
          .eq('id', teamAssignment.id)

        if (error) throw error
        toast.success('Assignment updated')
      } else {
        // Insert new
        const { error } = await supabase
          .from('doubles_players')
          .insert({
            pool_match_id: matchId,
            team_id: teamId,
            player1_id: player1,
            player2_id: player2,
            player1_name: player1Name,
            player2_name: player2Name,
          })

        if (error) throw error
        toast.success('Assignment saved')
      }

      await fetchData()
      setEditingTeam(null)
      onAssignmentsUpdated?.()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save assignment'
      console.error('Error saving assignment:', error)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const TeamAssignmentEditor = ({ teamId, teamName, players, assignment }: {
    teamId: string
    teamName: string
    players: TeamPlayer[]
    assignment: DoublesAssignment | null
  }) => {
    const [p1Id, setP1Id] = useState(assignment?.player1_id || '')
    const [p2Id, setP2Id] = useState(assignment?.player2_id || '')
    const [p1Name, setP1Name] = useState(assignment?.player1_name || '')
    const [p2Name, setP2Name] = useState(assignment?.player2_name || '')

    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            {teamName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Player 1 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Player 1</label>
            <div className="flex gap-2">
              <Select value={p1Id} onValueChange={setP1Id}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select player" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Manual Entry</SelectItem>
                  {players.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.player_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="Player 1 name"
              value={p1Name}
              onChange={e => setP1Name(e.target.value)}
              className="text-sm"
            />
          </div>

          {/* Player 2 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Player 2</label>
            <div className="flex gap-2">
              <Select value={p2Id} onValueChange={setP2Id}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select player" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Manual Entry</SelectItem>
                  {players.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.player_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="Player 2 name"
              value={p2Name}
              onChange={e => setP2Name(e.target.value)}
              className="text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => saveAssignment(teamId, p1Id || null, p2Id || null, p1Name, p2Name)}
              disabled={loading}
              className="gap-1"
            >
              <Save className="h-3 w-3" />
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditingTeam(null)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const TeamAssignmentDisplay = ({ teamId, teamName, players, assignment }: {
    teamId: string
    teamName: string
    players: TeamPlayer[]
    assignment: DoublesAssignment | null
  }) => {
    if (!assignment) {
      return (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {teamName}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingTeam(teamId)}
              >
                Assign Players
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No players assigned yet</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {teamName}
            </span>
            <Badge variant="outline" className="text-green-600">✓</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-1">
            <div className="text-sm font-medium">
              <span className="text-muted-foreground">Player 1: </span>
              <span>{assignment.player1_name}</span>
            </div>
            <div className="text-sm font-medium">
              <span className="text-muted-foreground">Player 2: </span>
              <span>{assignment.player2_name}</span>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEditingTeam(teamId)}
            className="text-xs"
          >
            Edit
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setOpen(true)}
      >
        <Users className="h-4 w-4" />
        Assign Doubles
      </Button>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Doubles Players</DialogTitle>
          <DialogDescription>
            Assign 2 players from each team for this match
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {editingTeam === team1Id ? (
            <TeamAssignmentEditor
              teamId={team1Id}
              teamName={team1Name}
              players={team1Players}
              assignment={team1Assignment}
            />
          ) : (
            <TeamAssignmentDisplay
              teamId={team1Id}
              teamName={team1Name}
              players={team1Players}
              assignment={team1Assignment}
            />
          )}

          {editingTeam === team2Id ? (
            <TeamAssignmentEditor
              teamId={team2Id}
              teamName={team2Name}
              players={team2Players}
              assignment={team2Assignment}
            />
          ) : (
            <TeamAssignmentDisplay
              teamId={team2Id}
              teamName={team2Name}
              players={team2Players}
              assignment={team2Assignment}
            />
          )}
        </div>

        {/* Ready Status */}
        {team1Assignment && team2Assignment && (
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <p className="text-sm font-medium text-green-900 dark:text-green-100">
              ✓ Both teams ready for doubles match
            </p>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
