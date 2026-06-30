import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()

  const handleDemo = () => {
    navigate('/app/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg text-white p-6">
      <div className="w-full max-w-sm bg-card border border-zinc-800 rounded-2xl p-6 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Zap size={24} />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold">Welcome to Sentri</h2>
          <p className="text-xs text-zinc-500 mt-1">Access the AI calendar & task defense command center.</p>
        </div>
        <button 
          onClick={handleDemo}
          className="w-full py-2.5 bg-primary hover:bg-indigo-500 text-xs font-bold rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Zap size={14} />
          Try Sentri Demo
        </button>
      </div>
    </div>
  )
}

