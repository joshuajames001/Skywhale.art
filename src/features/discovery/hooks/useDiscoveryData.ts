import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { DiscoveryCategory, DiscoveryBook, DiscoveryPage } from '../../../types/discovery';
import { processBooks, processPages } from '../utils';

export const useDiscoveryData = (i18n: any, t: any) => {
    const [categories, setCategories] = useState<DiscoveryCategory[]>([]);
    const [books, setBooks] = useState<DiscoveryBook[]>([]);
    const [pages, setPages] = useState<DiscoveryPage[]>([]);
    const [loading, setLoading] = useState(false);

    // Helper: Normalize language code (e.g. 'cs-CZ' -> 'cs')
    const getLangCode = () => i18n.language?.split('-')[0] || 'cs';

    // Initial Load: Categories
    useEffect(() => {
        const loadCategories = async () => {
            try {
                // 1. Load Categories (Universal - no language filter for now as column might be missing)
                const { data: catData, error } = await supabase
                    .from('discovery_categories')
                    .select('*')
                    .eq('is_active', true);

                if (error) {
                    console.error("Supabase Error [loadCategories]:", error);
                    throw error;
                }

                if (catData) {
                    // FALLBACK: If "Vesmír" is missing (likely due to RLS blocking insert), inject it locally so UI works.
                    const hasSpace = catData.some(c => c.slug === 'vesmir' || c.title.toLowerCase().includes('vesmír'));
                    let finalCategories = [...catData];

                    if (!hasSpace) {
                        console.warn("Space category missing in DB, injecting static fallback.");
                        finalCategories.push({
                            id: 'space-static-fallback',
                            title: t('discovery.categories_fallback_space'),
                            slug: 'vesmir',
                            description: t('discovery.categories_fallback_space_desc'),
                            icon_url: '🚀',
                            theme_color_hex: '#0f172a',
                            is_active: true
                        } as DiscoveryCategory);
                    }

                    setCategories(finalCategories);
                }
            } catch (err) {
                console.error("Failed to load discovery categories [Exception]:", err);
            }
        };
        loadCategories();
    }, [i18n.language]); // Keep trigger on lang change in case we re-introduce it later

    const loadBooksForCategory = useCallback(async (categoryId: string) => {
        setLoading(true);
        try {
            // REMOVED: .eq('language', lang) - Column does not exist
            const { data, error } = await supabase
                .from('discovery_books')
                .select('*')
                .eq('category_id', categoryId);

            if (error) {
                console.error("Supabase Error [loadBooksForCategory]:", error);
                throw error;
            }

            const validBooks = processBooks(data || []);
            setBooks(validBooks);
            return validBooks;
        } catch (err) {
            console.error("Failed to load books [Exception]:", err);
            setBooks([]); // Clear on error
            return [];
        } finally {
            setLoading(false);
        }
    }, [i18n.language]);

    const loadBookDetails = useCallback(async (bookId: string) => {
        setLoading(true);
        try {
            const { data: bData, error } = await supabase
                .from('discovery_books')
                .select('*')
                .eq('id', bookId)
                .single();
            
            if (error) {
                console.error("Supabase Error [loadBookDetails]:", error);
                throw error;
            }

            let targetBook = null;
            if (bData) {
                const processed = processBooks([bData]);
                if (processed.length > 0) targetBook = processed[0];
            }
            return targetBook;
        } catch (err) {
            console.error("Failed to load book details [Exception]:", err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const loadPagesForBook = useCallback(async (bookId: string, bookInfo?: DiscoveryBook) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('discovery_pages')
                .select('*')
                .eq('book_id', bookId)
                .order('page_number', { ascending: true });
            
            if (error) {
                console.error("Supabase Error [loadPagesForBook]:", error);
                throw error;
            }
            
            const isTRex = bookInfo ? (bookInfo.species_code === 'Tyrannosaurus rex' || bookInfo.title?.toUpperCase().includes('TYRANOSAURUS') || bookInfo.title?.toUpperCase().includes('T-REX')) : false;

            const processedPages = processPages(data || [], isTRex);
            setPages(processedPages);
            return processedPages;
        } catch (err) {
            console.error("Failed to load pages [Exception]:", err);
            setPages([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const clearPages = useCallback(() => {
        setPages([]);
    }, []);

    const clearBooks = useCallback(() => {
        setBooks([]);
    }, []);

    return {
        categories,
        books,
        pages,
        loading,
        setLoading,
        loadBooksForCategory,
        loadBookDetails,
        loadPagesForBook,
        clearPages,
        clearBooks
    };
};
