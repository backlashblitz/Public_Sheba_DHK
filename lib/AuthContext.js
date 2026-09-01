'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchUsername(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single()
    if (data?.username) setUsername(data.username)
  }

  useEffect(() => {
    // Check "Keep me logged in" logic:
    // If keep_logged_in was explicitly set to 'false' (user unchecked Keep me logged in)
    // and sessionStorage does NOT have the active session flag (browser was closed/reopened)
    const keepLoggedIn = typeof window !== 'undefined' ? localStorage.getItem('keep_logged_in') : null
    const sessionActive = typeof window !== 'undefined' ? sessionStorage.getItem('session_active') : null

    if (keepLoggedIn === 'false' && !sessionActive) {
      supabase.auth.signOut().then(() => {
        setUser(null)
        setUsername(null)
        setLoading(false)
      })
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        if (typeof window !== 'undefined') sessionStorage.setItem('session_active', 'true')
        fetchUsername(session.user.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setUsername(null)
          if (typeof window !== 'undefined') {
            localStorage.removeItem('keep_logged_in')
            sessionStorage.removeItem('session_active')
          }
          // Force redirect to login on sign out
          window.location.href = '/login'
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user ?? null)
          if (session?.user) {
            if (typeof window !== 'undefined') sessionStorage.setItem('session_active', 'true')
            fetchUsername(session.user.id)
          }
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, username, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)