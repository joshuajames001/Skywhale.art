import Stripe from 'https://esm.sh/stripe@14'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

    if (!stripeSecretKey || !webhookSecret) {
      console.error('Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET')
      return new Response('ok', { status: 200 })
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' })

    // Raw body required for signature verification
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      console.error('Missing stripe-signature header')
      return new Response('ok', { status: 200 })
    }

    let event: Stripe.Event
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return new Response('ok', { status: 200 })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.user_id
      const energyAmount = parseInt(session.metadata?.energy_amount ?? '0', 10)

      if (!userId || !energyAmount) {
        console.error('Missing metadata in checkout session', { userId, energyAmount })
        return new Response('ok', { status: 200 })
      }

      // Deduplicate
      const { data: existing } = await supabaseAdmin
        .from('transactions')
        .select('id')
        .eq('stripe_session_id', session.id)
        .maybeSingle()

      if (existing) {
        console.log('Duplicate checkout session ignored', { sessionId: session.id })
        return new Response('ok', { status: 200 })
      }

      // Grant energy
      const { error: energyError } = await supabaseAdmin.rpc('add_energy', {
        p_user_id: userId,
        p_amount: energyAmount,
      })

      if (energyError) {
        console.error('Failed to grant energy', energyError)
        return new Response('ok', { status: 200 })
      }

      // Log transaction
      await supabaseAdmin.from('transactions').insert({
        user_id: userId,
        stripe_session_id: session.id,
        energy_amount: energyAmount,
        package_id: session.mode === 'subscription' ? 'stripe_subscription' : 'stripe_onetime',
        status: 'completed',
      })

      console.log(`✅ checkout.session.completed: Granted ${energyAmount} energy to ${userId}`)

    } else if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice

      // Skip the first invoice — already handled by checkout.session.completed
      if (invoice.billing_reason === 'subscription_create') {
        console.log('Skipping first subscription invoice (handled by checkout.session.completed)')
        return new Response('ok', { status: 200 })
      }

      const subscriptionId = typeof invoice.subscription === 'string'
        ? invoice.subscription
        : invoice.subscription?.id

      if (!subscriptionId) {
        console.error('No subscription ID on invoice')
        return new Response('ok', { status: 200 })
      }

      // Get subscription metadata (set during checkout creation via subscription_data)
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const userId = subscription.metadata?.user_id
      const energyAmount = parseInt(subscription.metadata?.energy_amount ?? '0', 10)

      if (!userId || !energyAmount) {
        console.error('Missing metadata on subscription', { subscriptionId })
        return new Response('ok', { status: 200 })
      }

      // Deduplicate
      const { data: existing } = await supabaseAdmin
        .from('transactions')
        .select('id')
        .eq('stripe_session_id', invoice.id)
        .maybeSingle()

      if (existing) {
        console.log('Duplicate invoice ignored', { invoiceId: invoice.id })
        return new Response('ok', { status: 200 })
      }

      // Grant energy
      const { error: energyError } = await supabaseAdmin.rpc('add_energy', {
        p_user_id: userId,
        p_amount: energyAmount,
      })

      if (energyError) {
        console.error('Failed to grant energy for renewal', energyError)
        return new Response('ok', { status: 200 })
      }

      // Log transaction
      await supabaseAdmin.from('transactions').insert({
        user_id: userId,
        stripe_session_id: invoice.id,
        energy_amount: energyAmount,
        package_id: 'stripe_renewal',
        status: 'completed',
      })

      console.log(`✅ invoice.payment_succeeded: Granted ${energyAmount} energy to ${userId}`)
    }

    return new Response('ok', { status: 200 })

  } catch (error: any) {
    console.error('Unhandled error in stripe-webhook', error)
    return new Response('ok', { status: 200 })
  }
})
