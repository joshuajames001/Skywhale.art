import React from 'react';
import { motion } from 'framer-motion';
import { Book, X, Search, Loader2, Languages } from 'lucide-react';
import { SharedEditorProps } from '../types';
import { DictionaryResults } from '../../../components/DictionaryResults';

export const DictionarySidebar: React.FC<Pick<SharedEditorProps, 'state' | 'actions' | 't'>> = ({ state, actions, t }) => {
    return (
        <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            className="absolute right-0 top-0 bottom-0 w-full md:w-96 bg-white shadow-2xl z-50 border-l border-stone-100 flex flex-col"
        >
            <div className="p-6 bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <Book size={24} />
                    <div>
                        <h3 className="font-title font-bold text-xl">Magičtinář</h3>
                        <p className="text-xs text-orange-100 opacity-80">Slovník pro malé spisovatele</p>
                    </div>
                </div>
                <button onClick={() => actions.setShowDictionary(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto bg-stone-50">
                <div className="relative mb-6">
                    <input
                        type="text"
                        placeholder={t('library.custom_book_editor.dictionary_placeholder')}
                        value={state.dictionaryQuery}
                        onChange={(e) => actions.setDictionaryQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && state.dictionaryQuery) {
                                actions.setIsSearchingDict(true);
                                actions.searchDictionary(state.dictionaryQuery).then((res: any) => {
                                    actions.setDictionaryResult(res);
                                    actions.setIsSearchingDict(false);
                                });
                            }
                        }}
                        className="w-full p-4 pl-12 rounded-xl border border-stone-200 shadow-sm focus:ring-2 focus:ring-orange-300 focus:outline-none text-stone-900 placeholder:text-stone-400"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                </div>

                {state.isSearchingDict ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4 text-stone-400">
                        <Loader2 size={32} className="animate-spin text-orange-400" />
                        <p>Listuji ve starých knihách...</p>
                    </div>
                ) : state.dictionaryResult ? (
                    <DictionaryResults
                        result={state.dictionaryResult}
                        query={state.dictionaryQuery}
                        onWordClick={(word) => {
                            if (state.isExpertMode) {
                                const newPrompt = (state.currentPage.prompt || '') + " " + word;
                                const newPages = [...state.pages];
                                newPages[state.currentPageIndex].prompt = newPrompt;
                                actions.setPages(newPages);
                            }
                        }}
                        className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
                    />
                ) : (
                    <div className="text-center text-stone-400 py-10">
                        <Languages size={48} className="mx-auto mb-4 opacity-20" />
                        <p>{t('library.custom_book_editor.dictionary_empty')}</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
