import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CardAIPanelProps {
    generateBackground: (style: string, prompt: string) => Promise<string>;
    generateSticker: (prompt: string) => Promise<string>;
    generateSmartQuote: (occasion: string, recipient: string) => Promise<string>;
    isGenerating: boolean;
    onBackgroundGenerated: (url: string) => void;
    onStickerGenerated: (url: string) => void;
}

export const CardAIPanel = ({
    generateBackground, generateSticker, generateSmartQuote,
    isGenerating, onBackgroundGenerated, onStickerGenerated,
}: CardAIPanelProps) => {
    const { t } = useTranslation();
    const [prompt, setPrompt] = useState('');
    const [mode, setMode] = useState<'sticker' | 'background'>('sticker');
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim() || isGenerating) return;
        setError(null);
        try {
            if (mode === 'background') {
                const url = await generateBackground('', prompt);
                onBackgroundGenerated(url);
            } else {
                const url = await generateSticker(prompt);
                onStickerGenerated(url);
            }
            setPrompt('');
        } catch (e: any) {
            const msg = e.message || '';
            if (msg.includes('Obsah není vhodný')) setError(t('atelier.status.inappropriate_content'));
            else if (msg.includes('402') || msg.includes('Insufficient credit')) setError(t('atelier.status.payment_wait'));
            else setError(msg);
        }
    };

    return (
        <div className="flex flex-col gap-3 p-4">
            <div className="flex gap-2">
                <button
                    onClick={() => setMode('sticker')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'sticker' ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white/60'}`}
                >
                    {t('atelier.ai.sticker', 'Sticker')}
                </button>
                <button
                    onClick={() => setMode('background')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'background' ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white/60'}`}
                >
                    {t('atelier.ai.background', 'Background')}
                </button>
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                    placeholder={t('atelier.ai.prompt_placeholder', 'Describe what you want...')}
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-1"
                >
                    {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                </button>
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
    );
};
