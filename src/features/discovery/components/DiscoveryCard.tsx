import { DiscoveryBook } from '../../../types/discovery';

interface DiscoveryCardProps {
    book: DiscoveryBook;
    onClick?: (book: DiscoveryBook) => void;
    index?: number;
}

export const DiscoveryCard = ({ book, onClick }: DiscoveryCardProps) => {
    return (
        <div
            onClick={() => onClick?.(book)}
            className="relative w-full aspect-[3/4] md:aspect-[4/5] rounded-xl overflow-hidden group cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 bg-slate-900"
        >
            {/* 1. BACKGROUND IMAGE (Full Bleed) */}
            <div className="absolute inset-0 z-0">
                <img
                    src={book.cover_url}
                    alt={book.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                />
                {/* Fallback color/texture if image loads slow */}
                <div className="absolute inset-0 bg-slate-800 -z-10" />
            </div>

            {/* 2. READABILITY OVERLAY (Gradient) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10 opacity-90 group-hover:opacity-100 transition-opacity duration-300" />

            {/* 3. TEXT CONTENT (Bottom Aligned) */}
            <div className="absolute inset-0 z-20 p-5 md:p-6 flex flex-col justify-end">

                {/* Optional Top Decoration (e.g. Species Code or Badge) */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full border border-white/10">
                        {book.species_code}
                    </span>
                </div>

                {/* Main Text Block */}
                <div className="translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-xl md:text-2xl font-bold font-serif text-white leading-tight mb-2 drop-shadow-md">
                        {book.title}
                    </h3>

                    {/* Divider that expands on hover */}
                    <div className="w-12 h-1 bg-amber-500 mb-3 rounded-full transition-all duration-300 group-hover:w-full group-hover:bg-amber-400/80" />

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs md:text-sm text-slate-300/90 font-medium">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Období</span>
                            <span className="truncate">{book.period_text}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Váha</span>
                            <span className="truncate">{book.weight_text}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative Border Overlay (Inner Ring) */}
            <div className="absolute inset-0 border border-white/10 rounded-xl pointer-events-none z-30 group-hover:border-white/20 transition-colors" />
        </div>
    );
};
