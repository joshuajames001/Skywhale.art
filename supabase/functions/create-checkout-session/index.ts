import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14'

const ENERGY_MAP: Record<string, number> = {
  'price_1TFL4uB4Ulijcmb0SrJOWGvO': 1000,   // Zvědavec
  'price_1TFL4yB4Ulijcmb0odLKefpp': 3000,   // Spisovatel
  'price_1TFL51B4Ulijcmb0u0wDGGlR': 7500,   // Mistr Slova
  'price_1TFL57B4Ulijcmb0vwfItDDc': 1600,   // Start měsíčně
  'price_1TFL59B4Ulijcmb0tK4TfF4p': 1600,   // Start ročně
  'price_1TFL5DB4Ulijcmb0MmnjSghZ': 4000,   // Pokročilý měsíčně
  'price_1TFL5FB4Ulijcmb05c5mLn5a': 4000,   // Pokročilý ročně
  'price_1TFL5JB4Ulijcmb0dEvHlb2R': 9000,   // Expert měsíčně
  'price_1TFL5MB4Ulijcmb0TNxzSkiT': 9000,   // Expert ročně
  'price_1TFL5RB4Ulijcmb0JpMKtr3Z': 21000,  // Mistr měsíčně
  'price_1TFL5TB4Ulijcmb0WGeTWKqY': 21000,  // Mistr ročně
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')!
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: corsHeaders }
      )
    }

    const { priceId, mode } = await req.json()

    if (!priceId || !mode || !['payment', 'subscription'].includes(mode)) {
      return new Response(
        JSON.stringify({ error: 'Invalid priceId or mode' }),
        { status: 400, headers: corsHeaders }
      )
    }

    const energyAmount = ENERGY_MAP[priceId]
    if (!energyAmount) {
      return new Response(
        JSON.stringify({ error: 'Unknown price ID' }),
        { status: 400, headers: corsHeaders }
      )
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      console.error('Missing STRIPE_SECRET_KEY')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: corsHeaders }
      )
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' })
    const origin = req.headers.get('origin') ?? 'https://skywhale.art'

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: origin + '/energy?success=true',
      cancel_url: origin + '/energy?canceled=true',
      customer_email: user.email!,
      metadata: { user_id: user.id, energy_amount: String(energyAmount) },
    }

    if (mode === 'subscription') {
      sessionParams.subscription_data = {
        metadata: { user_id: user.id, energy_amount: String(energyAmount) },
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: corsHeaders }
    )
  } catch (err) {
    console.error('create-checkout-session error:', err)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: corsHeaders }
    )
  }
})
