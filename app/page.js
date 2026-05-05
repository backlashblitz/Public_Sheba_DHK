'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { useLang } from '@/lib/LangContext'
import { isAdmin } from '@/lib/isAdmin'
import dynamic from 'next/dynamic'
import HeroSlider from '@/components/HeroSlider'
import ReportFeed from '@/components/ReportFeed'

const ZoneMap = dynamic(() => import('@/components/ZoneMap'), { ssr: false })

export default function HomePage() {
  const { user } = useAuth()
  const { t } = useLang()
  const userIsAdmin = isAdmin(user)

  const [zones, setZones] = useState([])
  const [reports, setReports] = useState([])
  const [announcements, setAnnouncements] = useState([])

  useEffect(() => {
    fetch('/api/zones').then(r => r.json()).then(setZones)
    fetch('/api/reports').then(r => r.json()).then(setReports)
    fetch('/api/announcements').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setAnnouncements(data)
    })
  }, [])

  useEffect(() => {
    if (user) {
      window.__currentUser = user
      window.__currentUserIsAdmin = isAdmin(user)
    }
  }, [user])

  const waterAlert = zones.find(z => z.water_status === 'outage' || z.water_status === 'issues')
  const elecAlert = zones.find(z => z.electricity_status === 'outage' || z.electricity_status === 'issues')
  const gasAlert = zones.find(z => z.gas_status === 'outage' || z.gas_status === 'issues')

  const totalReports = reports.length
  const affectedZones = zones.filter(z =>
    z.water_status !== 'normal' || z.electricity_status !== 'normal' || z.gas_status !== 'normal'
  ).length

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>

      {/* Hero Slider - flush below navbar, no gap */}
      <HeroSlider />

      {/* Alert Banners */}
      {(waterAlert || elecAlert || gasAlert) && (
        <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {waterAlert && (
            <div style={{
              background: waterAlert.water_status === 'outage' ? '#fee2e2' : '#fef3c7',
              border: `1px solid ${waterAlert.water_status === 'outage' ? '#fca5a5' : '#fde68a'}`,
              borderRadius: '10px',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <span style={{ fontSize: '18px' }}>{'💧'}</span>
              <div>
                <p style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: waterAlert.water_status === 'outage' ? '#b91c1c' : '#92400e',
                  margin: 0,
                }}>
                  Water {waterAlert.water_status === 'outage' ? 'Outage' : 'Issues'} &mdash; {waterAlert.name}
                </p>
                <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>
                  {waterAlert.report_count || 0} reports in the last 2 hours
                </p>
              </div>
            </div>
          )}
          {elecAlert && (
            <div style={{
              background: elecAlert.electricity_status === 'outage' ? '#fee2e2' : '#fef3c7',
              border: `1px solid ${elecAlert.electricity_status === 'outage' ? '#fca5a5' : '#fde68a'}`,
              borderRadius: '10px',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <span style={{ fontSize: '18px' }}>{'⚡'}</span>
              <div>
                <p style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: elecAlert.electricity_status === 'outage' ? '#b91c1c' : '#92400e',
                  margin: 0,
                }}>
                  Electricity {elecAlert.electricity_status === 'outage' ? 'Outage' : 'Issues'} &mdash; {elecAlert.name}
                </p>
                <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>
                  {elecAlert.report_count || 0} reports in the last 2 hours
                </p>
              </div>
            </div>
          )}
          {gasAlert && (
            <div style={{
              background: gasAlert.gas_status === 'outage' ? '#fee2e2' : '#fef3c7',
              border: `1px solid ${gasAlert.gas_status === 'outage' ? '#fca5a5' : '#fde68a'}`,
              borderRadius: '10px',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <span style={{ fontSize: '18px' }}>{'🔥'}</span>
              <div>
                <p style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: gasAlert.gas_status === 'outage' ? '#b91c1c' : '#92400e',
                  margin: 0,
                }}>
                  Gas {gasAlert.gas_status === 'outage' ? 'Outage' : 'Issues'} &mdash; {gasAlert.name}
                </p>
                <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>
                  {gasAlert.report_count || 0} reports in the last 2 hours
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Announcements */}
      {announcements.length > 0 && (
        <div style={{ padding: '0 20px 12px' }}>
          {announcements.map(a => (
            <div key={a.id} style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '10px',
              padding: '10px 16px',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}>
              <span style={{ fontSize: '18px', flexShrink: 0 }}>{'📢'}</span>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '700', color: '#92400e', margin: '0 0 2px' }}>
                  {a.title}
                </p>
                <p style={{ fontSize: '12px', color: '#b45309', margin: 0 }}>{a.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats bar */}
      <div style={{
        display: 'flex',
        gap: '12px',
        padding: '0 20px 20px',
        flexWrap: 'wrap',
      }}>
        {[
          { icon: '📋', label: 'Active Reports', value: totalReports, color: '#2563eb' },
          { icon: '🗺️', label: 'Affected Zones', value: affectedZones, color: '#dc2626' },
          { icon: '🏘️', label: 'Total Zones', value: zones.length, color: '#16a34a' },
        ].map(s => (
          <div key={s.label} style={{
            flex: '1',
            minWidth: '100px',
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '14px 16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>{s.icon}</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '500' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Map + Feed */}
      <div style={{
        display: 'flex',
        gap: '16px',
        padding: '0 20px 40px',
        flexWrap: 'wrap',
      }}>
        {/* Map */}
        <div style={{
          flex: '2',
          minWidth: '300px',
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          overflow: 'hidden',
          height: '480px',
        }}>
          <div style={{
            padding: '14px 18px',
            borderBottom: '1px solid #f3f4f6',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{ fontSize: '16px' }}>{'🗺️'}</span>
            <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#111', margin: 0 }}>
              Live Zone Map
            </h2>
            <div style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '11px',
              color: '#16a34a',
              background: '#f0fdf4',
              padding: '3px 8px',
              borderRadius: '20px',
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#16a34a',
                display: 'inline-block',
              }} />
              Live
            </div>
          </div>
          <div style={{ height: 'calc(100% - 53px)' }}>
            <ZoneMap zones={zones} />
          </div>
        </div>

        {/* Report Feed */}
        <div style={{
          flex: '1',
          minWidth: '280px',
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          overflow: 'hidden',
          height: '480px',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            padding: '14px 18px',
            borderBottom: '1px solid #f3f4f6',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: '16px' }}>{'📡'}</span>
            <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#111', margin: 0 }}>
              Live Reports
            </h2>
            {reports.length > 0 && (
              <span style={{
                marginLeft: 'auto',
                background: '#eff6ff',
                color: '#2563eb',
                fontSize: '11px',
                fontWeight: '600',
                padding: '2px 8px',
                borderRadius: '20px',
              }}>
                {reports.length} active
              </span>
            )}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px' }}>
            <ReportFeed reports={reports} />
          </div>
        </div>
      </div>

      {/* CTA */}
      {!userIsAdmin && (
        <div style={{
          margin: '0 20px 40px',
          background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
          borderRadius: '16px',
          padding: '28px 24px',
          textAlign: 'center',
          color: '#fff',
        }}>
          <p style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 8px' }}>
            Facing a utility issue?
          </p>
          <p style={{ fontSize: '13px', color: '#bfdbfe', margin: '0 0 18px' }}>
            Report it now and help your neighbors stay informed
          </p>
          <a
            href="/report"
            style={{
              display: 'inline-block',
              background: '#fff',
              color: '#1d4ed8',
              fontWeight: '700',
              fontSize: '14px',
              padding: '10px 28px',
              borderRadius: '10px',
              textDecoration: 'none',
            }}
          >
            Report an Issue
          </a>
        </div>
      )}

    </div>
  )
}