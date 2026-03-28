import { corsHeaders } from './cors.ts'

interface RateLimitResult {
    allowed: boolean
    remaining: number
}

/**
 * Check rate limit for a user action. Fail open: if DB errors, allows request.
 */
export async function checkRateLimit(
    supabaseAdmin: { rpc: (fn: string, params: Record<string, unknown>) => Promise<{ data: RateLimitResult | null; error: unknown }> },
    userId: string,
    action: string,
    maxRequests: number,
    windowHours = 1
): Promise<RateLimitResult> {
    try {
        const { data, error } = await supabaseAdmin.rpc('check_rate_limit', {
            p_user_id: userId,
            p_action: action,
            p_max_requests: maxRequests,
            p_window_hours: windowHours,
        })

        if (error || !data) {
            console.warn('Rate limit check failed, allowing request:', error)
            return { allowed: true, remaining: maxRequests }
        }

        return data
    } catch (e) {
        console.warn('Rate limit exception, allowing request:', e)
        return { allowed: true, remaining: maxRequests }
    }
}

/**
 * Returns a 429 Response for rate-limited requests.
 */
export function rateLimitResponse(remaining: number): Response {
    return new Response(
        JSON.stringify({
            error: 'Rate limit exceeded. Try again in an hour.',
            remaining,
        }),
        { status: 429, headers: corsHeaders }
    )
}
