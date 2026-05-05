'use client'
import { useState, useEffect } from 'react'
import { Bell, BellOff } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'

export default function ZoneSubscribeButton({ zoneId, zoneName }) {
  const { user } = useAuth()
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    fetch(`/api/subscriptions?user_id=${user.id}`)
      .then(r => r.json())
      .then(ids => {
        if (Array.isArray(ids)) setSubscribed(ids.includes(zoneId))
      })
  }, [user, zoneId])

  async function toggle() {
    if (!user) {
      alert('Please sign in to subscribe to zone alerts.')
      return
    }
    setLoading(true)
    const res = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, zone_id: zoneId }),
    })
    const data = await res.json()
    setSubscribed(data.subscribed)
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={subscribed ? `Unsubscribe from ${zoneName}` : `Subscribe to ${zoneName} alerts`}
      className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
        subscribed
          ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium'
          : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
      }`}
    >
      {subscribed ? <Bell size={11} className="fill-blue-600" /> : <BellOff size={11} />}
      {subscribed ? 'Subscribed' : 'Subscribe'}
    </button>
  )
}