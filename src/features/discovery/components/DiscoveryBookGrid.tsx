import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DiscoveryCategory, DiscoveryBook } from '../../../types/discovery';
import { SLUG_EMOJI } from '../constants';

interface DiscoveryBookGridProps {
    category: DiscoveryCategory;
    books: DiscoveryBook[];
    loading: boolean;
    onSelectBook: (book: DiscoveryBook) => void;
    onBack: () => void;
}

export const DiscoveryBookGrid = ({ category, books, loading, onSelectBook, onBack }: DiscoveryBookGridProps) => {
    const { t } = useTranslation();
    const emoji = SLUG_EMOJI[category.slug] || '🌍';
    const color = category.theme_color_hex;

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
                onClick={onBack}
            />

            {/* Panel */}
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 250 }}
                className="fixed bottom-0 left-0 right-0 z-40 h-3/4 rounded-t-3xl overflow-hidden flex flex-col"
                style={{
                    background: `linear-gradient(to bottom, ${color}22 0%, #000 40%)`,
                }}
            >
                {/* Header */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft size={20} className="text-white" />
                    </button>
                    <span className="text-2xl">{emoji}</span>
                    <div>
                        <h2 className="text-lg font-bold text-white">{category.title}</h2>
                        <p className="text-xs text-white/50">{category.description}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 size={32} className="animate-spin text-white/40" />
                        </div>
                    ) : books.length === 0 ? (
                        <div className="text-center py-20 text-white/40">
                            <p>{t('discovery.no_books', 'Žádné knihy v této kategorii')}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
                            {books.map((book, i) => (
                                <motion.button
                                    key={book.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => onSelectBook(book)}
                                    className="group rounded-2xl overflow-hidden bg-white text-left shadow-lg hover:shadow-xl transition-shadow"
                                >
                                    {book.cover_url ? (
                                        <img
                                            src={book.cover_url}
                                            alt={book.title}
                                            className="w-full aspect-[3/4] object-cover rounded-t-2xl"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div
                                            className="w-full aspect-[3/4] flex items-center justify-center rounded-t-2xl"
                                            style={{ background: `linear-gradient(135deg, ${color}44, ${color}11)` }}
                                        >
                                            <span className="text-4xl opacity-40">{emoji}</span>
                                        </div>
                                    )}
                                    <div className="p-3">
                                        <h3 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2">
                                            {book.title}
                                        </h3>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </>
    );
};
