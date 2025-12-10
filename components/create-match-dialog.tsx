'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { toast } from 'sonner'

interface Player {
  id: string
  name: string
}

interface Referee {
  id: string
  name: string
}

interface CreateMatchDialogProps {
  tournamentId: string
  players: Player[]
  onClose: () => void
}

export default function CreateMatchDialog({ tournamentId, players, onClose }: CreateMatchDialogProps) {
  const [loading, setLoading] = useState(false)
  const [scheduledAt, setScheduledAt] = useState('')
  const [team1Players, setTeam1Players] = useState<Player[]>([])
  const [team2Players, setTeam2Players] = useState<Player[]>([])
  const [selectedReferee, setSelectedReferee] = useState('')
  const [referees, setReferees] = useState<Referee[]>([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchReferees()
  }, [])

  const fetchReferees = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('role', 'referee')

      if (error) throw error
      setReferees(data || [])
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const addPlayerToTeam = (player: Player, team: 1 | 2) => {
    if (team === 1) {
      if (team1Players.length >= 2) {
        toast.error('Team 1 can have maximum 2 players')
        return
      }
      if (team1Players.find(p => p.id === player.id)) return
      setTeam1Players(prev => [...prev, player])
    } else {
      if (team2Players.length >= 2) {
        toast.error('Team 2 can have maximum 2 players')
        return
      }
      if (team2Players.find(p => p.id === player.id)) return
      setTeam2Players(prev => [...prev, player])
    }
  }

  const removePlayerFromTeam = (playerId: string, team: 1 | 2) => {
    if (team === 1) {
      setTeam1Players(prev => prev.filter(p => p.id !== playerId))
    } else {
      setTeam2Players(prev => prev.filter(p => p.id !== playerId))
    }
  }

  const getAvailablePlayers = () => {
    const usedPlayerIds = [...team1Players, ...team2Players].map(p => p.id)
    return players.filter(p => !usedPlayerIds.includes(p.id))
  }

  const handleCreateMatch = async () => {
    if (team1Players.length === 0 || team2Players.length === 0) {
      toast.error('Both teams must have at least one player')
      return
    }

    if (!scheduledAt) {
      toast.error('Please select a scheduled time')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('matches')
        .insert({
          tournament_id: tournamentId,
          team1_players: team1Players.map(p => p.id),
          team2_players: team2Players.map(p => p.id),
          referee: selectedReferee || null,
          scheduled_at: scheduledAt,
          status: 'scheduled'
        })

      if (error) throw error

      toast.success('Match created successfully!')
      onClose()
      window.location.reload() // Refresh to show new match
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Match</DialogTitle>
          <DialogDescription>
            Set up a new match for this tournament
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Scheduled Time */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Scheduled Time *
            </label>
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
            />
          </div>

          {/* Teams */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team 1 */}
            <div>
              <h4 className="font-medium mb-3">Team 1</h4>
              <div className="space-y-2 mb-3">
                {team1Players.map((player) => (
                  <Badge key={player.id} variant="secondary" className="flex items-center justify-between w-full">
                    {player.name}
                    <X 
                      className="h-3 w-3 cursor-pointer ml-2" 
                      onClick={() => removePlayerFromTeam(player.id, 1)}
                    />
                  </Badge>
                ))}
                {team1Players.length === 0 && (
                  <div className="text-sm text-muted-foreground">No players added</div>
                )}
              </div>
              <Select onValueChange={(value) => {
                const player = players.find(p => p.id === value)
                if (player) addPlayerToTeam(player, 1)
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Add player to Team 1" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailablePlayers().map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Team 2 */}
            <div>
              <h4 className="font-medium mb-3">Team 2</h4>
              <div className="space-y-2 mb-3">
                {team2Players.map((player) => (
                  <Badge key={player.id} variant="secondary" className="flex items-center justify-between w-full">
                    {player.name}
                    <X 
                      className="h-3 w-3 cursor-pointer ml-2" 
                      onClick={() => removePlayerFromTeam(player.id, 2)}
                    />
                  </Badge>
                ))}
                {team2Players.length === 0 && (
                  <div className="text-sm text-muted-foreground">No players added</div>
                )}
              </div>
              <Select onValueChange={(value) => {
                const player = players.find(p => p.id === value)
                if (player) addPlayerToTeam(player, 2)
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Add player to Team 2" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailablePlayers().map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Referee */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Referee (Optional)
            </label>
            <Select onValueChange={setSelectedReferee}>
              <SelectTrigger>
                <SelectValue placeholder="Select a referee" />
              </SelectTrigger>
              <SelectContent>
                {referees.map((referee) => (
                  <SelectItem key={referee.id} value={referee.id}>
                    {referee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateMatch}
              disabled={loading || team1Players.length === 0 || team2Players.length === 0}
              className="athletic-button"
            >
              {loading ? 'Creating...' : 'Create Match'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}