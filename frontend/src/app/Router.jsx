import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from '../config/routes'

export default function Router() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
