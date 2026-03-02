import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen } from 'lucide-react';
import { DiscoveryView } from '../hooks/useDiscoveryNav';

interface DiscoveryHeaderProps {
    title?: string;
    subtitle?: string;
    onBack?: () => void;
    view?: DiscoveryView;
    showTrailerButton?: boolean;
    onPlayTrailer?: () => void;
    audioUrl?: string;
    isCustomTheme?: boolean;
}

export const DiscoveryHeader = ({
    title = "Encyklopedie",
    subtitle = "Objevuj svět kolem sebe",
    onBack
}: DiscoveryHeaderProps) => {
    return (
        <motion.div
            className="w-full flex items-center justify-between px-8 py-6 z-10 relative"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex flex-col">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg">
                        <BookOpen className="w-6 h-6 text-sky-300" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-wide drop-shadow-md">
                        {title}
                    </h1>
                </div>
                {subtitle && (
                    <div className="flex items-center gap-2 mt-1 ml-1">
                        <Sparkles className="w-3 h-3 text-yellow-300" />
                        <span className="text-sm text-sky-100/80 font-medium tracking-wider uppercase">
                            {subtitle}
                        </span>
                    </div>
                )}
            </div>

            {/* Optional Right Side Actions or profile info could go here */}
            <div className="w-12" />
        </motion.div>
    );
};
