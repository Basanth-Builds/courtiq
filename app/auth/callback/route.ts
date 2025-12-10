import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')

  // Handle auth errors
  if (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(error)}`)
  }

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )
    
    try {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Session exchange error:', exchangeError)
        return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(exchangeError.message)}`)
      }

      // Check if user has a profile
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('User fetch error:', userError)
        return NextResponse.redirect(`${requestUrl.origin}/login?error=Authentication failed`)
      }

      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000))

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError || !profile || !profile.role) {
        console.log('User needs to select role:', { profileError, profile })
        // User exists but no profile or no role, redirect to role selection
        return NextResponse.redirect(`${requestUrl.origin}/select-role`)
      }

      // Redirect to appropriate dashboard
      const roleRedirects = {
        referee: '/referee/dashboard',
        organizer: '/organizer/dashboard',
        player: '/player/dashboard',
        audience: '/audience/explore'
      }

      const redirectPath = roleRedirects[profile.role as keyof typeof roleRedirects] || '/audience/explore'
      
      // Create response with proper cookie handling
      const response = NextResponse.redirect(`${requestUrl.origin}${redirectPath}`)
      
      // Ensure cookies are set in the response
      cookieStore.getAll().forEach(({ name, value }) => {
        response.cookies.set(name, value)
      })
      
      return response
      
    } catch (error: any) {
      console.error('Unexpected auth callback error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=Authentication failed`)
    }
  }

  // No code parameter, redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}