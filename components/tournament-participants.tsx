'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Trash2, Mail, Phone, FileText } from 'lucide-react'
import { toast } from 'sonner'

interface Participant {
  id: string
  name: string
  email?: string
  phone?: string
  notes?: string
  created_at: string
}

interface TournamentParticipantsProps {
  tournamentId: string
  onRefresh?: () => void
}

export default function TournamentParticipants({ tournamentId, onRefresh }: TournamentParticipantsProps) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const fetchParticipants = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tournament_participants')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setParticipants(data || [])
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load participants'
      console.error('Error fetching participants:', error)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [tournamentId, supabase])

  useEffect(() => {
    fetchParticipants()

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`tournament_participants:${tournamentId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tournament_participants',
          filter: `tournament_id=eq.${tournamentId}`
        },
        () => {
          fetchParticipants()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [tournamentId, supabase, fetchParticipants])

  const handleDeleteParticipant = async (participantId: string) => {
    if (!confirm('Are you sure you want to remove this participant?')) {
      return
    }

    setDeleting(participantId)
    try {
      const { error } = await supabase
        .from('tournament_participants')
        .delete()
        .eq('id', participantId)

      if (error) throw error
      
      setParticipants(prev => prev.filter(p => p.id !== participantId))
      toast.success('Participant removed')
      onRefresh?.()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove participant'
      console.error('Error deleting participant:', error)
      toast.error(errorMessage)
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manual Participants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading participants...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (participants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manual Participants
          </CardTitle>
          <CardDescription>
            No manual participants added yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Add participants manually to get started
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manual Participants
          </div>
          <Badge variant="secondary">{participants.length}</Badge>
        </CardTitle>
        <CardDescription>
          Players added manually without requiring accounts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-start justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium">{participant.name}</div>
                <div className="space-y-1 mt-2">
                  {participant.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{participant.email}</span>
                    </div>
                  )}
                  {participant.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{participant.phone}</span>
                    </div>
                  )}
                  {participant.notes && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4 mt-0.5" />
                      <span>{participant.notes}</span>
                    </div>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDeleteParticipant(participant.id)}
                disabled={deleting === participant.id}
                className="flex-shrink-0 ml-2"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
