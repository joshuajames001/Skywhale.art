import { supabase } from './supabase';

export interface EdgeFunctionResult<T> {
    data: T | null;
    error: any;
}

// Supabase project URL for direct fetch
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Invokes a Supabase Edge Function using raw fetch() for full control over headers.
 * This bypasses supabase.functions.invoke() which can use stale internal tokens.
 */
export const invokeEdgeFunction = async <T = any>(
    functionName: string,
    body: any
): Promise<EdgeFunctionResult<T>> => {
    try {
        // 1. Get Session with proactive refresh check
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
            console.error("❌ callEdgeFunction: No active session found.");
            return { data: null, error: new Error("Authentication required (No Session)") };
        }

        // 2. Check Expiration & Force Refresh if needed (buffer 2 minutes)
        const expiresAt = (session.expires_at || 0) * 1000;
        const now = Date.now();
        let accessToken = session.access_token;

        if (expiresAt > 0 && expiresAt < now + 120000) {
            const { data: { session: refreshed }, error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError || !refreshed) {
                console.error("❌ Token Refresh Failed:", refreshError);
                return { data: null, error: new Error("Session expired and refresh failed.") };
            }
            accessToken = refreshed.access_token;
        }

        // 3. Direct fetch() – bypasses supabase-js client token management entirely
        const url = `${SUPABASE_URL}/functions/v1/${functionName}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ ...body, access_token_bypass: accessToken }),
        });

        if (!response.ok) {
            let serverMessage = null;
            try {
                const json = await response.json();
                console.error(`❌ Edge Function '${functionName}' Error (${response.status}):`, JSON.stringify(json, null, 2));
                serverMessage = json.error || json.message || `HTTP ${response.status}`;
            } catch {
                console.error(`❌ Edge Function '${functionName}' Error: HTTP ${response.status}`);
                serverMessage = `HTTP ${response.status}`;
            }
            return { data: null, error: new Error(serverMessage) };
        }

        const data = await response.json();
        return { data, error: null };

    } catch (err: any) {
        console.error(`💥 Unexpected Error calling '${functionName}':`, err);
        return { data: null, error: err };
    }
};

