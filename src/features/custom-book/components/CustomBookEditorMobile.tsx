import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, ImageIcon, Type, Book, Sparkles, Camera,
    Loader2, Star, X, Feather, Search, Languages,
    Zap, Check, Volume2, Palette, MoreHorizontal,
    Download, Share2, Save,
} from 'lucide-react';
import { SharedEditorProps } from '../types';
import { checkTopicBlacklist } from '../../../lib/content-policy';
import { BottomSheet } from '../../../components/BottomSheet';
import { DictionaryResults } from '../../../components/DictionaryResults';
import { useClipboardCopy } from '../../../hooks/useClipboardCopy';
import { VOICE_OPTIONS } from '../../../lib/audio-constants';
import { STYLE_PROMPTS } from '../../../lib/ai';

type MobileView = 0 | 1 | 2; // 0=text, 1=image, 2=dictionary

export const CustomBookEditorMobile: React.FC<SharedEditorProps> = ({ state, actions, refs, onBack, t }) => {
    const [activeView, setActiveView] = useState<MobileView>(0);
    const [showHeroMode, setShowHeroMode] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showVoicePicker, setShowVoicePicker] = useState(false);
    const [showStylePicker, setShowStylePicker] = useState(false);

    const nextView = () => setActiveView(v => Math.min(v + 1, 2) as MobileView);
    const prevView = () => setActiveView(v => Math.max(v - 1, 0) as MobileView);

    const pageLabel = state.currentPage?.isCover
        ? t('library.custom_book_editor.title_page', 'Obálka')
        : `Strana ${state.currentPageIndex}`;

    const openHeroMode = () => setShowHeroMode(true);

    return (
        <>
            {/* ── TOP BAR ── */}
            <header className="shrink-0 flex items-center justify-between px-3 py-2 bg-white/10 backdrop-blur-md border-b border-white/20 z-50">
                {/* Left: Back */}
                <button
                    onClick={onBack}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-white/20 hover:bg-white/40 rounded-full text-white transition-all"
                >
                    <ChevronLeft size={20} />
                </button>

                {/* Center: Chapter + dots */}
                <div className="flex flex-col items-center gap-1 flex-1 mx-2">
                    <span className="text-xs font-bold text-white/90 truncate max-w-[140px]">{pageLabel}</span>
                    <div className="flex gap-1.5">
                        {[0, 1, 2].map(i => (
                            <button
                                key={i}
                                onClick={() => setActiveView(i as MobileView)}
                                className={`w-2 h-2 rounded-full transition-all ${activeView === i ? 'bg-[#534AB7] scale-125' : 'bg-white/30'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Right: Audio, Style, Menu */}
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => setShowVoicePicker(true)}
                        className="min-w-[36px] min-h-[36px] flex items-center justify-center bg-[#EEEDFE] border border-[#AFA9EC] rounded-xl transition-all"
                    >
                        <Volume2 size={16} className="text-[#534AB7]" />
                    </button>
                    <button
                        onClick={() => setShowStylePicker(true)}
                        className="min-w-[36px] min-h-[36px] flex items-center justify-center bg-[#EEEDFE] border border-[#AFA9EC] rounded-xl transition-all"
                    >
                        <Palette size={16} className="text-[#534AB7]" />
                    </button>
                    <button
                        onClick={() => setShowMenu(true)}
                        className="min-w-[36px] min-h-[36px] flex items-center justify-center bg-white/20 rounded-xl transition-all"
                    >
                        <MoreHorizontal size={18} className="text-white" />
                    </button>
                </div>
            </header>

            {/* ── SWIPEABLE VIEWS ── */}
            <main className="flex-1 overflow-hidden relative">
                <motion.div
                    drag="x"
                    dragDirectionLock
                    dragElastic={0.1}
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(_, info) => {
                        if (info.offset.x < -60) nextView();
                        if (info.offset.x > 60) prevView();
                    }}
                    className="h-full"
                >
                    <div
                        className="flex h-full transition-transform duration-300 ease-out"
                        style={{ transform: `translateX(-${activeView * 100}%)` }}
                    >
                        {/* VIEW 1 — TEXT */}
                        <div className="w-full shrink-0 h-full overflow-y-auto p-4">
                            <TextViewContent state={state} actions={actions} t={t} onOpenHero={openHeroMode} />
                        </div>

                        {/* VIEW 2 — IMAGE */}
                        <div className="w-full shrink-0 h-full overflow-y-auto p-4">
                            <ImageViewContent state={state} actions={actions} refs={refs} t={t} onOpenHero={openHeroMode} />
                        </div>

                        {/* VIEW 3 — DICTIONARY */}
                        <div className="w-full shrink-0 h-full overflow-y-auto p-4">
                            <DictionaryViewContent state={state} actions={actions} t={t} />
                        </div>
                    </div>
                </motion.div>
            </main>

            {/* ── GEMINI SUGGESTION (floating) ── */}
            <AnimatePresence>
                {state.suggestion && activeView === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-44 left-4 right-4 z-30 bg-white shadow-xl shadow-purple-500/10 rounded-2xl p-4 border-2 border-purple-50 cursor-pointer"
                        onClick={actions.acceptSuggestion}
                    >
                        <button
                            onClick={actions.dismissSuggestion}
                            className="absolute top-2 right-2 p-1 text-stone-300 hover:text-stone-500 rounded-full"
                        >
                            <X size={14} />
                        </button>
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center shrink-0 border border-purple-100">
                                <Feather size={14} className="text-purple-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[8px] font-black text-purple-400 mb-1 uppercase tracking-widest">{t('library.custom_book_editor.suggestion_label', 'Návrh')}</p>
                                <p className="text-sm text-stone-700 leading-snug font-serif italic line-clamp-3">"{state.suggestion}"</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── BOTTOM NAV ── */}
            <nav className="shrink-0 bg-white border-t border-gray-100 flex z-50">
                {([
                    { view: 0 as MobileView, icon: Type, label: 'Text' },
                    { view: 1 as MobileView, icon: ImageIcon, label: t('library.custom_book_editor.badge_cover', 'Obrázek') === 'Obálka' ? 'Obrázek' : 'Obrázek' },
                    { view: 2 as MobileView, icon: Book, label: 'Slovník' },
                ] as const).map(({ view, icon: Icon, label }) => {
                    const isActive = activeView === view;
                    return (
                        <button
                            key={view}
                            onClick={() => setActiveView(view)}
                            className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 min-h-[56px]"
                        >
                            <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-[#EEEDFE]' : ''}`}>
                                <Icon size={20} className={isActive ? 'text-[#534AB7]' : 'text-gray-400'} />
                            </div>
                            <span className={`text-[10px] font-bold ${isActive ? 'text-[#534AB7]' : 'text-gray-400'}`}>
                                {label}
                            </span>
                        </button>
                    );
                })}
            </nav>

            {/* ── PAGE TIMELINE (horizontal scroll) ── */}
            <div className="shrink-0 bg-white/10 backdrop-blur-md border-t border-white/20 flex items-center px-3 gap-2 overflow-x-auto h-16 custom-scrollbar">
                {state.pages.map((page: typeof state.pages[0], index: number) => (
                    <button
                        key={page.id}
                        onClick={() => actions.setCurrentPageIndex(index)}
                        className={`relative shrink-0 w-11 h-14 rounded border transition-all overflow-hidden ${index === state.currentPageIndex
                            ? 'border-[#534AB7] ring-2 ring-[#534AB7]/30 bg-stone-800'
                            : 'border-white/10 bg-stone-800/50'
                            }`}
                    >
                        <span className="absolute top-0.5 left-1 text-[8px] font-bold text-stone-500 z-10">
                            {page.isCover ? 'T' : index}
                        </span>
                        {page.imageUrl ? (
                            <img src={page.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-70" />
                        ) : (
                            <div className="absolute inset-0 bg-white/5" />
                        )}
                    </button>
                ))}
            </div>

            {/* ── VOICE PICKER ── */}
            <AnimatePresence>
                {showVoicePicker && (
                    <BottomSheet onClose={() => setShowVoicePicker(false)}>
                        <h3 className="text-sm font-bold text-stone-800 px-5 mb-3">Hlas vypravěče</h3>
                        <button
                            onClick={() => { actions.setSelectedVoice(''); setShowVoicePicker(false); }}
                            className={`flex items-center gap-3 w-full px-5 py-3.5 text-left hover:bg-gray-50 active:bg-gray-100 ${!state.selectedVoice ? 'bg-[#EEEDFE]' : ''}`}
                        >
                            <span className="text-lg">🔇</span>
                            <span className="text-sm font-medium text-gray-800 flex-1">Bez hlasu</span>
                            {!state.selectedVoice && <Check size={16} className="text-[#534AB7]" />}
                        </button>
                        {VOICE_OPTIONS.map(v => (
                            <button
                                key={v.id}
                                onClick={() => { actions.setSelectedVoice(v.id); setShowVoicePicker(false); }}
                                className={`flex items-center gap-3 w-full px-5 py-3.5 text-left hover:bg-gray-50 active:bg-gray-100 ${state.selectedVoice === v.id ? 'bg-[#EEEDFE]' : ''}`}
                            >
                                <span className="text-lg">{v.emoji}</span>
                                <span className="text-sm font-medium text-gray-800 flex-1">{v.name}</span>
                                {state.selectedVoice === v.id && <Check size={16} className="text-[#534AB7]" />}
                            </button>
                        ))}
                    </BottomSheet>
                )}
            </AnimatePresence>

            {/* ── STYLE PICKER ── */}
            <AnimatePresence>
                {showStylePicker && (
                    <BottomSheet onClose={() => setShowStylePicker(false)}>
                        <h3 className="text-sm font-bold text-stone-800 px-5 mb-3">Vizuální styl</h3>
                        {STYLE_KEYS.map(key => (
                            <button
                                key={key}
                                onClick={() => { actions.setSelectedStyle(key); setShowStylePicker(false); }}
                                className={`flex items-center gap-3 w-full px-5 py-3.5 text-left hover:bg-gray-50 active:bg-gray-100 ${state.selectedStyle === key ? 'bg-[#EEEDFE]' : ''}`}
                            >
                                <span className="text-lg">🖌️</span>
                                <span className="text-sm font-medium text-gray-800 flex-1">{key.replace(/_/g, ' ')}</span>
                                {state.selectedStyle === key && <Check size={16} className="text-[#534AB7]" />}
                            </button>
                        ))}
                    </BottomSheet>
                )}
            </AnimatePresence>

            {/* ── OVERFLOW MENU ── */}
            <AnimatePresence>
                {showMenu && (
                    <BottomSheet onClose={() => setShowMenu(false)}>
                        <button
                            onClick={() => { actions.handleSave(false); setShowMenu(false); }}
                            disabled={state.saving}
                            className="flex items-center gap-3 w-full px-5 py-3.5 text-left hover:bg-gray-50 active:bg-gray-100"
                        >
                            <Save size={18} className="text-gray-500" />
                            <span className="text-sm font-medium text-gray-800">Uložit</span>
                            {state.saving && <Loader2 size={14} className="animate-spin text-gray-400" />}
                        </button>
                        <button
                            onClick={() => { actions.handleExportPdf(); setShowMenu(false); }}
                            disabled={state.isExportingPdf}
                            className="flex items-center gap-3 w-full px-5 py-3.5 text-left hover:bg-gray-50 active:bg-gray-100"
                        >
                            <Download size={18} className="text-gray-500" />
                            <span className="text-sm font-medium text-gray-800">Exportovat PDF</span>
                            {state.isExportingPdf && <Loader2 size={14} className="animate-spin text-gray-400" />}
                        </button>
                        <button
                            onClick={() => { actions.handleSave(true); setShowMenu(false); }}
                            disabled={state.saving}
                            className="flex items-center gap-3 w-full px-5 py-3.5 text-left hover:bg-gray-50 active:bg-gray-100"
                        >
                            <Share2 size={18} className="text-gray-500" />
                            <span className="text-sm font-medium text-gray-800">Publikovat</span>
                        </button>
                    </BottomSheet>
                )}
            </AnimatePresence>

            {/* ── HERO MODE OVERLAY ── */}
            <AnimatePresence>
                {showHeroMode && (
                    <HeroModeOverlay
                        state={state}
                        actions={actions}
                        refs={refs}
                        t={t}
                        onClose={() => setShowHeroMode(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

/* ───────────────────────────────────────────────
   TEXT VIEW
   ─────────────────────────────────────────────── */
const TextViewContent: React.FC<Pick<SharedEditorProps, 'state' | 'actions' | 't'> & { onOpenHero: () => void }> = ({ state, actions, t, onOpenHero }) => (
    <div className="flex flex-col h-full">
        {/* Label */}
        <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-widest text-white/70 uppercase">
                {state.currentPage?.isCover ? t('library.custom_book_editor.title_page', 'Titulní strana') : 'Strana — Text'}
            </span>
            <div className="flex items-center gap-2">
                {/* Gemini assist */}
                <button
                    onClick={() => {
                        const policy = checkTopicBlacklist(state.currentPage?.text ?? '');
                        if (policy.blocked) { alert(policy.reason ?? 'Nevhodný obsah.'); return; }
                        actions.handleGeminiAssist();
                    }}
                    disabled={state.geminiLoading}
                    className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-all ${state.geminiLoading ? 'bg-purple-100 text-purple-400' : 'bg-white text-gray-400 border border-gray-100 shadow-sm'}`}
                >
                    {state.geminiLoading ? <Loader2 size={16} className="animate-spin" /> : <Feather size={16} />}
                </button>
                {/* Hero mode */}
                <button
                    onClick={onOpenHero}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-[#EEEDFE] border border-[#AFA9EC] transition-all"
                >
                    <ImageIcon size={16} className="text-[#534AB7]" />
                </button>
            </div>
        </div>

        {/* Textarea card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex-1 flex flex-col min-h-[160px]">
            <textarea
                value={state.currentPage?.text ?? ''}
                onChange={(e) => actions.handleTextChange(e.target.value)}
                placeholder={state.currentPage?.isCover
                    ? t('library.custom_book_editor.placeholder_cover', 'Název tvé knihy…')
                    : t('library.custom_book_editor.placeholder_text', 'Napiš svůj příběh…')
                }
                className="flex-1 w-full bg-transparent border-none resize-none focus:ring-0 text-lg leading-relaxed text-stone-800 placeholder:text-stone-200 font-serif focus:outline-none"
                spellCheck={false}
            />
            <div className="text-right">
                <span className="text-xs text-gray-400">{(state.currentPage?.text ?? '').split(/\s+/).filter(Boolean).length} slov</span>
            </div>
        </div>

        {/* Expert mode prompt editor */}
        <AnimatePresence>
            {state.isExpertMode && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1">
                            <Sparkles size={10} /> {t('library.custom_book_editor.expert_prompt_label', 'Art Prompt')}
                        </span>
                        <button
                            onClick={async () => {
                                const p = await actions.generateImagePrompt(state.currentPage?.text ?? '');
                                if (p) {
                                    const newPages = [...state.pages];
                                    newPages[state.currentPageIndex].prompt = p;
                                    actions.setPages(newPages);
                                }
                            }}
                            className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-bold"
                        >
                            {state.currentPage?.prompt
                                ? t('library.custom_book_editor.expert_btn_regenerate', 'Přegenerovat')
                                : t('library.custom_book_editor.expert_btn_translate', 'Přeložit text → prompt')}
                        </button>
                    </div>
                    <textarea
                        className="w-full bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 text-sm font-mono text-indigo-800 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                        rows={3}
                        placeholder={t('library.custom_book_editor.expert_prompt_placeholder', 'Vlastní prompt pro obrázek…')}
                        value={state.currentPage?.prompt || ''}
                        onChange={(e) => {
                            const newPages = [...state.pages];
                            newPages[state.currentPageIndex].prompt = e.target.value;
                            actions.setPages(newPages);
                        }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

/* ───────────────────────────────────────────────
   IMAGE VIEW
   ─────────────────────────────────────────────── */
interface ImageViewProps extends Pick<SharedEditorProps, 'state' | 'actions' | 'refs' | 't'> {
    onOpenHero: () => void;
}

const ImageViewContent: React.FC<ImageViewProps> = ({ state, actions, refs, t, onOpenHero }) => (
    <div className="flex flex-col h-full gap-4">
        {/* Label + Magic Mirror */}
        <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-widest text-white/70 uppercase">Strana — Obrázek</span>
            <button
                onClick={() => refs.magicMirrorInputRef.current?.click()}
                className={`flex items-center gap-1 text-sm font-medium transition-all ${state.magicMirrorUrl ? 'text-purple-300' : 'text-[#534AB7]/70'}`}
            >
                <span>🪞</span>
                {state.magicMirrorUrl ? 'Mirror aktivní' : 'Magic Mirror'}
                {state.isUploadingMirror && <Loader2 size={12} className="animate-spin" />}
            </button>
        </div>
        <input
            type="file"
            ref={refs.magicMirrorInputRef}
            onChange={actions.handleMagicMirrorUpload}
            accept="image/*"
            className="hidden"
        />

        {/* Image card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 min-h-[200px] flex items-center justify-center overflow-hidden relative">
            {state.currentPage?.imageUrl ? (
                <img
                    src={state.currentPage.imageUrl}
                    alt="Scene"
                    className="w-full h-full object-contain"
                />
            ) : (
                <button
                    onClick={onOpenHero}
                    className="flex flex-col items-center gap-3 text-gray-300 p-6"
                >
                    <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center">
                        <ImageIcon size={24} className="text-gray-300" />
                    </div>
                    <span className="text-sm font-medium text-gray-400">{t('library.custom_book_editor.canvas_empty', 'Klikni pro vygenerování')}</span>
                </button>
            )}

            {/* Cover badge */}
            {state.currentPage?.isCover && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-stone-900 text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg z-20 flex items-center gap-1">
                    <Star size={8} className="text-yellow-400 fill-yellow-400" />
                    {t('library.custom_book_editor.badge_cover', 'Obálka')}
                </div>
            )}

            {/* Loading overlay */}
            {(state.isGeneratingImage || state.isUploading) && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                    <Loader2 size={32} className="text-purple-500 animate-spin" />
                    <p className="font-bold text-stone-400 text-sm">
                        {state.isGeneratingImage ? t('library.custom_book_editor.status_working', 'Kouzlím…') : t('library.custom_book_editor.status_uploading', 'Nahrávám…')}
                    </p>
                </div>
            )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
            <button
                onClick={() => refs.fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-700 font-medium text-sm"
            >
                <Camera size={16} />
                {t('library.custom_book_editor.btn_upload_photo', 'Z galerie')}
            </button>
            <button
                onClick={onOpenHero}
                className="flex-1 flex items-center justify-center gap-2 bg-[#534AB7] text-white rounded-xl px-4 py-2.5 font-medium text-sm"
            >
                <Sparkles size={16} />
                AI generovat
            </button>
        </div>

        {/* Hidden file input */}
        <input
            type="file"
            ref={refs.fileInputRef}
            onChange={actions.handlePhotoUpload}
            accept="image/*"
            className="hidden"
        />
    </div>
);

/* ───────────────────────────────────────────────
   DICTIONARY VIEW (Magičtinář)
   ─────────────────────────────────────────────── */
const DictionaryViewContent: React.FC<Pick<SharedEditorProps, 'state' | 'actions' | 't'>> = ({ state, actions, t }) => {
    const { copied, copy: copyToClipboard } = useClipboardCopy();

    const handleSearch = () => {
        if (!state.dictionaryQuery) return;
        actions.setIsSearchingDict(true);
        actions.searchDictionary(state.dictionaryQuery).then((res: ReturnType<typeof actions.searchDictionary> extends Promise<infer R> ? R : never) => {
            actions.setDictionaryResult(res);
            actions.setIsSearchingDict(false);
        });
    };

    return (
        <div className="flex flex-col h-full gap-4">
            <span className="text-[10px] font-bold tracking-widest text-white/70 uppercase">Magičtinář (slovník)</span>

            {/* Search input */}
            <div className="relative">
                <input
                    type="text"
                    placeholder={t('library.custom_book_editor.dictionary_placeholder', 'Hledej slovo…')}
                    value={state.dictionaryQuery}
                    onChange={(e) => actions.setDictionaryQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                    className="w-full p-3 pl-10 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-orange-300 focus:outline-none text-stone-900 placeholder:text-stone-400 bg-white"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
                {state.isSearchingDict ? (
                    <div className="flex flex-col items-center justify-center py-10 text-stone-400 gap-3">
                        <Loader2 size={28} className="animate-spin text-orange-400" />
                        <p className="text-sm">Listuji ve starých knihách...</p>
                    </div>
                ) : state.dictionaryResult ? (
                    <DictionaryResults
                        result={state.dictionaryResult}
                        query={state.dictionaryQuery}
                        onWordClick={copyToClipboard}
                    />
                ) : (
                    <div className="text-center text-stone-400 py-10">
                        <Languages size={40} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm">{t('library.custom_book_editor.dictionary_empty', 'Zadej slovo a stiskni Enter')}</p>
                    </div>
                )}
            </div>

        </div>
    );
};

/* Style keys for picker (filtered — no duplicates) */
const STYLE_KEYS = Object.keys(STYLE_PROMPTS).filter(k => !['Watercolor', 'Pixar 3D'].includes(k));

/* ───────────────────────────────────────────────
   HERO MODE OVERLAY
   ─────────────────────────────────────────────── */
interface HeroOverlayProps extends Pick<SharedEditorProps, 'state' | 'actions' | 'refs' | 't'> {
    onClose: () => void;
}

const HERO_CHIPS = [
    { label: 'whale in starry sky', prompt: 'whale floating among stars in cosmic night sky' },
    { label: 'enchanted forest', prompt: 'enchanted magical forest with glowing mushrooms and fireflies' },
    { label: 'underwater world', prompt: 'underwater world with colorful coral reef and sea creatures' },
];

const HeroModeOverlay: React.FC<HeroOverlayProps> = ({ state, actions, refs, t, onClose }) => {
    const [localPrompt, setLocalPrompt] = useState(state.currentPage?.prompt || '');

    const handleGenerate = () => {
        if (localPrompt.trim()) {
            const newPages = [...state.pages];
            newPages[state.currentPageIndex].prompt = localPrompt;
            actions.setPages(newPages);
        }
        actions.handleGenerateScene();
        onClose();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-full bg-white rounded-t-3xl p-5 pb-8 max-h-[85vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#EEEDFE] flex items-center justify-center">
                            <Sparkles size={18} className="text-[#534AB7]" />
                        </div>
                        <div>
                            <h3 className="font-bold text-stone-800 text-base">Hero mode — AI obrázek</h3>
                            <div className="flex items-center gap-1 text-xs text-stone-400">
                                <Zap size={10} className="text-amber-500" /> {state.costPerImage} ⚡
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-gray-100">
                        <X size={20} className="text-stone-400" />
                    </button>
                </div>

                {/* Preview area */}
                <div className="bg-[#EEEDFE] rounded-xl h-[140px] flex items-center justify-center mb-5 overflow-hidden">
                    {state.currentPage?.imageUrl ? (
                        <img src={state.currentPage.imageUrl} alt="" className="w-full h-full object-contain" />
                    ) : (
                        <span className="text-sm text-[#534AB7]/60 font-medium">Náhled se zobrazí zde</span>
                    )}
                </div>

                {/* Prompt input */}
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Prompt</label>
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={localPrompt}
                        onChange={(e) => setLocalPrompt(e.target.value)}
                        placeholder="Popiš svůj obrázek…"
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:ring-2 focus:ring-[#534AB7]/30 focus:outline-none"
                        onKeyDown={(e) => { if (e.key === 'Enter') handleGenerate(); }}
                    />
                    <p className="text-xs text-gray-400 mt-1">Write in English for best results</p>
                    <button
                        onClick={handleGenerate}
                        disabled={state.isGeneratingImage || (!state.currentPage?.text?.trim() && !localPrompt.trim())}
                        className="bg-[#534AB7] text-white rounded-xl px-4 py-2.5 font-bold text-sm disabled:opacity-50 flex items-center gap-1"
                    >
                        {state.isGeneratingImage ? <Loader2 size={16} className="animate-spin" /> : 'Generovat'}
                    </button>
                </div>

                {/* Quick chips */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {HERO_CHIPS.map(chip => (
                        <button
                            key={chip.label}
                            onClick={() => setLocalPrompt(chip.prompt)}
                            className="bg-[#EEEDFE] text-[#534AB7] border border-[#AFA9EC] rounded-full text-xs px-3 py-1 font-medium"
                        >
                            {chip.label}
                        </button>
                    ))}
                </div>

            </motion.div>
        </motion.div>
    );
};
