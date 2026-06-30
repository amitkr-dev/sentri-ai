import React, { createContext, useState, useEffect, useContext } from 'react'
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  signInAnonymously
} from 'firebase/auth'
import { auth, analytics } from '../firebase/config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      // Fallback mock user if Firebase auth is not configured
      setUser({
        uid: 'mock-user-123',
        displayName: 'Amit Singh',
        email: 'amit@sentri.ai',
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'
      })
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        try {
          console.log("[DEBUG] AuthProvider: No active session. Signing in anonymously...")
          await signInAnonymously(auth)
        } catch (error) {
          console.error("[DEBUG] Anonymous authentication failed:", error)
          setLoading(false)
        }
      } else {
        console.log("[DEBUG] AuthProvider: Session active for user:", currentUser.uid)
        setUser(currentUser)
        setLoading(false)

        if (analytics) {
          try {
            const { logEvent } = await import('firebase/analytics')
            logEvent(analytics, 'user_session_active', { 
              uid: currentUser.uid,
              isAnonymous: currentUser.isAnonymous 
            })
          } catch (e) {
            console.warn("Analytics failed", e)
          }
        }
      }
    })

    return () => unsubscribe()
  }, [])

  const login = async () => {
    if (!auth) {
      setUser({
        uid: 'mock-user-123',
        displayName: 'Amit Singh',
        email: 'amit@sentri.ai'
      })
      return
    }
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    try {
      const result = await signInWithPopup(auth, provider)
      if (analytics) {
        try {
          const { logEvent } = await import('firebase/analytics')
          logEvent(analytics, 'google_login_success', { uid: result.user.uid })
        } catch (e) {}
      }
      return result.user
    } catch (error) {
      console.error("Google Sign-In Error:", error)
      throw error
    }
  }

  const logout = async () => {
    if (!auth) {
      setUser(null)
      return
    }
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Logout Error:", error)
    }
  }

  const updateProfile = (data) => {
    setUser(prev => prev ? { ...prev, ...data } : null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

