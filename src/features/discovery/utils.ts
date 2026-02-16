import { DiscoveryBook } from '../../types/discovery';
import { supabase } from '../../lib/supabase';

// Helper to process books
export const processBooks = (rawBooks: any[]): DiscoveryBook[] => {
    if (!rawBooks) return [];
    return rawBooks.map(b => {
        // HOTFIX DISABLED: T-Rex image should now be correct in DB
        /* if (b.species_code === 'Tyrannosaurus rex' || b.title?.toUpperCase().includes('TYRANOSAURUS') || b.title?.toUpperCase().includes('T-REX')) {
            const { data } = supabase.storage.from('book-media').getPublicUrl('Discovery/T-Rex/discovery-cover.png');
            return { ...b, cover_url: data.publicUrl };
        } */
        return b;
    }).filter((b: any) => {
        const url = b.cover_url || '';
        return !url.includes('your-storage.supabase.co') && !url.includes('placeholder.com');
    });
};
