import WelcomeBanner from '../../components/dashboard/WelcomeBanner'
import StatsCards from '../../components/dashboard/StatsCards'
import CriticalAttentionZone from '../../components/dashboard/CriticalAttentionZone'
import RiskChart from '../../components/dashboard/RiskChart'
import TaskCards from '../../components/dashboard/TaskCards'
import AIInsights from '../../components/dashboard/AIInsights'
import UpcomingDeadlines from '../../components/dashboard/UpcomingDeadlines'
import ActivityFeed from '../../components/dashboard/ActivityFeed'

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* 1. Welcome + day status */}
      <WelcomeBanner />

      {/* 2. Glanceable stats */}
      <StatsCards />

      {/* 3. THE agentic centerpiece — AI proposals needing approval */}
      <CriticalAttentionZone />

      {/* 4. Trend context + actionable task list */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3">
          <RiskChart />
        </div>
        <div className="lg:col-span-2">
          <AIInsights />
        </div>
      </div>

      {/* 5. Active tasks (full width — this is the working list) */}
      <TaskCards />

      {/* 6. Deadlines + activity side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <UpcomingDeadlines />
        <ActivityFeed />
      </div>
    </div>
  )
}
