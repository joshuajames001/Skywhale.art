import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DiscoveryBook } from '../../../types/discovery';
import { DiscoveryCard } from './DiscoveryCard';

interface BookListProps {
    books: DiscoveryBook[];
    loading: boolean;
    onSelect: (book: DiscoveryBook) => void;
}

export const BookList = ({ books, loading, onSelect }: BookListProps) => {
    const { t } = useTranslation();

    return (
        <motion.div
            key="book-list"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            className="max-w-7xl mx-auto w-full p-4 md:p-8 relative z-50"
        >
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-10">
                {books.map((book, index) => (
                    <div key={book.id} className="flex justify-center w-full">
                        <DiscoveryCard
                            book={book}
                            index={index}
                            onClick={onSelect}
                        />
                    </div>
                ))}
            </div>

            {!loading && books.length === 0 && (
                <div className="text-center py-20 text-slate-500">
                    <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
                    <p>{t('discovery.no_books')}</p>
                </div>
            )}

            {loading && (
                <div className="flex justify-center py-20">
                    <Loader2 size={48} className="mx-auto mb-4 animate-spin opacity-50 text-white" />
                </div>
            )}
        </motion.div>
    );
};
