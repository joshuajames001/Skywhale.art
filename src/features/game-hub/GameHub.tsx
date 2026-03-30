import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { useGameHubAdapter } from '../../providers/useGameHubAdapter';
import { GameAsset } from './GameHubContext';

const GAMEHUB_BG_URL = 'https://gtixrzbgnstqulqvphtx.supabase.co/storage/v1/object/public/book-media/Gamehub-backgrounds/gamehub_bg_01.jpeg';

// Games
import { PuzzleGame } from './PuzzleGame';
import { MemoryGame } from './MemoryGame';
import { ColoringGame } from './magic-coloring/ColoringGame';

// Views
import { GameMenu } from './components/views/GameMenu';
import { BookSelector } from './components/views/BookSelector';
import { PageSelector } from './components/views/PageSelector';
import { DifficultySelector } from './components/views/DifficultySelector';

interface GameHubProps {
    onClose: () => void;
    imageUrl?: string | null;
    initialGame?: 'puzzle' | 'pexeso' | 'coloring';
}

export const GameHub = ({ onClose, imageUrl, initialGame }: GameHubProps) => {
    // Map props
    const onExit = onClose;
    const initialImageUrl = imageUrl || undefined;

    // Adapter - Stateless!
    const {
        onFetchBooks,
        onFetchPages
    } = useGameHubAdapter(onExit);

    // Local State
    const [view, setView] = useState<'menu' | 'book-select' | 'page-select' | 'difficulty' | 'game' | 'memory-game' | 'coloring-game'>(
        initialImageUrl ? 'difficulty' : 'menu'
    );

    const [selectedGame, setSelectedGame] = useState<'puzzle' | 'pexeso' | 'coloring' | null>(initialGame || null);
    const [selectedBook, setSelectedBook] = useState<GameAsset | null>(null);
    const [books, setBooks] = useState<GameAsset[]>([]); // Computed state
    const [bookPages, setBookPages] = useState<string[]>([]);
    const [imageUrlState, setImageUrl] = useState<string | null>(initialImageUrl || null);
    const [memoryImages, setMemoryImages] = useState<string[]>([]);
    const [difficulty, setDifficulty] = useState<3 | 4 | 5>(3);
    const [loading, setLoading] = useState(false);

    // Initialize (if props provided)
    useEffect(() => {
        if (initialGame) setSelectedGame(initialGame);
        if (initialImageUrl) {
            setImageUrl(initialImageUrl);
            if (initialGame === 'coloring') setView('coloring-game');
            else setView('difficulty'); // Default for puzzle
        }
    }, [initialGame, initialImageUrl]);

    // Fetch Books Helper
    const fetchBooks = async () => {
        setLoading(true);
        try {
            const data = await onFetchBooks();
            setBooks(data);
            return data;
        } finally {
            setLoading(false);
        }
    };

    // Fetch Pages for a Book
    const fetchPagesForBook = async (book: GameAsset) => {
        setLoading(true);
        try {
            const urls = await onFetchPages(book.id);

            // If no pages found but we have a cover
            if (urls.length === 0 && book.coverUrl) {
                const cover = [book.coverUrl];
                setBookPages(cover);
                return cover;
            }

            setBookPages(urls);
            return urls;
        } catch (e) {
            console.error(e);
            return [];
        } finally {
            setLoading(false);
        }
    };


    // Handle Game Selection
    const handleGameSelect = async (type: 'puzzle' | 'pexeso' | 'coloring') => {
        if (type === 'puzzle') {
            if (imageUrlState) {
                setView('difficulty');
            } else {
                setSelectedGame('puzzle');
                fetchBooks();
                setView('book-select');
            }
        } else if (type === 'pexeso') {
            setLoading(true);
            const loadedBooks = await onFetchBooks();
            setLoading(false);

            if (loadedBooks.length > 0) {
                const images = loadedBooks
                    .filter((b: GameAsset) => b.coverUrl)
                    .map((b: GameAsset) => b.coverUrl!)
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 8);

                setMemoryImages(images);
                setView('memory-game');
            }
        } else if (type === 'coloring') {
            if (imageUrlState) {
                setView('coloring-game');
            } else {
                setSelectedGame('coloring');
                fetchBooks();
                setView('book-select');
            }
        }
    };

    // Handle Book Selection
    const handleBookSelect = async (book: GameAsset) => {
        setSelectedBook(book);
        const pages = await fetchPagesForBook(book);

        if (pages.length > 1) {
            setView('page-select');
        } else if (pages.length === 1) {
            handleImageSelect(pages[0]);
        } else if (book.coverUrl) {
            handleImageSelect(book.coverUrl);
        }
    };

    const handleImageSelect = (url: string) => {
        setImageUrl(url);
        if (selectedGame === 'coloring') {
            setView('coloring-game');
        } else {
            setView('difficulty');
        }
    };

    const startGame = (diff: 3 | 4 | 5) => {
        setDifficulty(diff);
        setView('game');
    };

    const goBack = () => {
        if (view === 'page-select') {
            setView('book-select');
        } else if (view === 'difficulty') {
            setView('page-select');
        } else if (view === 'book-select') {
            setView('menu');
        } else if (view === 'game' || view === 'coloring-game' || view === 'memory-game') {
            setView('menu');
        }
    };

    const handleClose = () => {
        onExit();
    };

    // RENDER HELPERS - ACTIVE GAMES
    if (view === 'game' && imageUrlState) {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-cover bg-center bg-no-repeat relative overflow-hidden" style={{ backgroundImage: `url(${GAMEHUB_BG_URL})` }}>
                <div className="absolute inset-0 bg-white/35 pointer-events-none" />
                <BackButton onClick={() => setView('difficulty')} />
                <div className="relative z-10 w-full h-full max-w-7xl max-h-[90vh] p-4">
                    <PuzzleGame imageUrl={imageUrlState} difficulty={difficulty} onClose={() => setView('difficulty')} />
                </div>
            </div>
        );
    }

    if (view === 'memory-game') {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-cover bg-center bg-no-repeat relative overflow-hidden" style={{ backgroundImage: `url(${GAMEHUB_BG_URL})` }}>
                <div className="absolute inset-0 bg-white/35 pointer-events-none" />
                <BackButton onClick={() => setView('menu')} />
                <div className="relative z-10 w-full h-full max-w-7xl max-h-[90vh] p-4">
                    <MemoryGame images={memoryImages} onClose={() => setView('menu')} />
                </div>
            </div>
        );
    }

    if (view === 'coloring-game' && imageUrlState) {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-cover bg-center bg-no-repeat relative overflow-hidden" style={{ backgroundImage: `url(${GAMEHUB_BG_URL})` }}>
                <div className="absolute inset-0 bg-white/35 pointer-events-none" />
                <div className="relative z-10 w-full h-full max-w-[95vw] max-h-[95vh] p-4">
                    <ColoringGame
                        imageUrl={imageUrlState}
                        onClose={() => {
                            if (bookPages.length > 0) setView('page-select');
                            else if (initialImageUrl) onClose();
                            else setView('book-select');
                        }}
                    />
                </div>
            </div>
        );
    }

    // MAIN MENU & SELECTION VIEWS
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative overflow-hidden"
            style={{ backgroundImage: `url(${GAMEHUB_BG_URL})` }}
        >
            <div className="absolute inset-0 bg-white/35 pointer-events-none" />

            {/* Main Container */}
            <div className="w-full max-w-7xl max-h-[100dvh] md:max-h-[90vh] relative z-10 flex flex-col items-center overflow-y-auto no-scrollbar p-4 sm:p-6">
                <style>{`
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                `}</style>

                <div className="flex flex-col items-center w-full gap-8 md:gap-12 relative min-h-0">

                    {/* Header Text */}
                    <div className="text-center space-y-4 relative z-10 shrink-0">
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/60 border border-purple-200 text-purple-600 text-sm font-medium uppercase tracking-widest mb-2"
                        >
                            <Sparkles size={14} className="text-amber-400" />
                            <span>Síň Zázraků</span>
                        </motion.div>
                        <motion.h2
                            key={view}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-4xl md:text-6xl font-title font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 drop-shadow-sm"
                        >
                            {view === 'menu' ? 'Jak si budeme hrát?' :
                                view === 'book-select' ? 'Vyber příběh' :
                                    view === 'page-select' ? 'Kterou stránku?' :
                                        'Zvol obtížnost'}
                        </motion.h2>
                    </div>

                    {/* CONTENT CONTAINER - NO ANIMATE PRESENCE FOR STABILITY */}
                    <div className="w-full flex items-start justify-center relative perspective-1000 py-8">

                        {view === 'menu' && (
                            <GameMenu onClose={onExit} onSelectGame={handleGameSelect} />
                        )}

                        {view === 'book-select' && (
                            <BookSelector
                                onBack={goBack}
                                loading={loading}
                                books={books}
                                onSelectBook={handleBookSelect}
                            />
                        )}

                        {view === 'page-select' && (
                            <PageSelector
                                bookPages={bookPages}
                                onSelectImage={handleImageSelect}
                            />
                        )}

                        {view === 'difficulty' && (
                            <DifficultySelector onSelectDifficulty={startGame} />
                        )}

                    </div>

                    {/* Back Button (Contextual) */}
                    {view !== 'menu' && (
                        <button
                            onClick={goBack}
                            className="bg-white/60 hover:bg-white/80 text-slate-600 hover:text-slate-800 px-6 py-3 rounded-full font-medium transition-colors border border-purple-200 backdrop-blur mt-4"
                        >
                            Zpět
                        </button>
                    )}

                </div>
            </div>
        </motion.div>
    );
};

const BackButton = ({ onClick }: { onClick: () => void }) => (
    <button
        onClick={onClick}
        className="absolute top-4 right-4 z-50 p-4 rounded-full bg-white/60 hover:bg-white/80 text-slate-600 hover:text-slate-800 transition-colors shadow-sm"
    >
        <X size={24} />
        <span className="sr-only">Zavřít</span>
    </button>
);
