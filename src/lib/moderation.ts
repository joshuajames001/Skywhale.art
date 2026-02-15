/**
 * Content Moderation Utility
 * Uses OpenAI Moderation API to detect inappropriate content
 * before generating AI images or stories.
 */

export interface ModerationResult {
    flagged: boolean;
    categories: {
        sexual: boolean;
        hate: boolean;
        harassment: boolean;
        'self-harm': boolean;
        'sexual/minors': boolean;
        'hate/threatening': boolean;
        'violence/graphic': boolean;
        violence: boolean;
    };
    reason?: string;
}

/**
 * Check if text content is appropriate for children
 * @param text - Text to check
 * @returns Promise<ModerationResult>
 */
import { invokeEdgeFunction } from './edge-functions';
import i18n from './i18n';

/**
 * Check if text content is appropriate for children
 * @param text - Text to check
 * @returns Promise<ModerationResult>
 */
export async function moderateContent(text: string): Promise<ModerationResult> {
    try {
        console.log("🛡️ Moderation: Calling Edge Function...");

        const { data, error } = await invokeEdgeFunction('generate-story-content', {
            action: 'moderate-text',
            payload: { text }
        });

        if (error) throw error;
        if (!data) throw new Error("No data received from Moderation Service.");

        // Edge Function returns the standard OpenAI moderation response structure
        const result = data.results[0];

        if (result.flagged) {
            // Build human-readable reason
            const flaggedCategories = Object.entries(result.categories)
                .filter(([_, flagged]) => flagged)
                .map(([category]) => category);

            return {
                flagged: true,
                categories: result.categories,
                reason: i18n.t('common.errors.moderation_flagged', { categories: flaggedCategories.join(', ') })
            };
        }

        return {
            flagged: false,
            categories: result.categories
        };

    } catch (error) {
        console.error('❌ Moderation check failed:', error);
        // On error, be conservative and flag it
        return {
            flagged: true,
            categories: {
                sexual: false,
                hate: false,
                harassment: false,
                'self-harm': false,
                'sexual/minors': false,
                'hate/threatening': false,
                'violence/graphic': false,
                violence: false,
            },
            reason: i18n.t('common.errors.moderation_failed')
        };
    }
}

/**
 * Simple wrapper for throwing an error if content is inappropriate
 */
export async function assertContentSafe(text: string): Promise<void> {
    const result = await moderateContent(text);
    
    if (result.flagged) {
        throw new Error(result.reason || i18n.t('common.errors.moderation_generic'));
    }
}
