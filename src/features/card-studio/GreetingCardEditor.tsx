import { useState, useRef, useEffect } from 'react';
import { CardCanvas } from './CardCanvas';
import { ToolsDock } from './ToolsDock';
import { StarryBackground } from '../../components/StarryBackground';
import { SKYWHALE_STICKERS } from './data/stickers';
import Konva from 'konva';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { CardPage, CardItem } from './types';
import { useTranslation } from 'react-i18next';
import { useCardStudio } from './CardStudioContext';
import { useCardEditorState } from './hooks/useCardEditorState';
import { useCardEditorAI } from './hooks/useCardEditorAI';
import { CardToolbar } from './components/CardToolbar';

const PAGE_COVER = 0, PAGE_SPREAD = 1, PAGE_BACK = 3;

const PageLabel = ({ label, hasItems }: { label: string; hasItems: boolean }) => (
    <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-md text-white/90 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full pointer-events-none transition-opacity duration-500 ${hasItems ? 'opacity-0' : 'opacity-100'}`}>
        {label}
    </div>
);

const GreetingCardPage = ({ page, selectedId, onSelect, onUpdate, onItemDragStart, onItemDragEnd, stageRef }: any) => {
    if (!page) return <div className="w-full h-full bg-slate-100 animate-pulse" />;
    return <CardCanvas items={page.items || []} background={page.background || "#fffcf5"} selectedId={selectedId}
        onSelect={onSelect} onUpdate={onUpdate} onItemDragStart={onItemDragStart} onItemDragEnd={onItemDragEnd} domRef={stageRef} />;
};

interface GreetingCardEditorProps {
    initialProject?: { id: string; title: string; pages: CardPage[] } | null;
}

export const GreetingCardEditor = ({ initialProject }: GreetingCardEditorProps) => {
    const { t } = useTranslation();
    const { onSaveProject } = useCardStudio();

    const defaultPages: CardPage[] = [
        { id: 'p0', name: t('atelier.pages.front_cover'), items: [], background: '#fffcf5' },
        { id: 'p1', name: t('atelier.pages.left_side'), items: [], background: '#fffcf5' },
        { id: 'p2', name: t('atelier.pages.right_side'), items: [], background: '#fffcf5' },
        { id: 'p3', name: t('atelier.pages.back_side'), items: [], background: '#fffcf5' },
    ];

    const state = useCardEditorState(initialProject?.pages || defaultPages);
    const ai = useCardEditorAI(initialProject?.id || 'new');

    const [activeTool, setActiveTool] = useState<'background' | 'stickers' | 'text' | 'ai' | 'templates' | null>(null);
    const [isDraggingSticker, setIsDraggingSticker] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [viewStartIndex, setViewStartIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [textColor, setTextColor] = useState('#ffffff');
    const [textFont, setTextFont] = useState('Inter');
    const stageRef = useRef<Konva.Stage>(null);

    useEffect(() => {
        const h = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', h); return () => window.removeEventListener('resize', h);
    }, []);

    useEffect(() => { state.setFocusedPageIndex(viewStartIndex); }, [viewStartIndex]);

    const isCover = viewStartIndex === PAGE_COVER;
    const isBack = viewStartIndex === PAGE_BACK;
    const goToPrevPage = () => { if (isCover) return; setDirection(-1); setViewStartIndex(viewStartIndex === PAGE_BACK ? PAGE_SPREAD : PAGE_COVER); };
    const goToNextPage = () => { setDirection(1); setViewStartIndex(viewStartIndex === PAGE_COVER ? PAGE_SPREAD : PAGE_BACK); };

    const handleAddImage = (url: string) => { state.addItem({ type: 'image', content: url, scaleX: 0.15, scaleY: 0.15 }); };
    const handleAddText = (text: string) => { state.addItem({ type: 'text', content: text, color: textColor, fontFamily: textFont }); };

    const handleGenerateAI = async (prompt: string, mode: 'sticker' | 'background') => {
        try {
            const url = mode === 'sticker' ? await ai.generateSticker(prompt) : await ai.generateBackground('', prompt);
            if (mode === 'sticker') handleAddImage(url); else state.setBackground(url);
        } catch (e: any) {
            const msg = e.message || '';
            if (msg.includes('Obsah není vhodný')) alert(t('atelier.status.inappropriate_content'));
            else if (msg.includes('402') || msg.includes('Insufficient credit')) alert(t('atelier.status.payment_wait'));
            else alert(`${t('atelier.status.magic_dust_error')} ${msg}`);
        }
    };

    const handleDownload = async () => {
        if (!stageRef.current) return;
        setIsExporting(true); setSelectedId(null);
        setTimeout(async () => {
            try {
                const url = stageRef.current?.toDataURL({ pixelRatio: 2 });
                if (url) { const a = document.createElement('a'); a.download = `${t('atelier.card_default_title')}-${state.focusedPageIndex + 1}.png`; a.href = url; a.click(); }
            } finally { setIsExporting(false); }
        }, 50);
    };

    const handleSaveDB = async () => {
        if (!stageRef.current) { alert(t('atelier.status.capture_error')); return; }
        setSelectedId(null); await new Promise(r => setTimeout(r, 50));
        const blob = await new Promise<Blob | null>(resolve => stageRef.current?.toCanvas().toBlob(resolve, 'image/png'));
        if (!blob) { alert(t('atelier.status.thumbnail_error')); return; }
        setIsSaving(true);
        try { await onSaveProject({ id: crypto.randomUUID(), title: `${t('atelier.card_default_title')} ${new Date().toLocaleDateString()}`, pages: state.pages, thumbnailBlob: blob }); }
        catch (e) { console.error('Save failed', e); }
        finally { setIsSaving(false); }
    };

    const handleShare = () => {
        const ref = localStorage.getItem('referral_code') || 'friend';
        if (confirm(t('atelier.status.share_confirm'))) { navigator.clipboard.writeText(`${window.location.origin}/?ref=${ref}`); alert(t('atelier.status.share_ok')); }
    };

    const handleNewProject = () => {
        if (!window.confirm(t('atelier.status.reset_confirm'))) return;
        state.setPages(defaultPages); state.addToHistory(defaultPages); setViewStartIndex(0);
    };

    const handleSelectTemplate = (template: any) => {
        const bg = template.pages[0]?.background;
        if (bg) state.setBackground(bg);
    };

    // --- Canvas page renderer ---
    const renderPage = (idx: number, ref?: boolean) => (
        <GreetingCardPage page={state.pages[idx]} selectedId={selectedId} onSelect={setSelectedId} onUpdate={state.updateItem}
            onItemDragStart={() => setIsDraggingSticker(true)} onItemDragEnd={() => setIsDraggingSticker(false)}
            stageRef={ref && state.focusedPageIndex === idx ? stageRef : undefined} />
    );

    const dragProps = (onDrag: (offset: number) => void) => ({
        drag: (isDraggingSticker ? false : 'x') as any,
        dragConstraints: { left: 0, right: 0 },
        onDragEnd: (_: any, { offset }: any) => onDrag(offset.x),
    });

    // --- Single-page view helper (returns JSX, not a component — avoids forwardRef issue with AnimatePresence popLayout) ---
    const singlePage = (idx: number, label: string, onSwipe: (dx: number) => void) => (
        <motion.div key={`page-${idx}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className={`${isMobile ? 'w-full h-full flex items-center justify-center p-6 pt-36 pb-32' : 'relative flex flex-col items-center justify-center h-full aspect-[2/3]'}`}
            {...(isMobile ? dragProps(onSwipe) : {})}>
            <div className="w-full h-full bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 relative">
                <div onClick={() => state.setFocusedPageIndex(idx)} className={`w-full h-full ${isMobile ? '' : 'cursor-pointer'}`}>
                    {renderPage(idx, true)}
                </div>
                <PageLabel label={label} hasItems={state.pages[idx].items.length > 0} />
            </div>
            {!isMobile && idx === 0 && <button onClick={goToNextPage} className="absolute -right-16 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all hover:scale-110"><ChevronRight size={32} /></button>}
            {!isMobile && idx === 3 && <button onClick={goToPrevPage} className="absolute -left-16 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all hover:scale-110"><ChevronLeft size={32} /></button>}
        </motion.div>
    );

    return (
        <div className="flex flex-col h-[100svh] bg-slate-100 overflow-hidden relative selection:bg-indigo-500/30">
            <StarryBackground />
            <CardToolbar canUndo={state.canUndo} canRedo={state.canRedo} onUndo={state.undo} onRedo={state.redo}
                onDownload={handleDownload} onSave={handleSaveDB} onShare={handleShare} onNewProject={handleNewProject}
                onClosePanel={() => setActiveTool(null)} isSaving={isSaving} isExporting={isExporting}
                showClosePanel={activeTool === 'templates' || activeTool === 'stickers'} />

            <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-transparent mt-16 mb-20">
                <div className="relative w-full h-full max-w-6xl max-h-[85vh] flex items-center justify-center p-4 md:p-8">
                    <AnimatePresence initial={false} custom={direction} mode="popLayout">
                        {isCover && singlePage(0, t('atelier.pages.front_cover'), dx => { if (dx < -50) goToNextPage(); })}
                        {isBack && singlePage(3, t('atelier.pages.back_side'), dx => { if (dx > 50) goToPrevPage(); })}
                        {!isCover && !isBack && (isMobile ? (
                            <motion.div key="mobile-spread" custom={direction}
                                initial={{ x: direction * 100 + '%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: direction * -100 + '%', opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                {...dragProps(dx => { if (dx < -50) goToNextPage(); if (dx > 50) goToPrevPage(); })}
                                className="absolute inset-0 flex flex-col items-center justify-center p-2 pt-20 pb-32">
                                <div className="flex flex-row w-full aspect-[4/3] shadow-2xl rounded-lg overflow-hidden border border-slate-600 bg-slate-800 gap-[2px] relative z-0">
                                    {[1, 2].map(i => (
                                        <div key={i} className={`flex-1 bg-white relative overflow-hidden flex items-center justify-center transition-all duration-300 ${state.focusedPageIndex === i ? 'ring-4 ring-indigo-500 z-10 brightness-110' : 'brightness-90 hover:brightness-100'}`}>
                                            <div onPointerDown={e => { e.stopPropagation(); state.setFocusedPageIndex(i); }}
                                                onTouchStart={e => { e.stopPropagation(); state.setFocusedPageIndex(i); }}
                                                className="origin-center" style={{ transform: 'scale(0.42)' }}>
                                                {renderPage(i, true)}
                                            </div>
                                        </div>
                                    ))}
                                    <PageLabel label={t('atelier.pages.inside_spread')} hasItems={state.pages[1].items.length > 0 || state.pages[2].items.length > 0} />
                                </div>
                                <div className="mt-8 text-white/50 text-xs font-medium uppercase tracking-widest flex items-center gap-2">
                                    <ChevronLeft size={12} /> Slide <ChevronRight size={12} />
                                </div>
                            </motion.div>
                        ) : (
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
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            <ToolsDock key={state.focusedPageIndex} isMobile={isMobile} activeTool={activeTool} onToolChange={setActiveTool}
                onAddSticker={(sticker: any) => { state.addItem({ type: 'sticker', content: sticker.content, rotation: 0 }); }}
                stickers={SKYWHALE_STICKERS} onGenerateAI={(prompt, mode) => handleGenerateAI(prompt, mode)}
                isGenerating={ai.isGenerating} onAddText={handleAddText} onChangeBackground={state.setBackground}
                textColor={textColor} onTextColorChange={setTextColor} textFont={textFont} onTextFontChange={setTextFont}
                onSelectTemplate={handleSelectTemplate} />
        </div>
    );
};
