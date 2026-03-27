import React from 'react';
import { Sparkles, Zap, Loader2 } from 'lucide-react';

const AI_CHIPS = ['whale', 'flower', 'star', 'birthday cake', 'heart'];

interface AIPanelProps {
    mode: 'sticker' | 'background';
    setMode: (m: 'sticker' | 'background') => void;
    prompt: string;
    setPrompt: (p: string) => void;
    isGenerating: boolean;
    onGenerate: () => void;
}

export const AiPanel: React.FC<AIPanelProps> = ({ mode, setMode, prompt, setPrompt, isGenerating, onGenerate }) => (
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
            <p className="text-xs text-gray-400 mt-1">Write in English for best results</p>
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
