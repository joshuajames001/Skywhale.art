import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { StoryBook, StoryPage } from '../types';

export const useBookReaderAdapter = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStoryById = useCallback(async (id: string): Promise<StoryBook | null> => {
        setLoading(true);
        setError(null);
        try {
            // 1. Fetch the Book Metadata
            const { data: bookData, error: bookError } = await supabase
                .from('books')
                .select('*')
                .eq('id', id)
                .single();

            if (bookError) {
                console.error("❌ Error fetching book metadata:", bookError);
                throw bookError;
            }
            if (!bookData) {
                console.warn(`⚠️ Book not found in DB for ID: ${id}`);
                throw new Error('Book not found');
            }

            // 2. Fetch the Pages
            const { data: pagesData, error: pagesError } = await supabase
                .from('pages') // CORRECT: 'pages' matches useStory.ts writes
                .select('*')
                .eq('book_id', id)
                .order('page_number', { ascending: true });

            if (pagesError) {
                console.error("❌ Error fetching pages:", pagesError);
                throw pagesError;
            }

            // 3. Construct the StoryBook object matching the app's domain model
            const pages: StoryPage[] = (pagesData || []).map(p => ({
                id: p.id,
                page_number: p.page_number,
                text: p.content, // CORRECT: DB 'content' -> App 'text'
                image_url: p.image_url,
                // Defaults for fields not currently persisted in 'pages' table
                art_prompt: p.art_prompt || '', 
                layout_type: p.layout_type || 'standard',
                is_generated: p.is_generated !== undefined ? p.is_generated : true
            }));

            const story: StoryBook = {
                book_id: bookData.id,
                title: bookData.title,
                author: bookData.author || 'Unknown', // Fallback
                cover_image: bookData.cover_image_url,
                cover_prompt: bookData.cover_prompt,
                character_seed: bookData.character_seed,
                pages: pages,
                // Map DB columns to Domain Model
                theme_style: bookData.visual_style || 'Watercolor',
                visual_style: bookData.visual_style || 'watercolor',
                visual_dna: bookData.visual_dna,
                character_sheet_url: bookData.character_sheet_url,
                magic_mirror_url: bookData.magic_mirror_url,
                tier: bookData.tier || 'basic',
                target_audience: bookData.target_audience || 'children',
                setting: bookData.setting,
                main_character: bookData.main_character
            };

            return story;

        } catch (err: any) {
            console.error('Error fetching story:', err);
            setError(err.message || 'Failed to load story');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        fetchStoryById,
        loading,
        error
    };
};
