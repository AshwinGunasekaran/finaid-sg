import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const institutionId = session.metadata.institution_id

    // Update institution subscription status
    await supabaseAdmin
      .from('institutions')
      .update({ subscription_status: 'featured' })
      .eq('id', institutionId)

    // Mark all institution schemes as featured
    const { data: institution } = await supabaseAdmin
      .from('institutions')
      .select('name')
      .eq('id', institutionId)
      .single()

    if (institution) {
      await supabaseAdmin
        .from('schemes')
        .update({ featured: true })
        .eq('provider', institution.name)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object
    const customer = await stripe.customers.retrieve(subscription.customer)
    const institutionId = customer.metadata.institution_id

    // Remove featured status
    await supabaseAdmin
      .from('institutions')
      .update({ subscription_status: 'free' })
      .eq('id', institutionId)

    const { data: institution } = await supabaseAdmin
      .from('institutions')
      .select('name')
      .eq('id', institutionId)
      .single()

    if (institution) {
      await supabaseAdmin
        .from('schemes')
        .update({ featured: false })
        .eq('provider', institution.name)
    }
  }

  return Response.json({ received: true })
}