import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    const { message } = await req.json()
    const trimmed = typeof message === 'string' ? message.trim() : ''

    if (trimmed.length < 3) {
      return new Response(
        JSON.stringify({ error: 'Message must be at least 3 characters' }),
        { status: 400, headers: corsHeaders }
      )
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL')
    const recipientEmail = Deno.env.get('FEEDBACK_EMAIL')

    if (!resendApiKey || !fromEmail || !recipientEmail) {
      console.error('Missing RESEND_API_KEY, RESEND_FROM_EMAIL, or FEEDBACK_EMAIL env vars')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: corsHeaders }
      )
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: recipientEmail,
        subject: `[Skywhale Feedback] od ${user.email}`,
        text: `Od: ${user.email}\nDatum: ${new Date().toISOString()}\n\n${trimmed}`,
      }),
    })

    if (!resendResponse.ok) {
      const errText = await resendResponse.text()
      console.error('Resend API error:', errText)
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { status: 500, headers: corsHeaders }
      )
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: corsHeaders }
    )
  } catch (err) {
    console.error('send-feedback error:', err)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: corsHeaders }
    )
  }
})
