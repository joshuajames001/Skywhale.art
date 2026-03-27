import React from 'react';
import { motion } from 'framer-motion';

interface BottomSheetProps {
    onClose: () => void;
    children: React.ReactNode;
    maxHeight?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ onClose, children, maxHeight = '70vh' }) => (
    <>
        <motion.div
            className="fixed inset-0 bg-black/30 z-[90]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        />
        <motion.div
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-[91] pb-6 overflow-y-auto"
            style={{ maxHeight }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-4" />
            {children}
        </motion.div>
    </>
);
