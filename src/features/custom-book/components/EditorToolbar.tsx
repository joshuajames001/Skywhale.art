import React from 'react';
import { ChevronLeft, Mic, Palette, Zap, Download, Save, Plus, Loader2 } from 'lucide-react';
import { VOICE_OPTIONS } from '../../../lib/audio-constants';
import { VoicePreviewButton } from '../../../components/audio/VoicePreviewButton';
import { STYLE_PROMPTS } from '../../../lib/ai';
import { useTranslation } from 'react-i18next';

export const EditorToolbar = ({ state, actions, refs, onBack, t }: any) => {
    return (
        <header className="h-auto md:h-16 flex flex-col md:flex-row items-center justify-between px-4 py-2 md:py-0 bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50 shrink-0 shadow-sm relative gap-2">
            {/* Left: Back & Title */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
                <button
                    onClick={onBack}
                    className="p-2 bg-white/20 hover:bg-white/40 rounded-full transition-all text-white shadow-sm hover:scale-105"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="flex flex-col flex-1 mx-2">
                    <div className="flex items-center gap-2">
                        <input
                            id="editor-title-input"
                            type="text"
                            value={state.bookTitle}
                            onChange={(e) => actions.setBookTitle(e.target.value)}
                            className="bg-transparent text-base md:text-lg font-bold text-white focus:outline-none focus:ring-2 focus:ring-white/50 rounded px-2 -ml-2 transition-all w-full md:w-64 placeholder-white/70 drop-shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-white/80 uppercase tracking-widest font-bold ml-1 hidden sm:inline">{t('library.custom_book_editor.subtitle')}</span>

                        {/* Voice Selector */}
                        <div className="relative group">
                            <Mic size={14} className={`absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none ${state.selectedVoice ? 'text-white/70' : 'text-white/30'}`} />
                            <select
                                value={state.selectedVoice}
                                onChange={(e) => actions.setSelectedVoice(e.target.value)}
                                className={`bg-white/10 text-white text-xs rounded pl-7 pr-2 py-1 outline-none border border-white/10 cursor-pointer hover:bg-white/20 transition-colors appearance-none ${!state.selectedVoice && 'text-white/50 italic'}`}
                            >
                                <option value="" className="text-stone-500 bg-white italic">{t('library.custom_book_editor.voice_none')}</option>
                                {VOICE_OPTIONS.map(v => (
                                    <option key={v.id} value={v.id} className="text-stone-900 bg-white">
                                        {v.emoji} {v.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Selected Voice Preview */}
                        {state.selectedVoice && (
                            <VoicePreviewButton
                                previewUrl={VOICE_OPTIONS.find((v: any) => v.id === state.selectedVoice)?.previewUrl || ''}
                                isActive={true}
                            />
                        )}

                        {/* Style Selector */}
                        <div className="relative group">
                            <Palette size={14} className={`absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none text-white/70`} />
                            <select
                                value={state.selectedStyle}
                                onChange={(e: any) => actions.setSelectedStyle(e.target.value)}
                                className="bg-white/10 text-white text-xs rounded pl-7 pr-2 py-1 outline-none border border-white/10 cursor-pointer hover:bg-white/20 transition-colors appearance-none max-w-[100px] md:max-w-none"
                            >
                                {/* Priority Styles first */}
                                <option value="Pixar 3D" className="text-stone-900 bg-white">📽️ Pixar 3D</option>
                                <option value="watercolor" className="text-stone-900 bg-white">🎨 Watercolor</option>
                                <option value="ghibli_anime" className="text-stone-900 bg-white">🍃 Ghibli Anime</option>
                                <option value="illustration" className="text-stone-900 bg-white">✏️ Illustration</option>

                                {/* Other Styles from constant (filtering out duplicates/priority ones) */}
                                {Object.keys(STYLE_PROMPTS)
                                    .filter(k => !['Pixar 3D', 'watercolor', 'Watercolor', 'ghibli_anime', 'illustration'].includes(k))
                                    .map(styleKey => (
                                        <option key={styleKey} value={styleKey} className="text-stone-900 bg-white">
                                            🖌️ {styleKey.replace(/_/g, ' ')}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>

                        <select
                            value={state.maxPages}
                            onChange={(e) => actions.setMaxPages(Number(e.target.value))}
                            className="bg-white/10 text-white text-xs rounded px-2 py-1 outline-none border border-white/10 cursor-pointer hover:bg-white/20 transition-colors"
                        >
                            <option value={10} className="text-stone-900 bg-white">{t('library.custom_book_editor.pages_count', { count: 10 })}</option>
                            <option value={15} className="text-stone-900 bg-white">{t('library.custom_book_editor.pages_count', { count: 15 })}</option>
                            <option value={25} className="text-stone-900 bg-white">{t('library.custom_book_editor.pages_count', { count: 25 })}</option>
                        </select>
                        <div title="Cena audia: 1 ⚡ / 20 znaků (zde odhad)" className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border shadow-[0_0_10px_rgba(245,158,11,0.2)] ${state.magicMirrorUrl ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'}`}>
                            <Zap size={10} fill="currentColor" />
                            {(state.maxPages + 1) * state.costPerImage + (state.selectedVoice ? state.maxPages * 20 : 0)} ⚡
                        </div>
                    </div>
                </div>
                {/* Mobile Only: Save Icon */}
                <div className="flex items-center gap-2 md:hidden">
                    {/* Export PDF Button Mobile */}
                    <button
                        onClick={actions.handleExportPdf}
                        disabled={state.isUploading}
                        title="Stáhnout PDF"
                        className="p-2.5 bg-white/10 backdrop-blur-md rounded-full text-white/80 border border-white/20 shadow-lg hover:bg-white/20 transition-all active:scale-95"
                    >
                        {state.isUploading && state.pdfProgress ? (
                            <div className="flex items-center justify-center w-6 h-6 relative">
                                <Loader2 size={16} className="animate-spin absolute" />
                                <span className="text-[8px] font-bold z-10 pt-4">{Math.round((state.pdfProgress.current / state.pdfProgress.total) * 100)}%</span>
                            </div>
                        ) : (
                            <Download size={18} />
                        )}
                    </button>

                    <button
                        onClick={() => actions.startGuide('custom_book_editor_welcome')}
                        className="p-2.5 bg-white/10 backdrop-blur-md rounded-full text-white/50 border border-white/20 shadow-lg hover:bg-white/20 hover:text-white transition-all active:scale-95"
                        title={t('library.custom_book_editor.tooltip_help')}
                    >
                        <span className="font-bold text-lg">?</span>
                    </button>

                    <button
                        onClick={() => actions.handleSave(false)}
                        title={t('library.custom_book_editor.tooltip_save')}
                        className="p-2.5 bg-white/10 backdrop-blur-md rounded-full text-white/80 border border-white/20 shadow-lg transition-all hover:scale-110 active:scale-95 disabled:opacity-50 hover:bg-white/20"
                        disabled={state.saving}
                    >
                        {state.saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    </button>
                </div>
            </div>

            {/* Action Buttons (Desktop: Right, Mobile: Bottom/Flex) */}
            <div className="w-full md:w-auto pointer-events-auto flex items-center justify-between md:justify-end gap-2 md:gap-4 mt-1 md:mt-0 relative z-50">

                {/* Magic Mirror Toggle / Upload */}
                <div className="relative group">
                    <input
                        type="file"
                        ref={refs?.magicMirrorInputRef}
                        onChange={actions.handleMagicMirrorUpload}
                        accept="image/*"
                        className="hidden"
                    />
                    <button
                        onClick={() => refs?.magicMirrorInputRef.current?.click()}
                        className={`hidden md:flex items-center justify-center w-10 h-10 backdrop-blur-md rounded-full border transition-all hover:scale-110 active:scale-95 shadow-lg ${state.magicMirrorUrl ? 'bg-purple-500 text-white border-purple-400 ring-2 ring-purple-500/30' : 'bg-white/10 text-white/50 border-white/20 hover:bg-white/20 hover:text-white'}`}
                        title={t('library.custom_book_editor.tooltips.magic_mirror') || "Magic Mirror (Face Training)"}
                    >
                        <span className="text-xl">🪞</span>
                    </button>
                    {state.magicMirrorUrl && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-stone-900" />
                    )}
                </div>

                <div className="hidden md:block h-8 w-px bg-white/10" />

                <button
                    onClick={() => actions.startGuide('custom_book_editor_welcome')}
                    className="hidden md:flex items-center justify-center w-10 h-10 bg-white/10 backdrop-blur-md rounded-full text-white/50 border border-white/20 transition-all hover:scale-110 active:scale-95 hover:bg-white/20 hover:text-white shadow-lg"
                    title="Nápověda"
                >
                    <span className="font-bold text-lg">?</span>
                </button>

                <button
                    onClick={actions.handleNewBook}
                    className="hidden md:flex items-center justify-center w-10 h-10 bg-white/10 backdrop-blur-md rounded-full text-red-400 border border-white/20 transition-all hover:scale-110 active:scale-95 hover:bg-white/20 hover:text-red-500 shadow-lg group"
                    title={t('library.custom_book_editor.tooltip_new_book')}
                >
                    <Plus size={20} className="rotate-45 group-hover:text-red-500 transition-colors" strokeWidth={3} />
                </button>

                <button
                    onClick={actions.handleExportPdf}
                    disabled={state.isUploading}
                    title="Stáhnout PDF"
                    className="hidden md:flex items-center justify-center p-2.5 bg-white/10 backdrop-blur-md rounded-full text-white/80 border border-white/20 transition-all hover:scale-110 active:scale-95 hover:bg-white/20 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
                >
                    {state.isUploading && state.pdfProgress ? (
                        <div className="flex items-center justify-center w-6 h-6 relative">
                            <Loader2 size={16} className="animate-spin absolute" />
                            <span className="text-[8px] font-bold z-10 pt-4">{Math.round((state.pdfProgress.current / state.pdfProgress.total) * 100)}%</span>
                        </div>
                    ) : (
                        <Download size={18} />
                    )}
                </button>

                <button
                    onClick={() => actions.handleSave(false)}
                    disabled={state.saving || state.isGeneratingImage || state.isUploading || state.isUploadingMirror || state.geminiLoading}
                    title="Uložit"
                    className="hidden md:flex items-center justify-center p-2.5 bg-white/10 backdrop-blur-md rounded-full text-white/80 border border-white/20 transition-all hover:scale-110 active:scale-95 hover:bg-white/20 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
                >
                    {state.saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                </button>
            </div>
        </header>
    );
};
