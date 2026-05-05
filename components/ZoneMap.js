'use client'
import { useEffect, useRef } from 'react'

const statusColors = {
  normal: '#16a34a',
  issues: '#d97706',
  outage: '#dc2626',
}

function getStatusColor(status) {
  return statusColors[status] || '#16a34a'
}

function getStatusLabel(status) {
  if (status === 'outage') return 'Outage'
  if (status === 'issues') return 'Issues'
  return 'Normal'
}

function getWorstStatus(zone) {
  const statuses = [
    zone.water_status || 'normal',
    zone.electricity_status || 'normal',
    zone.gas_status || 'normal',
  ]
  if (statuses.includes('outage')) return 'outage'
  if (statuses.includes('issues')) return 'issues'
  return 'normal'
}

function countProblems(zone) {
  const statuses = [
    zone.water_status || 'normal',
    zone.electricity_status || 'normal',
    zone.gas_status || 'normal',
  ]
  return statuses.filter(s => s !== 'normal').length
}

export default function ZoneMap({ zones }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const initializedRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!mapRef.current) return
    if (initializedRef.current) return
    initializedRef.current = true

    async function initMap() {
      const L = (await import('leaflet')).default

      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
        await new Promise(r => setTimeout(r, 200))
      }

      if (mapRef.current._leaflet_id) return

      const map = L.map(mapRef.current, {
        center: [23.7808, 90.3947],
        zoom: 12,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map)

      mapInstanceRef.current = map

      map.on('popupopen', async (e) => {
        if (window.__currentUserIsAdmin) {
          document.querySelectorAll('[id^="sub-btn-"]').forEach(el => {
            el.style.display = 'none'
          })
          return
        }
        const user = window.__currentUser
        if (!user) return
        const zoneId = e.popup._source?.options?._zoneId
        if (!zoneId) return
        try {
          const res = await fetch(`/api/subscriptions?user_id=${user.id}`)
          const ids = await res.json()
          const isSubscribed = Array.isArray(ids) && ids.includes(zoneId)
          updateSubButton(zoneId, isSubscribed)
        } catch (err) {}
      })

      window.__subscribeToZone = async (zoneId, zoneName) => {
        const user = window.__currentUser
        if (!user) {
          const btn = document.getElementById(`sub-btn-${zoneId}`)
          if (btn) {
            btn.innerHTML = '🔒 Sign in to subscribe'
            btn.style.color = '#dc2626'
            setTimeout(() => {
              btn.innerHTML = '🔔 Subscribe to alerts'
              btn.style.color = '#374151'
            }, 2000)
          }
          return
        }
        if (window.__currentUserIsAdmin) return
        const btn = document.getElementById(`sub-btn-${zoneId}`)
        if (btn) { btn.disabled = true; btn.style.opacity = '0.5' }
        const res = await fetch('/api/subscriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, zone_id: zoneId }),
        })
        const data = await res.json()
        updateSubButton(zoneId, data.subscribed)
      }

      if (zones && zones.length > 0) {
        drawMarkers(L, map, zones)
      }
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        initializedRef.current = false
      }
    }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current || !zones?.length) return
    async function redraw() {
      const L = (await import('leaflet')).default
      drawMarkers(L, mapInstanceRef.current, zones)
    }
    redraw()
  }, [zones])

  function updateSubButton(zoneId, isSubscribed) {
    const btn = document.getElementById(`sub-btn-${zoneId}`)
    if (!btn) return
    btn.disabled = false
    btn.style.opacity = '1'
    if (isSubscribed) {
      btn.innerHTML = '✅ Subscribed — click to unsubscribe'
      btn.style.background = '#eff6ff'
      btn.style.borderColor = '#93c5fd'
      btn.style.color = '#1d4ed8'
      btn.style.fontWeight = '500'
    } else {
      btn.innerHTML = '🔔 Subscribe to alerts'
      btn.style.background = '#f9fafb'
      btn.style.borderColor = '#d1d5db'
      btn.style.color = '#374151'
      btn.style.fontWeight = 'normal'
    }
  }

  function drawMarkers(L, map, zonesData) {
    markersRef.current.forEach(m => { try { m.remove() } catch (e) {} })
    markersRef.current = []

    zonesData.forEach((zone) => {
      const worstStatus = getWorstStatus(zone)
      const problemCount = countProblems(zone)
      const mainColor = getStatusColor(worstStatus)

      const waterStatus = zone.water_status || 'normal'
      const elecStatus = zone.electricity_status || 'normal'
      const gasStatus = zone.gas_status || 'normal'

      const utilityRows = [
        { icon: '💧', label: 'Water', status: waterStatus },
        { icon: '⚡', label: 'Electricity', status: elecStatus },
        { icon: '🔥', label: 'Gas', status: gasStatus },
      ].map(u => `
        <div style="display:flex;align-items:center;gap:6px;font-size:12px;padding:2px 0">
          <span>${u.icon}</span>
          <span style="min-width:70px;color:#374151">${u.label}:</span>
          <span style="color:${getStatusColor(u.status)};font-weight:600">
            ${getStatusLabel(u.status)}
          </span>
          ${u.status !== 'normal'
            ? `<span style="width:6px;height:6px;border-radius:50%;background:${getStatusColor(u.status)};display:inline-block"></span>`
            : ''}
        </div>
      `).join('')

      const problemBadge = problemCount > 1
        ? `<div style="background:#fef3c7;color:#92400e;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;margin-bottom:8px;display:inline-block">
            ⚠️ ${problemCount} utilities affected
           </div><br/>`
        : ''

      const marker = L.circleMarker([zone.lat, zone.lng], {
        color: mainColor,
        fillColor: mainColor,
        fillOpacity: 0.7,
        weight: 1.5,
        radius: 14,
        _zoneId: zone.id,
      }).bindPopup(`
        <div style="font-size:13px;line-height:1.7;padding:4px;min-width:210px">
          <strong style="font-size:15px;color:#111;display:block;margin-bottom:6px">${zone.name}</strong>
          ${problemBadge}
          ${utilityRows}
          <div style="margin-top:6px;padding-top:6px;border-top:1px solid #f3f4f6">
            <span style="color:#6b7280;font-size:11px">${zone.report_count || 0} reports in last 2 hrs</span>
          </div>
          <button
            id="sub-btn-${zone.id}"
            onclick="window.__subscribeToZone && window.__subscribeToZone('${zone.id}', '${zone.name}')"
            style="margin-top:8px;font-size:11px;padding:6px 10px;border-radius:6px;border:1px solid #d1d5db;background:#f9fafb;cursor:pointer;color:#374151;width:100%"
          >
            🔔 Subscribe to alerts
          </button>
        </div>
      `)

      if (problemCount > 1) {
        const outerRing = L.circleMarker([zone.lat, zone.lng], {
          color: '#f59e0b',
          fillColor: 'transparent',
          fillOpacity: 0,
          weight: 1.5,
          radius: 20,
          dashArray: '4 4',
        }).addTo(map)
        markersRef.current.push(outerRing)
      }

      marker.options._zoneId = zone.id
      marker.addTo(map)
      markersRef.current.push(marker)
    })
  }

  return (
    <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
  )
}