import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f9fafb]">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-[#f9fafb]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
