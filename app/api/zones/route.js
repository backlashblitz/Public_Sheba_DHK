import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const statusMessages = {
  outage: '🚨 Outage confirmed in your zone.',
  issues: '⚠️ Issues reported in your zone.',
  normal: '✅ Supply restored to normal in your zone.',
}

export async function GET() {
  const { data, error } = await supabase
    .from('zones')
    .select('*')
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(request) {
  const { id, status, utility_type } = await request.json()

  const updateData = {}

  if (utility_type && status) {
    // Update specific utility status
    const statusField = `${utility_type}_status`
    updateData[statusField] = status
  } else if (status) {
    // Legacy: update all three
    updateData.water_status = status
    updateData.electricity_status = status
    updateData.gas_status = status
    updateData.status = status
  }

  const { data: zone } = await supabase
    .from('zones')
    .select('*')
    .eq('id', id)
    .single()

  const { data, error } = await supabase
    .from('zones')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Send notifications to subscribers if status changed
  if (zone && status && zone[`${utility_type}_status`] !== status) {
    const { data: subscribers } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('zone_id', id)

    if (subscribers && subscribers.length > 0) {
      const utilityLabel = utility_type === 'electricity' ? '⚡ Electricity' :
                           utility_type === 'gas' ? '🔥 Gas' : '💧 Water'
      const notifications = subscribers.map(s => ({
        user_id: s.user_id,
        zone_id: id,
        zone_name: zone.name,
        message: `${utilityLabel} — ${statusMessages[status] || status}`,
        is_read: false,
      }))
      await supabase.from('notifications').insert(notifications)
    }
  }

  return NextResponse.json(data)
}