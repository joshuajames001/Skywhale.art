import React, { useState } from 'react';
import { Search, Loader2, Languages } from 'lucide-react';
import { useCardStudio } from '../../CardStudioContext';
import { useClipboardCopy } from '../../../../hooks/useClipboardCopy';
import { DictionaryResult } from '../../../../types';
import { DictionaryResults } from '../../../../components/DictionaryResults';

export const DictionaryPanel: React.FC = () => {
    const { onDictionaryLookup } = useCardStudio();
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<DictionaryResult | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const { copy: copyToClipboard } = useClipboardCopy();

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
                <DictionaryResults
                    result={result}
                    query={query}
                    onWordClick={copyToClipboard}
                />
            ) : (
                <div className="text-center text-gray-400 py-10">
                    <Languages size={40} className="mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Zadej slovo a stiskni Enter</p>
                </div>
            )}
        </div>
    );
};
