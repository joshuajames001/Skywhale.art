import React, { useState } from 'react';
import { Search, Loader2, Sparkles, Star, Languages, Check, Copy } from 'lucide-react';
import { useCardStudio } from '../../CardStudioContext';
import { useClipboardCopy } from '../../../../hooks/useClipboardCopy';
import { DictionaryResult } from '../../../../types';

export const DictionaryPanel: React.FC = () => {
    const { onDictionaryLookup } = useCardStudio();
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<DictionaryResult | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const { copied, copy: copyToClipboard } = useClipboardCopy();

    const handleSearch = async () => {
        if (!query.trim()) return;
        setIsSearching(true);
        try { setResult(await onDictionaryLookup(query)); }
        catch { setResult(null); }
        finally { setIsSearching(false); }
    };

    return (
        <div className="space-y-4">
            {/* Search input */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Hledej slovo..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                    className="w-full p-3 pl-10 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-orange-300 focus:outline-none text-gray-900 placeholder:text-gray-400 bg-white"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>

            {/* Results */}
            {isSearching ? (
                <div className="flex flex-col items-center py-10 text-gray-400 gap-3">
                    <Loader2 size={28} className="animate-spin text-orange-400" />
                    <p className="text-sm">Hledám...</p>
                </div>
            ) : result ? (
                <div className="space-y-4">
                    {/* Main result */}
                    <button
                        onClick={() => copyToClipboard(result.primary_en || '')}
                        className="w-full bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center relative overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-orange-400" />
                        <div className="text-5xl mb-3">{result.emoji}</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-1 flex items-center justify-center gap-2">
                            {result.primary_en}
                            {copied === result.primary_en
                                ? <Check size={16} className="text-green-500" />
                                : <Copy size={14} className="text-gray-300" />}
                        </h3>
                        <p className="text-gray-400 italic font-serif text-sm">"{query}"</p>
                    </button>

                    {/* Synonyms */}
                    {result.synonyms && result.synonyms.length > 0 && (
                        <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1">
                                <Sparkles size={10} /> Synonyma
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {result.synonyms.map((syn) => (
                                    <button
                                        key={syn}
                                        onClick={() => copyToClipboard(syn)}
                                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 shadow-sm cursor-pointer hover:bg-[#EEEDFE] hover:border-[#AFA9EC] hover:text-[#534AB7] transition-colors flex items-center gap-1"
                                    >
                                        {copied === syn ? <Check size={12} className="text-green-500" /> : null}
                                        {syn}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Adjectives */}
                    {result.related_adjectives && result.related_adjectives.length > 0 && (
                        <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1">
                                <Star size={10} /> Přídavná jména
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {result.related_adjectives.map((adj) => (
                                    <span key={adj} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-bold border border-orange-100">
                                        {adj}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center text-gray-400 py-10">
                    <Languages size={40} className="mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Zadej slovo a stiskni Enter</p>
                </div>
            )}
        </div>
    );
};
