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
    .from('notifications')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json([])
  return NextResponse.json(data)
}

export async function PATCH(request) {
  const { user_id } = await request.json()

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user_id)

  return NextResponse.json({ success: true })
}