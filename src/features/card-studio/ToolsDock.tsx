import { Image, Layers, Type, Sparkles, Layout, X, ChevronLeft, ChevronRight, Languages, Book, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCardStudio } from './CardStudioContext';
import { clsx } from 'clsx';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useState } from 'react';
import { TEMPLATES } from './data/templates';
import { TextToolsSection } from './components/tools/TextToolsSection';
import { ImageToolsSection } from './components/tools/ImageToolsSection';
import { StickerToolsSection } from './components/tools/StickerToolsSection';
import { DictionaryPanel } from './components/tools/DictionaryPanel';

interface ToolsDockProps {
    activeTool: 'background' | 'stickers' | 'text' | 'ai' | 'templates' | null;
    onToolChange: (tool: 'background' | 'stickers' | 'text' | 'ai' | 'templates' | null) => void;
    onAddSticker: (sticker: any) => void;
    stickers: any[];
    onGenerateAI?: (prompt: string, mode: 'sticker' | 'background') => void;
    isGenerating?: boolean;
    onAddText: (text: string) => void;
    onChangeBackground: (bg: string) => void;
    textColor?: string;
    textFont?: string;
    onTextColorChange?: (color: string) => void;
    onTextFontChange?: (font: string) => void;
    onSelectTemplate?: (template: any) => void;
    isMobile?: boolean;
}

export const ToolsDock = ({ activeTool, onToolChange, onAddSticker, stickers, onGenerateAI, isGenerating,
    onAddText, onChangeBackground, textColor, textFont, onTextColorChange, onTextFontChange, onSelectTemplate }: ToolsDockProps) => {
    const { t } = useTranslation();
    const { onDictionaryLookup, onTranslate } = useCardStudio();
    const [aiPrompt, setAiPrompt] = useState('');
    const [showDictionary, setShowDictionary] = useState(false);
    const [dictionaryQuery, setDictionaryQuery] = useState('');
    const [dictionaryResult, setDictionaryResult] = useState<any>(null);
    const [isSearchingDict, setIsSearchingDict] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const dragControls = useDragControls();

    const handleTranslate = async () => {
        if (!aiPrompt.trim()) return;
        setIsTranslating(true);
        try { const r = await onTranslate(aiPrompt); if (r) setAiPrompt(r); }
        catch (e) { console.error('Translation failed', e); }
        finally { setIsTranslating(false); }
    };
    const handleSearchDict = async () => {
        if (!dictionaryQuery.trim()) return;
        setIsSearchingDict(true);
        try { setDictionaryResult(await onDictionaryLookup(dictionaryQuery)); }
        catch (e) { console.error('Dictionary search failed', e); }
        finally { setIsSearchingDict(false); }
    };
    const handleGenerate = (mode: 'sticker' | 'background') => { if (onGenerateAI && aiPrompt.trim()) onGenerateAI(aiPrompt, mode); };
    const closeDrawer = () => onToolChange(null);

    const tools = [
        { id: 'templates' as const, icon: Layout, label: t('tools.templates') },
        { id: 'background' as const, icon: Image, label: t('tools.background') },
        { id: 'stickers' as const, icon: Layers, label: t('tools.stickers') },
        { id: 'text' as const, icon: Type, label: t('tools.text') },
        { id: 'ai' as const, icon: Sparkles, label: t('tools.ai') },
    ];

    const renderContent = () => {
        switch (activeTool) {
            case 'templates': return (
                <div className="flex flex-col gap-4 pb-8">{TEMPLATES.map(tpl => (
                    <button key={tpl.id} onClick={() => onSelectTemplate?.(tpl)} className="group relative w-full aspect-[2/1] rounded-xl overflow-hidden border border-white/10 hover:border-indigo-500/50 transition-all">
                        <img src={tpl.thumbnail} alt={tpl.name} className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-end p-3"><span className="text-white font-medium text-sm">{tpl.name}</span></div>
                    </button>))}</div>);
            case 'background': return <ImageToolsSection onChangeBackground={onChangeBackground} />;
            case 'stickers': return <StickerToolsSection onAddSticker={onAddSticker} stickerList={stickers} />;
            case 'text': return <TextToolsSection onAddText={onAddText} textFont={textFont} onUpdateFont={onTextFontChange} textColor={textColor} onUpdateColor={onTextColorChange} />;
            case 'ai': return (
                <div className="flex flex-col gap-4 pb-8 relative">
                    <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder={t('tools.ai_placeholder')}
                        className="w-full h-24 bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none resize-none" />
                    <div className="flex flex-col gap-2">
                        <button onClick={() => handleGenerate('sticker')} disabled={isGenerating || !aiPrompt}
                            className="py-3 bg-indigo-600 rounded-xl text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 group overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            {isGenerating ? <Sparkles size={16} className="animate-spin" /> : <Layers size={16} />} {t('tools.create_sticker')}
                        </button>
                        <button onClick={() => handleGenerate('background')} disabled={isGenerating || !aiPrompt}
                            className="py-3 bg-slate-700 rounded-xl text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2">
                            {isGenerating ? <Sparkles size={16} className="animate-spin" /> : <Image size={16} />} {t('tools.create_background')}
                        </button>
                    </div>
                </div>);
            default: return null;
        }
    };

    const ActiveIcon = tools.find(tl => tl.id === activeTool)?.icon;

    return (
        <>
            <AnimatePresence>
                {activeTool && (
                    <motion.div className="fixed bottom-[90px] left-0 right-0 md:left-16 md:top-0 md:bottom-0 md:my-auto md:h-[400px] md:w-[350px] md:shadow-2xl md:z-[9998]"
                        initial={{ y: '110%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '110%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }} drag="y" dragControls={dragControls} dragListener={false}
                        dragConstraints={{ top: 0, bottom: 500 }} dragElastic={0.2} onDragEnd={(_, info) => { if (info.offset.y > 50 || info.velocity.y > 200) closeDrawer(); }}>
                        <div className="md:hidden flex flex-col bg-[#1a1a2e] rounded-t-3xl shadow-[0_-10px_60px_rgba(0,0,0,0.8)] border-t border-white/10 h-[50vh]">
                            <div className="w-full h-14 flex items-center justify-center pt-4 cursor-grab active:cursor-grabbing touch-none z-[100]"
                                onPointerDown={e => dragControls.start(e)}><div className="w-16 h-1.5 bg-white/20 rounded-full" /></div>
                            <button onClick={closeDrawer} className="absolute top-4 right-6 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white z-[101]"><X size={24} /></button>
                            <div className="overflow-y-auto p-4 custom-scrollbar flex-1 pb-16 touch-pan-y">{renderContent()}</div>
                        </div>
                        <div className="hidden md:flex flex-col bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-[2rem] h-[400px] shadow-2xl relative overflow-hidden">
                            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                    {ActiveIcon && <ActiveIcon size={20} className="text-indigo-400" />}
                                    <span className="mr-2">{tools.find(tl => tl.id === activeTool)?.label}</span>
                                    {activeTool === 'ai' && (
                                        <div className="flex gap-1.5 animate-in fade-in slide-in-from-left-2">
                                            <button onClick={() => setShowDictionary(!showDictionary)}
                                                className={clsx('p-1 rounded-md border transition-all hover:scale-105 flex items-center gap-1 px-1.5', showDictionary ? 'bg-amber-500 text-black border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-white/5 text-amber-500 border-amber-500/30 hover:bg-white/10')}
                                                title={t('ai_studio.dictionary_tooltip')}><Book size={10} /><span className="text-[8px] uppercase font-black tracking-widest hidden sm:inline">{t('ai_studio.dictionary')}</span></button>
                                            <button onClick={handleTranslate} disabled={isTranslating || !aiPrompt}
                                                className="p-1 rounded-md border transition-all hover:scale-105 flex items-center gap-1 px-1.5 bg-white/5 text-indigo-400 border-indigo-500/30 hover:bg-white/10 disabled:opacity-30"
                                                title={t('ai_studio.translate_tooltip')}>{isTranslating ? <Loader2 size={10} className="animate-spin" /> : <Languages size={10} />}<span className="text-[8px] uppercase font-black tracking-widest hidden sm:inline">{t('ai_studio.translate')}</span></button>
                                        </div>)}
                                </h3>
                                <button onClick={closeDrawer} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
                            </div>
                            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">{renderContent()}</div>
                        </div>
                    </motion.div>)}
            </AnimatePresence>

            <AnimatePresence>
                {showDictionary && <DictionaryPanel query={dictionaryQuery} onQueryChange={setDictionaryQuery} result={dictionaryResult}
                    isSearching={isSearchingDict} onSearch={handleSearchDict} onInsertWord={w => setAiPrompt(p => p ? `${p}, ${w}` : w)} onClose={() => setShowDictionary(false)} />}
            </AnimatePresence>

            <div className="fixed bottom-0 left-0 right-0 h-20 bg-[#111111]/95 backdrop-blur-xl border-t border-white/10 z-[99999] flex items-center justify-center shadow-[0_-5px_20px_rgba(0,0,0,0.5)] pb-safe-offset-0">
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black via-black/80 to-transparent pointer-events-none md:hidden z-10 flex items-center justify-start pl-1"><div className="animate-pulse text-white/30"><ChevronLeft size={20} /></div></div>
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black via-black/80 to-transparent pointer-events-none md:hidden z-10 flex items-center justify-end pr-1"><div className="animate-pulse text-white/50"><ChevronRight size={20} /></div></div>
                <div className="flex items-center gap-4 md:gap-8 px-8 h-full overflow-x-auto no-scrollbar max-w-4xl mx-auto w-full md:w-auto md:justify-center">
                    {tools.map(tool => (
                        <button key={tool.id} onClick={() => onToolChange(activeTool === tool.id ? null : tool.id)}
                            className={clsx('relative flex flex-col items-center justify-center h-full gap-1 transition-all active:scale-95 shrink-0 px-2 group min-w-[60px]', activeTool === tool.id ? 'text-indigo-400' : 'text-slate-400 hover:text-white')}>
                            <div className={clsx('p-2 rounded-xl transition-all duration-300', activeTool === tool.id ? 'bg-indigo-500/20 translate-y-[-4px]' : 'bg-transparent group-hover:bg-white/5')}>
                                <tool.icon size={26} className={clsx('transition-transform', activeTool === tool.id ? 'scale-110' : '')} />
                            </div>
                            <span className={clsx('text-[10px] font-bold leading-none uppercase tracking-wide transition-opacity', activeTool === tool.id ? 'opacity-100' : 'opacity-60 group-hover:opacity-100')}>{tool.label}</span>
                            {activeTool === tool.id && <motion.div layoutId="active-indicator" className="absolute bottom-2 w-1 h-1 rounded-full bg-indigo-500" />}
                        </button>))}
                </div>
            </div>
        </>
    );
};
