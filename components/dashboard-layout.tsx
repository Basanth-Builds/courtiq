'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { User, LogOut, Settings, Menu } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'

interface DashboardLayoutProps {
  children: React.ReactNode
  role: 'referee' | 'organizer' | 'player' | 'audience'
  userName?: string
}

const navigationItems = {
  referee: [
    { href: '/referee/dashboard', label: 'Dashboard' },
    { href: '/referee/matches', label: 'My Matches' },
  ],
  organizer: [
    { href: '/organizer/dashboard', label: 'Dashboard' },
    { href: '/organizer/tournaments', label: 'Tournaments' },
    { href: '/organizer/tournaments/create', label: 'Create Tournament' },
  ],
  player: [
    { href: '/player/dashboard', label: 'Dashboard' },
    { href: '/player/tournaments', label: 'My Tournaments' },
  ],
  audience: [
    { href: '/audience/explore', label: 'Explore' },
    { href: '/audience/tournaments', label: 'Tournaments' },
  ]
}

export default function DashboardLayout({ children, role, userName }: DashboardLayoutProps) {
  const [user, setUser] = useState<any>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Signed out successfully')
      router.push('/login')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const navItems = navigationItems[role] || []

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Navigation Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl sm:text-2xl font-bold neon-glow">CourtIQ</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6 lg:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-slate-600 dark:text-slate-300 hover:text-neon transition-colors font-medium text-sm lg:text-base"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Desktop User Menu & Theme Toggle */}
            <div className="hidden md:flex items-center space-x-2">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="hidden lg:inline max-w-32 truncate">{userName || user?.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-slate-200 dark:border-slate-700 py-4">
              <nav className="flex flex-col space-y-3">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-slate-600 dark:text-slate-300 hover:text-neon transition-colors font-medium px-2 py-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
                  <div className="flex items-center space-x-2 px-2 py-1 text-sm text-slate-600 dark:text-slate-300">
                    <User className="h-4 w-4" />
                    <span className="truncate">{userName || user?.email}</span>
                  </div>
                  <Link
                    href="/settings"
                    className="flex items-center space-x-2 px-2 py-1 text-slate-600 dark:text-slate-300 hover:text-neon transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut()
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center space-x-2 px-2 py-1 text-slate-600 dark:text-slate-300 hover:text-neon transition-colors w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {children}
      </main>
    </div>
  )
}