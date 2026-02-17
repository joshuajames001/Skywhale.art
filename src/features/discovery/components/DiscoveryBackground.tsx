import { motion, AnimatePresence } from 'framer-motion';
import { DiscoveryView } from '../hooks/useDiscoveryNav';
import { DiscoveryCategory } from '../../../types/discovery';

interface DiscoveryBackgroundProps {
    view: DiscoveryView;
    selectedCategory: DiscoveryCategory | null;
}

export const DiscoveryBackground = ({ view, selectedCategory }: DiscoveryBackgroundProps) => {
    const isDinoCategory = selectedCategory?.title?.toLowerCase().includes('dino') ||
        selectedCategory?.slug?.includes('dino') ||
        selectedCategory?.title?.toLowerCase().includes('dinosauři');

    const isSpaceCategory = selectedCategory?.title?.toLowerCase().includes('vesmír') ||
        selectedCategory?.title?.toLowerCase().includes('space') ||
        selectedCategory?.slug?.includes('space') ||
        selectedCategory?.slug === 'vesmir' ||
        selectedCategory?.slug === 'space';

    const showCustomBg = (isDinoCategory || isSpaceCategory) && view !== 'categories';

    return (
        <div className={`fixed inset-0 -z-10 absolute pointer-events-none transition-colors duration-500 ${showCustomBg ? 'bg-black' : 'bg-slate-900/95'}`}>
            {/* Conditional Background Image (Dino) */}
            {isDinoCategory && view !== 'categories' && (
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-black/30 z-10" /> {/* Dark Overlay for readability */}
                    <img
                        src="/discovery/dino-bg-v3.jpg"
                        alt="Dino Background"
                        className="w-full h-[100dvh] object-cover opacity-100"
                    />
                </div>
            )}

            {/* Conditional Background Image (Space) */}
            {isSpaceCategory && view !== 'categories' && (
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-black/40 z-10" /> {/* Dark Overlay for readability */}
                    <img
                        src="/discovery/space-bg.png"
                        alt="Space Background"
                        className="w-full h-[100dvh] object-cover opacity-100"
                    />
                </div>
            )}
        </div>
    );
};
