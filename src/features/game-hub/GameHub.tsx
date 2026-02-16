import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Puzzle, X, Brain, Palette, Sparkles, Lock, BookOpen, Loader2, Image as ImageIcon } from 'lucide-react';
import { PuzzleGame } from './PuzzleGame';
import { MemoryGame } from './MemoryGame';
import { ColoringGame } from './magic-coloring/ColoringGame';
import { useGameHub, GameAsset } from './GameHubContext';

// GameHub now relies on the Context Adapter for data and exit
interface GameHubProps {
    imageUrl: string | null;
    onClose: () => void; // Kept for API compatibility, but should likely use adapter.onExit internally
}

export const GameHub = ({ imageUrl: initialImageUrl, onClose }: GameHubProps) => {
    const { onFetchBooks, onFetchPages, onExit } = useGameHub();

    const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl);
    const [difficulty, setDifficulty] = useState<3 | 4 | 5>(3);

    // VIEW STATE MACHINE
    const [view, setView] = useState<'menu' | 'book-select' | 'page-select' | 'difficulty' | 'game' | 'memory-game' | 'coloring-game'>('menu');

    // DATA STATE
    const [books, setBooks] = useState<GameAsset[]>([]);
    const [selectedBook, setSelectedBook] = useState<GameAsset | null>(null);
    const [bookPages, setBookPages] = useState<string[]>([]); // URLs of pages

    const [loading, setLoading] = useState(false);
    const [memoryImages, setMemoryImages] = useState<string[]>([]); // Pexeso

    // Track which game type enabled the book selection
    const [selectedGame, setSelectedGame] = useState<'puzzle' | 'coloring' | null>(null);

    // Initialize View based on props
    useEffect(() => {
        if (initialImageUrl) {
            // Flow proceeds if image provided
        }
    }, [initialImageUrl]);

    // Fetch Books for Selection
    const fetchBooks = async () => {
        setLoading(true);
        try {
            const data = await onFetchBooks();
            setBooks(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Pages for a Book
    const fetchPagesForBook = async (bookId: string) => {
        setLoading(true);
        try {
            const urls = await onFetchPages(bookId);
            setBookPages(urls);

            // If no pages found but we have a cover (GameAsset has coverUrl)
            if (urls.length === 0 && selectedBook?.coverUrl) {
                setBookPages([selectedBook.coverUrl]);
                return [selectedBook.coverUrl];
            }
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
            if (imageUrl) {
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
                    .filter(b => b.coverUrl)
                    .map(b => b.coverUrl!)
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 8);

                setMemoryImages(images);
                setView('memory-game');
            }
        } else if (type === 'coloring') {
            if (imageUrl) {
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

        // Fetch pages for this book
        const pages = await fetchPagesForBook(book.id);

        if (pages.length > 1) {
            // If multiple pages, let user choose
            setView('page-select');
        } else if (pages.length === 1) {
            // Only one page, select it
            handleImageSelect(pages[0]);
        } else if (book.coverUrl) {
            // Fallback to cover
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
            // If we started with an initial image, maybe go back to menu?
            // For now, simple logic
            setView('menu');
        }
    };

    // Use Context Exit
    const handleClose = () => {
        // Prefer adapter's onExit, fallback to prop if needed (though we expect adapter to handle it)
        onExit();
    };
    // If we had initial image, probably close?


    // RENDER HELPERS
    if (view === 'game' && imageUrl) {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-xl">
                <BackButton onClick={() => setView('difficulty')} />
                <div className="w-full h-full max-w-7xl max-h-[90vh] p-4">
                    <PuzzleGame
                        imageUrl={imageUrl}
                        difficulty={difficulty}
                        onClose={() => setView('difficulty')}
                    />
                </div>
            </div>
        );
    }

    if (view === 'memory-game') {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-xl">
                <BackButton onClick={() => setView('menu')} />
                <div className="w-full h-full max-w-7xl max-h-[90vh] p-4">
                    <MemoryGame
                        images={memoryImages}
                        onClose={() => setView('menu')}
                    />
                </div>
            </div>
        );
    }

    if (view === 'coloring-game' && imageUrl) {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-xl">
                <div className="w-full h-full max-w-[95vw] max-h-[95vh] p-4">
                    <ColoringGame
                        imageUrl={imageUrl}
                        onClose={() => {
                            // Smart Back: If we came from page select, go there.
                            if (bookPages.length > 0) setView('page-select');
                            else if (initialImageUrl) onClose();
                            else setView('book-select');
                        }}
                    />
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
        >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none" />

            {/* Main Container */}
            <div className="w-full max-w-7xl max-h-[100dvh] md:max-h-[90vh] relative flex flex-col items-center overflow-y-auto no-scrollbar p-6">
                <style>{`
                    /* Hide scrollbar for Chrome, Safari and Opera */
                    .no-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    /* Hide scrollbar for IE, Edge and Firefox */
                    .no-scrollbar {
                        -ms-overflow-style: none;  /* IE and Edge */
                        scrollbar-width: none;  /* Firefox */
                    }
                `}</style>

                {/* Close Button Removed (Managed by NavigationHub) */}

                <div className="flex flex-col items-center w-full gap-8 md:gap-12 relative min-h-0">

                    {/* Header Text */}
                    <div className="text-center space-y-4 relative z-10 shrink-0">
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-sm font-medium uppercase tracking-widest mb-2"
                        >
                            <Sparkles size={14} className="text-amber-400" />
                            <span>Síň Zázraků</span>
                        </motion.div>
                        <motion.h2
                            key={view}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-title font-bold text-transparent bg-clip-text bg-gradient-to-br from-white via-indigo-200 to-indigo-400 drop-shadow-2xl"
                        >
                            {view === 'menu' ? 'Jak si budeme hrát?' :
                                view === 'book-select' ? 'Vyber příběh' :
                                    view === 'page-select' ? 'Kterou stránku?' :
                                        'Zvol obtížnost'}
                        </motion.h2>
                    </div>

                    {/* CONTENT CONTAINER */}
                    <div className="w-full flex items-start justify-center relative perspective-1000 py-8">
                        <AnimatePresence mode="wait">

                            {/* 1. MAIN MENU */}
                            {view === 'menu' && (
                                <motion.div
                                    key="menu"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="w-full h-full flex flex-col items-center justify-center relative p-8"
                                >
                                    <button
                                        onClick={handleClose}
                                        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur transition-all active:scale-95 z-50"
                                    >
                                        <X size={24} />
                                    </button>

                                    <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 mb-12 drop-shadow-lg text-center font-title">
                                        Herna
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
                                        {/* Puzzle */}
                                        <motion.button
                                            onClick={() => handleGameSelect('puzzle')}
                                            whileHover={{ scale: 1.05, translateY: -5 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="bg-gradient-to-br from-violet-600 to-indigo-700 p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center text-center gap-4 group relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
                                            <div className="bg-white/10 p-4 rounded-full group-hover:bg-white/20 transition-colors">
                                                <Puzzle size={48} className="text-violet-200" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-white z-10">Puzzle</h3>
                                            <p className="text-violet-200 text-sm z-10">Slož rozházené kousky příběhu zpátky dohromady.</p>
                                        </motion.button>

                                        {/* Pexeso */}
                                        <motion.button
                                            onClick={() => handleGameSelect('pexeso')}
                                            whileHover={{ scale: 1.05, translateY: -5 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="bg-gradient-to-br from-cyan-500 to-blue-600 p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center text-center gap-4 group relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
                                            <div className="bg-white/10 p-4 rounded-full group-hover:bg-white/20 transition-colors">
                                                <Brain size={48} className="text-cyan-100" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-white z-10">Pexeso</h3>
                                            <p className="text-cyan-100 text-sm z-10">Najdi všechny dvojice obrázků z tvých knížek.</p>
                                        </motion.button>

                                        {/* Coloring */}
                                        <motion.button
                                            onClick={() => handleGameSelect('coloring')}
                                            whileHover={{ scale: 1.05, translateY: -5 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="bg-gradient-to-br from-fuchsia-500 to-pink-600 p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center text-center gap-4 group relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-20" />
                                            <div className="bg-white/10 p-4 rounded-full group-hover:bg-white/20 transition-colors">
                                                <Palette size={48} className="text-pink-100" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-white z-10">Kouzelné Barvy</h3>
                                            <p className="text-pink-100 text-sm z-10">Vybarvi si své oblíbené ilustrace podle čísel.</p>
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}

                            {/* 2. BOOK SELECT */}
                            {view === 'book-select' && (
                                <motion.div
                                    key="book-select"
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    className="w-full h-full flex flex-col p-4 md:p-8"
                                >
                                    <div className="flex items-center justify-between mb-8 max-w-6xl mx-auto w-full">
                                        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                                            <BookOpen className="text-amber-400" />
                                            Vyber knížku
                                        </h2>
                                        <button onClick={goBack} className="text-white/70 hover:text-white px-4 py-2 hover:bg-white/10 rounded-full transition-colors">
                                            Zpět
                                        </button>
                                    </div>

                                    {loading ? (
                                        <div className="flex-1 flex items-center justify-center">
                                            <Loader2 className="animate-spin text-white" size={48} />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 max-w-6xl mx-auto w-full overflow-y-auto pb-20">
                                            {books.map((book) => (
                                                <motion.button
                                                    key={book.id}
                                                    layoutId={`book-${book.id}`}
                                                    onClick={() => handleBookSelect(book)}
                                                    whileHover={{ scale: 1.03 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="aspect-[2/3] relative rounded-xl overflow-hidden shadow-lg border border-white/10 group"
                                                >
                                                    {book.coverUrl ? (
                                                        <img src={book.coverUrl} className="w-full h-full object-cover" loading="lazy" />
                                                    ) : (
                                                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white/20">
                                                            <ImageIcon size={32} />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                                        <span className="text-white font-bold text-sm line-clamp-2">{book.title}</span>
                                                    </div>
                                                </motion.button>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* 3. PAGE SELECT (New) */}
                            {view === 'page-select' && (
                                <div className="w-full h-full overflow-y-auto no-scrollbar pb-8 px-4">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-4 place-items-center">
                                        {bookPages.map((url, i) => (
                                            <motion.button
                                                key={i}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: i * 0.05 }}
                                                onClick={() => handleImageSelect(url)}
                                                className="relative group w-full aspect-square rounded-xl overflow-hidden border-2 border-white/10 hover:border-fuchsia-400 hover:shadow-[0_0_30px_rgba(232,121,249,0.3)] transition-all"
                                            >
                                                <img
                                                    src={url}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    alt={`Strana ${i + 1}`}
                                                />
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 4. DIFFICULTY SELECT */}
                            {view === 'difficulty' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="flex flex-wrap items-center justify-center gap-6"
                                >
                                    <DifficultyCard level={3} label="Učeň" grid="3x3" color="emerald" onClick={() => startGame(3)} />
                                    <DifficultyCard level={4} label="Kouzelník" grid="4x4" color="cyan" onClick={() => startGame(4)} />
                                    <DifficultyCard level={5} label="Velmistr" grid="5x5" color="violet" onClick={() => startGame(5)} />
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>

                    {/* Back Button (Contextual) */}
                    {view !== 'menu' && (
                        <button
                            onClick={goBack}
                            className="bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white px-6 py-3 rounded-full font-medium transition-colors border border-white/5 backdrop-blur mt-4"
                        >
                            Zpět
                        </button>
                    )}

                </div>
            </div>
        </motion.div>
    );
};

// ----------------------------------------------------------------------
// SUBCOMPONENTS
// ----------------------------------------------------------------------

const BackButton = ({ onClick }: { onClick: () => void }) => (
    <button
        onClick={onClick}
        className="absolute top-4 right-4 z-50 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
    >
        <X size={24} />
        <span className="sr-only">Zavřít</span>
    </button>
);

const GameCard = ({ title, icon: Icon, color, description, onClick, delay, locked }: any) => {
    const colorStyles: any = {
        amber: 'group-hover:text-amber-400 from-amber-500/20 to-amber-500/5 hover:border-amber-500/50',
        cyan: 'group-hover:text-cyan-400 from-cyan-500/20 to-cyan-500/5 hover:border-cyan-500/50',
        fuchsia: 'group-hover:text-fuchsia-400 from-fuchsia-500/20 to-fuchsia-500/5 hover:border-fuchsia-500/50',
        indigo: 'group-hover:text-indigo-400 from-indigo-500/20 to-indigo-500/5 hover:border-indigo-500/50',
    };

    const activeStyle = colorStyles[color];

    return (
        <motion.button
            initial={{ opacity: 0, y: 50, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay, type: "spring" }}
            whileHover={!locked ? { y: -20, scale: 1.05, rotateX: 5, zIndex: 10 } : {}}
            whileTap={!locked ? { scale: 0.95 } : {}}
            onClick={onClick}
            disabled={locked}
            className={`group relative w-72 h-96 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-center justify-between p-8 transition-all duration-500 ${!locked ? activeStyle : 'opacity-60 grayscale cursor-not-allowed'}`}
        >
            {/* Background Glow */}
            <div className={`absolute inset-0 bg-gradient-to-b ${activeStyle.split(' ')[1]} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[32px]`} />

            {/* Icon Floating */}
            <div className="relative mt-8">
                <div className={`w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500 ${locked ? '' : 'animate-float'}`}>
                    <Icon size={40} className="text-white group-hover:text-white transition-colors" />
                </div>
                {/* Orbital Ring */}
                {!locked && (
                    <div className={`absolute inset-0 rounded-full border border-${color}-400/30 scale-125 opacity-0 group-hover:opacity-100 transition-all duration-700 animate-spin-slow`} />
                )}
            </div>

            <div className="relative text-center z-10">
                <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
                <p className="text-indigo-200/60 text-sm leading-relaxed">{description}</p>
            </div>

            <div className="relative pt-4">
                {locked ? (
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/20">
                        <Lock size={12} /> Brzy
                    </div>
                ) : (
                    <div className="w-12 h-1 bg-white/10 rounded-full group-hover:w-24 group-hover:bg-white transition-all duration-500" />
                )}
            </div>
        </motion.button>
    );
};

const DifficultyCard = ({ level, label, grid, color, onClick }: any) => {
    const bgColors: any = {
        emerald: 'bg-emerald-500',
        cyan: 'bg-cyan-500',
        violet: 'bg-violet-500'
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05, y: -10 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className="w-48 h-64 bg-slate-800/80 border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 relative overflow-hidden group hover:bg-slate-800"
        >
            <div className={`absolute inset-0 ${bgColors[color]} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

            <div className={`w-16 h-16 rounded-2xl ${bgColors[color]} flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300`}>
                <span className="text-white font-bold text-2xl">{level}</span>
            </div>

            <div className="text-center">
                <h4 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all">
                    {label}
                </h4>
                <p className="text-indigo-300/50 font-mono text-sm mt-1">{grid}</p>
            </div>
        </motion.button>
    );
};
