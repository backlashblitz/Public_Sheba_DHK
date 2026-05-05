'use client'
import { useState, useEffect } from 'react'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/AuthContext'
import { useLang } from '@/lib/LangContext'
import { isAdmin } from '@/lib/isAdmin'

const utilityConfig = {
  water: {
    icon: '💧',
    color: '#2563eb',
    bg: '#eff6ff',
    gradient: 'linear-gradient(135deg, #1e40af, #3b82f6)',
    issues: [
      { id: 'no_water', labelKey: 'noWater' },
      { id: 'low_pressure', labelKey: 'lowPressure' },
      { id: 'discoloured', labelKey: 'discoloured' },
      { id: 'bad_smell', labelKey: 'badSmell' },
    ]
  },
  electricity: {
    icon: '⚡',
    color: '#d97706',
    bg: '#fffbeb',
    gradient: 'linear-gradient(135deg, #92400e, #f59e0b)',
    issues: [
      { id: 'no_power', labelKey: 'noPower' },
      { id: 'low_voltage', labelKey: 'lowVoltage' },
      { id: 'frequent_cuts', labelKey: 'frequentCuts' },
    ]
  },
  gas: {
    icon: '🔥',
    color: '#dc2626',
    bg: '#fef2f2',
    gradient: 'linear-gradient(135deg, #991b1b, #ef4444)',
    issues: [
      { id: 'no_gas', labelKey: 'noGas' },
      { id: 'low_gas_pressure', labelKey: 'lowGasPressure' },
    ]
  },
}

function getPlaceholder(utilityType) {
  if (utilityType === 'electricity') return 'e.g. no electricity since morning, no notice from DESCO...'
  if (utilityType === 'gas') return 'e.g. no gas since last night, Titas Gas has not responded...'
  return 'e.g. no water since morning, no notice from WASA...'
}

function getActions(utility, level) {
  if (utility === 'water') {
    if (level === 'zone') return ['Call WASA hotline: 9555960 or 9514100', 'Store water if you have any remaining', 'Monitor the live map for zone status updates']
    if (level === 'multiple') return ['Contact WASA: 9555960', 'Check with neighbours in other buildings', 'Monitor the live map for updates']
    return ['Check with your building owner first', 'Ask if the pump or electricity is the issue', 'If whole zone is affected, call WASA: 9555960']
  }
  if (utility === 'electricity') {
    if (level === 'zone') return ['Call DESCO: 16116 or DPDC: 16117', 'Avoid using generators indoors without ventilation', 'Check the live map for zone status updates']
    if (level === 'multiple') return ['Contact DESCO: 16116 or DPDC: 16117', 'Report to your local electricity office', 'Monitor the live map for updates']
    return ['Check your building circuit breaker first', 'Ask neighbours if they have the same issue', 'If zone-wide, call DESCO: 16116']
  }
  if (utility === 'gas') {
    if (level === 'zone') return ['Call Titas Gas emergency: 16499', 'Do not use open flames if you smell gas leaking', 'Open windows and ventilate your home', 'Monitor the live map for zone status updates']
    return ['Check your building gas valve first', 'Contact Titas Gas: 16499', 'Do not attempt to repair gas lines yourself', 'If smell is strong, evacuate and call 999']
  }
  return []
}

export default function ReportPage() {
  const { user } = useAuth()
  const { t } = useLang()
  const [zones, setZones] = useState([])
  const [form, setForm] = useState({
    zone_id: '', zone_name: '',
    utility_type: '', issue_type: '',
    started: '', description: '',
    specific_location: '', address: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [diagnosis, setDiagnosis] = useState(null)

  useEffect(() => {
    fetch('/api/zones').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setZones(data)
    })
  }, [])

  const startedOptions = [
    { id: 'under_1hr', label: t.under1hr || 'Less than 1 hour' },
    { id: '1_3hrs', label: t.oneToThreeHrs || '1 to 3 hours' },
    { id: 'over_3hrs', label: t.over3hrs || 'More than 3 hours' },
  ]

  const currentIssues = form.utility_type
    ? utilityConfig[form.utility_type].issues.map(i => ({
        ...i, label: t[i.labelKey] || i.labelKey
      }))
    : []

  const activeColor = form.utility_type ? utilityConfig[form.utility_type].color : '#2563eb'
  const activeBg = form.utility_type ? utilityConfig[form.utility_type].bg : '#eff6ff'
  const activeGradient = form.utility_type ? utilityConfig[form.utility_type].gradient : 'linear-gradient(135deg, #1e40af, #3b82f6)'

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.zone_id || !form.utility_type || !form.issue_type || !form.started || !form.address.trim()) {
      setError('Please fill in all required fields including your address.')
      return
    }
    if (!user) { setError(t.signInToReport || 'Please sign in.'); return }
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zone_id: form.zone_id,
          zone_name: form.zone_name,
          utility_type: form.utility_type,
          issue_type: form.issue_type,
          started: form.started,
          description: form.description || null,
          specific_location: form.specific_location || null,
          address: form.address || null,
          user_id: user.id,
          user_email: user.email,
        }),
      })
      if (res.ok) {
        const zoneReports = await fetch(`/api/reports?zone_id=${form.zone_id}&utility_type=${form.utility_type}`).then(r => r.json())
        const count = Array.isArray(zoneReports) ? zoneReports.length : 1
        const utilityName = t[form.utility_type] || form.utility_type
        let diagnosisData
        if (count >= 20) {
          diagnosisData = { level: 'zone', icon: '🚨', title: `Zone-wide ${utilityName} failure detected`, message: `${count} households in ${form.zone_name} are reporting the same issue.`, actions: getActions(form.utility_type, 'zone') }
        } else if (count >= 8) {
          diagnosisData = { level: 'zone', icon: '⚠️', title: 'Multiple buildings affected', message: `${count} reports in ${form.zone_name}. Likely a supply-side problem.`, actions: getActions(form.utility_type, 'multiple') }
        } else {
          diagnosisData = { level: 'building', icon: '🔍', title: 'Isolated report — check your building first', message: `Only ${count} report in ${form.zone_name} so far.`, actions: getActions(form.utility_type, 'isolated') }
        }
        setDiagnosis(diagnosisData)
        setSubmitted(true)
      } else {
        const errData = await res.json()
        setError(errData.error || 'Something went wrong.')
      }
    } catch { setError('Something went wrong. Please try again.') }
    setSubmitting(false)
  }

  if (submitted) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div style={{ maxWidth: '520px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '70px', height: '70px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <CheckCircle size={34} color="#16a34a" />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', margin: '0 0 6px' }}>{t.reportSuccess || 'Report submitted!'}</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>{t.reportSuccessMsg || 'Thank you for helping your community.'}</p>
        </div>
        {diagnosis && (
          <div style={{ background: diagnosis.level === 'zone' ? '#fef2f2' : '#eff6ff', border: `1.5px solid ${diagnosis.level === 'zone' ? '#fecaca' : '#bfdbfe'}`, borderRadius: '16px', padding: '20px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>{diagnosis.icon}</span>
              <div>
                <p style={{ fontWeight: '700', color: '#111827', margin: '0 0 4px', fontSize: '14px' }}>{diagnosis.title}</p>
                <p style={{ color: '#6b7280', fontSize: '13px', margin: 0, lineHeight: '1.6' }}>{diagnosis.message}</p>
              </div>
            </div>
          </div>
        )}
        {diagnosis && (
          <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>What to do now</p>
            {diagnosis.actions.map((action, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280' }}>{i + 1}</span>
                </div>
                <p style={{ fontSize: '13px', color: '#374151', margin: 0, lineHeight: '1.6' }}>{action}</p>
              </div>
            ))}
          </div>
        )}
        <div style={{ textAlign: 'center' }}>
          <Link href="/" style={{ color: '#2563eb', fontSize: '14px', textDecoration: 'none', fontWeight: '600' }}>← View live map</Link>
        </div>
      </div>
    </div>
  )

  if (!user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔒</div>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>{t.signInRequired || 'Sign in required'}</h2>
        <Link href="/login" style={{ background: '#2563eb', color: 'white', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>{t.signInNow || 'Sign in'}</Link>
      </div>
    </div>
  )

  if (isAdmin(user)) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🛡️</div>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>Admins cannot submit reports</h2>
        <Link href="/admin" style={{ background: '#2563eb', color: 'white', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>Go to dashboard</Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>

      <style>{`
        @keyframes blob1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(40px, -50px) scale(1.1); }
          66% { transform: translate(-30px, 30px) scale(0.95); }
        }
        @keyframes blob2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(-40px, 40px) scale(1.08); }
          66% { transform: translate(50px, -30px) scale(0.92); }
        }
        @keyframes blob3 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, 30px) scale(1.05); }
          66% { transform: translate(-40px, -20px) scale(1.1); }
        }
        @keyframes blob4 {
          0%, 100% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
          50% { transform: translate(-20px, 40px) scale(1.07) rotate(45deg); }
        }
        @keyframes blob5 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(30px, -40px) scale(1.12); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spinReverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes drift {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(15px, -20px); }
          50% { transform: translate(-10px, -35px); }
          75% { transform: translate(-20px, -15px); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .form-card {
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1.5px solid rgba(255,255,255,0.9);
          border-radius: 20px;
          padding: 22px;
          margin-bottom: 14px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04);
          animation: fadeSlideIn 0.4s ease;
        }
        .step-label {
          font-size: 13px;
          font-weight: 700;
          color: #374151;
          margin: 0 0 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .step-num {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 11px;
          font-weight: 800;
          flex-shrink: 0;
          transition: background 0.4s ease;
        }
        .utility-btn {
          padding: 18px 8px;
          border-radius: 16px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          transition: all 0.25s ease;
          font-family: inherit;
          background: white;
        }
        .utility-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
        .option-btn {
          padding: 12px 14px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 13px;
          text-align: left;
          transition: all 0.2s ease;
          font-family: inherit;
          font-weight: 500;
        }
        .option-btn:hover { transform: translateY(-1px); }
        .duration-btn {
          padding: 13px 8px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s ease;
          font-family: inherit;
          font-weight: 500;
          text-align: center;
          line-height: 1.4;
        }
        .submit-btn {
          width: 100%;
          padding: 16px;
          color: white;
          border: none;
          border-radius: 14px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.3px;
          transition: all 0.3s ease;
          font-family: inherit;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.25);
        }
        .form-input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 12px;
          font-size: 14px;
          color: #111827;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: inherit;
          background: white;
        }
      `}</style>

      {/* ── ANIMATED BACKGROUND — pure CSS shapes, no images ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', background: '#f0f4ff' }}>

        {/* Base gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #e0e7ff 0%, #f5f3ff 25%, #fce7f3 50%, #ecfdf5 75%, #fef3c7 100%)',
        }} />

        {/* Large slow blob 1 — top left */}
        <div style={{
          position: 'absolute',
          top: '-150px', left: '-150px',
          width: '600px', height: '600px',
          borderRadius: '50%',
          background: `radial-gradient(circle at 30% 40%, ${activeColor}22, ${activeColor}08, transparent 65%)`,
          animation: 'blob1 12s ease-in-out infinite',
          transition: 'background 1s ease',
        }} />

        {/* Large slow blob 2 — bottom right */}
        <div style={{
          position: 'absolute',
          bottom: '-120px', right: '-120px',
          width: '550px', height: '550px',
          borderRadius: '50%',
          background: `radial-gradient(circle at 60% 60%, ${activeColor}1a, ${activeColor}08, transparent 65%)`,
          animation: 'blob2 15s ease-in-out infinite',
          transition: 'background 1s ease',
        }} />

        {/* Medium blob 3 — top right */}
        <div style={{
          position: 'absolute',
          top: '10%', right: '5%',
          width: '380px', height: '380px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.12), rgba(167,139,250,0.06), transparent 65%)',
          animation: 'blob3 18s ease-in-out infinite',
        }} />

        {/* Medium blob 4 — middle left */}
        <div style={{
          position: 'absolute',
          top: '45%', left: '-80px',
          width: '350px', height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236,72,153,0.08), transparent 65%)',
          animation: 'blob4 20s ease-in-out infinite',
        }} />

        {/* Small blob 5 — center */}
        <div style={{
          position: 'absolute',
          top: '30%', left: '50%',
          width: '250px', height: '250px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${activeColor}10, transparent 65%)`,
          animation: 'blob5 14s ease-in-out infinite',
          transition: 'background 1s ease',
        }} />

        {/* Spinning ring 1 */}
        <div style={{
          position: 'absolute',
          top: '15%', right: '15%',
          width: '200px', height: '200px',
          borderRadius: '50%',
          border: `1.5px solid ${activeColor}18`,
          animation: 'spin 25s linear infinite',
          transition: 'border-color 1s ease',
        }} />

        {/* Spinning ring 2 — bigger */}
        <div style={{
          position: 'absolute',
          top: '10%', right: '10%',
          width: '300px', height: '300px',
          borderRadius: '50%',
          border: `1px solid ${activeColor}10`,
          animation: 'spinReverse 35s linear infinite',
          transition: 'border-color 1s ease',
        }} />

        {/* Spinning ring 3 — bottom left */}
        <div style={{
          position: 'absolute',
          bottom: '20%', left: '8%',
          width: '250px', height: '250px',
          borderRadius: '50%',
          border: `1.5px solid rgba(139,92,246,0.12)`,
          animation: 'spin 30s linear infinite',
        }} />

        {/* Drifting small dots */}
        {[
          { top: '20%', left: '15%', size: 8, color: activeColor, delay: '0s', dur: '8s' },
          { top: '70%', left: '80%', size: 6, color: '#8b5cf6', delay: '2s', dur: '10s' },
          { top: '40%', left: '90%', size: 10, color: activeColor, delay: '1s', dur: '12s' },
          { top: '80%', left: '20%', size: 7, color: '#ec4899', delay: '3s', dur: '9s' },
          { top: '10%', left: '60%', size: 5, color: '#10b981', delay: '0.5s', dur: '11s' },
          { top: '60%', left: '5%', size: 9, color: activeColor, delay: '4s', dur: '7s' },
          { top: '25%', left: '75%', size: 6, color: '#f59e0b', delay: '1.5s', dur: '13s' },
          { top: '85%', left: '55%', size: 8, color: '#8b5cf6', delay: '2.5s', dur: '9s' },
        ].map((dot, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: dot.top, left: dot.left,
            width: `${dot.size}px`, height: `${dot.size}px`,
            borderRadius: '50%',
            background: `${dot.color}40`,
            animation: `drift ${dot.dur} ease-in-out infinite ${dot.delay}`,
            transition: 'background 1s ease',
          }} />
        ))}

        {/* Subtle grid dots */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, #94a3b825 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

      </div>

      {/* ── PAGE CONTENT ── */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', margin: '0 auto', padding: '48px 20px 60px' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.9)',
            borderRadius: '30px',
            padding: '6px 14px',
            marginBottom: '14px',
          }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: '#22c55e',
              }} />
              <div style={{
                position: 'absolute', inset: 0,
                borderRadius: '50%',
                background: '#22c55e',
                animation: 'pulse-ring 1.5s ease-out infinite',
              }} />
            </div>
            <span style={{ fontSize: '12px', color: '#374151', fontWeight: '600' }}>
              Live reporting system · Dhaka
            </span>
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            {t.reportTitle || 'Report a utility issue'}
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
            {t.reportSubtitle || 'Takes less than 30 seconds — help your neighbours know'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* ── STEP 1 — Utility type ── */}
          <div className="form-card">
            <p className="step-label">
              <span className="step-num" style={{ background: form.utility_type ? activeColor : '#9ca3af' }}>1</span>
              {t.utilityType || 'Utility type'}
              <span style={{ color: '#ef4444' }}>*</span>
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              {Object.entries(utilityConfig).map(([key, val]) => (
                <button
                  key={key}
                  type="button"
                  className="utility-btn"
                  onClick={() => setForm(f => ({ ...f, utility_type: key, issue_type: '' }))}
                  style={{
                    border: `2px solid ${form.utility_type === key ? val.color : '#e5e7eb'}`,
                    background: form.utility_type === key ? val.bg : 'white',
                    transform: form.utility_type === key ? 'translateY(-3px) scale(1.02)' : 'none',
                    boxShadow: form.utility_type === key ? `0 8px 24px ${val.color}30` : 'none',
                  }}
                >
                  <span style={{ fontSize: '32px' }}>{val.icon}</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: form.utility_type === key ? val.color : '#374151' }}>
                    {t[key] || key}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── STEP 2 — Zone + Address ── */}
          <div className="form-card">
            <p className="step-label">
              <span className="step-num" style={{ background: form.zone_id && form.address.trim() ? activeColor : '#9ca3af' }}>2</span>
              {t.yourArea || 'Your area'}
              <span style={{ color: '#ef4444' }}>*</span>
            </p>

            <select
              className="form-input"
              value={form.zone_id}
              style={{ border: `1.5px solid ${form.zone_id ? activeColor : '#e5e7eb'}`, marginBottom: '12px' }}
              onChange={e => {
                const z = zones.find(z => z.id === e.target.value)
                if (z) setForm(f => ({ ...f, zone_id: z.id, zone_name: z.name }))
              }}
            >
              <option value="">{t.selectZone || 'Select your zone...'}</option>
              {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>

            {form.zone_id && (
              <>
                <div style={{ marginBottom: '10px', animation: 'fadeSlideIn 0.35s ease' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Your address <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. House 12, Road 5, Dhanmondi"
                    value={form.address}
                    style={{ border: `1.5px solid ${form.address.trim() ? activeColor : '#e5e7eb'}` }}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    onFocus={e => e.target.style.borderColor = activeColor}
                    onBlur={e => e.target.style.borderColor = form.address.trim() ? activeColor : '#e5e7eb'}
                  />
                  <p style={{ color: '#9ca3af', fontSize: '11px', margin: '4px 0 0 2px' }}>Exact address helps identify the affected area</p>
                </div>

                <div style={{ animation: 'fadeSlideIn 0.35s ease' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Specific location <span style={{ color: '#9ca3af', fontWeight: '400', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Block B, near mosque, Colony Gate..."
                    value={form.specific_location}
                    style={{ border: '1.5px solid #e5e7eb' }}
                    onChange={e => setForm(f => ({ ...f, specific_location: e.target.value }))}
                    onFocus={e => e.target.style.borderColor = activeColor}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </>
            )}
          </div>

          {/* ── STEP 3 — Issue type ── */}
          {form.utility_type && (
            <div className="form-card">
              <p className="step-label">
                <span className="step-num" style={{ background: form.issue_type ? activeColor : '#9ca3af' }}>3</span>
                {t.issueType || 'Issue type'}
                <span style={{ color: '#ef4444' }}>*</span>
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {currentIssues.map(type => (
                  <button
                    key={type.id}
                    type="button"
                    className="option-btn"
                    onClick={() => setForm(f => ({ ...f, issue_type: type.id }))}
                    style={{
                      border: `2px solid ${form.issue_type === type.id ? activeColor : '#e5e7eb'}`,
                      background: form.issue_type === type.id ? activeBg : 'white',
                      color: form.issue_type === type.id ? activeColor : '#374151',
                      fontWeight: form.issue_type === type.id ? '700' : '500',
                      boxShadow: form.issue_type === type.id ? `0 4px 14px ${activeColor}25` : 'none',
                    }}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 4 — Duration ── */}
          <div className="form-card">
            <p className="step-label">
              <span className="step-num" style={{ background: form.started ? activeColor : '#9ca3af' }}>4</span>
              {t.howLong || 'How long has this been happening?'}
              <span style={{ color: '#ef4444' }}>*</span>
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {startedOptions.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  className="duration-btn"
                  onClick={() => setForm(f => ({ ...f, started: opt.id }))}
                  style={{
                    border: `2px solid ${form.started === opt.id ? activeColor : '#e5e7eb'}`,
                    background: form.started === opt.id ? activeBg : 'white',
                    color: form.started === opt.id ? activeColor : '#374151',
                    fontWeight: form.started === opt.id ? '700' : '500',
                    boxShadow: form.started === opt.id ? `0 4px 14px ${activeColor}25` : 'none',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── STEP 5 — Extra details ── */}
          <div className="form-card">
            <p className="step-label">
              <span className="step-num" style={{ background: '#9ca3af' }}>5</span>
              {t.extraDetails || 'Extra details'}
              <span style={{ color: '#9ca3af', fontWeight: '400', fontSize: '12px' }}>({t.optional || 'optional'})</span>
            </p>
            <textarea
              className="form-input"
              rows={3}
              placeholder={getPlaceholder(form.utility_type)}
              value={form.description}
              style={{ border: '1.5px solid #e5e7eb', resize: 'none', lineHeight: '1.6' }}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              onFocus={e => e.target.style.borderColor = activeColor}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {error && (
            <div style={{ background: 'rgba(254,242,242,0.9)', border: '1.5px solid #fecaca', borderRadius: '12px', padding: '14px 16px', marginBottom: '14px', backdropFilter: 'blur(8px)' }}>
              <p style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>⚠️ {error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="submit-btn"
            style={{
              background: submitting ? '#93c5fd' : activeGradient,
              boxShadow: submitting ? 'none' : `0 4px 20px ${activeColor}50`,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? '⏳ Submitting your report...' : `🚨 ${t.submitReport || 'Submit report'}`}
          </button>

        </form>
      </div>
    </div>
  )
}