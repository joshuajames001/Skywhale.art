import { supabase } from '../lib/supabase';
import { GameHubAdapter } from '../features/game-hub/GameHubContext';

export const useGameHubAdapter = (onExit: () => void): GameHubAdapter => {
    return {
        onFetchBooks: async () => {
            const { data } = await supabase
                .from('books')
                .select('id, title, cover_image_url')
                .order('created_at', { ascending: false });

            if (!data) return [];
            return data.map((b: any) => ({
                id: b.id,
                title: b.title,
                coverUrl: b.cover_image_url
            }));
        },
        onFetchPages: async (bookId: string) => {
            const { data: pages } = await supabase
                .from('pages')
                .select('image_url')
                .eq('book_id', bookId)
                .order('page_number', { ascending: true });

            if (!pages) return [];
            return pages.map((p: any) => p.image_url).filter(Boolean);
        },
        onExit
    };
};
