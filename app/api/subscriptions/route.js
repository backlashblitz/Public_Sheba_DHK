import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const user_id = searchParams.get('user_id')
  if (!user_id) return NextResponse.json([])

  const { data, error } = await supabase
    .from('subscriptions')
    .select('zone_id')
    .eq('user_id', user_id)

  if (error) return NextResponse.json([])
  return NextResponse.json(data.map(s => s.zone_id))
}

export async function POST(request) {
  const { user_id, zone_id } = await request.json()

  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', user_id)
    .eq('zone_id', zone_id)
    .single()

  if (existing) {
    await supabase.from('subscriptions').delete().eq('id', existing.id)
    return NextResponse.json({ subscribed: false })
  }

  await supabase.from('subscriptions').insert([{ user_id, zone_id }])
  return NextResponse.json({ subscribed: true })
}