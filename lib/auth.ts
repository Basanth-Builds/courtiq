import { createServerComponentClient } from './supabase-server'
import { redirect } from 'next/navigation'

export async function getUser() {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile() {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
    
  return profile
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    redirect('/login')
  }
  return user
}

export async function requireRole(allowedRoles: string[]) {
  const profile = await getUserProfile()
  if (!profile || !allowedRoles.includes(profile.role)) {
    redirect('/unauthorized')
  }
  return profile
}

export function getRoleRedirectPath(role: string) {
  switch (role) {
    case 'referee':
      return '/referee/dashboard'
    case 'organizer':
      return '/organizer/dashboard'
    case 'player':
      return '/player/dashboard'
    case 'audience':
      return '/audience/explore'
    default:
      return '/select-role'
  }
}