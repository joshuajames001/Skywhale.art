import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flag, X, CheckCircle } from 'lucide-react';
import { useReportData } from '../hooks/useReportData';

interface ReportDialogProps {
    type: 'book' | 'user';
    targetId: string;
    onClose: () => void;
}

const REASONS = [
    { value: 'inappropriate', label: 'Nevhodný obsah pro děti' },
    { value: 'spam',          label: 'Spam nebo reklama' },
    { value: 'copyright',     label: 'Porušení autorských práv' },
    { value: 'other',         label: 'Jiný důvod' },
] as const;

export const ReportDialog = ({ type, targetId, onClose }: ReportDialogProps) => {
    const [reason, setReason] = useState<string>('inappropriate');
    const [details, setDetails] = useState('');

    const { loading, sent, submitReport } = useReportData();

    const handleSubmit = async () => {
        const result = await submitReport({
            type,
            targetId,
            reason,
            details: details.trim() || null,
        });

        if (result.success) {
            setTimeout(onClose, 2000);
        } else if (result.error) {
            alert(result.error);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors">
                    <X size={20} />
                </button>

                {sent ? (
                    <div className="text-center py-4">
                        <CheckCircle className="text-green-400 mx-auto mb-3" size={40} />
                        <p className="text-white font-bold">Hlášení odesláno</p>
                        <p className="text-white/50 text-sm mt-1">Děkujeme za pomoc při udržování komunity bezpečnou.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-2 mb-5">
                            <Flag size={18} className="text-red-400" />
                            <h3 className="text-white font-bold">
                                {type === 'book' ? 'Nahlásit knihu' : 'Nahlásit uživatele'}
                            </h3>
                        </div>

                        <div className="space-y-2 mb-4">
                            {REASONS.map((r) => (
                                <label key={r.value} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="reason"
                                        value={r.value}
                                        checked={reason === r.value}
                                        onChange={() => setReason(r.value)}
                                        className="accent-red-500"
                                    />
                                    <span className="text-sm text-white/70 group-hover:text-white transition-colors">{r.label}</span>
                                </label>
                            ))}
                        </div>

                        <textarea
                            value={details}
                            onChange={(e) => setDetails(e.target.value.slice(0, 300))}
                            placeholder="Nepovinné podrobnosti..."
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-red-500/50 resize-none mb-4"
                        />
                        <p className="text-right text-xs text-white/30 -mt-3 mb-4">{details.length}/300</p>

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Odesílám...' : 'Odeslat hlášení'}
                        </button>
                    </>
                )}
            </motion.div>
        </div>
    );
};
