'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import Navbar from '@/components/Navbar'

export default function AuthGuard({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isLoginPage = pathname === '/login'
  const isResetPage = pathname === '/reset-password'

  useEffect(() => {
    if (loading) return
    if (!user && !isLoginPage && !isResetPage) {
      router.push('/login')
    }
  }, [user, loading, isLoginPage, isResetPage])

  if (loading) return null

  // No navbar on login or reset password page
  if (isLoginPage || isResetPage) {
    return <>{children}</>
  }

  if (!user) return null

  return (
    <>
      <Navbar />
      {children}
    </>
  )
}