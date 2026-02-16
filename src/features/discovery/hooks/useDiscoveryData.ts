import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { DiscoveryCategory, DiscoveryBook, DiscoveryPage } from '../../../types/discovery';
import { processBooks } from '../utils';

export const useDiscoveryData = (i18n: any, t: any) => {
    const [categories, setCategories] = useState<DiscoveryCategory[]>([]);
    const [books, setBooks] = useState<DiscoveryBook[]>([]);
    const [pages, setPages] = useState<DiscoveryPage[]>([]);
    const [loading, setLoading] = useState(false);

    // Initial Load: Categories
    useEffect(() => {
        const loadCategories = async () => {
            // 1. Load Categories (Filter by language)
            const { data: catData } = await supabase
                .from('discovery_categories')
                .select('*')
                .eq('is_active', true)
                .eq('language', i18n.language);

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
        };
        loadCategories();
    }, [i18n.language]); // Reload on language change

    const loadBooksForCategory = useCallback(async (categoryId: string) => {
        setLoading(true);
        const { data } = await supabase
            .from('discovery_books')
            .select('*')
            .eq('category_id', categoryId)
            .eq('language', i18n.language);

        const validBooks = processBooks(data || []);
        setBooks(validBooks);
        setLoading(false);
        return validBooks;
    }, [i18n.language]);

    const loadBookDetails = useCallback(async (bookId: string) => {
        setLoading(true);
        const { data: bData } = await supabase
            .from('discovery_books')
            .select('*')
            .eq('id', bookId)
            .single();
        
        let targetBook = null;
        if (bData) {
            const processed = processBooks([bData]);
            if (processed.length > 0) targetBook = processed[0];
        }
        
        setLoading(false); // Note: might want to keep loading if we immediately load pages?
        // Parent often sets loading true/false around this/
        return targetBook;
    }, []);

    const loadPagesForBook = useCallback(async (bookId: string) => {
        setLoading(true);
        const { data } = await supabase
            .from('discovery_pages')
            .select('*')
            .eq('book_id', bookId)
            .order('page_number', { ascending: true });
        
        setPages(data || []);
        setLoading(false);
        return data || [];
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
