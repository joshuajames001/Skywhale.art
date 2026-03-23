import { useState, useEffect, useRef } from 'react';
import { useGuide } from '../../../hooks/useGuide';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { DEFAULT_VOICE_ID } from '../../../lib/audio-constants';
import { useTranslation } from 'react-i18next';
import { BookPage, CustomBookEditorProps } from '../types';
import { StoryPage } from '../../../types';
import { useBookEditorAI } from './useBookEditorAI';
import { useBookEditorPersistence } from './useBookEditorPersistence';

const mkPages = (n: number): BookPage[] => [
    { id: 'cover', text: '', isCover: true },
    ...Array.from({ length: n }, () => ({ id: crypto.randomUUID(), text: '' })),
];

export const useCustomBookEditor = ({ onOpenStore }: CustomBookEditorProps) => {
    const { t } = useTranslation();
    const [bookId, setBookId] = useState<string>(crypto.randomUUID());
    const [bookSeed, setBookSeed] = useLocalStorage('skywhale_draft_book_seed', Math.floor(Math.random() * 1e9));
    const [bookTitle, setBookTitle] = useLocalStorage('skywhale_draft_book_title', t('library.custom_book_editor.title_default'));
    const [pages, setPages] = useLocalStorage<BookPage[]>('skywhale_draft_book_pages', mkPages(10));
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [suggestion, setSuggestion] = useState<string | null>(null);
    const [magicMirrorUrl, setMagicMirrorUrl] = useLocalStorage<string | null>('skywhale_draft_mirror_url', null);
    const [magicMirrorDna, setMagicMirrorDna] = useLocalStorage<string | null>('skywhale_draft_mirror_dna', null);
    const [showPublishDialog, setShowPublishDialog] = useState(false);
    const [publishBookId, setPublishBookId] = useState<string | null>(null);
    const [currentAchievement, setCurrentAchievement] = useState<any>(null);
    const [maxPages, setMaxPages] = useState(10);
    const [selectedVoice, setSelectedVoice] = useState(DEFAULT_VOICE_ID);
    const [selectedStyle, setSelectedStyle] = useState('Pixar 3D');
    const [continuityImageUrl, setContinuityImageUrl] = useState<string | null>(null);
    const [isExpertMode, setIsExpertMode] = useState(false);
    const [showDictionary, setShowDictionary] = useState(false);
    const [dictionaryQuery, setDictionaryQuery] = useState('');
    const [dictionaryResult, setDictionaryResult] = useState<any>(null);
    const [isSearchingDict, setIsSearchingDict] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const magicMirrorInputRef = useRef<HTMLInputElement>(null);

    const ai = useBookEditorAI(bookId);
    const persistence = useBookEditorPersistence(bookId, '');
    const { startGuide, hasSeenGroups } = useGuide();
    const activeReference = magicMirrorUrl || continuityImageUrl;
    const costPerImage = activeReference ? 50 : 30;
    const hasEnoughEnergy = persistence.userBalance !== null && persistence.userBalance >= costPerImage;
    const currentPage = pages[currentPageIndex];

    const updatePage = (idx: number, patch: Partial<BookPage>) => {
        const next = [...pages]; next[idx] = { ...next[idx], ...patch }; setPages(next);
    };

    useEffect(() => {
        const tm = setTimeout(() => { if (!hasSeenGroups['custom_book_editor_welcome']) startGuide('custom_book_editor_welcome'); }, 800);
        return () => clearTimeout(tm);
    }, [hasSeenGroups, startGuide]);

    useEffect(() => {
        if (currentPageIndex === 1 && pages[1]?.text === '' && !suggestion)
            ai.generateIdeas().then(ideas => { if (ideas?.length) setSuggestion(ideas[Math.floor(Math.random() * ideas.length)]); });
    }, [currentPageIndex]);

    useEffect(() => {
        const cc = pages.filter(p => !p.isCover).length;
        if (cc === maxPages) return;
        if (!pages.some(p => p.text.length > 20 || !!p.imageUrl)) { setPages(mkPages(maxPages)); setCurrentPageIndex(0); return; }
        if (cc < maxPages) setPages([...pages, ...Array.from({ length: maxPages - cc }, () => ({ id: crypto.randomUUID(), text: '' }))]);
        else setPages(pages.filter((p, i) => p.isCover || pages.filter((_, j) => j < i && !_.isCover).length < maxPages));
    }, [maxPages]);

    const handleTextChange = (text: string) => {
        updatePage(currentPageIndex, { text });
        if (currentPageIndex === 0) { const title = text.split('\n')[0].trim(); if (title) setBookTitle(title); }
    };
    const handleNewBook = () => {
        if (!window.confirm(t('library.custom_book_editor.confirm_new_book'))) return;
        setBookTitle(t('library.custom_book_editor.title_default')); setPages(mkPages(maxPages));
        setMagicMirrorUrl(null); setMagicMirrorDna(null); setContinuityImageUrl(null);
        setCurrentPageIndex(0); setBookSeed(Math.floor(Math.random() * 1e9));
    };
    const addNewPage = () => { setPages([...pages, { id: Date.now().toString(), text: '' }]); setCurrentPageIndex(pages.length); };

    const handleSave = async (isPublic: boolean = false) => {
        const storyPages: StoryPage[] = pages.slice(1).map((p, idx) => ({
            page_number: idx + 1, text: p.text, image_url: p.imageUrl || null,
            art_prompt: p.prompt || '', is_generated: !!p.imageUrl, layout_type: 'standard',
        }));
        const result = await persistence.savePages({
            book_id: bookId, title: bookTitle, author: 'Já', theme_style: 'Watercolor',
            visual_style: 'watercolor', cover_image: pages[0]?.imageUrl || null, pages: storyPages,
            is_public: isPublic, magic_mirror_url: magicMirrorUrl || undefined,
            tier: magicMirrorUrl ? 'premium' : 'basic', voice_id: selectedVoice,
        });
        if (result) {
            const { bookId: rid, achievements } = result;
            setBookId(rid);
            if (achievements?.length) {
                setCurrentAchievement(achievements[0]);
                achievements.slice(1).forEach((a, i) => setTimeout(() => setCurrentAchievement(a), (i + 1) * 6000));
            }
            setPublishBookId(rid); setShowPublishDialog(true);
        }
    };
    const handleGeminiAssist = async () => {
        const ctx = pages.slice(0, currentPageIndex).map(p => p.text).join('\n');
        if (!currentPage.text.trim() && !ctx.trim()) return;
        setSuggestion(null);
        const r = await ai.generateSuggestion(currentPage.text, ctx, currentPageIndex, maxPages);
        if (r) setSuggestion(r);
    };
    const acceptSuggestion = () => { if (suggestion) { handleTextChange(currentPage.text + ' ' + suggestion); setSuggestion(null); } };
    const dismissSuggestion = (e: React.MouseEvent) => { e.stopPropagation(); setSuggestion(null); };
    const handleGenerateScene = async () => {
        try {
            const r = await ai.generateScene({
                page: currentPage, pageIndex: currentPageIndex, isExpertMode, selectedStyle,
                bookSeed, magicMirrorUrl, magicMirrorDna, continuityImageUrl,
            });
            if (!r) return;
            updatePage(currentPageIndex, { prompt: r.prompt, ...(r.url ? { imageUrl: r.url } : {}) });
            if (r.url) setContinuityImageUrl(r.url);
        } catch (err: any) {
            if (err.message?.includes('Insufficient Energy') || err.message?.includes('INSUFFICIENT_ENERGY')) {
                alert(`⚠️ Nedostatek energie! Potřebuješ ${costPerImage} ⚡`); onOpenStore?.();
            } else alert(`❌ Generování selhalo: ${err.message || 'Neznámá chyba'}`);
        }
    };
    const handleMagicMirrorUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const r = await persistence.uploadMagicMirror(e.target.files?.[0]);
        if (r) { setMagicMirrorUrl(r.url); setMagicMirrorDna(r.dna); }
    };
    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        e.target.value = '';
        const url = await persistence.uploadPhoto(file);
        if (url) updatePage(currentPageIndex, { imageUrl: url });
    };
    const handleExportPdf = async () => {
        if (!pages?.length) return;
        await persistence.exportPdf(pages.map((_, i) => `book-page-${i}`), bookTitle);
    };

    return {
        state: {
            bookId, bookTitle, pages, currentPageIndex, suggestion,
            isGeneratingImage: ai.isGeneratingImage, isUploading: persistence.isUploading,
            magicMirrorUrl, showPublishDialog, publishBookId, currentAchievement,
            isUploadingMirror: persistence.isUploadingMirror, maxPages,
            userBalance: persistence.userBalance, selectedVoice, selectedStyle,
            continuityImageUrl, isExpertMode, showDictionary, dictionaryQuery,
            dictionaryResult, isSearchingDict, activeReference, costPerImage,
            hasEnoughEnergy, geminiLoading: ai.isAiLoading, saving: persistence.isSaving,
            pdfProgress: persistence.pdfProgress, currentPage,
        },
        actions: {
            setBookTitle, setPages, setCurrentPageIndex, setSuggestion,
            setMagicMirrorUrl, setShowPublishDialog, setPublishBookId, setCurrentAchievement,
            setMaxPages, setSelectedVoice, setSelectedStyle, setIsExpertMode, setShowDictionary,
            setDictionaryQuery, setDictionaryResult, setIsSearchingDict,
            handleTextChange, handleNewBook, addNewPage, handleSave, handleGeminiAssist,
            acceptSuggestion, dismissSuggestion, handleGenerateScene, handleMagicMirrorUpload,
            handlePhotoUpload, handleExportPdf, searchDictionary: ai.lookupWord,
            generateImagePrompt: ai.generateImagePrompt, startGuide,
        },
        refs: { fileInputRef, magicMirrorInputRef },
    };
};
