'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { isAdmin } from '@/lib/isAdmin'
import Link from 'next/link'
import { CheckCircle, MessageSquare, Droplets, Zap, Flame, AlertTriangle } from 'lucide-react'

const statusOptions = ['normal', 'issues', 'outage']

const statusStyles = {
  normal: {
    active: 'bg-green-500 text-white border-green-500',
    inactive: 'border-gray-200 text-gray-500 hover:bg-green-50 hover:text-green-600 hover:border-green-300',
  },
  issues: {
    active: 'bg-amber-500 text-white border-amber-500',
    inactive: 'border-gray-200 text-gray-500 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-300',
  },
  outage: {
    active: 'bg-red-500 text-white border-red-500',
    inactive: 'border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-300',
  },
}

const issueLabels = {
  no_water: 'No water', low_pressure: 'Low pressure',
  discoloured: 'Discoloured', bad_smell: 'Bad smell',
  no_power: 'No electricity', low_voltage: 'Low voltage',
  frequent_cuts: 'Load shedding', no_gas: 'No gas',
  low_gas_pressure: 'Low gas pressure',
}

const issueTagColors = {
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

const utilityIcons = { water: '💧', electricity: '⚡', gas: '🔥' }

function timeAgo(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diff = Math.floor(diffMs / 60000)

  if (diff < 1) return 'just now'
  if (diff < 60) return `${diff}m ago`
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
  return `${Math.floor(diff / 1440)}d ago`
}

function StatusBadge({ status }) {
  const colors = {
    normal: 'bg-green-100 text-green-700',
    issues: 'bg-amber-100 text-amber-700',
    outage: 'bg-red-100 text-red-700',
  }
  const dots = {
    normal: 'bg-green-500',
    issues: 'bg-amber-500',
    outage: 'bg-red-500',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${colors[status] || colors.normal}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status] || dots.normal}`} />
      {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Normal'}
    </span>
  )
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const [zones, setZones] = useState([])
  const [reports, setReports] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [updating, setUpdating] = useState(null)
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [solvingId, setSolvingId] = useState(null)
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '', message: '', zone_name: '', starts_at: '', ends_at: ''
  })
  const [postingAnnouncement, setPostingAnnouncement] = useState(false)
  const [activeTab, setActiveTab] = useState('zones')

  useEffect(() => {
    if (!user || !isAdmin(user)) return
    fetch('/api/zones').then(r => r.json()).then(setZones)
    fetch('/api/reports?all=true').then(r => r.json()).then(setReports)
    fetch('/api/announcements').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setAnnouncements(data)
    })
  }, [user])

  async function updateZoneStatus(zoneId, utilityType, status) {
    setUpdating(zoneId + utilityType)
    const res = await fetch('/api/zones', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: zoneId, status, utility_type: utilityType }),
    })
    if (res.ok) {
      const updated = await res.json()
      setZones(prev => prev.map(z => z.id === zoneId ? updated : z))
    }
    setUpdating(null)
  }

  async function handleReply(reportId) {
    if (!replyText.trim()) return
    setSendingReply(true)
    const res = await fetch('/api/reports', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: reportId, admin_reply: replyText.trim() }),
    })
    if (res.ok) {
      const updated = await res.json()
      setReports(prev => prev.map(r => r.id === reportId ? updated : r))
      setReplyingTo(null)
      setReplyText('')
    }
    setSendingReply(false)
  }

  async function markSolved(report) {
    setSolvingId(report.id)
    const res = await fetch('/api/reports', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: report.id, status: 'solved', zone_id: report.zone_id }),
    })
    if (res.ok) {
      setReports(prev => prev.map(r => r.id === report.id ? { ...r, status: 'solved' } : r))
      fetch('/api/zones').then(r => r.json()).then(setZones)
    }
    setSolvingId(null)
  }

  async function postAnnouncement() {
    if (!newAnnouncement.title || !newAnnouncement.message || !newAnnouncement.starts_at) return
    setPostingAnnouncement(true)
    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAnnouncement),
    })
    if (res.ok) {
      const created = await res.json()
      setAnnouncements(prev => [created, ...prev])
      setNewAnnouncement({ title: '', message: '', zone_name: '', starts_at: '', ends_at: '' })
    }
    setPostingAnnouncement(false)
  }

  async function deleteAnnouncement(id) {
    await fetch('/api/announcements', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setAnnouncements(prev => prev.filter(a => a.id !== id))
  }

  if (authLoading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400">Loading...</p>
    </div>
  )

  if (!user) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="text-4xl mb-4">🔒</div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Sign in required</h2>
      <Link href="/login" className="bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-blue-800 transition-colors text-sm">
        Sign in
      </Link>
    </div>
  )

  if (!isAdmin(user)) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="text-4xl mb-4">⛔</div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Access denied</h2>
      <Link href="/" className="bg-gray-800 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-gray-900 transition-colors text-sm">
        Back to map
      </Link>
    </div>
  )

  const activeReports = reports.filter(r => r.status !== 'solved')
  const solvedReports = reports.filter(r => r.status === 'solved')
  const totalOutageZones = zones.filter(z =>
    z.water_status === 'outage' || z.electricity_status === 'outage' || z.gas_status === 'outage'
  ).length
  const totalIssueZones = zones.filter(z =>
    z.water_status === 'issues' || z.electricity_status === 'issues' || z.gas_status === 'issues'
  ).length

  const tabs = [
    { id: 'zones', label: 'Zone Control', count: zones.length },
    { id: 'reports', label: 'Reports', count: activeReports.length },
    { id: 'announcements', label: 'Announcements', count: announcements.length },
  ]

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-8">

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Public Sheba DHK — Utility zone management</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-green-700 font-medium">System live</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Reports', value: activeReports.length, color: 'text-blue-600', bg: 'bg-blue-50', icon: <AlertTriangle size={14} className="text-blue-600" /> },
          { label: 'Solved Today', value: solvedReports.length, color: 'text-green-600', bg: 'bg-green-50', icon: <CheckCircle size={14} className="text-green-600" /> },
          { label: 'Outage Zones', value: totalOutageZones, color: 'text-red-600', bg: 'bg-red-50', icon: <span className="text-sm">🚨</span> },
          { label: 'Issue Zones', value: totalIssueZones, color: 'text-amber-600', bg: 'bg-amber-50', icon: <span className="text-sm">⚠️</span> },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{s.label}</p>
              <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center`}>{s.icon}</div>
            </div>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Zone Control */}
      {activeTab === 'zones' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {zones.map(zone => {
            const waterStatus = zone.water_status || 'normal'
            const elecStatus = zone.electricity_status || 'normal'
            const gasStatus = zone.gas_status || 'normal'
            const hasProblems = [waterStatus, elecStatus, gasStatus].some(s => s !== 'normal')
            return (
              <div key={zone.id} className={`bg-white border rounded-2xl p-5 ${hasProblems ? 'border-red-200 shadow-sm' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900">{zone.name}</h3>
                  <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                    {zone.report_count || 0} reports
                  </span>
                </div>
                <div className="space-y-3">
                  {[
                    { key: 'water', icon: <Droplets size={14} className="text-blue-500" />, label: 'Water', currentStatus: waterStatus },
                    { key: 'electricity', icon: <Zap size={14} className="text-amber-500" />, label: 'Electricity', currentStatus: elecStatus },
                    { key: 'gas', icon: <Flame size={14} className="text-red-500" />, label: 'Gas', currentStatus: gasStatus },
                  ].map(util => (
                    <div key={util.key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          {util.icon}
                          <span className="text-sm font-medium text-gray-700">{util.label}</span>
                        </div>
                        <StatusBadge status={util.currentStatus} />
                      </div>
                      <div className="flex gap-1.5">
                        {statusOptions.map(s => (
                          <button
                            key={s}
                            onClick={() => updateZoneStatus(zone.id, util.key, s)}
                            disabled={updating === zone.id + util.key}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${
                              util.currentStatus === s
                                ? statusStyles[s].active
                                : statusStyles[s].inactive
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {activeReports.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
              <CheckCircle size={40} className="text-green-400 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No active reports</p>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeReports.map(r => (
              <div key={r.id} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-lg">{utilityIcons[r.utility_type] || '💧'}</span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${issueTagColors[r.issue_type] || 'bg-gray-100 text-gray-600'}`}>
                        {issueLabels[r.issue_type] || r.issue_type}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg">
                        {timeAgo(r.created_at)}
                      </span>
                    </div>
                    <p className="text-base font-semibold text-gray-900">{r.zone_name}</p>
                    {r.address && (
                      <p className="text-xs text-gray-500 mt-0.5">🏠 {r.address}</p>
                    )}
                    {r.specific_location && (
                      <p className="text-xs text-blue-600 mt-0.5 font-medium">📍 {r.specific_location}</p>
                    )}
                    {r.user_email && (
                      <p className="text-xs text-gray-400 mt-0.5">{r.user_email}</p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        setReplyingTo(replyingTo === r.id ? null : r.id)
                        setReplyText(r.admin_reply || '')
                      }}
                      className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-all font-medium ${
                        replyingTo === r.id
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
                      }`}
                    >
                      <MessageSquare size={12} />
                      Reply
                    </button>
                    <button
                      onClick={() => markSolved(r)}
                      disabled={solvingId === r.id}
                      className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all font-medium disabled:opacity-50"
                    >
                      <CheckCircle size={12} />
                      {solvingId === r.id ? 'Solving...' : 'Solved'}
                    </button>
                  </div>
                </div>

                {r.description && (
                  <div className="bg-gray-50 rounded-xl px-4 py-3">
                    <p className="text-xs text-gray-500 font-medium mb-1">User description</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{r.description}</p>
                  </div>
                )}

                {r.admin_reply && replyingTo !== r.id && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                    <p className="text-xs text-blue-600 font-medium mb-1">Your reply</p>
                    <p className="text-sm text-blue-800 leading-relaxed">{r.admin_reply}</p>
                  </div>
                )}

                {replyingTo === r.id && (
                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Type your reply to this user..."
                      className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReply(r.id)}
                        disabled={sendingReply || !replyText.trim()}
                        className="text-sm px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 font-medium"
                      >
                        {sendingReply ? 'Sending...' : 'Send reply'}
                      </button>
                      <button
                        onClick={() => { setReplyingTo(null); setReplyText('') }}
                        className="text-sm px-4 py-2 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {solvedReports.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                <CheckCircle size={14} className="text-green-500" />
                Solved reports ({solvedReports.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {solvedReports.map(r => (
                  <div key={r.id} className="bg-white border border-gray-100 rounded-xl p-4 opacity-60">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{utilityIcons[r.utility_type] || '💧'}</span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        ✓ Solved
                      </span>
                      <span className="text-xs text-gray-400">{issueLabels[r.issue_type] || r.issue_type}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-700">{r.zone_name}</p>
                    {r.address && <p className="text-xs text-gray-500 mt-0.5">🏠 {r.address}</p>}
                    {r.specific_location && <p className="text-xs text-blue-500 mt-0.5">📍 {r.specific_location}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">{timeAgo(r.created_at)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Announcements */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Post new announcement</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Title e.g. Scheduled water shutdown — Mirpur-10"
                value={newAnnouncement.title}
                onChange={e => setNewAnnouncement(p => ({ ...p, title: e.target.value }))}
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                rows={3}
                placeholder="Details e.g. Water supply will be shut down for pipe maintenance from 9am to 1pm"
                value={newAnnouncement.message}
                onChange={e => setNewAnnouncement(p => ({ ...p, message: e.target.value }))}
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Zone name (optional)"
                  value={newAnnouncement.zone_name}
                  onChange={e => setNewAnnouncement(p => ({ ...p, zone_name: e.target.value }))}
                  className="text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <p className="text-xs text-gray-400 mb-1 ml-1">Start time</p>
                  <input
                    type="datetime-local"
                    value={newAnnouncement.starts_at}
                    onChange={e => setNewAnnouncement(p => ({ ...p, starts_at: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1 ml-1">End time</p>
                  <input
                    type="datetime-local"
                    value={newAnnouncement.ends_at}
                    onChange={e => setNewAnnouncement(p => ({ ...p, ends_at: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={postAnnouncement}
                disabled={postingAnnouncement || !newAnnouncement.title || !newAnnouncement.starts_at}
                className="px-6 py-3 bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-colors disabled:opacity-50 font-medium text-sm"
              >
                {postingAnnouncement ? 'Posting...' : '📢 Post announcement'}
              </button>
            </div>
          </div>

          {announcements.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
              <p className="text-gray-400 text-sm">No active announcements</p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map(a => (
                <div key={a.id} className="bg-yellow-50 border border-yellow-200 rounded-2xl px-5 py-4 flex items-start justify-between gap-4">
                  <div className="flex gap-3 flex-1">
                    <span className="text-xl flex-shrink-0 mt-0.5">📢</span>
                    <div>
                      <p className="text-sm font-semibold text-yellow-900">{a.title}</p>
                      <p className="text-sm text-yellow-700 mt-1 leading-relaxed">{a.message}</p>
                      <div className="flex items-center gap-3 mt-2">
                        {a.zone_name && (
                          <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
                            {a.zone_name}
                          </span>
                        )}
                        <span className="text-xs text-yellow-500">
                          {new Date(a.starts_at).toLocaleString('en-BD')}
                          {a.ends_at && ` → ${new Date(a.ends_at).toLocaleString('en-BD')}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteAnnouncement(a.id)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors flex-shrink-0 bg-white border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}