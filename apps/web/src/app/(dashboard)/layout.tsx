import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { AuthSessionProvider } from '@/components/auth/session-provider'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthSessionProvider>
      <div className="flex h-screen bg-background overflow-hidden">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </AuthSessionProvider>
  )
}
