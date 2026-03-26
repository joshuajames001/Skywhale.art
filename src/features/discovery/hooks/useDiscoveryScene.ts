import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { DiscoveryCategory, DiscoveryBook, DiscoveryPage } from '../../../types/discovery';
import { processBooks, processPages } from '../utils';

export const useDiscoveryScene = () => {
    const [categories, setCategories] = useState<DiscoveryCategory[]>([]);
    const [books, setBooks] = useState<DiscoveryBook[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<DiscoveryCategory | null>(null);
    const [selectedBook, setSelectedBook] = useState<DiscoveryBook | null>(null);
    const [pages, setPages] = useState<DiscoveryPage[]>([]);
    const [pagesLoading, setPagesLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [booksLoading, setBooksLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const { data, error } = await supabase
                    .from('discovery_categories')
                    .select('*')
                    .eq('is_active', true);

                if (error) console.error('[Discovery] Failed to load categories:', error.message);
                if (data) setCategories(data);
            } catch (e) {
                console.error('[Discovery] Categories fetch error:', e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const selectCategory = useCallback(async (cat: DiscoveryCategory) => {
        setSelectedCategory(cat);
        setSelectedBook(null);
        setBooksLoading(true);

        try {
            const { data, error } = await supabase
                .from('discovery_books')
                .select('*')
                .eq('category_id', cat.id);

            if (error) console.error('[Discovery] Failed to load books:', error.message);
            setBooks(processBooks(data || []));
        } catch (e) {
            console.error('[Discovery] Books fetch error:', e);
        } finally {
            setBooksLoading(false);
        }
    }, []);

    const selectBook = useCallback(async (book: DiscoveryBook) => {
        setSelectedBook(book);
        setPagesLoading(true);

        try {
            const { data, error } = await supabase
                .from('discovery_pages')
                .select('*')
                .eq('book_id', book.id)
                .order('page_number', { ascending: true });

            if (error) console.error('[Discovery] Failed to load pages:', error.message);
            const isTRex = book.storage_folder === 'T-Rex';
            setPages(processPages(data || [], isTRex));
        } catch (e) {
            console.error('[Discovery] Pages fetch error:', e);
        } finally {
            setPagesLoading(false);
        }
    }, []);

    const clearCategory = useCallback(() => {
        setSelectedCategory(null);
        setSelectedBook(null);
        setBooks([]);
    }, []);

    const clearBook = useCallback(() => {
        setSelectedBook(null);
        setPages([]);
    }, []);

    return {
        categories,
        books,
        selectedCategory,
        selectedBook,
        loading,
        booksLoading,
        pages,
        pagesLoading,
        selectCategory,
        selectBook,
        clearCategory,
        clearBook,
    };
};
