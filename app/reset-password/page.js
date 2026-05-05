'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase automatically handles the token from the URL
    // We just need to check if we have a valid session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true)
      } else {
        // Listen for auth state change (token exchange happens automatically)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'PASSWORD_RECOVERY') {
            setReady(true)
          }
        })
        return () => subscription.unsubscribe()
      }
    })
  }, [])

  async function handleReset(e) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      // Sign out and redirect to login after 3 seconds
      setTimeout(async () => {
        await supabase.auth.signOut()
        router.push('/login')
      }, 3000)
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
      padding: '20px',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '20px',
        border: '1px solid #e5e7eb',
        padding: '40px 36px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
          <div style={{
            width: '38px', height: '38px',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            borderRadius: '10px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '18px',
          }}>
            {'💧'}
          </div>
          <div>
            <p style={{ fontSize: '15px', fontWeight: '800', color: '#111', margin: 0 }}>
              Public Sheba DHK
            </p>
            <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>
              Real-time utility monitoring
            </p>
          </div>
        </div>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '52px', marginBottom: '16px' }}>✅</div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#111', margin: '0 0 8px' }}>
              Password updated!
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px', lineHeight: '1.6' }}>
              Your password has been changed successfully.
            </p>
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>
              Redirecting you to sign in...
            </p>
          </div>
        ) : !ready ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔐</div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111', margin: '0 0 8px' }}>
              Verifying reset link...
            </h2>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
              Please wait a moment.
            </p>
          </div>
        ) : (
          <>
            <div style={{ fontSize: '40px', marginBottom: '16px', textAlign: 'center' }}>🔒</div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#111', margin: '0 0 6px', textAlign: 'center' }}>
              Set new password
            </h2>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 24px', textAlign: 'center' }}>
              Choose a strong password for your account.
            </p>

            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: '10px', padding: '12px 14px',
                fontSize: '13px', color: '#b91c1c', marginBottom: '16px',
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleReset}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>
                  New password
                </label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: '10px',
                    border: '1.5px solid #e5e7eb', fontSize: '14px', color: '#111',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>
                  Confirm new password
                </label>
                <input
                  type="password"
                  placeholder="Type your password again"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: '10px',
                    border: `1.5px solid ${confirmPassword && confirmPassword !== password ? '#fca5a5' : '#e5e7eb'}`,
                    fontSize: '14px', color: '#111',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
                {confirmPassword && confirmPassword !== password && (
                  <p style={{ fontSize: '12px', color: '#dc2626', margin: '4px 0 0' }}>
                    Passwords do not match
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '13px', borderRadius: '10px',
                  border: 'none', background: loading ? '#94a3b8' : '#2563eb',
                  color: '#fff', fontSize: '15px', fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Updating password...' : 'Update password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}