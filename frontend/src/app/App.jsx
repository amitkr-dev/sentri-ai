import React from 'react'
import Providers from './Providers'
import Router from './Router'
import ErrorBoundary from './ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
      <Providers>
        <Router />
      </Providers>
    </ErrorBoundary>
  )
}
