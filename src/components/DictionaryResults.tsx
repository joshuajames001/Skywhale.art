import React from 'react';
import { Sparkles, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DictionaryResult } from '../types';

interface DictionaryResultsProps {
    result: DictionaryResult;
    query: string;
    onWordClick: (word: string) => void;
    /** Optional render for the main word (e.g., to add copy icon). If omitted, renders plain h3. */
    renderMainWord?: (word: string) => React.ReactNode;
    className?: string;
}

export const DictionaryResults: React.FC<DictionaryResultsProps> = ({
    result, query, onWordClick, renderMainWord, className = 'space-y-4',
}) => {
    const { t } = useTranslation();

    return (
        <div className={className}>
            {/* Main result card */}
            <button
                onClick={() => onWordClick(result.primary_en || '')}
                className="w-full bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center relative overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors"
            >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-orange-400" />
                <div className="text-5xl mb-3">{result.emoji}</div>
                {renderMainWord ? renderMainWord(result.primary_en || '') : (
                    <h3 className="text-2xl font-bold text-gray-800 mb-1">{result.primary_en}</h3>
                )}
                <p className="text-gray-400 italic font-serif text-sm">"{query}"</p>
            </button>

            {/* Synonyms */}
            {(result.synonyms?.length ?? 0) > 0 && (
                <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1">
                        <Sparkles size={10} /> {t('library.custom_book_editor.synonyms_label', 'Synonyma')}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {result.synonyms!.map((syn) => (
                            <button
                                key={syn}
                                onClick={() => onWordClick(syn)}
                                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 shadow-sm cursor-pointer hover:bg-[#EEEDFE] hover:border-[#AFA9EC] hover:text-[#534AB7] transition-colors"
                            >
                                {syn}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Adjectives */}
            {(result.related_adjectives?.length ?? 0) > 0 && (
                <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1">
                        <Star size={10} /> {t('library.custom_book_editor.adjectives_label', 'Přídavná jména')}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {result.related_adjectives!.map((adj) => (
                            <span key={adj} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-bold border border-orange-100">
                                {adj}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
