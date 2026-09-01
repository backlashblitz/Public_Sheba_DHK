'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Lock, Eye, EyeOff, Droplets, CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // 1. Check if we already have an active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true)
      }
    })

    // 2. Listen for auth state changes (Supabase recovery token exchange)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || session) {
        setReady(true)
      }
    })

    // 3. Fallback: if user landed on this page directly with hash or link, allow them to enter password
    const timer = setTimeout(() => {
      setReady(true)
    }, 1500)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timer)
    }
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
      setLoading(false)
    } else {
      setSuccess(true)
      // Sign out and redirect to login with success banner
      setTimeout(async () => {
        await supabase.auth.signOut()
        window.location.href = '/login?reset=success'
      }, 2000)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a163c 0%, #050f28 100%)',
      padding: '24px 16px',
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '44px 36px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
      }}>

        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <div style={{
            width: '42px', height: '42px',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            borderRadius: '12px', display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
          }}>
            <Droplets size={22} color="white" />
          </div>
          <div>
            <p style={{ fontSize: '17px', fontWeight: '800', color: '#111827', margin: 0, letterSpacing: '-0.3px' }}>
              Public Sheba DHK
            </p>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
              Utility Monitoring · Dhaka
            </p>
          </div>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: '64px', height: '64px',
              borderRadius: '50%', background: '#dcfce7',
              color: '#16a34a', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 16px',
            }}>
              <CheckCircle size={36} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', margin: '0 0 8px' }}>
              Password Updated!
            </h2>
            <p style={{ fontSize: '14px', color: '#4b5563', margin: '0 0 6px', lineHeight: '1.6' }}>
              Your password has been changed successfully.
            </p>
            <p style={{ fontSize: '13px', color: '#2563eb', fontWeight: '600', margin: 0 }}>
              Redirecting you to Sign in...
            </p>
          </div>
        ) : !ready ? (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔐</div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', margin: '0 0 8px' }}>
              Verifying link...
            </h2>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
              Connecting to secure recovery session...
            </p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', margin: '0 0 6px' }}>
                Reset Your Password
              </h2>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                Enter your new password below to secure your account.
              </p>
            </div>

            {error && (
              <div style={{
                background: '#fef2f2', border: '1.5px solid #fecaca',
                borderRadius: '12px', padding: '12px 14px',
                fontSize: '13px', color: '#dc2626', marginBottom: '20px',
              }}>
                {'⚠️'} {error}
              </div>
            )}

            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* New Password */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>
                  New password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#9ca3af" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={{
                      width: '100%', padding: '12px 42px 12px 42px', borderRadius: '10px',
                      border: '1.5px solid #e5e7eb', fontSize: '14px', color: '#111827',
                      outline: 'none', boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = '#2563eb'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af',
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>
                  Confirm new password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#9ca3af" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-type your password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    style={{
                      width: '100%', padding: '12px 42px 12px 42px', borderRadius: '10px',
                      border: `1.5px solid ${confirmPassword && confirmPassword !== password ? '#fca5a5' : '#e5e7eb'}`,
                      fontSize: '14px', color: '#111827',
                      outline: 'none', boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = confirmPassword && confirmPassword !== password ? '#ef4444' : '#2563eb'}
                    onBlur={e => e.target.style.borderColor = confirmPassword && confirmPassword !== password ? '#fca5a5' : '#e5e7eb'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af',
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p style={{ fontSize: '12px', color: '#dc2626', margin: '6px 0 0' }}>
                    Passwords do not match
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '13px', borderRadius: '10px',
                  border: 'none',
                  background: loading ? '#93c5fd' : 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                  color: '#ffffff', fontSize: '15px', fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.3px', marginTop: '4px',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
                }}
              >
                {loading ? 'Saving new password...' : 'Save new password'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Link
                href="/login"
                style={{
                  color: '#6b7280', fontSize: '13px', fontWeight: '600',
                  textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px',
                }}
              >
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}