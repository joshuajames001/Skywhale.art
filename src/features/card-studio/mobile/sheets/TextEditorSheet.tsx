import React from 'react';
import { Check } from 'lucide-react';
import { TextEditorState } from '../types';
import { BottomSheet } from '../../../../components/BottomSheet';

const EDITOR_COLORS = [
    { label: 'Černá', value: '#1a1a1a' },
    { label: 'Bílá', value: '#ffffff' },
    { label: 'Purple', value: '#534AB7' },
    { label: 'Červená', value: '#E24B4A' },
    { label: 'Zlatá', value: '#EF9F27' },
    { label: 'Modrá', value: '#185FA5' },
];
const EDITOR_SIZES = [
    { label: 'S', value: 12 },
    { label: 'M', value: 16 },
    { label: 'L', value: 24 },
];
const EDITOR_FONTS = ['Inter', 'Georgia', 'Fredoka'];

interface TextEditorSheetProps {
    editor: TextEditorState;
    onChange: (e: TextEditorState) => void;
    onConfirm: () => void;
    onClose: () => void;
}

export const TextEditorSheet: React.FC<TextEditorSheetProps> = ({ editor, onChange, onConfirm, onClose }) => (
    <BottomSheet onClose={onClose} maxHeight="80vh">
        <div className="px-5 space-y-5">
            <textarea
                autoFocus
                value={editor.text}
                onChange={(e) => onChange({ ...editor, text: e.target.value })}
                placeholder="Napiš svůj text..."
                className="w-full min-h-[80px] border border-gray-200 rounded-xl p-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#534AB7]/30 focus:outline-none resize-none"
                style={{ fontSize: editor.fontSize, fontFamily: editor.fontFamily, color: editor.color }}
            />
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Velikost</label>
                <div className="flex gap-2">
                    {EDITOR_SIZES.map(s => (
                        <button key={s.label} onClick={() => onChange({ ...editor, fontSize: s.value })}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${editor.fontSize === s.value ? 'bg-[#534AB7] text-white' : 'bg-gray-100 text-gray-600'}`}>
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Barva</label>
                <div className="flex gap-2">
                    {EDITOR_COLORS.map(c => (
                        <button key={c.value} onClick={() => onChange({ ...editor, color: c.value })}
                            className={`w-[28px] h-[28px] rounded-full border transition-all ${editor.color === c.value ? 'ring-2 ring-[#534AB7] ring-offset-1 border-transparent' : 'border-gray-200'}`}
                            style={{ backgroundColor: c.value }} title={c.label} />
                    ))}
                </div>
            </div>
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Písmo</label>
                <div className="flex gap-2">
                    {EDITOR_FONTS.map(f => (
                        <button key={f} onClick={() => onChange({ ...editor, fontFamily: f })}
                            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${editor.fontFamily === f ? 'bg-[#EEEDFE] border border-[#AFA9EC] text-[#534AB7]' : 'bg-gray-100 border border-gray-100 text-gray-600'}`}
                            style={{ fontFamily: f }}>
                            {f}
                        </button>
                    ))}
                </div>
            </div>
            <button onClick={onConfirm} disabled={!editor.text.trim()}
                className="w-full bg-[#534AB7] text-white rounded-xl py-3 font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                <Check size={16} /> Přidat na kartu
            </button>
        </div>
    </BottomSheet>
);
