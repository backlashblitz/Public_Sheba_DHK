import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const all = searchParams.get('all')
  const zone_id = searchParams.get('zone_id')
  const utility_type = searchParams.get('utility_type')

  let query = supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (!all) query = query.eq('status', 'active')
  if (zone_id) query = query.eq('zone_id', zone_id)
  if (utility_type) query = query.eq('utility_type', utility_type)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      zone_id, zone_name,
      utility_type = 'water',
      issue_type, started, description,
      specific_location, address,
      lat, lng, user_id, user_email
    } = body

    if (!zone_id || !issue_type || !started) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const validUtilities = ['water', 'electricity', 'gas']
    const safeUtility = validUtilities.includes(utility_type) ? utility_type : 'water'

    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('reports')
      .insert([{
        zone_id,
        zone_name,
        utility_type: safeUtility,
        issue_type,
        started,
        description: description || null,
        specific_location: specific_location || null,
        address: address || null,
        lat: lat || null,
        lng: lng || null,
        user_id: user_id || null,
        user_email: user_email || null,
        created_at: now,
      }])
      .select()
      .single()

    if (error) {
      console.error('Insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const twoHrsAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    const { count } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('zone_id', zone_id)
      .eq('utility_type', safeUtility)
      .eq('status', 'active')
      .gte('created_at', twoHrsAgo)

    let newStatus = 'normal'
    if (count >= 25) newStatus = 'outage'
    else if (count >= 10) newStatus = 'issues'

    const statusField = `${safeUtility}_status`
    await supabase
      .from('zones')
      .update({ [statusField]: newStatus, report_count: count })
      .eq('id', zone_id)

    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    console.error('POST error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const { id, admin_reply, status, zone_id } = await request.json()

    const updateData = {}
    if (admin_reply !== undefined) updateData.admin_reply = admin_reply
    if (status !== undefined) updateData.status = status

    const { data, error } = await supabase
      .from('reports')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    if (status === 'solved' && zone_id) {
      const twoHrsAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      const { data: reportData } = await supabase
        .from('reports')
        .select('utility_type')
        .eq('id', id)
        .single()

      const utility_type = reportData?.utility_type || 'water'
      const { count } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('zone_id', zone_id)
        .eq('utility_type', utility_type)
        .eq('status', 'active')
        .gte('created_at', twoHrsAgo)

      let newZoneStatus = 'normal'
      if (count >= 25) newZoneStatus = 'outage'
      else if (count >= 10) newZoneStatus = 'issues'

      const statusField = `${utility_type}_status`
      await supabase
        .from('zones')
        .update({ [statusField]: newZoneStatus, report_count: count })
        .eq('id', zone_id)
    }

    return NextResponse.json(data)
  } catch (e) {
    console.error('PATCH error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}