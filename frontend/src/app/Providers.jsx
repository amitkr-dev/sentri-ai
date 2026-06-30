import React from 'react'
import { AuthProvider } from './AuthProvider'

export default function Providers({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}
