'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { Lock } from 'lucide-react'

const roles = [
  {
    id: 'organizer',
    title: 'Tournament Organizer',
    description: 'Create tournaments and manage events',
    icon: '🏆',
    requiresCode: true
  },
  {
    id: 'referee',
    title: 'Referee',
    description: 'Score matches and manage live games',
    icon: '⚖️',
    requiresCode: true
  },
  {
    id: 'player',
    title: 'Player',
    description: 'Participate in tournaments',
    icon: '🏓',
    requiresCode: false
  },
  {
    id: 'audience',
    title: 'Spectator',
    description: 'Watch live matches and follow tournaments',
    icon: '👥',
    requiresCode: false
  }
]

export default function SelectRolePage() {
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState('')
  const [name, setName] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [showAccessCodeDialog, setShowAccessCodeDialog] = useState(false)
  const [accessCode, setAccessCode] = useState('')
  const [pendingRole, setPendingRole] = useState('')
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      setName(user.user_metadata?.name || user.email?.split('@')[0] || '')
    }
    getUser()
  }, [router, supabase])

  const handleRoleClick = (roleId: string) => {
    const role = roles.find(r => r.id === roleId)
    
    if (role?.requiresCode) {
      setPendingRole(roleId)
      setAccessCode('')
      setShowAccessCodeDialog(true)
    } else {
      setSelectedRole(roleId)
    }
  }

  const handleAccessCodeSubmit = async () => {
    const role = roles.find(r => r.id === pendingRole)
    
    if (!role || accessCode.length !== 4) {
      toast.error('Please enter a 4-digit access code')
      return
    }

    if (!user) return

    setLoading(true)
    try {
      const response = await fetch('/api/verify-access-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: pendingRole,
          code: accessCode
        })
      })

      const { valid } = await response.json()

      if (valid) {
        // Immediately create/update the profile with the verified role
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            name: name.trim(),
            role: pendingRole
          }, {
            onConflict: 'id'
          })

        if (error) throw error

        setSelectedRole(pendingRole)
        setShowAccessCodeDialog(false)
        toast.success(`Access granted! Redirecting to ${role.title} dashboard...`)

        // Small delay to ensure the database is updated
        await new Promise(resolve => setTimeout(resolve, 500))

        // Redirect to appropriate dashboard immediately
        const roleRedirects = {
          referee: '/referee/dashboard',
          organizer: '/organizer/dashboard',
          player: '/player/dashboard',
          audience: '/audience/explore'
        }

        const redirectPath = roleRedirects[pendingRole as keyof typeof roleRedirects]
        
        // Redirect after a short delay to show the success message
        setTimeout(() => {
          router.push(redirectPath)
        }, 1000)

      } else {
        toast.error('Invalid access code. Please try again.')
        setAccessCode('')
      }
    } catch (error: any) {
      console.error('Role selection error:', error)
      toast.error('Error selecting role. Please try again.')
      setAccessCode('')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleSelection = async () => {
    if (!selectedRole) {
      toast.error('Please select a role')
      return
    }

    if (!name.trim()) {
      toast.error('Please enter your name')
      return
    }

    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: name.trim(),
          role: selectedRole
        }, {
          onConflict: 'id'
        })

      if (error) throw error

      toast.success('Profile created successfully!')

      // Small delay to ensure the database is updated
      await new Promise(resolve => setTimeout(resolve, 500))

      // Redirect to appropriate dashboard
      const roleRedirects = {
        referee: '/referee/dashboard',
        organizer: '/organizer/dashboard',
        player: '/player/dashboard',
        audience: '/audience/explore'
      }

      const redirectPath = roleRedirects[selectedRole as keyof typeof roleRedirects]
      router.push(redirectPath)
    } catch (error: any) {
      console.error('Role selection error:', error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <Card className="w-full max-w-4xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl sm:text-3xl font-bold neon-glow">Welcome to CourtIQ</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Choose your role to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Your Name</label>
              <Input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-base"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-4 block">Select Your Role</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {roles.map((role) => (
                  <Card
                    key={role.id}
                    className={`cursor-pointer transition-all hover:scale-105 ${
                      selectedRole === role.id 
                        ? 'ring-2 ring-neon border-neon' 
                        : 'hover:border-neon/50'
                    }`}
                    onClick={() => handleRoleClick(role.id)}
                  >
                    <CardContent className="p-4 sm:p-6 text-center relative">
                      {role.requiresCode && (
                        <div className="absolute top-2 right-2">
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="text-3xl sm:text-4xl mb-2">{role.icon}</div>
                      <h3 className="font-bold text-base sm:text-lg mb-2">{role.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">{role.description}</p>
                      {role.requiresCode && (
                        <p className="text-xs text-yellow-600 mt-2">
                          🔒 Requires access code
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {selectedRole && (
              <div className="p-4 bg-neon/10 border border-neon/20 rounded-lg">
                <p className="text-center text-sm">
                  Selected: <strong>{roles.find(r => r.id === selectedRole)?.title}</strong>
                </p>
              </div>
            )}

            <Button 
              onClick={handleRoleSelection}
              disabled={loading || !selectedRole || !name.trim()}
              className="w-full athletic-button"
              size="lg"
            >
              {loading ? 'Creating Profile...' : 'Continue'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Access Code Dialog */}
      <Dialog open={showAccessCodeDialog} onOpenChange={setShowAccessCodeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Lock className="h-5 w-5" />
              <span>Access Code Required</span>
            </DialogTitle>
            <DialogDescription>
              Enter the access code for {roles.find(r => r.id === pendingRole)?.title}. You will be redirected immediately after verification.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter 4-digit access code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                maxLength={4}
                className="text-center text-lg tracking-widest"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAccessCodeSubmit()
                  }
                }}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowAccessCodeDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAccessCodeSubmit}
                disabled={accessCode.length !== 4 || loading}
                className="flex-1 athletic-button"
              >
                {loading ? 'Redirecting...' : 'Verify & Continue'}
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground text-center">
              Contact your administrator if you don't have an access code
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}