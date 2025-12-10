'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface RoleChangeConfirmationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRole: string
  newRole: string
  onConfirm: () => void
  loading?: boolean
}

const roleNames = {
  organizer: 'Tournament Organizer',
  referee: 'Referee',
  player: 'Player',
  audience: 'Spectator'
}

export default function RoleChangeConfirmation({
  open,
  onOpenChange,
  currentRole,
  newRole,
  onConfirm,
  loading = false
}: RoleChangeConfirmationProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <span>Confirm Role Change</span>
          </DialogTitle>
          <DialogDescription>
            You are about to change your role. This will redirect you to a different dashboard.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="text-sm">
              <p><strong>Current Role:</strong> {roleNames[currentRole as keyof typeof roleNames]}</p>
              <p><strong>New Role:</strong> {roleNames[newRole as keyof typeof roleNames]}</p>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>After changing your role:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>You'll be redirected to the new dashboard</li>
              <li>Your permissions will be updated</li>
              <li>You can change back anytime from settings</li>
            </ul>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 athletic-button"
            >
              {loading ? 'Changing...' : 'Confirm Change'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}