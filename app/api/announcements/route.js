import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET() {
  try {
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('starts_at', { ascending: true })

    if (error) return NextResponse.json([], { status: 200 })
    return NextResponse.json(data || [])
  } catch (e) {
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request) {
  try {
    const { title, message, zone_name, starts_at, ends_at } = await request.json()

    if (!title || !message || !starts_at) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const insertData = {
      title,
      message,
      zone_name: zone_name || null,
      starts_at: new Date(starts_at).toISOString(),
      ends_at: ends_at ? new Date(ends_at).toISOString() : null,
    }

    const { data, error } = await supabase
      .from('announcements')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    console.error('POST error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json()
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}