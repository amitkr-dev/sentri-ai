import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function TaskDetails() {
  const { id } = useParams()
  return (
    <div className="space-y-6">
      <Link to="/app/tasks" className="flex items-center gap-1.5 text-xs text-primary hover:text-indigo-400">
        <ArrowLeft size={14} /> Back to Tasks
      </Link>
      <div className="bg-card border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white">Task Details (ID: {id})</h2>
        <p className="text-xs text-zinc-500">Detailed auditing parameters are active for this identifier.</p>
      </div>
    </div>
  )
}
