import React from 'react'
import { Route } from 'react-router-dom'
import Landing from '../pages/Landing/Landing'
import Login from '../pages/Auth/Login'

export const publicRoutes = (
  <>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Login />} />
  </>
)
