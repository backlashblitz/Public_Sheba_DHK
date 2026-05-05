'use client'
import { useState, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'

export default function NotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  const unread = notifications.filter(n => !n.is_read).length

  useEffect(() => {
    if (!user) return

    fetch(`/api/notifications?user_id=${user.id}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setNotifications(data) })

    const channel = supabase
      .channel('notifications:' + user.id)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          setNotifications(prev => [payload.new, ...prev])
        }
      ).subscribe()

    return () => supabase.removeChannel(channel)
  }, [user])

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleOpen() {
    setOpen(!open)
    if (!open && unread > 0 && user) {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      })
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    }
  }

  function timeAgo(dateStr) {
    const diff = Math.floor((Number(new Date()) - Number(new Date(dateStr))) / 60000)
    if (diff < 1) return 'just now'
    if (diff < 60) return `${diff}m ago`
    return `${Math.floor(diff / 60)}h ago`
  }

  if (!user) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed right-4 top-14 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-[999] overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-800">Notifications</p>
            <p className="text-xs text-gray-400 mt-0.5">Zone status alerts for your subscriptions</p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell size={24} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No notifications yet</p>
                <p className="text-xs text-gray-300 mt-1">Subscribe to zones to get alerts</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-gray-50 last:border-0 ${
                    !n.is_read ? 'bg-blue-50' : ''
                  }`}
                >
                  <p className="text-sm text-gray-800 leading-snug">{n.message}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-xs font-medium text-blue-600">{n.zone_name}</p>
                    <p className="text-xs text-gray-400">{timeAgo(n.created_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}