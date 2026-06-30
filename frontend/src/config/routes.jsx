import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { publicRoutes } from './PublicRoutes'
import { protectedRoutes } from './ProtectedRoutes'
import AppShell from '../components/layout/DashboardLayout'
import ProtectedRoute from '../app/ProtectedRoute'

export default function AppRoutes() {
  return (
    <Routes>
      {publicRoutes}
      <Route 
        path="/app" 
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        {protectedRoutes}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
