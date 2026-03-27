import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { TextEditorState } from '../types';

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
    <>
        <motion.div
            className="fixed inset-0 bg-black/30 z-[90]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
        />
        <motion.div
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-[91] pb-6 max-h-[80vh] overflow-y-auto"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-4" />
            <div className="px-5 space-y-5">
                {/* Textarea */}
                <textarea
                    autoFocus
                    value={editor.text}
                    onChange={(e) => onChange({ ...editor, text: e.target.value })}
                    placeholder="Napiš svůj text..."
                    className="w-full min-h-[80px] border border-gray-200 rounded-xl p-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#534AB7]/30 focus:outline-none resize-none"
                    style={{ fontSize: editor.fontSize, fontFamily: editor.fontFamily, color: editor.color }}
                />

                {/* Size */}
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Velikost</label>
                    <div className="flex gap-2">
                        {EDITOR_SIZES.map(s => (
                            <button
                                key={s.label}
                                onClick={() => onChange({ ...editor, fontSize: s.value })}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${editor.fontSize === s.value
                                    ? 'bg-[#534AB7] text-white' : 'bg-gray-100 text-gray-600'}`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Color */}
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Barva</label>
                    <div className="flex gap-2">
                        {EDITOR_COLORS.map(c => (
                            <button
                                key={c.value}
                                onClick={() => onChange({ ...editor, color: c.value })}
                                className={`w-[28px] h-[28px] rounded-full border transition-all ${editor.color === c.value
                                    ? 'ring-2 ring-[#534AB7] ring-offset-1 border-transparent'
                                    : 'border-gray-200'}`}
                                style={{ backgroundColor: c.value }}
                                title={c.label}
                            />
                        ))}
                    </div>
                </div>

                {/* Font */}
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Písmo</label>
                    <div className="flex gap-2">
                        {EDITOR_FONTS.map(f => (
                            <button
                                key={f}
                                onClick={() => onChange({ ...editor, fontFamily: f })}
                                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${editor.fontFamily === f
                                    ? 'bg-[#EEEDFE] border border-[#AFA9EC] text-[#534AB7]'
                                    : 'bg-gray-100 border border-gray-100 text-gray-600'}`}
                                style={{ fontFamily: f }}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Confirm */}
                <button
                    onClick={onConfirm}
                    disabled={!editor.text.trim()}
                    className="w-full bg-[#534AB7] text-white rounded-xl py-3 font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <Check size={16} /> Přidat na kartu
                </button>
            </div>
        </motion.div>
    </>
);
