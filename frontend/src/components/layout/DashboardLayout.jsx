import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useTaskStore } from '../../store/taskStore'

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(false)
  const { criticalCount, notifications, fetchTasks } = useTaskStore()

  useEffect(() => {
    fetchTasks()
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="h-screen w-screen flex bg-bg overflow-hidden">
      <Sidebar 
        collapsed={collapsed} 
        onToggle={() => setCollapsed((c) => !c)} 
        criticalCount={criticalCount} 
        unreadCount={unreadCount} 
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

