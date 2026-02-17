import { DiscoveryBook } from '../../types/discovery';
import { supabase } from '../../lib/supabase';

// Helper to process books
export const processBooks = (rawBooks: any[]): DiscoveryBook[] => {
    if (!rawBooks) return [];
    return rawBooks.map(b => {
        // HOTFIX: T-Rex image mapping
        if (b.species_code === 'Tyrannosaurus rex' || b.title?.toUpperCase().includes('TYRANOSAURUS') || b.title?.toUpperCase().includes('T-REX')) {
            const { data } = supabase.storage.from('book-media').getPublicUrl('Discovery/T-Rex/discovery-cover.png');
            return { ...b, cover_url: data.publicUrl };
        }
        return b;
    }).filter((b: any) => {
        const url = b.cover_url || '';
        // Basic filtering of invalid URLs if needed, but keeping it loose for now
        return true; 
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
