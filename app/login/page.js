'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Droplets, Mail, Lock, User } from 'lucide-react'

const slides = [
  {
    image: '/images/water-crisis.jpeg',
    stat: '4M+',
    statLabel: 'Dhaka residents affected by water issues daily',
    tag: '💧 Water Crisis',
    tagColor: '#2563eb',
  },
  {
    image: '/images/loadshedding.jpg',
    stat: '8hrs',
    statLabel: 'Average daily load shedding in many Dhaka zones',
    tag: '⚡ Load Shedding',
    tagColor: '#d97706',
  },
  {
    image: '/images/gas_crisis.jpg',
    stat: '60%',
    statLabel: 'Households face gas pressure issues every week',
    tag: '🔥 Gas Crisis',
    tagColor: '#dc2626',
  },
]

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [current, setCurrent] = useState(0)
  const [fade, setFade] = useState(true)

  // Forgot password states
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % slides.length)
        setFade(true)
      }, 500)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push('/')
        router.refresh()
      }
    } else {
      if (!username.trim()) {
        setError('Please enter your name.')
        setLoading(false)
        return
      }
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        if (data.user) {
          await supabase.from('profiles').insert([{
            id: data.user.id,
            username: username.trim(),
            email: email,
          }])
        }
        setSuccess('Account created! You can now sign in.')
        setMode('login')
      }
    }
    setLoading(false)
  }

  async function handleForgotPassword(e) {
    e.preventDefault()
    if (!forgotEmail.trim()) {
      setError('Please enter your email address.')
      return
    }
    setForgotLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) {
      setError(error.message)
    } else {
      setForgotSent(true)
    }
    setForgotLoading(false)
  }

  const slide = slides[current]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>

      {/* ── LEFT PANEL ── */}
      <div style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}>

        {/* Animated background image */}
        {slides.map((s, i) => (
          <img
            key={i}
            src={s.image}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              opacity: i === current ? (fade ? 0.4 : 0) : 0,
              transition: 'opacity 0.5s ease-in-out',
              transform: i === current && fade ? 'scale(1.03)' : 'scale(1)',
            }}
          />
        ))}

        {/* Dark overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(10,22,60,0.92) 0%, rgba(5,15,40,0.95) 100%)',
        }} />

        {/* Animated floating circles */}
        <div style={{
          position: 'absolute',
          top: '-80px', right: '-80px',
          width: '300px', height: '300px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${slide.tagColor}22, transparent 70%)`,
          transition: 'background 1s ease',
          animation: 'floatA 6s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-60px', left: '-60px',
          width: '250px', height: '250px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${slide.tagColor}18, transparent 70%)`,
          transition: 'background 1s ease',
          animation: 'floatB 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          top: '40%', left: '-40px',
          width: '180px', height: '180px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.03), transparent 70%)',
          animation: 'floatC 10s ease-in-out infinite',
        }} />

        <style>{`
          @keyframes floatA {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-20px, 20px) scale(1.05); }
          }
          @keyframes floatB {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(20px, -20px) scale(1.08); }
          }
          @keyframes floatC {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(10px, 15px); }
          }
          @keyframes countUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse-ring {
            0% { transform: scale(0.9); opacity: 0.7; }
            100% { transform: scale(1.4); opacity: 0; }
          }
        `}</style>

        {/* Content */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          padding: '40px 48px',
          width: '100%',
          maxWidth: '520px',
        }}>

          {/* Logo + brand */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{
              position: 'relative',
              width: '72px',
              height: '72px',
              margin: '0 auto 20px',
            }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: `2px solid ${slide.tagColor}`,
                animation: 'pulse-ring 2s ease-out infinite',
                transition: 'border-color 1s',
              }} />
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: `2px solid ${slide.tagColor}`,
                animation: 'pulse-ring 2s ease-out infinite 0.6s',
                transition: 'border-color 1s',
              }} />
              <div style={{
                width: '72px',
                height: '72px',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1.5px solid rgba(255,255,255,0.2)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Droplets size={36} color="white" />
              </div>
            </div>

            <h1 style={{
              color: 'white',
              fontSize: '28px',
              fontWeight: '800',
              margin: '0 0 6px',
              letterSpacing: '-0.3px',
            }}>
              Public Sheba DHK
            </h1>
            <p style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: '13px',
              margin: 0,
            }}>
              Real-time utility monitoring · Dhaka, Bangladesh
            </p>
          </div>

          {/* Animated stat card */}
          <div
            key={current}
            style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(16px)',
              border: `1px solid ${slide.tagColor}44`,
              borderRadius: '20px',
              padding: '32px 28px',
              marginBottom: '28px',
              animation: 'countUp 0.6s ease forwards',
              transition: 'border-color 0.5s',
            }}
          >
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: `${slide.tagColor}22`,
              border: `1px solid ${slide.tagColor}44`,
              color: 'white',
              fontSize: '12px',
              fontWeight: '700',
              padding: '5px 14px',
              borderRadius: '20px',
              marginBottom: '20px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              {slide.tag}
            </div>

            <div style={{
              fontSize: '72px',
              fontWeight: '900',
              color: 'white',
              lineHeight: 1,
              marginBottom: '12px',
              letterSpacing: '-2px',
            }}>
              {slide.stat}
            </div>

            <p style={{
              color: 'rgba(255,255,255,0.65)',
              fontSize: '14px',
              lineHeight: '1.6',
              margin: 0,
            }}>
              {slide.statLabel}
            </p>
          </div>

          {/* Dot indicators */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setFade(false)
                  setTimeout(() => { setCurrent(i); setFade(true) }, 300)
                }}
                style={{
                  width: i === current ? '28px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: i === current ? slide.tagColor : 'rgba(255,255,255,0.25)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.4s ease',
                }}
              />
            ))}
          </div>

          {/* Feature pills */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { icon: '🗺️', text: 'Live zone map' },
              { icon: '🔔', text: 'Instant alerts' },
              { icon: '📊', text: 'Real-time data' },
            ].map(f => (
              <div key={f.text} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px',
                padding: '6px 14px',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '12px',
                fontWeight: '500',
              }}>
                <span>{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{
          position: 'absolute',
          bottom: '20px',
          color: 'rgba(255,255,255,0.2)',
          fontSize: '11px',
          zIndex: 1,
        }}>
          publicsheba.dhk © 2026
        </p>
      </div>

      {/* ── RIGHT PANEL — Form ── */}
      <div style={{
        width: '550px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 40px',
        backgroundColor: '#ffffff',
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: '360px' }}>

          {/* ── FORGOT PASSWORD VIEW ── */}
          {showForgot ? (
            <div>
              <button
                onClick={() => {
                  setShowForgot(false)
                  setForgotSent(false)
                  setForgotEmail('')
                  setError('')
                }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#6b7280', fontSize: '13px', fontWeight: '600',
                  padding: '0 0 20px', display: 'flex', alignItems: 'center', gap: '4px',
                }}
              >
                ← Back to sign in
              </button>

              {forgotSent ? (
                <div style={{ textAlign: 'center', paddingTop: '20px' }}>
                  <div style={{ fontSize: '56px', marginBottom: '20px' }}>📧</div>
                  <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', margin: '0 0 10px' }}>
                    Check your email
                  </h2>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px', lineHeight: '1.7' }}>
                    We sent a password reset link to
                  </p>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: '0 0 24px' }}>
                    {forgotEmail}
                  </p>
                  <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 6px' }}>
                    Click the link in the email to set a new password.
                  </p>
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                    Did not receive it? Check your spam folder or{' '}
                    <button
                      onClick={() => { setForgotSent(false); setError('') }}
                      style={{
                        background: 'none', border: 'none',
                        color: '#2563eb', cursor: 'pointer',
                        fontSize: '12px', fontWeight: '700', padding: 0,
                      }}
                    >
                      try again
                    </button>
                  </p>
                </div>
              ) : (
                <>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', margin: '0 0 6px' }}>
                    Forgot password?
                  </h2>
                  <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 28px' }}>
                    Enter your email and we will send you a reset link.
                  </p>

                  {error && (
                    <div style={{
                      background: '#fef2f2', border: '1.5px solid #fecaca',
                      borderRadius: '10px', padding: '12px 14px', marginBottom: '16px',
                    }}>
                      <p style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>
                        {'⚠️'} {error}
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                        Email address
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={16} color="#9ca3af" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        <input
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={e => setForgotEmail(e.target.value)}
                          placeholder="your@email.com"
                          style={{
                            width: '100%', padding: '12px 14px 12px 42px',
                            border: '1.5px solid #e5e7eb', borderRadius: '10px',
                            fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                            color: '#111827', transition: 'border-color 0.2s',
                          }}
                          onFocus={e => e.target.style.borderColor = '#3b82f6'}
                          onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={forgotLoading}
                      style={{
                        width: '100%', padding: '13px',
                        background: forgotLoading ? '#93c5fd' : 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                        color: 'white', border: 'none', borderRadius: '10px',
                        fontSize: '15px', fontWeight: '700',
                        cursor: forgotLoading ? 'not-allowed' : 'pointer',
                        letterSpacing: '0.3px',
                      }}
                    >
                      {forgotLoading ? 'Sending...' : 'Send reset link'}
                    </button>
                  </form>
                </>
              )}
            </div>
          ) : (

            /* ── NORMAL SIGN IN / SIGN UP VIEW ── */
            <>
              <div style={{ marginBottom: '32px' }}>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 4px' }}>
                  {mode === 'login' ? 'Welcome back 👋' : 'Join us today 🎉'}
                </p>
                <h2 style={{ color: '#111827', fontSize: '26px', fontWeight: '800', margin: '0 0 6px' }}>
                  {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
                </h2>
                <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
                  {mode === 'login'
                    ? 'Enter your credentials to access the dashboard'
                    : 'Fill in the details below to get started'}
                </p>
              </div>

              {/* Toggle tabs */}
              <div style={{
                display: 'flex',
                background: '#f3f4f6',
                borderRadius: '12px',
                padding: '4px',
                marginBottom: '28px',
              }}>
                {['login', 'signup'].map(m => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setError(''); setSuccess('') }}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '9px',
                      border: 'none', fontSize: '14px', fontWeight: '600',
                      cursor: 'pointer', transition: 'all 0.2s',
                      background: mode === m ? 'white' : 'transparent',
                      color: mode === m ? '#111827' : '#6b7280',
                      boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    {m === 'login' ? 'Sign in' : 'Sign up'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Name — signup only */}
                {mode === 'signup' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                      Your name
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} color="#9ca3af" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="e.g. Rahin Ahmed"
                        style={{
                          width: '100%', padding: '12px 14px 12px 42px',
                          border: '1.5px solid #e5e7eb', borderRadius: '10px',
                          fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                          color: '#111827', transition: 'border-color 0.2s',
                        }}
                        onFocus={e => e.target.style.borderColor = '#3b82f6'}
                        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Email address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="#9ca3af" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      style={{
                        width: '100%', padding: '12px 14px 12px 42px',
                        border: '1.5px solid #e5e7eb', borderRadius: '10px',
                        fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                        color: '#111827', transition: 'border-color 0.2s',
                      }}
                      onFocus={e => e.target.style.borderColor = '#3b82f6'}
                      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color="#9ca3af" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      style={{
                        width: '100%', padding: '12px 14px 12px 42px',
                        border: '1.5px solid #e5e7eb', borderRadius: '10px',
                        fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                        color: '#111827', transition: 'border-color 0.2s',
                      }}
                      onFocus={e => e.target.style.borderColor = '#3b82f6'}
                      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                </div>

                {/* Forgot password link — login mode only */}
                {mode === 'login' && (
                  <div style={{ textAlign: 'right', marginTop: '-4px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgot(true)
                        setForgotEmail(email)
                        setError('')
                      }}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#2563eb', fontSize: '13px', fontWeight: '600',
                        padding: 0,
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div style={{
                    background: '#fef2f2', border: '1.5px solid #fecaca',
                    borderRadius: '10px', padding: '12px 14px',
                  }}>
                    <p style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>
                      {'⚠️'} {error}
                    </p>
                  </div>
                )}

                {/* Success */}
                {success && (
                  <div style={{
                    background: '#f0fdf4', border: '1.5px solid #bbf7d0',
                    borderRadius: '10px', padding: '12px 14px',
                  }}>
                    <p style={{ color: '#16a34a', fontSize: '13px', margin: 0 }}>
                      {'✅'} {success}
                    </p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '13px',
                    background: loading ? '#93c5fd' : 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                    color: 'white', border: 'none', borderRadius: '10px',
                    fontSize: '15px', fontWeight: '700',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginTop: '4px', letterSpacing: '0.3px',
                    transition: 'opacity 0.2s',
                  }}
                >
                  {loading
                    ? 'Please wait...'
                    : mode === 'login' ? '→ Sign in' : '→ Create account'}
                </button>
              </form>

              <p style={{
                textAlign: 'center',
                color: '#9ca3af',
                fontSize: '12px',
                marginTop: '28px',
                lineHeight: '1.6',
              }}>
                By continuing you agree to our terms of service.<br />
                This platform is for Dhaka residents only.
              </p>
            </>
          )}
        </div>
      </div>

    </div>
  )
}