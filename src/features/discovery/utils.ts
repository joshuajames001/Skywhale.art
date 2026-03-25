import { DiscoveryBook } from '../../types/discovery';
import { supabase } from '../../lib/supabase';

/** Build a public cover URL from the book-media bucket */
const getDiscoveryCoverUrl = (folder: string): string => {
    const { data } = supabase.storage
        .from('book-media')
        .getPublicUrl(`Discovery/${folder}/discovery-cover.png`);
    return data.publicUrl;
};

/** Process raw DB rows into DiscoveryBook[]; applies cover URL fallback */
export const processBooks = (rawBooks: any[]): DiscoveryBook[] => {
    if (!rawBooks) return [];
    return rawBooks.map(b => {
        let coverUrl = b.cover_url;
        const isInvalid = !coverUrl || coverUrl.trim() === '' || coverUrl.endsWith('.mp4');

        if (isInvalid && b.storage_folder) {
            coverUrl = getDiscoveryCoverUrl(b.storage_folder);
        }

        return { ...b, cover_url: coverUrl };
    });
};

export const processPages = (rawPages: any[], isTRex: boolean): any[] => {
    if (!rawPages) return [];

    return rawPages.map(p => {
        let imageUrl = p.image_url;

        // T-Rex specific logic for MP4/PNG switching
        if (isTRex) {
            // Pages 2, 7, and 15 are MP4 animations
            const isVideo = p.page_number === 2 || p.page_number === 7 || p.page_number === 15;
            const extension = isVideo ? 'mp4' : 'png';
            const { data } = supabase.storage.from('book-media').getPublicUrl(`Discovery/T-Rex/${p.page_number}.${extension}`);
            imageUrl = data.publicUrl;
        }

        return {
            ...p,
            // CRITICAL FIX: Map DB column 'content_text' to UI property 'text_content'
            text_content: p.content_text || p.text_content,
            image_url: imageUrl
        };
    });
};
