import { useEffect, useState, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { StoryBook } from '../../types';
import { BookCard } from './BookCard';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Sparkles, AlertCircle, Globe, Lock, Heart, Calendar } from 'lucide-react';
import { getTheme } from '../../lib/themes';
import { PublicProfile } from '../profile/components/PublicProfile';
import { AudioConfirmDialog } from '../../components/audio/AudioConfirmDialog';
import { useScrollDirection } from '../../hooks/useScrollDirection';
import { useScrollDirectionContext } from '../../contexts/ScrollDirectionContext';
import { useEnergy } from '../../hooks/useEnergy';
import { useGuide } from '../../hooks/useGuide';
import { useTranslation } from 'react-i18next';
import { useLibrary, LibraryTab } from './LibraryContext';
import { ReportDialog } from './components/ReportDialog';


export interface LibraryProps {
    user: User | null;
    onOpenBook: (book: StoryBook) => void;
    onOpenMagic: () => void;
    onCreateCustom: () => void;
    onCreateCard?: () => void;
}

export const Library = ({ user, onOpenBook, onOpenMagic, onCreateCustom, onCreateCard }: LibraryProps) => {
    const { t } = useTranslation();
    const {
        fetchBooks,
        togglePublicStatus,
        deleteBook,
        toggleFavorite,
        getFavoriteIds,
    } = useLibrary();

    const [books, setBooks] = useState<StoryBook[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [publicationError, setPublicationError] = useState<string | null>(null);
    const [publishingBookId, setPublishingBookId] = useState<string | null>(null);
    const [reportTarget, setReportTarget] = useState<{ type: 'book' | 'user'; id: string } | null>(null);

    // Theme Hover Logic
    const [hoveredStyle, setHoveredStyle] = useState<string | null>(null);
    const activeTheme = hoveredStyle ? getTheme(hoveredStyle) : null;

    // GUIDE HOOK
    const { startGuide, hasSeenGroups } = useGuide();

    useEffect(() => {
        // Guide Trigger Logic
        if (!hasSeenGroups['library_welcome']) {
            // Delay to ensure mount
            const timer = setTimeout(() => startGuide('library_welcome'), 1000);
            return () => clearTimeout(timer);
        }
    }, [hasSeenGroups, startGuide]);

    const handleBookHover = useCallback((book: StoryBook | null) => {
        setHoveredStyle(book?.theme_style || null);
    }, []);


    const [activeTab, setActiveTab] = useState<LibraryTab>('public');
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

    // Pagination state
    const [visibleCount, setVisibleCount] = useState(20);

    // Audio Logic
    const { balance: energyBalance, refreshBalance } = useEnergy();
    const [audioDialog, setAudioDialog] = useState<{
        isOpen: boolean;
        book: StoryBook | null;
        charCount: number;
        cost: number;
        loading: boolean;
    }>({ isOpen: false, book: null, charCount: 0, cost: 0, loading: false });

    // Optimized Fetching
    useEffect(() => {
        const loadBooks = async () => {
            setLoading(true);
            setVisibleCount(20);
            try {
                const [mappedBooks, favIds] = await Promise.all([
                    fetchBooks(activeTab, user?.id),
                    user ? getFavoriteIds(user.id) : Promise.resolve([]),
                ]);
                setBooks(mappedBooks);
                setFavoriteIds(new Set(favIds));
            } catch (err: any) {
                console.error("Error fetching library:", err);
                setError(t('library.errors.load_failed'));
            } finally {
                setLoading(false);
            }
        };

        loadBooks();
    }, [activeTab, user, fetchBooks, getFavoriteIds]);

    // Handler for toggling public/private status
    const handleTogglePublic = useCallback(async (bookId: string, currentStatus: boolean) => {
        if (!user) return;
        setPublishingBookId(bookId);
        const result = await togglePublicStatus(bookId, currentStatus, user.id);
        setPublishingBookId(null);

        if (result.success) {
            setPublicationError(null);
            setBooks(prev => prev.map(b =>
                b.book_id === bookId ? { ...b, is_public: !currentStatus } : b
            ));
        } else if (result.blockedReason) {
            setPublicationError(result.blockedReason);
            setTimeout(() => setPublicationError(null), 5000);
        }
    }, [user, togglePublicStatus]);

    // Handler for deleting books
    const handleDelete = useCallback(async (bookId: string) => {
        if (!user) return;
        const success = await deleteBook(bookId, user.id);

        if (success) {
            setBooks(prev => prev.filter(b => b.book_id !== bookId));
            console.log(`🗑️ Book ${bookId} deleted`);
        }
    }, [user, deleteBook]);

    // Handler for favorites
    const handleToggleFavorite = useCallback(async (bookId: string) => {
        if (!user) return;
        const isFavorited = favoriteIds.has(bookId);

        // Optimistic Update
        setFavoriteIds(prev => {
            const newSet = new Set(prev);
            if (isFavorited) newSet.delete(bookId);
            else newSet.add(bookId);
            return newSet;
        });

        if (activeTab === 'favorites') {
            if (isFavorited) setBooks(prev => prev.filter(b => b.book_id !== bookId));
        }

        await toggleFavorite(bookId, isFavorited, user.id);

    }, [user, favoriteIds, activeTab, toggleFavorite]);


    // -- RENDER HELPERS --

    const tabs = [
        { id: 'public', label: t('library.tabs.community'), icon: Globe },
        { id: 'private', label: t('library.tabs.my_books'), icon: Lock, hidden: !user },
        { id: 'favorites', label: t('library.tabs.favorites'), icon: Heart, hidden: !user },
        { id: 'cards', label: t('library.tabs.cards'), icon: Sparkles, hidden: !user },
    ];

    const scrollRef = useRef<HTMLDivElement>(null);
    const scrollDir = useScrollDirection(scrollRef);
    const { setDirection } = useScrollDirectionContext();
    const isHeaderHidden = scrollDir === 'down';

    // Sync scroll direction to global context (for NavigationHub)
    useEffect(() => { setDirection(scrollDir); return () => setDirection('top'); }, [scrollDir, setDirection]);

    // Scroll handler for auto-pagination
    const handleScroll = (e: any) => {
        const { scrollTop, clientHeight, scrollHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight * 1.5) {
            setVisibleCount(prev => prev + 10);
        }
    };


    return (
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-blue-50 text-slate-800 flex flex-col">
            {/* Decorative clouds & animals */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="hidden sm:block absolute top-12 left-8 text-6xl opacity-20 animate-[float_20s_ease-in-out_infinite]">☁️</div>
                <div className="hidden sm:block absolute top-24 right-16 text-5xl opacity-15 animate-[float_25s_ease-in-out_infinite_2s]">☁️</div>
                <div className="absolute top-40 left-1/3 text-4xl opacity-10 animate-[float_30s_ease-in-out_infinite_4s]">☁️</div>
                <div className="absolute bottom-24 right-12 text-3xl opacity-20">🐳</div>
                <div className="absolute top-32 right-1/4 text-2xl opacity-15">🦋</div>
                <div className="absolute bottom-40 left-16 text-2xl opacity-15">🐰</div>
            </div>



            {/* HEADER + TABS (auto-hide on scroll) */}
            <motion.div
                animate={{ height: isHeaderHidden ? 0 : 'auto', opacity: isHeaderHidden ? 0 : 1 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="relative z-10 overflow-hidden"
            >
            <div className="pt-8 pb-6 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-violet-400 to-fuchsia-400 font-title mb-2">
                        {t('library.title')}
                    </h1>
                    <p className="text-slate-500 text-sm md:text-base max-w-md">
                        {t('library.subtitle')}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 sm:gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onOpenMagic}
                        className="px-6 py-3 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold shadow-lg shadow-violet-500/30 flex items-center gap-2"
                    >
                        <Sparkles size={20} />
                        {t('library.new_story')}
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onCreateCustom}
                        className="px-4 py-3 rounded-full bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <Plus size={20} />
                        {t('library.custom_book')}
                    </motion.button>
                    {onCreateCard && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onCreateCard}
                            className="px-4 py-3 rounded-full bg-pink-50 border border-pink-200 text-pink-600 font-bold hover:bg-pink-100 transition-colors flex items-center gap-2"
                        >
                            <Calendar size={20} />
                            {t('library.cards')}
                        </motion.button>
                    )}
                </div>
            </div>

            {/* TABS */}
            <div className="relative z-10 px-6 md:px-12 mb-8 flex gap-8 border-b border-slate-200 overflow-x-auto">
                {tabs.filter(t => !t.hidden).map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as LibraryTab)}
                        className={`pb-4 px-2 relative transition-colors duration-300 flex items-center gap-2 ${activeTab === tab.id ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <tab.icon size={18} />
                        <span className="font-bold tracking-wide">{tab.label}</span>
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-sky-400 via-violet-400 to-fuchsia-400"
                            />
                        )}
                    </button>
                ))}
            </div>
            </motion.div>

            {/* CONTENT GRID */}
            <div
                ref={scrollRef}
                className="relative z-10 px-4 sm:px-6 md:px-12 pb-20 flex-1 overflow-y-auto custom-scrollbar"
                onScroll={handleScroll}
            >
                {loading ? (
                    <div className="w-full h-40 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                ) : error ? (
                    <div className="w-full h-40 flex flex-col items-center justify-center text-red-400 gap-2">
                        <AlertCircle size={32} />
                        <p>{error}</p>
                    </div>
                ) : books.length === 0 ? (
                    <div className="w-full h-40 flex flex-col items-center justify-center text-slate-500">
                        <p>{t('library.empty_state')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 md:gap-8 auto-rows-max">
                        <AnimatePresence mode='popLayout'>
                            {books.slice(0, visibleCount).map((book, index) => (
                                <BookCard
                                    key={book.book_id}
                                    index={index}
                                    book={book}
                                    onClick={onOpenBook}
                                    onHover={handleBookHover}
                                    onTogglePublic={user?.id === book.author_id ? handleTogglePublic : undefined}
                                    onDelete={user?.id === book.author_id ? handleDelete : undefined}
                                    showMenu={user?.id === book.author_id}
                                    onAuthorClick={book.author_profile ? () => setSelectedUserId(book.author_id!) : undefined}
                                    showReactions={true}
                                    isFavorited={favoriteIds.has(book.book_id!)}
                                    onToggleFavorite={user ? handleToggleFavorite : undefined}
                                    onGenerateAudio={(id) => setAudioDialog({ ...audioDialog, isOpen: true, book: book })}
                                    onReport={user && user.id !== book.author_id ? (bookId) => setReportTarget({ type: 'book', id: bookId }) : undefined}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* PUBLIC PROFILE MODAL */}
            <AnimatePresence>
                {selectedUserId && (
                    <PublicProfile
                        userId={selectedUserId}
                        onClose={() => setSelectedUserId(null)}
                        onOpenBook={onOpenBook} // Added missing prop
                    />
                )}
            </AnimatePresence>

            {/* AUDIO GENERATION DIALOG */}
            {audioDialog.isOpen && audioDialog.book && (
                <AudioConfirmDialog
                    isOpen={audioDialog.isOpen}
                    onClose={() => setAudioDialog({ ...audioDialog, isOpen: false })}
                    onConfirm={() => {
                        // Logic to generate audio would go here, presumably calling another adapter function or existing logic.
                        // For now, closing.
                        setAudioDialog({ ...audioDialog, isOpen: false });
                    }}
                    cost={0}
                    bookTitle={audioDialog.book.title || t('book_card.untitled')}
                    currentEnergy={energyBalance || 0}
                    charCount={100} // Placeholder
                    loading={false}
                />
            )}

            {/* REPORT DIALOG */}
            <AnimatePresence>
                {reportTarget && (
                    <ReportDialog
                        type={reportTarget.type}
                        targetId={reportTarget.id}
                        onClose={() => setReportTarget(null)}
                    />
                )}
            </AnimatePresence>

            {/* PUBLICATION ERROR TOAST */}
            <AnimatePresence>
                {publicationError && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-red-900/90 border border-red-500/50 text-red-200 px-6 py-3 rounded-2xl shadow-xl text-sm font-medium backdrop-blur"
                    >
                        🛡️ {publicationError}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
