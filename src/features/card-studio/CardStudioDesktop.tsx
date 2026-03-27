import React, { useState } from 'react';
import { CardCanvas } from './CardCanvas';
import { ToolsDock } from './ToolsDock';
import { StarryBackground } from '../../components/StarryBackground';
import { SKYWHALE_STICKERS } from './data/stickers';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { SharedCardStudioProps, CardPage, CardItem } from './types';
import { StickerItem } from './data/stickers';
import Konva from 'konva';
import { CardToolbar } from './components/CardToolbar';

const PAGE_COVER = 0, PAGE_BACK = 3;

const PageLabel = ({ label, hasItems }: { label: string; hasItems: boolean }) => (
    <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-md text-white/90 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full pointer-events-none transition-opacity duration-500 ${hasItems ? 'opacity-0' : 'opacity-100'}`}>
        {label}
    </div>
);

interface GreetingCardPageProps {
    page: CardPage | undefined;
    selectedId: string | null;
    onSelect: (id: string) => void;
    onUpdate: (id: string, updates: Partial<CardItem>) => void;
    onItemDragStart: () => void;
    onItemDragEnd: () => void;
    stageRef?: React.RefObject<Konva.Stage>;
}

const GreetingCardPage = ({ page, selectedId, onSelect, onUpdate, onItemDragStart, onItemDragEnd, stageRef }: GreetingCardPageProps) => {
    if (!page) return <div className="w-full h-full bg-slate-100 animate-pulse" />;
    return <CardCanvas items={page.items || []} background={page.background || "#fffcf5"} selectedId={selectedId}
        onSelect={onSelect} onUpdate={onUpdate} onItemDragStart={onItemDragStart} onItemDragEnd={onItemDragEnd} domRef={stageRef} />;
};

export const CardStudioDesktop: React.FC<SharedCardStudioProps> = (props) => {
    const { state, ai, activeTool, setActiveTool, selectedId, setSelectedId, viewStartIndex,
        direction, setDirection, textColor, setTextColor, textFont, setTextFont,
        isSaving, isExporting, stageRef, onSave, onDownload, onShare, onNewProject,
        onGenerateAI, onAddText, onSelectTemplate, goToNextPage, goToPrevPage, t } = props;

    const [isDraggingSticker, setIsDraggingSticker] = useState(false);

    const isCover = viewStartIndex === PAGE_COVER;
    const isBack = viewStartIndex === PAGE_BACK;

    const renderPage = (idx: number, ref?: boolean) => (
        <GreetingCardPage page={state.pages[idx]} selectedId={selectedId} onSelect={setSelectedId} onUpdate={state.updateItem}
            onItemDragStart={() => setIsDraggingSticker(true)} onItemDragEnd={() => setIsDraggingSticker(false)}
            stageRef={ref && state.focusedPageIndex === idx ? stageRef : undefined} />
    );

    const singlePage = (idx: number, label: string) => (
        <motion.div key={`page-${idx}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="relative flex flex-col items-center justify-center h-full aspect-[2/3]">
            <div className="w-full h-full bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 relative">
                <div onClick={() => state.setFocusedPageIndex(idx)} className="w-full h-full cursor-pointer">
                    {renderPage(idx, true)}
                </div>
                <PageLabel label={label} hasItems={state.pages[idx].items.length > 0} />
            </div>
            {idx === 0 && <button onClick={goToNextPage} className="absolute -right-16 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all hover:scale-110"><ChevronRight size={32} /></button>}
            {idx === 3 && <button onClick={goToPrevPage} className="absolute -left-16 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all hover:scale-110"><ChevronLeft size={32} /></button>}
        </motion.div>
    );

    return (
        <>
            <StarryBackground />
            <CardToolbar canUndo={state.canUndo} canRedo={state.canRedo} onUndo={state.undo} onRedo={state.redo}
                onDownload={onDownload} onSave={onSave} onShare={onShare} onNewProject={onNewProject}
                onClosePanel={() => setActiveTool(null)} isSaving={isSaving} isExporting={isExporting}
                showClosePanel={activeTool === 'templates' || activeTool === 'stickers'} />

            <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-transparent mt-16 mb-20">
                <div className="relative w-full h-full max-w-6xl max-h-[85vh] flex items-center justify-center p-4 md:p-8">
                    <AnimatePresence initial={false} custom={direction} mode="popLayout">
                        {isCover && singlePage(0, t('atelier.pages.front_cover'))}
                        {isBack && singlePage(3, t('atelier.pages.back_side'))}
                        {!isCover && !isBack && (
                            <motion.div key={`spread-${viewStartIndex}`} custom={direction}
                                initial={{ rotateY: direction === 1 ? -90 : 90, opacity: 0, scale: 0.8 }} animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                                exit={{ rotateY: direction === 1 ? 90 : -90, opacity: 0, scale: 0.8 }} transition={{ duration: 0.5 }}
                                className="flex flex-row gap-4 h-full aspect-[4/3] items-center justify-center perspective-1000 relative">
                                <div className="flex-1 h-full bg-white rounded-l-xl shadow-2xl overflow-hidden border-r border-slate-200 relative">
                                    <div onClick={() => state.setFocusedPageIndex(1)} className="w-full h-full cursor-pointer">{renderPage(1, true)}</div>
                                </div>
                                <div className="flex-1 h-full bg-white rounded-r-xl shadow-2xl overflow-hidden relative">
                                    <div onClick={() => state.setFocusedPageIndex(2)} className="w-full h-full cursor-pointer">{renderPage(2, true)}</div>
                                </div>
                                <PageLabel label={t('atelier.pages.inside_spread')} hasItems={state.pages[1].items.length > 0 || state.pages[2].items.length > 0} />
                                <button onClick={goToPrevPage} className="absolute -left-16 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all hover:scale-110"><ChevronLeft size={32} /></button>
                                <button onClick={goToNextPage} className="absolute -right-16 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all hover:scale-110"><ChevronRight size={32} /></button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <ToolsDock key={state.focusedPageIndex} isMobile={false} activeTool={activeTool} onToolChange={setActiveTool}
                onAddSticker={(sticker: StickerItem) => { state.addItem({ type: 'sticker', content: sticker.content, rotation: 0 }); }}
                stickers={SKYWHALE_STICKERS} onGenerateAI={onGenerateAI}
                isGenerating={ai.isGenerating} onAddText={onAddText} onChangeBackground={state.setBackground}
                textColor={textColor} onTextColorChange={setTextColor} textFont={textFont} onTextFontChange={setTextFont}
                onSelectTemplate={onSelectTemplate} />
        </>
    );
};
