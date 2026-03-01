import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface TrailerOverlayProps {
    url: string | null;
    onComplete: () => void;
}

export const TrailerOverlay = ({ url, onComplete }: TrailerOverlayProps) => {
    if (!url) return null;

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <button
                onClick={onComplete}
                className="absolute top-8 right-8 p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            >
                <X className="w-8 h-8" />
            </button>

            <div className="w-[90vw] h-[80vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative">
                <iframe
                    src={url}
                    className="w-full h-full object-cover"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                />
            </div>
        </motion.div>
    );
};
