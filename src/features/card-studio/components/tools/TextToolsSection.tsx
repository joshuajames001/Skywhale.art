import { useState } from 'react';
import { Type } from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

const COLORS = [
    { name: 'White', value: '#ffffff' }, { name: 'Black', value: '#000000' },
    { name: 'Rose', value: '#f43f5e' }, { name: 'Amber', value: '#fbbf24' },
    { name: 'Sky', value: '#38bdf8' }, { name: 'Indigo', value: '#818cf8' },
    { name: 'Emerald', value: '#34d399' }, { name: 'Purple', value: '#c084fc' },
];

const FONTS = [
    { name: 'Modern', value: 'Inter, sans-serif' },
    { name: 'Elegant', value: 'Playfair Display, serif' },
    { name: 'Script', value: 'Dancing Script, cursive' },
    { name: 'Fun', value: 'Comic Sans MS, cursive' },
];

interface TextToolsSectionProps {
    onAddText: (text: string) => void;
    textFont?: string;
    onUpdateFont?: (font: string) => void;
    textColor?: string;
    onUpdateColor?: (color: string) => void;
}

export const TextToolsSection = ({ onAddText, textFont, onUpdateFont, textColor, onUpdateColor }: TextToolsSectionProps) => {
    const { t } = useTranslation();
    const [textInput, setTextInput] = useState('');

    return (
        <div className="flex flex-col gap-4 pb-8">
            <div>
                <h3 className="text-white/80 text-xs font-bold uppercase mb-2">{t('tools.font')}</h3>
                <div className="grid grid-cols-2 gap-2">
                    {FONTS.map(f => (
                        <button key={f.value} onClick={() => onUpdateFont?.(f.value)}
                            className={clsx('p-2 rounded border text-xs transition-all', textFont === f.value ? 'bg-white text-black border-white' : 'bg-white/5 text-slate-300 border-white/10')}
                            style={{ fontFamily: f.value }}>{f.name}</button>
                    ))}
                </div>
            </div>
            <div>
                <h3 className="text-white/80 text-xs font-bold uppercase mb-2">{t('tools.color')}</h3>
                <div className="flex gap-2 flex-wrap">
                    {COLORS.map(c => (
                        <button key={c.value} onClick={() => onUpdateColor?.(c.value)}
                            className={clsx('w-8 h-8 rounded-full border-2 transition-transform', textColor === c.value ? 'border-white scale-110' : 'border-transparent')}
                            style={{ backgroundColor: c.value }} />
                    ))}
                </div>
            </div>
            <textarea value={textInput} onChange={e => setTextInput(e.target.value)} placeholder={t('tools.text_placeholder')}
                className="w-full h-24 bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                style={{ fontFamily: textFont, color: textColor === '#000000' && textInput ? 'white' : textColor }} />
            <button onClick={() => { if (textInput.trim()) { onAddText(textInput); setTextInput(''); } }} disabled={!textInput.trim()}
                className="w-full py-3 bg-indigo-600 rounded-xl text-white font-bold text-sm shadow-lg disabled:opacity-50">
                <Type size={14} className="inline mr-2" /> {t('tools.insert')}
            </button>
        </div>
    );
};
