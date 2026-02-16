import { useState, useEffect } from 'react';
import { DiscoveryCategory, DiscoveryBook } from '../../../types/discovery';

export type DiscoveryView = 'categories' | 'book-list' | 'reader' | 'trailer';

interface UseDiscoveryNavProps {
    categories: DiscoveryCategory[];
    onLoadBook: (bookId: string) => Promise<DiscoveryBook | null>;
    onLoadCategoryBooks: (categoryId: string) => Promise<any>; // Returns book list
    isRestoring: boolean;
}

export const useDiscoveryNav = ({ categories, onLoadBook, onLoadCategoryBooks, isRestoring }: UseDiscoveryNavProps) => {
    const [view, setView] = useState<DiscoveryView>('categories');
    const [selectedCategory, setSelectedCategory] = useState<DiscoveryCategory | null>(null);
    const [selectedBook, setSelectedBook] = useState<DiscoveryBook | null>(null);
    const [readerPage, setReaderPage] = useState<string | null>(null);

    // URL Helper
    const updateUrl = (params: Record<string, string | null>, push = false) => {
        const url = new URL(window.location.href);
        Object.entries(params).forEach(([key, value]) => {
            if (value === null) url.searchParams.delete(key);
            else url.searchParams.set(key, value);
        });
        if (push) window.history.pushState({}, '', url);
        else window.history.replaceState({}, '', url);
    };

    // Reactive State Sync from URL
    useEffect(() => {
        if (categories.length === 0 || isRestoring) return;

        const syncStateFromUrl = async () => {
            const params = new URLSearchParams(window.location.search);
            const catSlug = params.get('category');
            const bookId = params.get('book');
            const pageNum = params.get('page');

            if (!catSlug) {
                // Only reset if we are not already at root to prevent flashing
                if (view !== 'categories') {
                    setView('categories');
                    setSelectedCategory(null);
                    // We don't clear books here generally to keep cache, but Hub logic did
                    // Hub logic: setBooks([]). The data hook handles books state, we handle View.
                }
                return;
            }

            const targetCat = categories.find(c =>
                c.slug === catSlug ||
                c.title.toLowerCase() === catSlug.toLowerCase() ||
                (catSlug === 'vesmir' && c.id === 'space-static-fallback')
            );

            if (targetCat) {
                setSelectedCategory(targetCat);
                
                // Trigger Data Load (managed by parent or connected hook)
                // In original Hub, this logic fetched books if needed.
                // We will delegate "fetching" to the data hook but we need to signal "Selection".
               
                if (!bookId) {
                    if (view !== 'book-list') setView('book-list');
                } else {
                    let targetBook = null;
                    // Logic to find book - passed as prop callback
                     targetBook = await onLoadBook(bookId);

                    if (targetBook) {
                        setSelectedBook(targetBook);
                        setReaderPage(pageNum);
                        setView('reader');
                    } else {
                        setView('book-list');
                    }
                }
            }
        };

        syncStateFromUrl();

        const handlePopState = () => syncStateFromUrl();
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [categories, isRestoring]); // Keep dependencies minimal

    
    const navigateToCategory = (cat: DiscoveryCategory) => {
        setSelectedCategory(cat);
        updateUrl({ category: cat.slug || cat.title.toLowerCase(), book: null, page: null }, true);
    };

    const navigateToBook = (book: DiscoveryBook) => {
        setSelectedBook(book);
        updateUrl({ book: book.id, page: '0' }, true);
        setView('reader');
    };

    const navigateToPage = (pageNum: number) => {
        updateUrl({ page: pageNum.toString() });
    };

    const goBack = () => {
        if (view === 'categories') {
            return false; // Signal to close
        } else if (view === 'trailer' || view === 'book-list') {
            setView('categories');
            setSelectedCategory(null);
            updateUrl({ category: null, book: null, page: null }, true);
        } else if (view === 'reader') {
            setView('book-list');
            updateUrl({ book: null, page: null }, true);
        } else {
            setView('categories');
            updateUrl({ category: null, book: null, page: null }, true);
        }
        return true; // Signal handled
    };

    return {
        view,
        setView,
        selectedCategory,
        selectedBook,
        readerPage,
        navigateToCategory,
        navigateToBook,
        navigateToPage,
        goBack,
        updateUrl
    };
};
