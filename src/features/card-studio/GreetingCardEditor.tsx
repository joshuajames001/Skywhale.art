import { useState, useRef, useEffect } from 'react';
import Konva from 'konva';
import { CardPage } from './types';
import { useTranslation } from 'react-i18next';
import { useCardStudio } from './CardStudioContext';
import { useCardEditorState } from './hooks/useCardEditorState';
import { useCardEditorAI } from './hooks/useCardEditorAI';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { CardStudioDesktop } from './CardStudioDesktop';
import { CardStudioMobile } from './CardStudioMobile';

const PAGE_COVER = 0, PAGE_SPREAD = 1, PAGE_BACK = 3;

interface GreetingCardEditorProps {
    initialProject?: { id: string; title: string; pages: CardPage[] } | null;
}

export const GreetingCardEditor = ({ initialProject }: GreetingCardEditorProps) => {
    const { t } = useTranslation();
    const { onSaveProject, onShareCard } = useCardStudio();
    const isMobile = !useMediaQuery('(min-width: 768px)');

    const defaultPages: CardPage[] = [
        { id: 'p0', name: t('atelier.pages.front_cover'), items: [], background: '#fffcf5' },
        { id: 'p1', name: t('atelier.pages.left_side'), items: [], background: '#fffcf5' },
        { id: 'p2', name: t('atelier.pages.right_side'), items: [], background: '#fffcf5' },
        { id: 'p3', name: t('atelier.pages.back_side'), items: [], background: '#fffcf5' },
    ];

    const state = useCardEditorState(initialProject?.pages || defaultPages);
    const ai = useCardEditorAI(initialProject?.id || 'new');

    const [activeTool, setActiveTool] = useState<'background' | 'stickers' | 'text' | 'ai' | 'templates' | null>(null);
    const [viewStartIndex, setViewStartIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [textColor, setTextColor] = useState('#ffffff');
    const [textFont, setTextFont] = useState('Inter');
    const stageRef = useRef<Konva.Stage>(null);

    useEffect(() => { state.setFocusedPageIndex(viewStartIndex); }, [viewStartIndex]);

    const goToPrevPage = () => {
        if (viewStartIndex === PAGE_COVER) return;
        setDirection(-1);
        setViewStartIndex(viewStartIndex === PAGE_BACK ? PAGE_SPREAD : PAGE_COVER);
    };
    const goToNextPage = () => {
        setDirection(1);
        setViewStartIndex(viewStartIndex === PAGE_COVER ? PAGE_SPREAD : PAGE_BACK);
    };

    const handleAddImage = (url: string) => { state.addItem({ type: 'image', content: url, scaleX: 0.15, scaleY: 0.15 }); };
    const handleAddText = (text: string) => { state.addItem({ type: 'text', content: text, color: textColor, fontFamily: textFont }); };

    const handleGenerateAI = async (prompt: string, mode: 'sticker' | 'background') => {
        try {
            const url = mode === 'sticker' ? await ai.generateSticker(prompt) : await ai.generateBackground('', prompt);
            if (mode === 'sticker') handleAddImage(url); else state.setBackground(url);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : '';
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

    const handleShare = async () => {
        if (!confirm(t('atelier.status.share_confirm'))) return;
        const result = await onShareCard(state.pages);
        if (!result) { alert(t('atelier.status.share_error')); return; }
        await navigator.clipboard.writeText(result.shareUrl);
        alert(t('atelier.status.share_ok'));
    };

    const handleNewProject = () => {
        if (!window.confirm(t('atelier.status.reset_confirm'))) return;
        state.setPages(defaultPages); state.addToHistory(defaultPages); setViewStartIndex(0);
    };

    const handleSelectTemplate = (template: { pages?: CardPage[] }) => {
        const bg = template.pages?.[0]?.background;
        if (bg) state.setBackground(bg);
    };

    const sharedProps = {
        state, ai, activeTool, setActiveTool, selectedId, setSelectedId,
        viewStartIndex, setViewStartIndex, direction, setDirection,
        textColor, setTextColor, textFont, setTextFont,
        isSaving, isExporting, stageRef,
        onSave: handleSaveDB, onDownload: handleDownload, onShare: handleShare,
        onNewProject: handleNewProject, onGenerateAI: handleGenerateAI,
        onAddText: handleAddText, onAddImage: handleAddImage,
        onSelectTemplate: handleSelectTemplate,
        goToNextPage, goToPrevPage, t, defaultPages,
    };

    return (
        <div className="flex flex-col h-[100svh] bg-slate-100 overflow-hidden relative selection:bg-indigo-500/30">
            {isMobile ? (
                <CardStudioMobile {...sharedProps} />
            ) : (
                <CardStudioDesktop {...sharedProps} />
            )}
        </div>
    );
};
