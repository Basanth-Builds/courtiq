'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Plus, X, Edit2, Trash2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface ManualPlayer {
  id: string
  name: string
  email?: string
  phone?: string
  notes?: string
}

interface ManualPlayerDialogProps {
  tournamentId: string
  onPlayersAdded?: () => void
}

export default function ManualPlayerDialog({ tournamentId, onPlayersAdded }: ManualPlayerDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [players, setPlayers] = useState<ManualPlayer[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Form fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  
  const supabase = createClientComponentClient()

  const resetForm = () => {
    setName('')
    setEmail('')
    setPhone('')
    setNotes('')
    setEditingId(null)
  }

  const isValidEmail = (email: string) => {
    if (!email) return true // Optional field
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const isValidPhone = (phone: string) => {
    if (!phone) return true // Optional field
    return /^\d{10,}$/.test(phone.replace(/\D/g, ''))
  }

  const handleAddPlayer = () => {
    if (!name.trim()) {
      toast.error('Player name is required')
      return
    }

    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    if (!isValidPhone(phone)) {
      toast.error('Please enter a valid phone number (10+ digits)')
      return
    }

    // Check for duplicate names
    if (players.some(p => p.name.toLowerCase() === name.toLowerCase() && p.id !== editingId)) {
      toast.error('A player with this name already exists')
      return
    }

    if (editingId) {
      // Update existing player
      setPlayers(prev => prev.map(p => 
        p.id === editingId 
          ? { ...p, name: name.trim(), email: email.trim(), phone: phone.trim(), notes: notes.trim() }
          : p
      ))
      toast.success('Player updated')
    } else {
      // Add new player
      setPlayers(prev => [...prev, {
        id: `temp-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        notes: notes.trim()
      }])
      toast.success('Player added to list')
    }

    resetForm()
  }

  const handleEditPlayer = (player: ManualPlayer) => {
    setName(player.name)
    setEmail(player.email || '')
    setPhone(player.phone || '')
    setNotes(player.notes || '')
    setEditingId(player.id)
  }

  const handleRemovePlayer = (id: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id))
    if (editingId === id) {
      resetForm()
    }
    toast.success('Player removed')
  }

  const handleSaveAllPlayers = async () => {
    if (players.length === 0) {
      toast.error('Please add at least one player')
      return
    }

    setLoading(true)
    try {
      // Prepare data for insertion
      const participantsToAdd = players.map(p => ({
        tournament_id: tournamentId,
        name: p.name,
        email: p.email || null,
        phone: p.phone || null,
        notes: p.notes || null,
      }))

      // Insert all players
      const { error } = await supabase
        .from('tournament_participants')
        .insert(participantsToAdd)

      if (error) {
        // Handle constraint violation (duplicate)
        if (error.code === '23505') {
          toast.error('One or more players already exist in this tournament')
        } else {
          throw error
        }
        return
      }

      toast.success(`Added ${players.length} players to tournament`)
      setOpen(false)
      setPlayers([])
      resetForm()
      onPlayersAdded?.()
    } catch (error: any) {
      console.error('Error adding players:', error)
      toast.error(error.message || 'Failed to add players')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Players Manually
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Players Manually</DialogTitle>
          <DialogDescription>
            Add player names directly to the tournament without requiring accounts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Info box */}
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                Players added manually won't need to create accounts. They can participate using the organizer's match setup.
              </div>
            </div>
          </Card>

          {/* Form */}
          <div className="space-y-4 border rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
            <h3 className="font-semibold">
              {editingId ? 'Edit Player' : 'Add New Player'}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input
                  placeholder="Enter player name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Email (optional)</label>
                <Input
                  type="email"
                  placeholder="player@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Phone (optional)</label>
                <Input
                  placeholder="+1 234 567 8900"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Notes (optional)</label>
                <Input
                  placeholder="e.g., Jersey number, skill level"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleAddPlayer}
                  className="athletic-button flex-1"
                >
                  {editingId ? 'Update Player' : 'Add to List'}
                </Button>
                {editingId && (
                  <Button 
                    variant="outline" 
                    onClick={resetForm}
                  >
                    Cancel Edit
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Players list */}
          {players.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Players to Add ({players.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {players.map((player) => (
                  <Card key={player.id} className="p-4 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{player.name}</div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {player.email && <div>📧 {player.email}</div>}
                        {player.phone && <div>📱 {player.phone}</div>}
                        {player.notes && <div>📝 {player.notes}</div>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditPlayer(player)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemovePlayer(player.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setOpen(false)
                setPlayers([])
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveAllPlayers}
              disabled={loading || players.length === 0}
              className="athletic-button"
            >
              {loading ? 'Saving...' : `Save ${players.length} Players`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
