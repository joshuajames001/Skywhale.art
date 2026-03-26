import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDiscoveryScene } from '../hooks/useDiscoveryScene';
import { WorldsScene } from './WorldsScene';
import { DiscoveryBookGrid } from './DiscoveryBookGrid';
import { DiscoveryReader } from './DiscoveryReader';
import { WORLD_BACKGROUNDS } from './WorldSection';
import { getBookMediaUrl } from '../../../lib/supabase';

interface DiscoveryHubProps {
    onClose: () => void;
}

export const DiscoveryHub = ({ onClose }: DiscoveryHubProps) => {
    const { t } = useTranslation();

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, []);

    const {
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
    } = useDiscoveryScene();

    const READER_BACKGROUNDS: Record<string, string> = {
        dinosauri: getBookMediaUrl('Discovery-backgrounds/dinosauri.png'),
        vesmir: getBookMediaUrl('Discovery-backgrounds/vesmir.png'),
    };

    const [readerPage, setReaderPage] = useState(0);

    useEffect(() => { if (selectedBook) setReaderPage(0); }, [selectedBook]);

    const inReader = !!selectedBook;
    const isDinoCategory = selectedCategory?.slug?.includes('dino') || false;
    const isSpaceCategory = selectedCategory?.slug === 'vesmir' || false;

    const handleBack = () => {
        if (inReader) {
            window.dispatchEvent(new Event('discovery:stop-audio'));
            clearBook();
        }
        else if (selectedCategory) clearCategory();
        else onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black overflow-hidden">

            {/* Worlds snap scroll — visible unless in reader */}
            {!inReader && (
                <WorldsScene
                    categories={categories}
                    loading={loading}
                    onSelectCategory={selectCategory}
                />
            )}

            {/* Book grid overlay */}
            <AnimatePresence>
                {selectedCategory && !inReader && (
                    <DiscoveryBookGrid
                        category={selectedCategory}
                        books={books}
                        loading={booksLoading}
                        onSelectBook={selectBook}
                        onBack={clearCategory}
                    />
                )}
            </AnimatePresence>

            {/* Reader */}
            <AnimatePresence>
                {inReader && selectedBook && (() => {
                    const slug = selectedCategory?.slug ?? '';
                    const readerBg = READER_BACKGROUNDS[slug];
                    const readerGradient = WORLD_BACKGROUNDS[slug];
                    return (
                    <motion.div
                        className="fixed inset-0 z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, pointerEvents: 'none' }}
                        style={readerBg ? {
                            backgroundImage: `url(${readerBg})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        } : {
                            background: readerGradient ?? '#000',
                        }}
                    >
                        <DiscoveryReader
                            pages={pages}
                            readerIndex={readerPage}
                            onPageChange={setReaderPage}
                            isSpaceCategory={isSpaceCategory}
                            isDinoCategory={isDinoCategory}
                            loading={pagesLoading}
                            t={t}
                        />
                    </motion.div>
                    );
                })()}
            </AnimatePresence>

            {/* Back / Home button */}
            <button
                onClick={handleBack}
                className="fixed top-4 left-4 z-[60] flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full transition-colors text-white text-sm border border-white/10"
            >
                <ArrowLeft size={16} />
                {inReader
                    ? selectedCategory?.title || t('discovery.back', 'Zpět')
                    : selectedCategory
                    ? t('discovery.worlds', 'Světy')
                    : t('discovery.back_home', 'Domů')}
            </button>
        </div>
    );
};

export default DiscoveryHub;
