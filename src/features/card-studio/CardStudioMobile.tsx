import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, Layout, Image, Layers, Type, Sparkles,
    RotateCcw, RotateCw, MoreHorizontal, BookOpen,
    LucideIcon,
} from 'lucide-react';
import { CardCanvas } from './CardCanvas';
import { SharedCardStudioProps, CardPage } from './types';
import { Panel, TextEditorState } from './mobile/types';
import { TemplatesPanel } from './mobile/panels/TemplatesPanel';
import { BackgroundPanel } from './mobile/panels/BackgroundPanel';
import { StickersPanel } from './mobile/panels/StickersPanel';
import { TextPanel } from './mobile/panels/TextPanel';
import { AiPanel } from './mobile/panels/AiPanel';
import { DictionaryPanel } from './mobile/panels/DictionaryPanel';
import { TextEditorSheet } from './mobile/sheets/TextEditorSheet';
import { OverflowMenuSheet } from './mobile/sheets/OverflowMenuSheet';

const PANEL_TITLES: Record<Exclude<Panel, null>, string> = {
    templates: 'Šablony', background: 'Pozadí', stickers: 'Nálepky',
    text: 'Text', dictionary: 'Slovník', ai: 'AI generátor',
};

const TOOLBAR_ITEMS: { id: Exclude<Panel, null>; icon: LucideIcon; label: string; accent?: boolean }[] = [
    { id: 'templates', icon: Layout, label: 'Šablony' },
    { id: 'background', icon: Image, label: 'Pozadí' },
    { id: 'stickers', icon: Layers, label: 'Nálepky' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'dictionary', icon: BookOpen, label: 'Slovník' },
    { id: 'ai', icon: Sparkles, label: 'AI', accent: true },
];

export const CardStudioMobile: React.FC<SharedCardStudioProps> = (props) => {
    const { state, ai, selectedId, setSelectedId, stageRef, isSaving,
        onSave, onDownload, onShare, onNewProject, onGenerateAI, onAddText, onSelectTemplate, t } = props;

    const [activePanel, setActivePanel] = useState<Panel>(null);
    const [aiMode, setAiMode] = useState<'sticker' | 'background'>('sticker');
    const [aiPrompt, setAiPrompt] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [textEditor, setTextEditor] = useState<TextEditorState | null>(null);

    const currentPage = state.pages[state.focusedPageIndex];

    return (
        <>
            {/* ── TOP BAR ── */}
            <header className="shrink-0 flex items-center justify-between px-3 py-2 bg-[#0d1117] border-b border-white/10 z-50">
                <button onClick={() => window.history.back()} className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-white/10 rounded-full text-white">
                    <ChevronLeft size={20} />
                </button>
                <div className="flex flex-col items-center gap-1 flex-1 mx-2">
                    <span className="text-xs font-bold text-white/90 truncate max-w-[160px]">
                        {currentPage?.name || 'Přáníčko'}
                    </span>
                    <div className="flex gap-1.5">
                        {state.pages.map((_: CardPage, i: number) => (
                            <button
                                key={i}
                                onClick={() => state.setFocusedPageIndex(i)}
                                className={`w-2 h-2 rounded-full transition-all ${state.focusedPageIndex === i ? 'bg-[#534AB7] scale-125' : 'bg-white/30'}`}
                            />
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <button onClick={state.undo} disabled={!state.canUndo}
                        className={`min-w-[36px] min-h-[36px] flex items-center justify-center bg-white/10 rounded-full text-white transition-all ${!state.canUndo ? 'opacity-30 pointer-events-none' : ''}`}>
                        <RotateCcw size={16} />
                    </button>
                    <button onClick={state.redo} disabled={!state.canRedo}
                        className={`min-w-[36px] min-h-[36px] flex items-center justify-center bg-white/10 rounded-full text-white transition-all ${!state.canRedo ? 'opacity-30 pointer-events-none' : ''}`}>
                        <RotateCw size={16} />
                    </button>
                    <button onClick={() => setShowMenu(true)}
                        className="min-w-[36px] min-h-[36px] flex items-center justify-center bg-white/10 rounded-full text-white">
                        <MoreHorizontal size={18} />
                    </button>
                </div>
            </header>

            {/* ── CANVAS AREA ── */}
            <div className="flex-1 bg-[#0d1117] relative flex flex-col items-center justify-center overflow-hidden"
                style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                <div className="relative">
                    <div className="bg-[#fffef8] rounded-lg shadow-2xl shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden border border-white/10 relative"
                        style={{ width: Math.min(window.innerWidth - 64, 200), height: Math.min(window.innerWidth - 64, 200) * 1.4 }}>
                        <CardCanvas items={currentPage?.items || []} background={currentPage?.background || '#fffef8'}
                            selectedId={selectedId} onSelect={setSelectedId} onUpdate={state.updateItem} domRef={stageRef} />
                        {(currentPage?.items.length ?? 0) === 0 && (
                            <div className="absolute inset-[10px] border border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 pointer-events-none">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2L13.8 8.2H20.2L14.9 11.8L16.7 18L12 14.4L7.3 18L9.1 11.8L3.8 8.2H10.2Z" fill="#E2D9F3" stroke="#AFA9EC" strokeWidth="1"/>
                                </svg>
                                <span className="text-[10px] text-[#AFA9EC]">Přidej text nebo nálepku</span>
                            </div>
                        )}
                    </div>
                    <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 bg-[rgba(30,30,40,0.85)] text-white text-[10px] rounded-full px-3 py-1 font-bold uppercase tracking-wider whitespace-nowrap transition-opacity ${currentPage?.items.length > 0 ? 'opacity-0' : 'opacity-100'}`}>
                        {currentPage?.name}
                    </div>
                </div>
            </div>

            {/* ── PAGE STRIP ── */}
            <div className="shrink-0 bg-[#0d1117] border-t border-white/10 flex items-center px-3 gap-2 overflow-x-auto h-[88px] custom-scrollbar py-2">
                {state.pages.map((page: CardPage, i: number) => (
                    <button key={page.id} onClick={() => state.setFocusedPageIndex(i)}
                        className={`relative shrink-0 w-[52px] h-[72px] rounded-lg overflow-hidden transition-all ${state.focusedPageIndex === i ? 'border-2 border-[#534AB7] ring-2 ring-[#534AB7]/30' : 'border border-white/10'}`}
                        style={{ backgroundColor: page.background?.startsWith('#') ? page.background : '#374151' }}>
                        <span className="absolute top-0.5 left-1 text-[7px] font-bold text-white/50 z-10">{i + 1}</span>
                        {page.items.length > 0 && (
                            <div className="absolute inset-0 flex items-center justify-center text-[18px] opacity-60">
                                {page.items[0]?.type === 'sticker' ? page.items[0].content : '📝'}
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {/* ── BOTTOM TOOLBAR ── */}
            <nav className="shrink-0 bg-white border-t border-gray-100 flex overflow-x-auto z-50">
                {TOOLBAR_ITEMS.map(({ id, icon: Icon, label, accent }) => {
                    const isActive = activePanel === id;
                    return (
                        <button key={id} onClick={() => setActivePanel(isActive ? null : id)}
                            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 min-h-[52px] ${accent && !isActive ? 'bg-[#EEEDFE]' : ''}`}>
                            <Icon size={18} className={isActive ? 'text-[#534AB7]' : accent ? 'text-[#534AB7]' : 'text-gray-400'} />
                            <span className={`text-[10px] font-bold ${isActive ? 'text-[#534AB7]' : accent ? 'text-[#534AB7]' : 'text-gray-400'}`}>{label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* ── PANELS ── */}
            <AnimatePresence>
                {activePanel && (
                    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-[80] bg-white flex flex-col">
                        <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                            <button onClick={() => setActivePanel(null)} className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-gray-100">
                                <ChevronLeft size={20} className="text-gray-600" />
                            </button>
                            <span className="text-base font-bold text-gray-800">{PANEL_TITLES[activePanel]}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            {activePanel === 'templates' && <TemplatesPanel onSelect={(tmpl) => { onSelectTemplate(tmpl); setActivePanel(null); }} />}
                            {activePanel === 'background' && <BackgroundPanel onSelect={(bg) => { state.setBackground(bg); setActivePanel(null); }} />}
                            {activePanel === 'stickers' && <StickersPanel onAdd={(c) => { state.addItem({ type: 'sticker', content: c, rotation: 0 }); setActivePanel(null); }} onOpenAI={() => { setAiMode('sticker'); setActivePanel('ai'); }} />}
                            {activePanel === 'text' && <TextPanel onOpenEditor={(opts) => setTextEditor({ text: '', color: '#1a1a1a', ...opts })} />}
                            {activePanel === 'dictionary' && <DictionaryPanel />}
                            {activePanel === 'ai' && <AiPanel mode={aiMode} setMode={setAiMode} prompt={aiPrompt} setPrompt={setAiPrompt} isGenerating={ai.isGenerating} onGenerate={() => { onGenerateAI(aiPrompt, aiMode); setAiPrompt(''); setActivePanel(null); }} />}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── OVERFLOW MENU ── */}
            <AnimatePresence>
                {showMenu && <OverflowMenuSheet isSaving={isSaving} onSave={onSave} onDownload={onDownload} onShare={onShare} onNewProject={onNewProject} onClose={() => setShowMenu(false)} />}
            </AnimatePresence>

            {/* ── TEXT EDITOR ── */}
            <AnimatePresence>
                {textEditor && (
                    <TextEditorSheet editor={textEditor} onChange={setTextEditor}
                        onConfirm={() => {
                            if (textEditor.text.trim()) {
                                state.addItem({ type: 'text', content: textEditor.text, color: textEditor.color, fontSize: textEditor.fontSize, fontFamily: textEditor.fontFamily });
                            }
                            setTextEditor(null); setActivePanel(null);
                        }}
                        onClose={() => setTextEditor(null)} />
                )}
            </AnimatePresence>
        </>
    );
};
