import { AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useDiscoveryNav } from '../../features/discovery/hooks/useDiscoveryNav';
import { useDiscoveryData } from '../../features/discovery/hooks/useDiscoveryData';
import { useTrailers } from '../../features/discovery/hooks/useTrailers';

import { DiscoveryBackground } from '../../features/discovery/components/DiscoveryBackground';
import { DiscoveryHeader } from '../../features/discovery/components/DiscoveryHeader';
import { CategoryGrid } from '../../features/discovery/components/CategoryGrid';
import { BookList } from '../../features/discovery/components/BookList';
import { DiscoveryReader } from '../../features/discovery/components/DiscoveryReader';
import { TrailerOverlay } from '../../features/discovery/components/TrailerOverlay';

interface DiscoveryHubProps {
    onClose: () => void;
    isRestoring?: boolean;
}

export const DiscoveryHub = ({ onClose, isRestoring = false }: DiscoveryHubProps) => {
    const { t, i18n } = useTranslation();

    // 1. Data Hook
    const {
        categories,
        books,
        pages,
        loading,
        loadBooksForCategory,
        loadBookDetails,
        loadPagesForBook,
        clearPages,
        clearBooks
    } = useDiscoveryData(i18n, t);

    // 2. Navigation Hook
    const {
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
    } = useDiscoveryNav({
        categories,
        isRestoring,
        onLoadBook: loadBookDetails,
        onLoadCategoryBooks: loadBooksForCategory
    });

    // 3. Trailers Hook
    const { categoryTrailers, checkTrailerSeen, markTrailerSeen } = useTrailers(categories, i18n);

    // --- Interaction Handlers ---

    const handleCategorySelect = async (cat: any) => {
        // Trailer Logic
        const hasTrailer = categoryTrailers[cat.id];
        const hasSeen = checkTrailerSeen(cat.id);

        if (hasTrailer && !hasSeen) {
            // Show Trailer first
            navigateToCategory(cat); // Update URL/State
            setView('trailer');      // Override view to trailer
        } else {
            // Go straight to books
            navigateToCategory(cat);
            clearBooks(); // Clear previous
            await loadBooksForCategory(cat.id);
            setView('book-list');
        }
    };

    const handleTrailerComplete = async () => {
        if (selectedCategory) {
            markTrailerSeen(selectedCategory.id);
            setView('book-list');

            // Load books if not already loaded (might have been skipped if we went straight to trailer)
            if (books.length === 0) {
                await loadBooksForCategory(selectedCategory.id);
            }
        }
    };

    const handleBookSelect = async (book: any) => {
        navigateToBook(book);
        clearPages();
        await loadPagesForBook(book.id);
    };

    const handleBack = () => {
        const handled = goBack();
        if (!handled) {
            onClose();
        }
    };

    // Derived State for UI
    const isDinoCategory = selectedCategory?.title?.toLowerCase().includes('dino') ||
        selectedCategory?.slug?.includes('dino') || false;

    const isSpaceCategory = selectedCategory?.title?.toLowerCase().includes('vesmír') ||
        selectedCategory?.slug?.includes('space') ||
        selectedCategory?.slug === 'vesmir' || false;

    // Title Logic
    let currentTitle = t('discovery.title');
    if (view === 'book-list' && selectedCategory) currentTitle = selectedCategory.title;
    if (view === 'reader' && selectedBook) currentTitle = selectedBook.title;

    return (
        <div className="fixed inset-0 z-50 flex flex-col font-sans text-slate-100 bg-[#0c0a09]">

            {/* Background Layer */}
            <DiscoveryBackground view={view} selectedCategory={selectedCategory} />

            {/* Header */}
            <DiscoveryHeader
                view={view}
                title={currentTitle}
                onBack={handleBack}
                showTrailerButton={view === 'book-list' && !!selectedCategory && !!categoryTrailers[selectedCategory.id]}
                onPlayTrailer={() => setView('trailer')}
                audioUrl={selectedBook?.audio_url}
                isCustomTheme={(isDinoCategory || isSpaceCategory) && view !== 'categories'}
            />

            {/* Main Content Area */}
            <div className="flex-1 relative overflow-hidden flex flex-col">
                <AnimatePresence mode="wait">

                    {/* VIEW: CATEGORIES */}
                    {view === 'categories' && (
                        <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
                            <CategoryGrid
                                categories={categories}
                                onSelect={handleCategorySelect}
                                loading={categories.length === 0} // Initial data loading
                            />
                        </div>
                    )}

                    {/* VIEW: BOOK LIST */}
                    {view === 'book-list' && (
                        <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
                            <BookList
                                books={books}
                                loading={loading}
                                onSelect={handleBookSelect}
                            />
                        </div>
                    )}

                    {/* VIEW: READER */}
                    {view === 'reader' && (
                        <div className="absolute inset-0 overflow-hidden">
                            <DiscoveryReader
                                pages={pages}
                                readerIndex={readerPage ? parseInt(readerPage) : 0}
                                onPageChange={(idx) => navigateToPage(idx)}
                                isSpaceCategory={isSpaceCategory}
                                isDinoCategory={isDinoCategory}
                                loading={loading}
                                t={t}
                            />
                        </div>
                    )}

                    {/* VIEW: TRAILER */}
                    {view === 'trailer' && (
                        <TrailerOverlay
                            url={selectedCategory ? categoryTrailers[selectedCategory.id] : null}
                            onComplete={handleTrailerComplete}
                        />
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
};
