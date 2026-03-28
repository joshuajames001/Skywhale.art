import { corsHeaders } from './cors.ts'

interface RateLimitResult {
    allowed: boolean
    remaining: number
}

interface RateLimitConfig {
    maxRequests: number
    windowHours: number
}

const PAID_TIERS = [
    'sub_start', 'sub_advanced', 'sub_expert', 'sub_master',
    'sub_yearly_start', 'sub_yearly_advanced', 'sub_yearly_expert', 'sub_yearly_master',
]

/**
 * Determine text rate limit based on user's subscription tier.
 * Paid (active subscription) → 150/6h, Free → 20/6h.
 * Fail open: unknown tier → free limit.
 */
export async function getTextRateLimit(
    supabaseAdmin: { from: (table: string) => { select: (cols: string) => { eq: (col: string, val: string) => { single: () => Promise<{ data: { subscription_tier?: string; subscription_status?: string } | null; error: unknown }> } } } },
    userId: string
): Promise<RateLimitConfig> {
    try {
        const { data } = await supabaseAdmin
            .from('profiles')
            .select('subscription_tier, subscription_status')
            .eq('id', userId)
            .single()

        const isPaid = data?.subscription_status === 'active' &&
            PAID_TIERS.includes(data?.subscription_tier ?? '')

        return isPaid
            ? { maxRequests: 150, windowHours: 6 }
            : { maxRequests: 20, windowHours: 6 }
    } catch {
        return { maxRequests: 20, windowHours: 6 }
    }
}

/**
 * Check rate limit for a user action. Fail open: if DB errors, allows request.
 */
export async function checkRateLimit(
    supabaseAdmin: { rpc: (fn: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }> },
    userId: string,
    action: string,
    maxRequests: number,
    windowHours = 6
): Promise<RateLimitResult> {
    try {
        const { data, error } = await supabaseAdmin.rpc('check_rate_limit', {
            p_user_id: userId,
            p_action: action,
            p_max_requests: maxRequests,
            p_window_hours: windowHours,
        })

        if (error || !data) {
            console.warn('[rate-limit] RPC failed, allowing request:', error)
            return { allowed: true, remaining: maxRequests }
        }

        // Handle both parsed object and string response from Supabase RPC
        const result = typeof data === 'string' ? JSON.parse(data) : data
        const allowed = result?.allowed === true
        const remaining = typeof result?.remaining === 'number' ? result.remaining : maxRequests

        console.log(`[rate-limit] user=${userId.slice(0,8)} action=${action} allowed=${allowed} remaining=${remaining}`)

        return { allowed, remaining }
    } catch (e) {
        console.warn('[rate-limit] Exception, allowing request:', e)
        return { allowed: true, remaining: maxRequests }
    }
}

/**
 * Returns a 429 Response for rate-limited requests.
 */
export function rateLimitResponse(remaining: number): Response {
    console.warn(`[rate-limit] BLOCKED — remaining=${remaining}`)
    return new Response(
        JSON.stringify({
            error: 'Příliš mnoho požadavků. Zkus to znovu za chvíli.',
            error_en: 'Rate limit exceeded. Try again later.',
            remaining,
        }),
        { status: 429, headers: corsHeaders }
    )
}
