import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft } from 'lucide-react';

interface MagicMirrorGameProps {
    onClose: () => void;
}

export const MagicMirrorGame: React.FC<MagicMirrorGameProps> = ({ onClose }) => {
    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center text-slate-800">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/60 rounded-full hover:bg-white/80 text-slate-600 transition-colors"
            >
                <ArrowLeft size={24} />
            </button>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-8 bg-white/70 backdrop-blur-xl rounded-3xl border border-purple-200 shadow-lg max-w-lg"
            >
                <div className="mb-6 w-24 h-24 mx-auto bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-400/30">
                    <Sparkles size={48} className="text-indigo-300" />
                </div>

                <h2 className="text-3xl font-bold mb-4 font-title bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                    Magické Zrcadlo
                </h2>

                <p className="text-slate-500 mb-8 leading-relaxed">
                    Tato kletba je zatím příliš silná! <br />
                    Naši čarodějové pracují na odemčení této místnosti.
                </p>

                <div className="px-4 py-2 bg-purple-50 rounded-lg border border-purple-200 inline-block text-sm font-mono text-purple-500">
                    STATUS: LOCKED_FEATURE
                </div>
            </motion.div>
        </div>
    );
};
