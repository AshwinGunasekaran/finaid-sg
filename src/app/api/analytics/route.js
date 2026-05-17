import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request) {
  try {
    const { schemeId, eventType } = await request.json()

    if (!schemeId || !eventType) {
      return Response.json({ error: 'Missing schemeId or eventType' }, { status: 400 })
    }

    await supabaseAdmin
      .from('scheme_analytics')
      .insert({
        scheme_id: schemeId,
        event_type: eventType
      })

    return Response.json({ success: true })

  } catch (error) {
    console.error('Analytics error:', error)
    return Response.json({ error: 'Failed to record event' }, { status: 500 })
  }
}