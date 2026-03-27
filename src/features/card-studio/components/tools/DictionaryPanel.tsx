import { Book, Loader2, Search, Sparkles, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { DictionaryResult } from '../../../../types';

interface DictionaryPanelProps {
    query: string;
    onQueryChange: (q: string) => void;
    result: DictionaryResult | null;
    isSearching: boolean;
    onSearch: () => void;
    onInsertWord: (word: string) => void;
    onClose: () => void;
}

export const DictionaryPanel = ({ query, onQueryChange, result, isSearching, onSearch, onInsertWord, onClose }: DictionaryPanelProps) => {
    const { t } = useTranslation();

    return (
        <motion.div initial={{ opacity: 0, x: 50, y: '-50%' }} animate={{ opacity: 1, x: 0, y: '-50%' }} exit={{ opacity: 0, x: 50, y: '-50%' }}
            style={{ top: '50%' }}
            className="fixed right-4 md:right-16 w-[92vw] left-4 md:left-auto md:w-[350px] h-fit max-h-[80vh] bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl md:rounded-[2rem] shadow-2xl z-[10000] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-amber-500/20 bg-amber-500/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 text-amber-500">
                    <div className="p-2 bg-amber-500/10 rounded-xl"><Book size={18} /></div>
                    <div>
                        <h3 className="font-bold text-base leading-none">{t('dictionary.title')}</h3>
                        <p className="text-[9px] text-amber-500/50 uppercase tracking-widest mt-1">{t('dictionary.subtitle')}</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-5 overflow-y-auto custom-scrollbar flex flex-col gap-5">
                <div className="relative">
                    <input type="text" placeholder={t('dictionary.search_placeholder')} value={query} onChange={e => onQueryChange(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && onSearch()}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-3.5 pl-11 text-white text-sm outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all placeholder:text-slate-600" />
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
                {isSearching ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-4 opacity-50">
                        <div className="relative"><Loader2 size={32} className="animate-spin text-amber-500" /><Sparkles size={12} className="absolute -top-1 -right-1 text-amber-300 animate-pulse" /></div>
                        <span className="text-xs font-medium text-slate-400">{t('dictionary.searching_hint')}</span>
                    </div>
                ) : result ? (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="text-6xl mb-3 transition-transform group-hover:scale-110 duration-500 drop-shadow-2xl">{result.emoji}</div>
                            <div className="text-2xl font-black text-white uppercase tracking-tighter">{result.primary_en}</div>
                            <div className="text-[10px] text-slate-500 italic mt-2 font-serif">"{query}"</div>
                        </div>
                        {(result.synonyms?.length ?? 0) > 0 && (
                            <div className="space-y-2.5">
                                <div className="text-[9px] uppercase font-bold text-slate-500 tracking-[0.2em] flex items-center gap-2"><Sparkles size={10} className="text-amber-500" /> {t('dictionary.synonyms')}</div>
                                <div className="flex flex-wrap gap-2">
                                    {result.synonyms!.map((s: string) => (
                                        <button key={s} onClick={() => onInsertWord(s)}
                                            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-300 hover:border-amber-500/50 hover:text-amber-400 hover:bg-amber-500/5 transition-all shadow-sm active:scale-95">{s}</button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 opacity-30 text-center px-4 gap-4">
                        <div className="w-16 h-16 bg-white/5 rounded-[1.5rem] flex items-center justify-center"><Book size={32} /></div>
                        <p className="text-xs leading-relaxed">{t('dictionary.help_text')}</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
