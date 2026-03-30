import { motion } from 'framer-motion';
import { BookOpen, Loader2, ImageIcon } from 'lucide-react';

interface BookSelectorProps {
    onBack: () => void;
    loading: boolean;
    books: any[]; // Ideally defined in types/discovery.ts or similar
    onSelectBook: (book: any) => void;
}

export const BookSelector = ({ onBack, loading, books, onSelectBook }: BookSelectorProps) => {
    return (
        <motion.div
            key="book-select"
            initial={{ opacity: 1, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full h-full flex flex-col p-4 md:p-8"
        >
            <div className="flex items-center justify-between mb-8 max-w-6xl mx-auto w-full">
                <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                    <BookOpen className="text-amber-400" />
                    Vyber knížku
                </h2>
                <button onClick={onBack} className="text-slate-500 hover:text-slate-800 px-4 py-2 hover:bg-white/60 rounded-full transition-colors">
                    Zpět
                </button>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="animate-spin text-purple-400" size={48} />
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 max-w-6xl mx-auto w-full overflow-y-auto pb-20">
                    {books.map((book) => (
                        <motion.button
                            key={book.id}
                            layoutId={`book-${book.id}`}
                            onClick={() => onSelectBook(book)}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className="aspect-[2/3] relative rounded-xl overflow-hidden shadow-lg border border-purple-200 group"
                        >
                            {book.coverUrl ? (
                                <img src={book.coverUrl} className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                                <div className="w-full h-full bg-purple-50 flex items-center justify-center text-purple-300">
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
    );
};
