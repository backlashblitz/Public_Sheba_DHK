import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
  const { report_id, user_id } = await request.json()

  if (!report_id || !user_id) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Check if already upvoted
  const { data: existing } = await supabase
    .from('upvotes')
    .select('id')
    .eq('report_id', report_id)
    .eq('user_id', user_id)
    .single()

  if (existing) {
    // Remove upvote (toggle off)
    await supabase.from('upvotes').delete().eq('id', existing.id)

    const { count } = await supabase
      .from('upvotes')
      .select('*', { count: 'exact', head: true })
      .eq('report_id', report_id)

    await supabase.from('reports').update({ upvotes: count }).eq('id', report_id)
    return NextResponse.json({ upvoted: false, count })
  }

  // Add upvote
  await supabase.from('upvotes').insert([{ report_id, user_id }])

  const { count } = await supabase
    .from('upvotes')
    .select('*', { count: 'exact', head: true })
    .eq('report_id', report_id)

  await supabase.from('reports').update({ upvotes: count }).eq('id', report_id)
  return NextResponse.json({ upvoted: true, count })
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const user_id = searchParams.get('user_id')

  if (!user_id) return NextResponse.json([])

  const { data } = await supabase
    .from('upvotes')
    .select('report_id')
    .eq('user_id', user_id)

  return NextResponse.json(data?.map(u => u.report_id) || [])
}