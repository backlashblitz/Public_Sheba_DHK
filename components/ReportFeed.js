'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { useLang } from '@/lib/LangContext'
import { isAdmin } from '@/lib/isAdmin'
import { ThumbsUp, ChevronDown, ChevronUp } from 'lucide-react'

const utilityIcons = {
  water: '💧',
  electricity: '⚡',
  gas: '🔥',
}

const issueLabels = {
  no_water: 'No water',
  low_pressure: 'Low pressure',
  discoloured: 'Discoloured',
  bad_smell: 'Bad smell',
  no_power: 'No electricity',
  low_voltage: 'Low voltage',
  frequent_cuts: 'Load shedding',
  no_gas: 'No gas',
  low_gas_pressure: 'Low gas pressure',
}

const issueColors = {
  no_water: 'bg-blue-100 text-blue-700',
  low_pressure: 'bg-blue-50 text-blue-600',
  discoloured: 'bg-orange-100 text-orange-700',
  bad_smell: 'bg-purple-100 text-purple-700',
  no_power: 'bg-amber-100 text-amber-700',
  low_voltage: 'bg-amber-50 text-amber-600',
  frequent_cuts: 'bg-yellow-100 text-yellow-700',
  no_gas: 'bg-red-100 text-red-700',
  low_gas_pressure: 'bg-red-50 text-red-600',
}

function timeAgo(dateStr, lang) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (lang === 'bn') {
    if (diffMins < 1) return 'এইমাত্র'
    if (diffMins < 60) return `${diffMins} মিনিট আগে`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} ঘণ্টা আগে`
    return `${Math.floor(diffMins / 1440)} দিন আগে`
  }

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hr ago`
  return `${Math.floor(diffMins / 1440)}d ago`
}

export default function ReportFeed({ reports: initialReports }) {
  const { user } = useAuth()
  const { t, lang } = useLang()

  const [reports, setReports] = useState(initialReports)
  const [upvotedIds, setUpvotedIds] = useState([])
  const [loading, setLoading] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  const userIsAdmin = isAdmin(user)

  useEffect(() => { setReports(initialReports) }, [initialReports])

  useEffect(() => {
    if (!user || userIsAdmin) return
    fetch(`/api/upvotes?user_id=${user.id}`)
      .then(r => r.json())
      .then(ids => { if (Array.isArray(ids)) setUpvotedIds(ids) })
  }, [user])

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/reports')
        .then(r => r.json())
        .then(fresh => { if (Array.isArray(fresh)) setReports(fresh) })
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  async function handleUpvote(reportId) {
    if (!user) { alert(t.signInToConfirm); return }
    if (userIsAdmin) return
    setLoading(reportId)
    const res = await fetch('/api/upvotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report_id: reportId, user_id: user.id }),
    })
    const data = await res.json()
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, upvotes: data.count } : r))
    setUpvotedIds(prev => data.upvoted ? [...prev, reportId] : prev.filter(id => id !== reportId))
    setLoading(null)
  }

  if (!reports.length) return (
    <div className="text-center py-12 text-gray-400 text-sm">
      {t.noReports}
    </div>
  )

  return (
    <div className="divide-y divide-gray-100">
      {reports.map((r) => {
        const upvoted = upvotedIds.includes(r.id)
        const isMyReport = user && r.user_id === user.id
        const hasAdminReply = !!r.admin_reply
        const isExpanded = expandedId === r.id
        const hasDetails = r.description || hasAdminReply

        return (
          <div key={r.id} className="py-4 px-1">

            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">

                {/* Issue tag */}
                <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                  <span className="text-base">{utilityIcons[r.utility_type] || '💧'}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${issueColors[r.issue_type] || 'bg-gray-100 text-gray-600'}`}>
                    {issueLabels[r.issue_type] || r.issue_type}
                  </span>
                </div>

                {/* Zone name */}
                <p className="text-sm font-semibold text-gray-800 leading-tight mb-0.5">
                  {r.zone_name}
                </p>

                {/* Address */}
                {r.address && (
                  <p className="text-xs text-gray-500 mb-0.5">🏠 {r.address}</p>
                )}

                {/* Specific location */}
                {r.specific_location && (
                  <p className="text-xs text-blue-600 font-medium mb-0.5">📍 {r.specific_location}</p>
                )}

                {/* Time */}
                <p className="text-xs text-gray-400">
                  {timeAgo(r.created_at, lang)}
                </p>
              </div>

              {/* Me too button — users only */}
              {!userIsAdmin && (
                <button
                  onClick={() => handleUpvote(r.id)}
                  disabled={loading === r.id}
                  className={`flex-shrink-0 flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                    upvoted
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                      : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <ThumbsUp size={11} className={upvoted ? 'fill-blue-600' : ''} />
                  <span>{t.meToo}</span>
                  {r.upvotes > 0 && (
                    <span className={`font-bold ${upvoted ? 'text-blue-700' : 'text-gray-600'}`}>
                      {r.upvotes}
                    </span>
                  )}
                </button>
              )}

              {/* Admin — upvote count read only */}
              {userIsAdmin && r.upvotes > 0 && (
                <div className="flex-shrink-0 flex items-center gap-1 text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2 py-1.5 rounded-lg">
                  <ThumbsUp size={10} />
                  <span>{r.upvotes} confirmed</span>
                </div>
              )}
            </div>

            {/* Badges + expand */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                {isMyReport && !userIsAdmin && (
                  <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
                    My report
                  </span>
                )}
                {hasAdminReply && (
                  <span className="flex items-center gap-1 text-xs text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    Admin replied
                  </span>
                )}
              </div>

              {hasDetails && (
                <button
                  onClick={() => setExpandedId(isExpanded ? null : r.id)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
                >
                  {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  {isExpanded ? 'Hide' : 'Details'}
                </button>
              )}
            </div>

            {/* Expanded details */}
            {isExpanded && (
              <div className="mt-3 space-y-2">
                {r.description && (
                  <div className="bg-gray-50 rounded-lg px-3 py-2.5">
                    <p className="text-xs text-gray-500 font-medium mb-1">
                      {isMyReport && !userIsAdmin ? 'Your description' : 'User description'}
                    </p>
                    <p className="text-xs text-gray-700 leading-relaxed">{r.description}</p>
                  </div>
                )}
                {hasAdminReply && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                      <p className="text-xs text-blue-600 font-semibold">Admin reply</p>
                    </div>
                    <p className="text-xs text-blue-800 leading-relaxed">{r.admin_reply}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}