import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { DashboardTopbar } from '@/components/layout/dashboard-topbar'
import { RoleGate } from '@/components/auth/role-gate'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate allowedRoles={['admin', 'referee', 'umpire', 'spectator']}>
      <div className="flex h-screen overflow-hidden bg-background">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardTopbar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </RoleGate>
  )
}
