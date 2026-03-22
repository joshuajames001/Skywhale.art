import { corsHeaders } from '../_shared/cors.ts'
import { callGemini } from '../_shared/ai-clients.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const authHeader = req.headers.get('Authorization')!;
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        );
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401, headers: corsHeaders
            });
        }

        const apiKey = Deno.env.get('GEMINI_API_KEY')
        if (!apiKey) {
            return new Response(
                JSON.stringify({ error: 'GEMINI_API_KEY not configured' }),
                { status: 500, headers: corsHeaders }
            )
        }

        const { action, payload } = await req.json()

        switch (action) {
            case 'moderate-text': {
                const { text } = payload
                const systemPrompt = `You are a Content Safety Moderator. Analyze the following text for violation of safety policies (Sexual, Hate, Harassment, Self-Harm, Violence).
Return a JSON object matching this EXACT structure:
{
  "results": [{
    "flagged": boolean,
    "categories": {
      "sexual": boolean, "hate": boolean, "harassment": boolean,
      "self-harm": boolean, "sexual/minors": boolean,
      "hate/threatening": boolean, "violence/graphic": boolean, "violence": boolean
    }
  }]
}
Strictness: HIGH for sexual/hate/self-harm. MEDIUM for violence (fantasy violence is allowed if not graphic).`
                const userPrompt = `Analyze this text for safety: "${text}"`

                const result = await callGemini(
                    [{ role: 'user', content: userPrompt }],
                    systemPrompt,
                    true,
                    apiKey,
                    'gemini-2.5-flash'
                )

                return new Response(
                    JSON.stringify(result),
                    { headers: corsHeaders }
                )
            }

            case 'extract-visual-dna': {
                const { imageUrl } = payload

                const imageResponse = await fetch(imageUrl)
                if (!imageResponse.ok) {
                    throw new Error(`Failed to fetch image: ${imageResponse.statusText}`)
                }
                const imageBuffer = await imageResponse.arrayBuffer()
                const base64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)))
                const mimeType = imageResponse.headers.get('content-type') || 'image/png'

                const systemPrompt = `You are an expert Visual Character Analyst for AI Art generation.
Analyze the provided image and extract a precise Visual DNA description.
Focus on: 1.Species/Type, 2.Age Group/Scale, 3.Detailed Appearance (Hair/Eyes/Skin), 4.Clothing/Equipment, 5.Vibe/Style.
Return JSON: { "species", "age_group", "hair_fur", "outfit_top", "outfit_bottom", "distinctive_marks", "visual_summary" }`

                const result = await callGemini(
                    [{
                        role: 'user',
                        parts: [
                            { text: 'Analyze this character image and extract Visual DNA.' },
                            { inline_data: { mime_type: mimeType, data: base64 } }
                        ]
                    }],
                    systemPrompt,
                    true,
                    apiKey,
                    'gemini-2.5-flash'
                )

                return new Response(
                    JSON.stringify({ choices: [{ message: { content: JSON.stringify(result) } }] }),
                    { headers: corsHeaders }
                )
            }

            default:
                throw new Error(`Unknown action: ${action}`)
        }
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: corsHeaders }
        )
    }
})
