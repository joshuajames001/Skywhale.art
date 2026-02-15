
// --- Types ---
import { assertContentSafe } from './moderation';
import i18n from './i18n';

export interface CardTheme {
    id: string;
    label: string;
    description: string;
    bgPromptModifier: string; // "Cosmic background, stars, nebula"
    stickerPromptModifier: string; // "Cyberpunk style, neon borders"
    defaultStickers: string[]; // List of sticker concepts to suggest
}

export interface CardElement {
    id: string;
    type: 'sticker' | 'text';
    x: number;
    y: number;
    rotation: number;
    scale: number;
    content: string; // Image URL or Text content
    style_props?: any; // Color, font, etc.
}

export interface SmartQuoteParams {
    occasion: string; // Birthday, Thank You, etc.
    recipient: string; // Grandma, Best Friend, Teacher
    mood: string; // Funny, Heartfelt, Poetic
    language?: string; // default CZ
}

// --- Themes Registry ---

export const CARD_THEMES: Record<string, CardTheme> = {
    'space_party': {
        id: 'space_party',
        label: 'atelier.templates.space_party_label',
        description: 'atelier.templates.space_party_desc',
        bgPromptModifier: 'Deep space background, purple and blue nebula, sparkling stars, festive atmosphere, party streamers in zero gravity',
        stickerPromptModifier: 'Cute space style, vector illustration, white border sticker',
        defaultStickers: ['Rocket', 'Alien with Cake', 'Astronaut Helmet', 'Shooting Star']
    },
    'fairytale_birthday': {
        id: 'fairytale_birthday',
        label: 'atelier.templates.fairy_celebration_label',
        description: 'atelier.templates.fairy_celebration_desc',
        bgPromptModifier: 'Magical fairytale forest clearing, soft sunlight, pastel colors, enchanted flowers, birthday bunting',
        stickerPromptModifier: 'Watercolor storybook style, white border sticker',
        defaultStickers: ['Dragon blowing out candles', 'Magic Crown', 'Treasure Chest', 'Fairy']
    },
    'dino_adventure': {
        id: 'dino_adventure',
        label: 'atelier.templates.dino_ride_label',
        description: 'atelier.templates.dino_ride_desc',
        bgPromptModifier: 'Prehistoric jungle, volcano in distance, balloons tied to ferns, warm sunset colors',
        stickerPromptModifier: 'Cartoon dino style, vibrant colors, white border sticker',
        defaultStickers: ['T-Rex with Party Hat', 'Dino Egg Gift', 'Volcano Cake', 'Palm Tree']
    }
};

// --- Smart Quotes Logic ---

import { invokeEdgeFunction } from './edge-functions';

export const generateSmartQuote = async (params: SmartQuoteParams): Promise<string> => {
    const { t } = i18n;
    
    try {
        console.log("💌 Smart Quote: Calling Edge Function...");
        
        const { data, error } = await invokeEdgeFunction('generate-story-content', {
            action: 'generate-card-text',
            payload: params
        });

        if (error) throw error;
        if (!data) throw new Error("No data received from AI.");
        
        // Edge function returns OpenAI format { id, choices: [...] }
        const generatedText = data.choices?.[0]?.message?.content?.trim() || t('atelier.default_greeting');
        
        return generatedText;

    } catch (e: any) {
        console.error("Smart Quote Error:", e);
        // Map server-side moderation error to user message
        if (e.message?.includes('Obsah není vhodný') || e.message?.includes('400')) {
             throw new Error(t('atelier.moderation_retry'));
        }
        return t('atelier.default_birthday');
    }
};
