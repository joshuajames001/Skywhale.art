import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Permalink slug → energy granted per ping (subscriptions ping monthly even on yearly plans)
const ENERGY_MAP: Record<string, number> = {
  'Zvedavec':   1000,
  'Spisovatel': 3000,
  'MistrSlova': 7500,
  'Start':      1600,
  'pokrocily':  4000,
  'expert':     9000,
  'mistr':      21000,
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.text()
    const params = new URLSearchParams(body)

    const saleId           = params.get('sale_id') ?? ''
    const productPermalink = params.get('product_permalink') ?? ''
    const purchaserEmail   = params.get('purchaser_email') ?? ''

    if (!saleId || !productPermalink || !purchaserEmail) {
      console.error('Gumroad ping missing required fields', { saleId, productPermalink, purchaserEmail })
      return new Response('ok', { status: 200 })
    }

    // 1. Verify sale via Gumroad API to prevent forged pings
    const accessToken = Deno.env.get('GUMROAD_ACCESS_TOKEN')
    if (!accessToken) {
      console.error('GUMROAD_ACCESS_TOKEN not configured')
      return new Response('ok', { status: 200 })
    }

    const verifyRes = await fetch(
      `https://api.gumroad.com/v2/sales/${saleId}?access_token=${accessToken}`
    )
    const verifyJson = await verifyRes.json()

    if (!verifyJson.success) {
      console.error('Gumroad sale verification failed', { saleId, verifyJson })
      return new Response('ok', { status: 200 })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Deduplicate — do not grant energy twice for the same ping
    const { data: existing } = await supabaseAdmin
      .from('transactions')
      .select('id')
      .eq('stripe_session_id', saleId)
      .maybeSingle()

    if (existing) {
      console.log('Duplicate ping ignored', { saleId })
      return new Response('ok', { status: 200 })
    }

    // 3. Find Supabase user by email
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserByEmail(purchaserEmail)

    if (userError || !user) {
      console.error('User not found for email', { purchaserEmail, userError })
      return new Response('ok', { status: 200 })
    }

    // 4. Resolve energy amount
    const energyAmount = ENERGY_MAP[productPermalink]

    if (!energyAmount) {
      console.error('Unknown product permalink', { productPermalink })
      return new Response('ok', { status: 200 })
    }

    // 5. Grant energy
    const { error: energyError } = await supabaseAdmin.rpc('add_energy', {
      p_user_id: user.id,
      p_amount: energyAmount,
    })

    if (energyError) {
      console.error('Failed to grant energy', energyError)
      return new Response('ok', { status: 200 })
    }

    // 6. Log transaction
    await supabaseAdmin.from('transactions').insert({
      user_id: user.id,
      stripe_session_id: saleId,
      energy_amount: energyAmount,
      package_id: productPermalink,
      status: 'completed',
    })

    console.log(`✅ Granted ${energyAmount} energy to ${purchaserEmail} for ${productPermalink}`)

    return new Response('ok', { status: 200 })

  } catch (error: any) {
    console.error('Unhandled error in gumroad-webhook', error)
    // Return 200 so Gumroad does not retry indefinitely
    return new Response('ok', { status: 200 })
  }
})
