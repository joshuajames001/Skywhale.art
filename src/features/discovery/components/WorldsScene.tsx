import { useRef, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { DiscoveryCategory } from '../../../types/discovery';
import { WorldSection } from './WorldSection';

interface WorldsSceneProps {
    categories: DiscoveryCategory[];
    loading: boolean;
    onSelectCategory: (cat: DiscoveryCategory) => void;
}

export const WorldsScene = ({ categories, loading, onSelectCategory }: WorldsSceneProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentSection, setCurrentSection] = useState(0);

    // Track current section via IntersectionObserver
    useEffect(() => {
        const container = containerRef.current;
        if (!container || categories.length === 0) return;

        const sections = container.querySelectorAll<HTMLElement>('[data-section]');
        if (sections.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        const idx = Number(entry.target.getAttribute('data-section'));
                        if (!isNaN(idx)) setCurrentSection(idx);
                    }
                }
            },
            { root: container, threshold: 0.6 }
        );

        sections.forEach((s) => observer.observe(s));
        return () => observer.disconnect();
    }, [categories]);

    const scrollToSection = (index: number) => {
        const container = containerRef.current;
        if (!container) return;
        const section = container.querySelector(`[data-section="${index}"]`);
        section?.scrollIntoView({ behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-black">
                <Loader2 size={48} className="animate-spin text-white/30" />
            </div>
        );
    }

    return (
        <div className="relative w-full h-full">
            {/* Snap scroll container */}
            <div
                ref={containerRef}
                className="h-full overflow-y-scroll snap-y snap-mandatory [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
            >
                {categories.map((cat, i) => (
                    <div key={cat.id} data-section={i}>
                        <WorldSection
                            category={cat}
                            index={i}
                            onClick={() => onSelectCategory(cat)}
                        />
                    </div>
                ))}
            </div>

            {/* Scroll indicator dots */}
            {categories.length > 1 && (
                <div className="fixed right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
                    {categories.map((cat, i) => (
                        <button
                            key={cat.id}
                            onClick={() => scrollToSection(i)}
                            className="group relative flex items-center justify-end"
                        >
                            {/* Label on hover */}
                            <span className="absolute right-5 whitespace-nowrap text-xs text-white/70 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                {cat.title}
                            </span>
                            <div
                                className="rounded-full transition-all duration-300"
                                style={{
                                    width: currentSection === i ? '10px' : '6px',
                                    height: currentSection === i ? '10px' : '6px',
                                    backgroundColor: currentSection === i ? cat.theme_color_hex : 'rgba(255,255,255,0.3)',
                                    boxShadow: currentSection === i ? `0 0 8px ${cat.theme_color_hex}88` : 'none',
                                }}
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
