import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Callback() {
  const navigate = useNavigate()
  useEffect(() => {
    navigate('/app/dashboard')
  }, [navigate])
  return <div className="text-white text-xs p-6">Authenticating, please wait...</div>
}
