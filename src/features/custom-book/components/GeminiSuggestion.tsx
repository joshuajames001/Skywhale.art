import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Feather, X } from 'lucide-react';

export const GeminiSuggestion = ({ suggestion, onAccept, onDismiss, t }: any) => {
    return (
        <AnimatePresence>
            {suggestion && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-4 right-4 left-4 md:left-auto md:bottom-8 md:right-8 z-30 bg-white shadow-xl shadow-purple-500/10 rounded-2xl md:rounded-3xl p-4 md:p-6 md:w-96 border-2 border-purple-50 cursor-pointer hover:border-purple-200 transition-all"
                    onClick={onAccept}
                >
                    <button
                        onClick={onDismiss}
                        className="absolute top-2 right-2 md:top-3 md:right-3 p-1 text-stone-300 hover:text-stone-500 rounded-full hover:bg-stone-50"
                    >
                        <X size={14} />
                    </button>
                    <div className="flex gap-3 md:gap-4">
                        <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center shrink-0 border border-purple-100">
                            <Feather size={16} className="text-purple-500" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[8px] md:text-[10px] font-black text-purple-400 mb-1 uppercase tracking-widest">{t('library.custom_book_editor.suggestion_label')}</p>
                            <p className="text-sm md:text-lg text-stone-700 leading-snug font-serif italic line-clamp-3">"{suggestion}"</p>
                            <div className="flex items-center gap-2 mt-2 md:mt-3">
                                <span className="text-[8px] md:text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-bold">{t('library.custom_book_editor.suggestion_tip')}</span>
                                <span className="text-[8px] md:text-[10px] text-stone-400 font-medium">{t('library.custom_book_editor.suggestion_insert')}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
