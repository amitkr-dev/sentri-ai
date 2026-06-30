import React from 'react'
import { Route, Navigate } from 'react-router-dom'
import Dashboard from '../pages/Dashboard/Dashboard'
import Tasks from '../pages/Tasks/Tasks'
import RescueMode from '../pages/Rescue/RescueMode'
import RiskAnalysis from '../pages/Risk/RiskAnalysis'
import Calendar from '../pages/Calendar/Calendar'
import Analytics from '../pages/Analytics/Analytics'
import Copilot from '../pages/Copilot/Copilot'
import Notifications from '../pages/Notifications/Notifications'
import Settings from '../pages/Settings/Settings'
import Profile from '../pages/Profile/Profile'
import ComingSoon from '../pages/ComingSoon/ComingSoon'

export const protectedRoutes = (
  <>
    <Route index element={<Navigate to="/app/dashboard" replace />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="tasks" element={<Tasks />} />
    <Route path="risk" element={<RiskAnalysis />} />
    <Route path="rescue" element={<RescueMode />} />
    <Route path="calendar" element={<Calendar />} />
    <Route path="analytics" element={<Analytics />} />
    <Route path="copilot" element={<Copilot />} />
    <Route path="notifications" element={<Notifications />} />
    <Route path="settings" element={<Settings />} />
    <Route path="profile" element={<Profile />} />
  </>
)
