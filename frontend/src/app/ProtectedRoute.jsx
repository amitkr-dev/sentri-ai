import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'

export default function ProtectedRoute({ children }) {
  // Bypassed sign-in requirement to allow direct website access
  return children
}
