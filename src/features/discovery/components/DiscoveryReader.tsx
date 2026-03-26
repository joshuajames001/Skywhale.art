import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DiscoveryPageView } from './DiscoveryPageView';
import { DiscoveryPage } from '../../../types/discovery';
import { TFunction } from 'i18next';
import { SWIPE_THRESHOLD } from '../constants';

interface DiscoveryReaderProps {
    pages: DiscoveryPage[];
    readerIndex: number;
    onPageChange: (index: number) => void;
    isSpaceCategory: boolean;
    isDinoCategory: boolean;
    loading: boolean;
    t: TFunction;
}

export const DiscoveryReader = ({
    pages,
    readerIndex,
    onPageChange,
    isSpaceCategory,
    isDinoCategory,
    loading,
    t
}: DiscoveryReaderProps) => {
    return (
        <motion.div
            key="reader"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="flex-1 flex flex-col justify-center items-center h-full w-full"
        >
            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <div className="animate-spin mb-4 h-8 w-8 border-b-2 border-white rounded-full"></div>
                    <p>{t('discovery.loading_pages')}</p>
                </div>
            ) : pages.length > 0 ? (
                <>
                    <div className="flex items-stretch md:items-center justify-center w-full h-full md:h-[85vh] md:px-10 md:gap-8">

                        {/* PREV BUTTON (Desktop) */}
                        <button
                            onClick={() => onPageChange(Math.max(0, readerIndex - 1))}
                            disabled={readerIndex === 0}
                            className="hidden md:flex p-4 rounded-full bg-white/5 hover:bg-white/10 text-white disabled:opacity-0 disabled:pointer-events-none transition-all hover:scale-110 active:scale-95 shrink-0"
                        >
                            <ChevronLeft size={48} strokeWidth={1} />
                        </button>

                        {/* READER CONTENT */}
                        <div className="flex-1 w-full max-w-7xl h-full flex items-stretch md:items-center justify-center relative">
                            <motion.div
                                key={readerIndex}
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.2}
                                onDragEnd={(_, info) => {
                                    if (info.offset.x < -SWIPE_THRESHOLD && readerIndex < pages.length - 1) {
                                        onPageChange(readerIndex + 1);
                                    } else if (info.offset.x > SWIPE_THRESHOLD && readerIndex > 0) {
                                        onPageChange(readerIndex - 1);
                                    }
                                }}
                                className={`w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing`}
                            >
                                <DiscoveryPageView
                                    page={pages[readerIndex]}
                                    isDino={isDinoCategory}
                                    isSpace={isSpaceCategory}
                                    onPageComplete={() => {
                                        if (readerIndex < pages.length - 1) {
                                            onPageChange(readerIndex + 1);
                                        }
                                    }}
                                />
                            </motion.div>

                            {/* Swipe Indicator (Mobile only) */}
                            <div className="absolute top-1/2 left-4 text-white/20 md:hidden pointer-events-none -translate-y-1/2">
                                {readerIndex > 0 && <ChevronLeft size={32} />}
                            </div>
                            <div className="absolute top-1/2 right-4 text-white/20 md:hidden pointer-events-none -translate-y-1/2">
                                {readerIndex < pages.length - 1 && <ChevronRight size={32} />}
                            </div>
                        </div>

                        {/* NEXT BUTTON (Desktop) */}
                        <button
                            onClick={() => onPageChange(Math.min(pages.length - 1, readerIndex + 1))}
                            disabled={readerIndex >= pages.length - 1}
                            className="hidden md:flex p-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-0 disabled:pointer-events-none transition-all hover:scale-110 active:scale-95 shadow-lg shadow-indigo-500/20 shrink-0"
                        >
                            <ChevronRight size={48} strokeWidth={1} />
                        </button>
                    </div>

                    {/* Page Indicator */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-slate-500 text-sm font-mono mt-2">
                        {readerIndex + 1} / {pages.length}
                    </div>
                </>
            ) : (
                <div className="text-center py-20 text-slate-500">
                    <p>{t('discovery.no_pages')}</p>
                </div>
            )}
        </motion.div>
    );
};
