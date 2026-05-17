import Stripe from 'stripe'
import { createSupabaseServer } from '@/lib/supabase-server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  try {
    const { institutionId, plan } = await request.json()
    const supabase = await createSupabaseServer()

    // Get institution details
    const { data: institution } = await supabase
      .from('institutions')
      .select('*')
      .eq('id', institutionId)
      .single()

    if (!institution) {
      return Response.json({ error: 'Institution not found' }, { status: 404 })
    }

    // Define plans
    const plans = {
      featured_monthly: {
        name: 'Featured Listing — Monthly',
        amount: 9900, // $99 SGD in cents
        interval: 'month'
      },
      featured_yearly: {
        name: 'Featured Listing — Yearly',
        amount: 99900, // $999 SGD in cents
        interval: 'year'
      }
    }

    const selectedPlan = plans[plan]
    if (!selectedPlan) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Create or get Stripe customer
    let customerId = institution.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: institution.contact_email,
        name: institution.name,
        metadata: { institution_id: institutionId.toString() }
      })
      customerId = customer.id

      // Save customer ID to database
      await supabase
        .from('institutions')
        .update({ stripe_customer_id: customerId })
        .eq('id', institutionId)
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'sgd',
          product_data: {
            name: selectedPlan.name,
            description: `Feature your schemes at the top of FinAid SG search results`
          },
          unit_amount: selectedPlan.amount,
          recurring: { interval: selectedPlan.interval }
        },
        quantity: 1
      }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/institutions/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/institutions/billing?cancelled=true`,
      metadata: { institution_id: institutionId.toString() }
    })

    return Response.json({ url: session.url })

  } catch (error) {
    console.error('Stripe error:', error)
    return Response.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}