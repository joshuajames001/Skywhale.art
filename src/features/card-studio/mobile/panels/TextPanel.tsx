import React from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TEXT_STYLES = [
    { key: 'tools.heading', preview: 'text-base font-bold', fontSize: 16, fontFamily: 'Inter' },
    { key: 'tools.body_text', preview: 'text-sm', fontSize: 13, fontFamily: 'Inter' },
    { key: 'tools.quote', preview: 'text-sm italic font-serif', fontSize: 13, fontFamily: 'Georgia' },
    { key: 'tools.caption', preview: 'text-[10px] uppercase tracking-widest', fontSize: 10, fontFamily: 'Inter' },
];

export const TextPanel: React.FC<{ onOpenEditor: (opts: { fontSize: number; fontFamily: string }) => void }> = ({ onOpenEditor }) => {
    const { t } = useTranslation();
    return (
    <div className="space-y-2">
        {TEXT_STYLES.map(style => (
            <div key={style.key} className="flex items-center justify-between bg-gray-50 rounded-xl border border-gray-100 px-4 py-3">
                <div>
                    <span className={`text-gray-800 ${style.preview}`}>{t(style.key)}</span>
                    <p className="text-[10px] text-gray-400 mt-0.5">{style.fontSize}px · {style.fontFamily}</p>
                </div>
                <button
                    onClick={() => onOpenEditor({ fontSize: style.fontSize, fontFamily: style.fontFamily })}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-[#EEEDFE] border border-[#AFA9EC] text-[#534AB7]"
                >
                    <Plus size={18} />
                </button>
            </div>
        ))}
    </div>
    );
};
