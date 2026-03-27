import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, Save, Layout, Image, Layers, Type, Sparkles,
    Plus, Loader2, Zap, Check, RotateCcw, RotateCw, MoreHorizontal,
    Download, Share2, FilePlus,
} from 'lucide-react';
import { CardCanvas } from './CardCanvas';
import { SharedCardStudioProps, CardPage } from './types';
import { SKYWHALE_STICKERS, BACKGROUND_TEXTURES } from './data/stickers';
import { TEMPLATES } from './data/templates';

type Panel = 'templates' | 'background' | 'stickers' | 'text' | 'ai' | null;

export const CardStudioMobile: React.FC<SharedCardStudioProps> = (props) => {
    const { state, ai, selectedId, setSelectedId, stageRef, isSaving,
        onSave, onDownload, onShare, onNewProject, onGenerateAI, onAddText, onSelectTemplate, t } = props;

    const [activePanel, setActivePanel] = useState<Panel>(null);
    const [aiMode, setAiMode] = useState<'sticker' | 'background'>('sticker');
    const [aiPrompt, setAiPrompt] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [textEditor, setTextEditor] = useState<{
        text: string; color: string; fontSize: number; fontFamily: string;
    } | null>(null);

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
                    <button
                        onClick={state.undo}
                        disabled={!state.canUndo}
                        className={`min-w-[36px] min-h-[36px] flex items-center justify-center bg-white/10 rounded-full text-white transition-all ${!state.canUndo ? 'opacity-30 pointer-events-none' : ''}`}
                    >
                        <RotateCcw size={16} />
                    </button>
                    <button
                        onClick={state.redo}
                        disabled={!state.canRedo}
                        className={`min-w-[36px] min-h-[36px] flex items-center justify-center bg-white/10 rounded-full text-white transition-all ${!state.canRedo ? 'opacity-30 pointer-events-none' : ''}`}
                    >
                        <RotateCw size={16} />
                    </button>
                    <button
                        onClick={() => setShowMenu(true)}
                        className="min-w-[36px] min-h-[36px] flex items-center justify-center bg-white/10 rounded-full text-white"
                    >
                        <MoreHorizontal size={18} />
                    </button>
                </div>
            </header>

            {/* ── CANVAS AREA ── */}
            <div className="flex-1 bg-[#0d1117] relative flex flex-col items-center justify-center overflow-hidden"
                style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
            >
                {/* Card canvas — small portrait */}
                <div className="relative">
                    <div className="bg-white rounded-lg shadow-2xl overflow-hidden border border-white/10"
                        style={{ width: Math.min(window.innerWidth - 64, 200), height: Math.min(window.innerWidth - 64, 200) * 1.4 }}
                    >
                        <CardCanvas
                            items={currentPage?.items || []}
                            background={currentPage?.background || '#fffcf5'}
                            selectedId={selectedId}
                            onSelect={setSelectedId}
                            onUpdate={state.updateItem}
                            domRef={stageRef}
                        />
                    </div>
                    {/* Page label pill */}
                    <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 bg-[rgba(30,30,40,0.85)] text-white text-[10px] rounded-full px-3 py-1 font-bold uppercase tracking-wider whitespace-nowrap transition-opacity ${currentPage?.items.length > 0 ? 'opacity-0' : 'opacity-100'}`}>
                        {currentPage?.name}
                    </div>
                </div>
            </div>

            {/* ── PAGE STRIP ── */}
            <div className="shrink-0 bg-[#0d1117] border-t border-white/10 flex items-center px-3 gap-2 overflow-x-auto h-[88px] custom-scrollbar py-2">
                {state.pages.map((page: CardPage, i: number) => (
                    <button
                        key={page.id}
                        onClick={() => state.setFocusedPageIndex(i)}
                        className={`relative shrink-0 w-[52px] h-[72px] rounded-lg overflow-hidden transition-all ${state.focusedPageIndex === i
                            ? 'border-2 border-[#534AB7] ring-2 ring-[#534AB7]/30'
                            : 'border border-white/10'
                        }`}
                        style={{ backgroundColor: page.background?.startsWith('#') ? page.background : '#374151' }}
                    >
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
            <nav className="shrink-0 bg-white border-t border-gray-100 flex z-50">
                {([
                    { id: 'templates' as Panel, icon: Layout, label: 'Šablony' },
                    { id: 'background' as Panel, icon: Image, label: 'Pozadí' },
                    { id: 'stickers' as Panel, icon: Layers, label: 'Nálepky' },
                    { id: 'text' as Panel, icon: Type, label: 'Text' },
                    { id: 'ai' as Panel, icon: Sparkles, label: 'AI', accent: true },
                ]).map(({ id, icon: Icon, label, accent }) => {
                    const isActive = activePanel === id;
                    return (
                        <button
                            key={id}
                            onClick={() => setActivePanel(isActive ? null : id)}
                            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 min-h-[52px] ${accent && !isActive ? 'bg-[#EEEDFE]' : ''}`}
                        >
                            <Icon size={18} className={isActive ? 'text-[#534AB7]' : accent ? 'text-[#534AB7]' : 'text-gray-400'} />
                            <span className={`text-[10px] font-bold ${isActive ? 'text-[#534AB7]' : accent ? 'text-[#534AB7]' : 'text-gray-400'}`}>
                                {label}
                            </span>
                        </button>
                    );
                })}
            </nav>

            {/* ── PANELS ── */}
            <AnimatePresence>
                {activePanel && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-[80] bg-white flex flex-col"
                    >
                        {/* Panel header */}
                        <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                            <button onClick={() => setActivePanel(null)} className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-gray-100">
                                <ChevronLeft size={20} className="text-gray-600" />
                            </button>
                            <span className="text-base font-bold text-gray-800">
                                {activePanel === 'templates' && 'Šablony'}
                                {activePanel === 'background' && 'Pozadí'}
                                {activePanel === 'stickers' && 'Nálepky'}
                                {activePanel === 'text' && 'Text'}
                                {activePanel === 'ai' && 'AI generátor'}
                            </span>
                        </div>

                        {/* Panel content */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {activePanel === 'templates' && (
                                <TemplatesPanel onSelect={(tmpl) => { onSelectTemplate(tmpl); setActivePanel(null); }} t={t} />
                            )}
                            {activePanel === 'background' && (
                                <BackgroundPanel onSelect={(bg) => { state.setBackground(bg); setActivePanel(null); }} />
                            )}
                            {activePanel === 'stickers' && (
                                <StickersPanel
                                    onAdd={(content) => { state.addItem({ type: 'sticker', content, rotation: 0 }); setActivePanel(null); }}
                                    onOpenAI={() => setActivePanel('ai')}
                                />
                            )}
                            {activePanel === 'text' && (
                                <TextPanel onOpenEditor={(opts) => setTextEditor({ text: '', color: '#1a1a1a', ...opts })} />
                            )}
                            {activePanel === 'ai' && (
                                <AIPanel
                                    mode={aiMode}
                                    setMode={setAiMode}
                                    prompt={aiPrompt}
                                    setPrompt={setAiPrompt}
                                    isGenerating={ai.isGenerating}
                                    onGenerate={() => { onGenerateAI(aiPrompt, aiMode); setAiPrompt(''); setActivePanel(null); }}
                                />
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── OVERFLOW MENU ── */}
            <AnimatePresence>
                {showMenu && (
                    <>
                        <motion.div
                            className="fixed inset-0 bg-black/30 z-[90]"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowMenu(false)}
                        />
                        <motion.div
                            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-[91] pb-6"
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-4" />
                            <button
                                onClick={() => { onSave(); setShowMenu(false); }}
                                disabled={isSaving}
                                className="flex items-center gap-3 w-full px-5 py-3.5 text-left hover:bg-gray-50 active:bg-gray-100"
                            >
                                <Save size={18} className="text-gray-500" />
                                <span className="text-sm font-medium text-gray-800">Uložit</span>
                                {isSaving && <Loader2 size={14} className="animate-spin text-gray-400" />}
                            </button>
                            <button
                                onClick={() => { onDownload(); setShowMenu(false); }}
                                className="flex items-center gap-3 w-full px-5 py-3.5 text-left hover:bg-gray-50 active:bg-gray-100"
                            >
                                <Download size={18} className="text-gray-500" />
                                <span className="text-sm font-medium text-gray-800">Stáhnout PNG</span>
                            </button>
                            <button
                                onClick={() => { onShare(); setShowMenu(false); }}
                                className="flex items-center gap-3 w-full px-5 py-3.5 text-left hover:bg-gray-50 active:bg-gray-100"
                            >
                                <Share2 size={18} className="text-gray-500" />
                                <span className="text-sm font-medium text-gray-800">Sdílet</span>
                            </button>
                            <button
                                onClick={() => { onNewProject(); setShowMenu(false); }}
                                className="flex items-center gap-3 w-full px-5 py-3.5 text-left hover:bg-gray-50 active:bg-gray-100"
                            >
                                <FilePlus size={18} className="text-gray-500" />
                                <span className="text-sm font-medium text-gray-800">Nová karta</span>
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ── TEXT EDITOR BOTTOM SHEET ── */}
            <AnimatePresence>
                {textEditor && (
                    <TextEditorSheet
                        editor={textEditor}
                        onChange={setTextEditor}
                        onConfirm={() => {
                            if (textEditor.text.trim()) {
                                state.addItem({
                                    type: 'text',
                                    content: textEditor.text,
                                    color: textEditor.color,
                                    fontSize: textEditor.fontSize,
                                    fontFamily: textEditor.fontFamily,
                                });
                            }
                            setTextEditor(null);
                            setActivePanel(null);
                        }}
                        onClose={() => setTextEditor(null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

/* ───────────────────────────────────────────────
   TEMPLATES PANEL
   ─────────────────────────────────────────────── */
const TemplatesPanel: React.FC<{ onSelect: (t: any) => void; t: SharedCardStudioProps['t'] }> = ({ onSelect }) => (
    <div className="grid grid-cols-2 gap-3">
        {TEMPLATES.map(tmpl => (
            <button
                key={tmpl.id}
                onClick={() => onSelect(tmpl)}
                className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
                <div className="aspect-[3/4] overflow-hidden">
                    <img src={tmpl.thumbnail} alt={tmpl.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-2">
                    <span className="text-xs font-medium text-gray-700">{tmpl.name}</span>
                </div>
            </button>
        ))}
    </div>
);

/* ───────────────────────────────────────────────
   BACKGROUND PANEL
   ─────────────────────────────────────────────── */
const BackgroundPanel: React.FC<{ onSelect: (bg: string) => void }> = ({ onSelect }) => {
    const colors = BACKGROUND_TEXTURES.filter(b => b.type === 'color');
    const images = BACKGROUND_TEXTURES.filter(b => b.type === 'image');

    return (
        <div className="space-y-6">
            {/* Colors */}
            <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Barvy</h4>
                <div className="flex flex-wrap gap-2">
                    {colors.map(bg => (
                        <button
                            key={bg.id}
                            onClick={() => onSelect(bg.value)}
                            className="w-10 h-10 rounded-xl border-2 border-gray-200 hover:border-[#534AB7] transition-all shadow-sm"
                            style={{ backgroundColor: bg.value }}
                            title={bg.name}
                        />
                    ))}
                </div>
            </div>
            {/* Patterns */}
            <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Vzory</h4>
                <div className="grid grid-cols-2 gap-3">
                    {images.map(bg => (
                        <button
                            key={bg.id}
                            onClick={() => onSelect(bg.value)}
                            className="aspect-[4/3] rounded-xl overflow-hidden border-2 border-gray-100 hover:border-[#534AB7] transition-all shadow-sm"
                        >
                            <img src={bg.value} alt={bg.name} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

/* ───────────────────────────────────────────────
   STICKERS PANEL
   ─────────────────────────────────────────────── */
const StickersPanel: React.FC<{ onAdd: (content: string) => void; onOpenAI: () => void }> = ({ onAdd, onOpenAI }) => (
    <div className="grid grid-cols-4 gap-3">
        {SKYWHALE_STICKERS.map(s => (
            <button
                key={s.id}
                onClick={() => onAdd(s.content)}
                className="aspect-square flex items-center justify-center text-3xl bg-gray-50 rounded-xl border border-gray-100 hover:bg-[#EEEDFE] hover:border-[#AFA9EC] transition-all"
            >
                {s.content}
            </button>
        ))}
        {/* AI sticker generator shortcut */}
        <button
            onClick={onOpenAI}
            className="aspect-square flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-[#534AB7] hover:text-[#534AB7] transition-all"
        >
            <Plus size={24} />
        </button>
    </div>
);

/* ───────────────────────────────────────────────
   TEXT PANEL
   ─────────────────────────────────────────────── */
const TEXT_STYLES = [
    { label: 'Nadpis', preview: 'text-base font-bold', fontSize: 16, fontFamily: 'Inter' },
    { label: 'Tělo textu', preview: 'text-sm', fontSize: 13, fontFamily: 'Inter' },
    { label: 'Citát', preview: 'text-sm italic font-serif', fontSize: 13, fontFamily: 'Georgia' },
    { label: 'Popisek', preview: 'text-[10px] uppercase tracking-widest', fontSize: 10, fontFamily: 'Inter' },
];

const TextPanel: React.FC<{ onOpenEditor: (opts: { fontSize: number; fontFamily: string }) => void }> = ({ onOpenEditor }) => (
    <div className="space-y-2">
        {TEXT_STYLES.map(style => (
            <div key={style.label} className="flex items-center justify-between bg-gray-50 rounded-xl border border-gray-100 px-4 py-3">
                <div>
                    <span className={`text-gray-800 ${style.preview}`}>{style.label}</span>
                    <p className="text-[10px] text-gray-400 mt-0.5">{style.fontSize}px · {style.fontFamily}</p>
                </div>
                <button
                    onClick={() => onOpenEditor({ fontSize: style.fontSize, fontFamily: style.fontFamily })}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-[#EEEDFE] border border-[#AFA9EC] text-[#534AB7]"
                >
                    <Plus size={18} />
                </button>
            </div>
        ))}
    </div>
);

/* ───────────────────────────────────────────────
   TEXT EDITOR BOTTOM SHEET
   ─────────────────────────────────────────────── */
const EDITOR_COLORS = [
    { label: 'Černá', value: '#1a1a1a' },
    { label: 'Bílá', value: '#ffffff' },
    { label: 'Purple', value: '#534AB7' },
    { label: 'Červená', value: '#E24B4A' },
    { label: 'Zlatá', value: '#EF9F27' },
    { label: 'Modrá', value: '#185FA5' },
];
const EDITOR_SIZES = [
    { label: 'S', value: 12 },
    { label: 'M', value: 16 },
    { label: 'L', value: 24 },
];
const EDITOR_FONTS = ['Inter', 'Georgia', 'Fredoka'];

interface TextEditorSheetProps {
    editor: { text: string; color: string; fontSize: number; fontFamily: string };
    onChange: (e: { text: string; color: string; fontSize: number; fontFamily: string }) => void;
    onConfirm: () => void;
    onClose: () => void;
}

const TextEditorSheet: React.FC<TextEditorSheetProps> = ({ editor, onChange, onConfirm, onClose }) => (
    <>
        <motion.div
            className="fixed inset-0 bg-black/30 z-[90]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
        />
        <motion.div
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-[91] pb-6 max-h-[80vh] overflow-y-auto"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-4" />
            <div className="px-5 space-y-5">
                {/* Textarea */}
                <textarea
                    autoFocus
                    value={editor.text}
                    onChange={(e) => onChange({ ...editor, text: e.target.value })}
                    placeholder="Napiš svůj text..."
                    className="w-full min-h-[80px] border border-gray-200 rounded-xl p-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#534AB7]/30 focus:outline-none resize-none"
                    style={{ fontSize: editor.fontSize, fontFamily: editor.fontFamily, color: editor.color }}
                />

                {/* Size */}
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Velikost</label>
                    <div className="flex gap-2">
                        {EDITOR_SIZES.map(s => (
                            <button
                                key={s.label}
                                onClick={() => onChange({ ...editor, fontSize: s.value })}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${editor.fontSize === s.value
                                    ? 'bg-[#534AB7] text-white' : 'bg-gray-100 text-gray-600'}`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Color */}
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Barva</label>
                    <div className="flex gap-2">
                        {EDITOR_COLORS.map(c => (
                            <button
                                key={c.value}
                                onClick={() => onChange({ ...editor, color: c.value })}
                                className={`w-[28px] h-[28px] rounded-full border transition-all ${editor.color === c.value
                                    ? 'ring-2 ring-[#534AB7] ring-offset-1 border-transparent'
                                    : 'border-gray-200'}`}
                                style={{ backgroundColor: c.value }}
                                title={c.label}
                            />
                        ))}
                    </div>
                </div>

                {/* Font */}
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Písmo</label>
                    <div className="flex gap-2">
                        {EDITOR_FONTS.map(f => (
                            <button
                                key={f}
                                onClick={() => onChange({ ...editor, fontFamily: f })}
                                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${editor.fontFamily === f
                                    ? 'bg-[#EEEDFE] border border-[#AFA9EC] text-[#534AB7]'
                                    : 'bg-gray-100 border border-gray-100 text-gray-600'}`}
                                style={{ fontFamily: f }}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Confirm */}
                <button
                    onClick={onConfirm}
                    disabled={!editor.text.trim()}
                    className="w-full bg-[#534AB7] text-white rounded-xl py-3 font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <Check size={16} /> Přidat na kartu
                </button>
            </div>
        </motion.div>
    </>
);

/* ───────────────────────────────────────────────
   AI PANEL
   ─────────────────────────────────────────────── */
const AI_CHIPS = ['velryba', 'kytička', 'hvězda', 'dort', 'srdíčko'];

interface AIPanelProps {
    mode: 'sticker' | 'background';
    setMode: (m: 'sticker' | 'background') => void;
    prompt: string;
    setPrompt: (p: string) => void;
    isGenerating: boolean;
    onGenerate: () => void;
}

const AIPanel: React.FC<AIPanelProps> = ({ mode, setMode, prompt, setPrompt, isGenerating, onGenerate }) => (
    <div className="space-y-5">
        {/* Tab switcher */}
        <div className="flex bg-gray-100 rounded-xl p-1">
            <button
                onClick={() => setMode('sticker')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-1 transition-all ${mode === 'sticker' ? 'bg-white text-[#534AB7] shadow-sm' : 'text-gray-500'}`}
            >
                Nálepka <Zap size={12} className="text-amber-500" /> 5
            </button>
            <button
                onClick={() => setMode('background')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-1 transition-all ${mode === 'background' ? 'bg-white text-[#534AB7] shadow-sm' : 'text-gray-500'}`}
            >
                Pozadí <Zap size={12} className="text-amber-500" /> 5
            </button>
        </div>

        {/* Prompt input */}
        <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Prompt</label>
            <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={mode === 'sticker' ? 'Popiš nálepku…' : 'Popiš pozadí…'}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:ring-2 focus:ring-[#534AB7]/30 focus:outline-none"
                onKeyDown={(e) => { if (e.key === 'Enter' && prompt.trim()) onGenerate(); }}
            />
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-2">
            {AI_CHIPS.map(chip => (
                <button
                    key={chip}
                    onClick={() => setPrompt(chip)}
                    className="bg-[#EEEDFE] text-[#534AB7] border border-[#AFA9EC] rounded-full text-xs px-3 py-1 font-medium"
                >
                    {chip}
                </button>
            ))}
        </div>

        {/* Generate button */}
        <button
            onClick={onGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-[#534AB7] text-white rounded-xl px-4 py-3 font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
            {isGenerating ? (
                <><Loader2 size={16} className="animate-spin" /> Generuji…</>
            ) : (
                <><Sparkles size={16} /> Generovat {mode === 'sticker' ? 'nálepku' : 'pozadí'}</>
            )}
        </button>
    </div>
);
