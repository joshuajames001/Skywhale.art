import React from 'react';
import { Cloud, Feather, Book, GraduationCap, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const WriterPanel = ({ state, actions, t }: any) => {
    return (
        <div className="flex-1 bg-[#fdfbf7] text-stone-900 relative flex flex-col border-b md:border-b-0 md:border-r border-stone-200/50 h-1/2 md:h-full">
            {/* Background Decorations (Left) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
                <Cloud className="absolute top-8 left-8 text-indigo-50/80 w-32 h-32 fill-indigo-50/50 opacity-50 md:opacity-100" />
            </div>

            {/* Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-12 custom-scrollbar z-10 relative">
                <div className="w-full h-full min-h-[200px] md:min-h-[500px] flex flex-col relative">
                    <div className="flex items-center justify-between mb-4 md:mb-8 shrink-0">
                        <span className="text-[10px] md:text-xs font-bold tracking-widest text-stone-300 uppercase select-none">
                            {state.currentPage.isCover ? t('library.custom_book_editor.title_page') : t('library.custom_book_editor.page_number', { number: state.currentPageIndex })}
                        </span>
                        <button
                            id="gemini-assist-btn"
                            onClick={actions.handleGeminiAssist}
                            disabled={state.geminiLoading}
                            className={`p-2 md:p-3 rounded-full transition-all group shadow-sm ${state.geminiLoading ? 'bg-purple-100 text-purple-400' : 'bg-white hover:bg-purple-50 text-stone-400 hover:text-purple-600 border border-stone-100 hover:border-purple-200 hover:shadow-md'}`}
                            title="Gemini Asistent"
                        >
                            {state.geminiLoading ? <Loader2 size={16} className="animate-spin" /> : <Feather size={16} className="group-hover:animate-pulse" />}
                        </button>

                        {/* DICTIONARY TOGGLE */}
                        <div className="h-4 w-px bg-stone-200 mx-2" />
                        <button
                            onClick={() => actions.setShowDictionary(!state.showDictionary)}
                            className={`p-2 md:p-3 rounded-full transition-all group shadow-sm ${state.showDictionary ? 'bg-amber-100 text-amber-600 ring-2 ring-amber-200' : 'bg-white hover:bg-amber-50 text-stone-400 hover:text-amber-500 border border-stone-100'}`}
                            title="Magičtinář (Slovník)"
                        >
                            <Book size={16} />
                        </button>

                        {/* EXPERT MODE TOGGLE */}
                        <button
                            onClick={() => actions.setIsExpertMode(!state.isExpertMode)}
                            className={`ml-2 p-2 md:p-3 rounded-full transition-all group shadow-sm ${state.isExpertMode ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-200' : 'bg-white hover:bg-indigo-50 text-stone-400 hover:text-indigo-500 border border-stone-100'}`}
                            title="Expert Mode (Editace promptu)"
                        >
                            <GraduationCap size={16} />
                        </button>
                    </div>

                    <textarea
                        id="story-textarea"
                        value={state.currentPage.text}
                        onChange={(e) => actions.handleTextChange(e.target.value)}
                        placeholder={state.currentPage.isCover ? t('library.custom_book_editor.placeholder_cover') : t('library.custom_book_editor.placeholder_text')}
                        className="flex-1 w-full bg-transparent border-none resize-none focus:ring-0 text-xl md:text-4xl leading-relaxed text-stone-800 placeholder:text-stone-200/50 font-serif focus:outline-none selection:bg-purple-200"
                        spellCheck={false}
                    />

                    {/* EXPERT MODE PROMPT EDITOR */}
                    <AnimatePresence>
                        {state.isExpertMode && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 border-t-2 border-dashed border-indigo-100 pt-4"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                                        <Sparkles size={10} /> {t('library.custom_book_editor.expert_prompt_label')}
                                    </span>
                                    <button
                                        onClick={async () => {
                                            const p = await actions.generateImagePrompt(state.currentPage.text);
                                            if (p) {
                                                const newPages = [...state.pages];
                                                newPages[state.currentPageIndex].prompt = p;
                                                actions.setPages(newPages);
                                            }
                                        }}
                                        className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100 font-bold"
                                    >
                                        {state.currentPage.prompt ? t('library.custom_book_editor.expert_btn_regenerate') : t('library.custom_book_editor.expert_btn_translate')}
                                    </button>
                                </div>
                                <textarea
                                    className="w-full bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 text-sm font-mono text-indigo-800 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                                    rows={4}
                                    placeholder={t('library.custom_book_editor.expert_prompt_placeholder')}
                                    value={state.currentPage.prompt || ''}
                                    onChange={(e) => {
                                        const newPages = [...state.pages];
                                        newPages[state.currentPageIndex].prompt = e.target.value;
                                        actions.setPages(newPages);
                                    }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="h-12 md:h-32 shrink-0"></div>
                </div>
            </div>
        </div>
    );
};
