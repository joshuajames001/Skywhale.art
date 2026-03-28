import { corsHeaders } from '../_shared/cors.ts'
import { callGemini } from '../_shared/ai-clients.ts'
import { getLanguageName } from '../_shared/lang-utils.ts'
import { checkRateLimit, rateLimitResponse, getTextRateLimit } from '../_shared/rate-limit.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const FROG_PROTOCOL = `You are Art Director for children's book illustrations.
OUTPUT MUST BE ENGLISH ONLY. NO TEXT IN IMAGE.

FOCUS on:
- Composition: camera angle, framing, depth
- Lighting: time of day, light source, mood lighting
- Mood: emotional tone, atmosphere
- Action: what characters are DOING (not just standing)
- Setting: specific environment details, props, background elements

ANATOMY: All animals must be biologically accurate. No anthropomorphic features unless explicitly requested. A frog has four legs, webbed feet, and sits on a log — not standing upright wearing clothes.

STYLE: Choose either Pixar-quality 3D render OR soft watercolor storybook illustration. Never mix styles.

EXAMPLES:
- INPUT: "A tiny dragon discovers he can't breathe fire, only warm air that makes flowers bloom"
  OUTPUT: "Pixar 3D render, tiny red baby dragon sitting on a mossy rock in a sunlit meadow, the dragon gently blowing warm golden air from its small snout toward a cluster of closed daisies, the daisies mid-bloom with petals unfurling, soft morning light streaming through birch trees, dewdrops on grass blades catching light, shallow depth of field, warm color palette of amber gold and spring green, the dragon's expression mix of surprise and delight, butterfly landing on its tail, no text"

- INPUT: "A frog who collects sounds in glass jars"
  OUTPUT: "Soft watercolor illustration, a small bright-green tree frog perched on a mossy fallen log beside a quiet forest pond, surrounded by six glass mason jars of varying sizes each containing swirling colored mist representing captured sounds — amber swirl for cricket chirps, blue ripple for raindrop splashes, silver spiral for wind whispers, the frog mid-reach with one webbed front foot toward a new jar, late afternoon dappled sunlight filtering through maple canopy, reflections in still pond water, muted earth tones with pops of jewel-colored mist, no text"

Given the story text below, generate a single detailed art prompt for the illustration. Return ONLY the prompt text.`

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

        // Rate limit: tier-based (free 20/6h, paid 150/6h)
        const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')
        const { maxRequests, windowHours } = await getTextRateLimit(supabaseAdmin, user.id)
        const rl = await checkRateLimit(supabaseAdmin, user.id, 'text', maxRequests, windowHours)
        if (!rl.allowed) return rateLimitResponse(rl.remaining)

        const apiKey = Deno.env.get('GEMINI_API_KEY')
        if (!apiKey) {
            return new Response(
                JSON.stringify({ error: 'GEMINI_API_KEY not configured' }),
                { status: 500, headers: corsHeaders }
            )
        }

        const { action, payload } = await req.json()
        const lang = payload?.language || 'cs'
        const langName = lang === 'cs' ? 'Czech' : 'English'

        let result: any

        switch (action) {
            case 'generate-suggestion': {
                const { storySoFar, currentText, pageIndex, totalPages } = payload
                const systemPrompt = `You are a helpful children's story writing assistant. You help continue stories in a creative, age-appropriate way. Write in ${langName}. Return ONLY the suggested continuation text (1-3 sentences), no JSON, no formatting.`
                const userPrompt = `Story so far:\n${storySoFar}\n\nCurrent page text:\n${currentText}\n\nThis is page ${pageIndex} of ${totalPages}. Suggest a natural continuation.`

                result = await callGemini(
                    [{ role: 'user', content: userPrompt }],
                    systemPrompt,
                    false,
                    apiKey,
                    'gemini-2.0-flash'
                )

                return new Response(
                    JSON.stringify({ choices: [{ message: { content: result } }] }),
                    { headers: corsHeaders }
                )
            }

            case 'generate-image-prompt': {
                const { storyText } = payload

                result = await callGemini(
                    [{ role: 'user', content: storyText }],
                    FROG_PROTOCOL,
                    false,
                    apiKey,
                    'gemini-2.0-flash'
                )

                return new Response(
                    JSON.stringify({ choices: [{ message: { content: result } }] }),
                    { headers: corsHeaders }
                )
            }

            case 'generate-initial-ideas': {
                const systemPrompt = `You are a creative children's story idea generator. Generate exactly 5 short, fun story ideas for children aged 4-10. Write in ${langName}. Return the ideas separated by semicolons (;). No numbering, no formatting, just the ideas.`
                const userPrompt = 'Generate 5 creative children\'s story ideas.'

                result = await callGemini(
                    [{ role: 'user', content: userPrompt }],
                    systemPrompt,
                    false,
                    apiKey,
                    'gemini-2.0-flash'
                )

                return new Response(
                    JSON.stringify({ choices: [{ message: { content: result } }] }),
                    { headers: corsHeaders }
                )
            }

            case 'dictionary-lookup': {
                const { term } = payload
                const systemPrompt = 'You are a creative bilingual dictionary for children\'s story writers. Given a Czech word, return a JSON object with: emoji (relevant emoji), primary_en (English translation), synonyms (array of 3-5 creative English synonyms useful for art prompts), related_adjectives (array of 3-5 English adjectives that pair well with this word for visual descriptions). Return ONLY valid JSON.'
                const userPrompt = `Translate and expand this Czech word: "${term}"`

                result = await callGemini(
                    [{ role: 'user', content: userPrompt }],
                    systemPrompt,
                    true,
                    apiKey,
                    'gemini-2.0-flash'
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
