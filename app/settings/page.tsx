'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { Lock, Settings, User as UserIcon, ArrowLeft } from 'lucide-react'
import DashboardLayout from '@/components/dashboard-layout'
import Link from 'next/link'

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

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [selectedRole, setSelectedRole] = useState('')
  const [name, setName] = useState('')
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

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setProfile(profile)
        setSelectedRole(profile.role)
        setName(profile.name || '')
      }
    }
    getUser()
  }, [router, supabase])

  const handleRoleClick = (roleId: string) => {
    if (roleId === selectedRole) return // Same role, no change needed

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
        // Immediately update the role in the database
        const { error } = await supabase
          .from('profiles')
          .update({
            name: name.trim(),
            role: pendingRole
          })
          .eq('id', user.id)

        if (error) throw error

        setSelectedRole(pendingRole)
        setShowAccessCodeDialog(false)
        toast.success(`Access granted! Switching to ${role.title} dashboard...`)

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
      console.error('Role change error:', error)
      toast.error('Error changing role. Please try again.')
      setAccessCode('')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = () => {
    if (!selectedRole) {
      toast.error('Please select a role')
      return
    }

    if (!name.trim()) {
      toast.error('Please enter your name')
      return
    }

    // Only update name if role hasn't changed (protected roles change immediately)
    updateProfile()
  }

  const updateProfile = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: name.trim(),
          role: selectedRole
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Settings updated successfully!')

      // Small delay to ensure the database is updated
      await new Promise(resolve => setTimeout(resolve, 500))

      // Only redirect if it's a non-protected role change or just name update
      if (selectedRole !== profile?.role && !roles.find(r => r.id === selectedRole)?.requiresCode) {
        const roleRedirects = {
          referee: '/referee/dashboard',
          organizer: '/organizer/dashboard',
          player: '/player/dashboard',
          audience: '/audience/explore'
        }

        const redirectPath = roleRedirects[selectedRole as keyof typeof roleRedirects]
        toast.success(`Redirecting to ${roles.find(r => r.id === selectedRole)?.title} dashboard...`)
        setTimeout(() => {
          router.push(redirectPath)
        }, 1500)
      }
    } catch (error: any) {
      console.error('Settings update error:', error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentRoleInfo = () => {
    return roles.find(r => r.id === profile?.role)
  }

  const currentRole = getCurrentRoleInfo()

  return (
    <>
      <DashboardLayout role={profile?.role || 'audience'} userName={profile?.name}>
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href={
              profile?.role === 'referee' ? '/referee/dashboard' :
              profile?.role === 'organizer' ? '/organizer/dashboard' :
              profile?.role === 'player' ? '/player/dashboard' :
              '/audience/explore'
            }>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center space-x-2">
                <Settings className="h-6 w-6 sm:h-8 sm:w-8" />
                <span>Settings</span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">Manage your account and role preferences</p>
            </div>
          </div>

          {/* Current Role Info */}
          {currentRole && (
            <Card className="border-neon/20 bg-neon/5">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserIcon className="h-5 w-5" />
                  <span>Current Role</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">{currentRole.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold">{currentRole.title}</h3>
                    <p className="text-muted-foreground">{currentRole.description}</p>
                  </div>
                  <Badge className="ml-auto">Current</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Settings Form */}
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Update your profile information and change your role
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="text-sm font-medium mb-2 block">Your Name</label>
                <Input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email cannot be changed from settings
                </p>
              </div>

              {/* Role Selection */}
              <div>
                <label className="text-sm font-medium mb-4 block">Change Role</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {roles.map((role) => (
                    <Card
                      key={role.id}
                      className={`cursor-pointer transition-all hover:scale-105 ${
                        selectedRole === role.id 
                          ? 'ring-2 ring-neon border-neon' 
                          : 'hover:border-neon/50'
                      } ${role.id === profile?.role ? 'bg-muted/50' : ''}`}
                      onClick={() => handleRoleClick(role.id)}
                    >
                      <CardContent className="p-4 sm:p-6 text-center relative">
                        {role.requiresCode && (
                          <div className="absolute top-2 right-2">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        {role.id === profile?.role && (
                          <div className="absolute top-2 left-2">
                            <Badge variant="secondary" className="text-xs">Current</Badge>
                          </div>
                        )}
                        <div className="text-4xl mb-2">{role.icon}</div>
                        <h3 className="font-bold text-lg mb-2">{role.title}</h3>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                        {role.requiresCode && (
                          <p className="text-xs text-yellow-600 mt-2">
                            🔒 Requires access code - Changes immediately
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {selectedRole && selectedRole !== profile?.role && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-center text-sm text-blue-800 dark:text-blue-200">
                    You will be switched to: <strong>{roles.find(r => r.id === selectedRole)?.title}</strong>
                  </p>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end space-x-4">
                <Button 
                  onClick={handleSaveSettings}
                  disabled={loading || !selectedRole || !name.trim()}
                  className="athletic-button"
                  size="lg"
                >
                  {loading ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>

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
                {loading ? 'Switching Role...' : 'Verify & Switch'}
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