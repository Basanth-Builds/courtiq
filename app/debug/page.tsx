'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function DebugPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        setUser(user)
        
        if (userError) {
          setError(`User error: ${userError.message}`)
          return
        }

        if (user) {
          // Check profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (profileError) {
            setError(`Profile error: ${profileError.message}`)
          } else {
            setProfile(profile)
          }
        }
      } catch (err: any) {
        setError(`Unexpected error: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Debug Information</h1>
        
        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle>User Authentication</CardTitle>
            <CardDescription>Current user session information</CardDescription>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-2">
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
                <p><strong>Last Sign In:</strong> {new Date(user.last_sign_in_at).toLocaleString()}</p>
                <p><strong>Status:</strong> <span className="text-green-600">✅ Authenticated</span></p>
              </div>
            ) : (
              <p className="text-red-600">❌ Not authenticated</p>
            )}
          </CardContent>
        </Card>

        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Profile information from database</CardDescription>
          </CardHeader>
          <CardContent>
            {profile ? (
              <div className="space-y-2">
                <p><strong>Profile ID:</strong> {profile.id}</p>
                <p><strong>Name:</strong> {profile.name || 'Not set'}</p>
                <p><strong>Role:</strong> {profile.role}</p>
                <p><strong>Created:</strong> {new Date(profile.created_at).toLocaleString()}</p>
                <p><strong>Status:</strong> <span className="text-green-600">✅ Profile exists</span></p>
              </div>
            ) : user ? (
              <p className="text-yellow-600">⚠️ User authenticated but no profile found</p>
            ) : (
              <p className="text-gray-600">No profile (user not authenticated)</p>
            )}
          </CardContent>
        </Card>

        {/* Error Info */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user && profile ? (
              <div className="space-y-2">
                <p className="text-green-600">✅ Ready to access dashboard</p>
                <Link href={
                  profile.role === 'referee' ? '/referee/dashboard' :
                  profile.role === 'organizer' ? '/organizer/dashboard' :
                  profile.role === 'player' ? '/player/dashboard' :
                  '/audience/explore'
                }>
                  <Button className="mr-2">Go to Dashboard</Button>
                </Link>
              </div>
            ) : user && !profile ? (
              <div className="space-y-2">
                <p className="text-yellow-600">⚠️ Need to select role</p>
                <Link href="/select-role">
                  <Button className="mr-2">Select Role</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-red-600">❌ Need to sign in</p>
                <Link href="/login">
                  <Button className="mr-2">Sign In</Button>
                </Link>
              </div>
            )}
            
            {user && (
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}