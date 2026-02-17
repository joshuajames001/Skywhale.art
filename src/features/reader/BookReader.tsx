import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Save, Loader2, Share2, Printer } from 'lucide-react';
import { StoryBook, StoryPage } from '../../types';
import { MiniPlayer } from '../../features/audio/components/MiniPlayer';
import { AudioConfirmDialog } from '../../features/audio/components/AudioConfirmDialog';
import { BookCover } from './components/BookCover';
import { StorySpread } from './components/StorySpread';
import { HiddenPdfTemplate } from './components/HiddenPdfTemplate';
import { usePdfExport } from './hooks/usePdfExport';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useEnergy } from '../../hooks/useEnergy';

interface BookReaderProps {
    story: StoryBook;
    onClose?: () => void;
    onUpdatePage?: (pageNumber: number, updates: Partial<StoryPage>) => void;
    onUpdateCover?: (url: string | null, seed?: number, identityUrl?: string, identityLock?: string) => void;
    onSave?: () => void;
    isSaving?: boolean;
    onUploadImage?: (bookId: string, pageNumber: number, url: string, seed?: number) => Promise<string | null>;
}

export const BookReader: React.FC<BookReaderProps> = ({
    story,
    onClose,
    onUpdatePage,
    onUpdateCover,
    onSave,
    isSaving = false,
    onUploadImage
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { balance: energyBalance } = useEnergy();

    // Internal State for Reader Navigation
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    // Custom Hooks
    const { isExportingPdf, pdfProgress, handleExportPdf } = usePdfExport(story, t);

    // Audio Generation State
    const [isAudioDialogOpen, setIsAudioDialogOpen] = useState(false);

    const isCover = currentIndex === 0;

    // KEYBOARD NAVIGATION
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'Escape') onClose?.();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex]);

    const handleNext = () => {
        if (currentIndex < story.pages.length) {
            setDirection(1);
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setDirection(-1);
            setCurrentIndex(prev => prev - 1);
        }
    };

    const variants = {
        enter: (direction: number) => ({
            rotateY: direction > 0 ? 180 : -180,
            opacity: 0,
            scale: 0.8,
            zIndex: 0
        }),
        center: {
            zIndex: 50,
            rotateY: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            rotateY: direction < 0 ? 180 : -180,
            opacity: 0,
            scale: 0.8
        })
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full relative">
            <motion.div
                initial={{ scale: 0.5, opacity: 0, y: 100, rotateX: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="relative w-full max-w-5xl h-[85vh] md:h-auto md:aspect-[3/2]"
            >
                {/* Mobile Close Button (Top Left) */}
                <div className="absolute top-4 left-4 z-[1000] pointer-events-auto md:hidden">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose?.();
                        }}
                        className="flex items-center justify-center min-w-[56px] min-h-[56px] bg-black/60 backdrop-blur-xl rounded-full text-white border border-white/20 shadow-2xl active:scale-95 transition-all"
                    >
                        <X size={28} />
                    </button>
                </div>

                {/* Book Toolbar (Top Right) */}
                <div className="absolute top-4 right-4 z-[60] flex gap-4 pointer-events-auto items-center">
                    {/* Audio Player and Generator */}
                    <div className="mr-2 flex items-center gap-2">
                        {story.audio_url ? (
                            <MiniPlayer audioUrl={story.audio_url} />
                        ) : (
                            <button
                                onClick={() => setIsAudioDialogOpen(true)}
                                className="flex items-center justify-center bg-violet-500/80 backdrop-blur-md text-white p-2.5 rounded-full shadow-lg hover:bg-violet-500 transition-all border border-violet-400/50 hover:scale-110 active:scale-95 group"
                                title={t('audio.generate_button', 'Vytvořit Audioknihu')}
                            >
                                <span className="sr-only">Vytvořit audio</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mic"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
                            </button>
                        )}
                    </div>

                    {/* PDF EXPORT BUTTON */}
                    <button
                        onClick={handleExportPdf}
                        disabled={isExportingPdf}
                        className="flex items-center justify-center bg-white/10 backdrop-blur-md text-white/80 p-2.5 rounded-full shadow-lg hover:bg-white/20 transition-all border border-white/20 hover:scale-110 active:scale-95 disabled:opacity-50"
                        title={t('app.tooltips.download_pdf')}
                    >
                        {isExportingPdf ? (
                            <div className="flex items-center gap-2 px-2 text-xs font-bold text-white">
                                <Loader2 size={14} className="animate-spin" />
                                {pdfProgress && <span>{Math.round((pdfProgress.current / pdfProgress.total) * 100)}%</span>}
                            </div>
                        ) : (
                            <Download size={18} />
                        )}
                    </button>

                    <button
                        onClick={onSave}
                        disabled={isSaving}
                        title={t('app.tooltips.save')}
                        className="flex items-center justify-center bg-white/10 backdrop-blur-md text-white/80 p-2.5 rounded-full shadow-lg hover:bg-white/20 transition-all border border-white/20 hover:scale-110 active:scale-95 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    </button>
                </div>

                {/* Audio Generation Dialog */}
                {isAudioDialogOpen && (
                    <AudioConfirmDialog
                        isOpen={isAudioDialogOpen}
                        onClose={() => setIsAudioDialogOpen(false)}
                        onConfirm={() => {
                            // Logic to refresh story would be needed here eventually
                            setIsAudioDialogOpen(false);
                            // Ideally, we'd trigger a refresh or callback to show the player immediately
                        }}
                        bookTitle={story.title || 'Untitled Story'}
                        charCount={100} // Placeholder, should be calculated from story.pages
                        cost={0} // Logic handles cost server-side mostly, but UI needs estimate
                        currentEnergy={energyBalance || 0}
                        loading={false}
                    />
                )}

                <AnimatePresence initial={false} custom={direction} mode='wait'>
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.5 }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(e, { offset }) => {
                            if (offset.x < -50) handleNext();
                            else if (offset.x > 50) handlePrev();
                        }}
                        className="absolute inset-0 w-full h-full"
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        {isCover ? (
                            <BookCover
                                book={story}
                                onOpen={handleNext}
                                onUpdateCover={onUpdateCover || (() => { })}
                                onUploadImage={onUploadImage || (async () => null)}
                                tier={story.tier}
                                referenceImageUrl={story.character_sheet_url}
                            />
                        ) : (
                            <StorySpread
                                page={story.pages[currentIndex - 1]}
                                bookId={story.book_id}
                                onUpdatePage={onUpdatePage || (() => { })}
                                onUploadImage={onUploadImage || (async () => null)}
                                // RESTORED VISUAL DNA PIPELINE
                                visualDna={story.visual_dna || story.main_character}
                                mainCharacter={story.main_character}
                                setting={story.setting}
                                visualStyle={story.visual_style}
                                tier={story.tier}
                                // FLUX 2 PRO: UNIFIED TRUTH PIPELINE
                                // Priority: 1. Character Sheet (New) -> 2. Identity Slot (Alt) -> 3. Visual DNA Image (Legacy)
                                referenceImageUrl={story.character_sheet_url || story.identity_image_slot || (story as any).visual_dna_image}
                                characterSeed={story.character_seed}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            {/* Desktop Close Button (Outside) */}
            <button onClick={onClose} className="hidden md:flex absolute top-8 left-8 z-[60] text-white/50 hover:text-white transition-colors items-center gap-2">
                <X size={24} /> <span>Zavřít</span>
            </button>

            {/* Navigation Arrows (Desktop) */}
            {
                !isCover && (
                    <button
                        onClick={handlePrev}
                        className="hidden md:flex absolute top-1/2 -left-16 transform -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full items-center justify-center text-white transition-all hover:scale-110 z-[60]"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                )
            }

            {
                currentIndex < story.pages.length && (
                    <button
                        onClick={handleNext}
                        className="hidden md:flex absolute top-1/2 -right-16 transform -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full items-center justify-center text-white transition-all hover:scale-110 z-[60]"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                    </button>
                )
            }

            {/* Pagination Dots */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
                {[...Array(story.pages.length + 1)].map((_, i) => (
                    <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-white w-4' : 'bg-white/30'}`}
                    />
                ))}
            </div>
            {/* OFF-SCREEN EXPORT CONTAINER */}
            <HiddenPdfTemplate story={story} isExportingPdf={isExportingPdf} />
        </div >
    );
};
