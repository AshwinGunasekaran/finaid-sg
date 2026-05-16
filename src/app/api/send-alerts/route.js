import { Resend } from 'resend'
import { createSupabaseServer } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
    try {
        const { schemeId } = await request.json()
        const supabase = supabaseAdmin

        // Get the new scheme details
        const { data: scheme } = await supabase
            .from('schemes')
            .select('*, categories(name, id)')
            .eq('id', schemeId)
            .single()

        if (!scheme) {
            return Response.json({ error: 'Scheme not found' }, { status: 404 })
        }

        // Find all users subscribed to this category
        console.log('Category ID:', scheme.categories.id)

        const { data: subscribers, error } = await supabase
            .from('alerts')
            .select('email, user_id')
            .eq('category_id', scheme.categories.id)

        console.log('Subscribers found:', subscribers)
        console.log('Subscribers error:', error)

        if (!subscribers || subscribers.length === 0) {
            return Response.json({ message: 'No subscribers for this category' })
        }

        // Send email to each subscriber
        const emails = subscribers.map(sub => ({
            from: 'FinAid SG <onboarding@resend.dev>',
            to: sub.email,
            subject: `New ${scheme.categories.name} scheme added — ${scheme.title}`,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h1 style="color: #2563eb; font-size: 24px; margin-bottom: 4px;">FinAid SG</h1>
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 32px;">Your financial aid aggregator</p>
          
          <h2 style="font-size: 18px; color: #111827; margin-bottom-8px;">New scheme added in ${scheme.categories.name}!</h2>
          
          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin: 16px 0;">
            <span style="background: #eff6ff; color: #2563eb; font-size: 12px; padding: 4px 10px; border-radius: 999px;">
              ${scheme.categories.name}
            </span>
            <h3 style="font-size: 16px; color: #111827; margin: 12px 0 8px;">${scheme.title}</h3>
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 12px;">${scheme.description}</p>
            <p style="color: #16a34a; font-weight: 600; font-size: 14px; margin: 0;">${scheme.amount || ''}</p>
          </div>

          <a 
            href="https://finaid-sg.vercel.app/schemes/${scheme.slug}"
            style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 16px;"
          >
            View Scheme Details
          </a>

          <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">
            You're receiving this because you subscribed to ${scheme.categories.name} alerts on FinAid SG.
            <br/>
            <a href="https://finaid-sg.vercel.app/alerts" style="color: #2563eb;">Manage your alerts</a>
          </p>
        </div>
      `
        }))

        await resend.batch.send(emails)

        return Response.json({
            message: `Sent ${emails.length} alert emails successfully`
        })

    } catch (error) {
        console.error('Alert error:', error)
        return Response.json({ error: 'Failed to send alerts' }, { status: 500 })
    }
}