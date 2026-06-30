import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-bg text-white p-6 text-center">
          <h2 className="text-xl font-bold text-danger mb-2">Something went wrong</h2>
          <p className="text-xs text-zinc-500 max-w-sm mb-4">{this.state.error?.message || "An unexpected error occurred."}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary rounded-xl text-xs font-bold"
          >
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
