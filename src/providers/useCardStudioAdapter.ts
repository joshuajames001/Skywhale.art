import { User } from '@supabase/supabase-js';
import { CardStudioAdapter } from '../features/card-studio/CardStudioContext';
import { useStory } from '../hooks/useStory';
import { useGemini } from '../hooks/useGemini';
import { invokeEdgeFunction } from '../lib/edge-functions';
import { assertContentSafe } from '../lib/moderation';
import { supabase } from '../lib/supabase';

export const useCardStudioAdapter = (user: User | null): CardStudioAdapter => {
    const { saveCardProject } = useStory();
    const { searchDictionary, generateImagePrompt } = useGemini();

    return {
        user: user ? { id: user.id } : null,
        onSaveProject: saveCardProject,
        onGenerateImage: async (prompt, mode, referenceUrl) => {
            // OPTIMIZATION: Use specialized skywhale-flux function (Schnell) for stickers/backgrounds
            const { data, error } = await invokeEdgeFunction('skywhale-flux', {
                prompt,
                mode, // 'sticker' | 'background'
                model: 'schnell',
                image_prompt: referenceUrl // Map referenceUrl to image_prompt
            });
            
            if (error || !data?.imageUrl) throw new Error(error?.message || "Generation failed");
            return { imageUrl: data.imageUrl };
        },
        onShareCard: async (pages) => {
            if (!user) return null;
            const { data, error } = await supabase
                .from('shared_cards')
                .insert({ user_id: user.id, pages })
                .select('id')
                .single();

            if (error || !data) return null;
            return { shareUrl: `${window.location.origin}/card/${data.id}` };
        },
        onModerateContent: async (text) => {
            await assertContentSafe(text);
        },
        onDictionaryLookup: searchDictionary,
        onTranslate: generateImagePrompt
    };
};
