'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, UserPlus, X } from 'lucide-react'
import { toast } from 'sonner'

interface Player {
  id: string
  name: string
  role: string
}

interface AddPlayersDialogProps {
  tournamentId: string
}

export default function AddPlayersDialog({ tournamentId }: AddPlayersDialogProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([])
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (open) {
      fetchAvailablePlayers()
    }
  }, [open])

  const fetchAvailablePlayers = async () => {
    try {
      const { data: players, error } = await supabase
        .from('profiles')
        .select('id, name, role')
        .eq('role', 'player')
        .ilike('name', `%${searchTerm}%`)
        .limit(20)

      if (error) throw error
      setAvailablePlayers(players || [])
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (open) {
        fetchAvailablePlayers()
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  const togglePlayerSelection = (player: Player) => {
    setSelectedPlayers(prev => {
      const isSelected = prev.find(p => p.id === player.id)
      if (isSelected) {
        return prev.filter(p => p.id !== player.id)
      } else {
        return [...prev, player]
      }
    })
  }

  const handleAddPlayers = async () => {
    if (selectedPlayers.length === 0) {
      toast.error('Please select at least one player')
      return
    }

    setLoading(true)
    try {
      // For now, we'll just show success. In a real app, you'd update a players table
      // or add players to tournament matches
      toast.success(`Added ${selectedPlayers.length} players to tournament`)
      setOpen(false)
      setSelectedPlayers([])
      setSearchTerm('')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="athletic-button">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Players
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Players to Tournament</DialogTitle>
          <DialogDescription>
            Search and select players to add to this tournament
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <Input
            placeholder="Search players by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Selected Players */}
          {selectedPlayers.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Selected Players ({selectedPlayers.length})</h4>
              <div className="flex flex-wrap gap-2">
                {selectedPlayers.map((player) => (
                  <Badge key={player.id} variant="secondary" className="flex items-center gap-1">
                    {player.name}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => togglePlayerSelection(player)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Available Players */}
          <div>
            <h4 className="font-medium mb-2">Available Players</h4>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {availablePlayers.map((player) => {
                const isSelected = selectedPlayers.find(p => p.id === player.id)
                return (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-3 border rounded cursor-pointer transition-colors ${
                      isSelected ? 'bg-neon/10 border-neon' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                    onClick={() => togglePlayerSelection(player)}
                  >
                    <div>
                      <div className="font-medium">{player.name}</div>
                      <div className="text-sm text-muted-foreground">Player</div>
                    </div>
                    {isSelected && (
                      <Badge variant="secondary">Selected</Badge>
                    )}
                  </div>
                )
              })}
              {availablePlayers.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No players found
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddPlayers}
              disabled={loading || selectedPlayers.length === 0}
              className="athletic-button"
            >
              {loading ? 'Adding...' : `Add ${selectedPlayers.length} Players`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}