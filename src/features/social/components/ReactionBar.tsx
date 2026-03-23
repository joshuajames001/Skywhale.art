import { motion } from 'framer-motion';
import { useReactionData } from '../hooks/useReactionData';

const REACTION_ICONS: Record<string, string> = {
    heart: '❤️',
    star: '⭐',
    fire: '🔥',
    clap: '👏',
    rocket: '🚀'
};

interface ReactionBarProps {
    bookId: string;
    showCount?: boolean;
}

export const ReactionBar = ({ bookId, showCount = true }: ReactionBarProps) => {
    const { reactions, loading, toggleReaction } = useReactionData(bookId);

    if (loading) return <div className="h-6" />;

    return (
        <div className="flex items-center gap-1 mt-3 w-full justify-start px-0">
            {reactions.map((reaction) => (
                <motion.button
                    key={reaction.type}
                    whileHover={{ scale: 1.2, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleReaction(reaction.type);
                    }}
                    className={`
                        relative group flex flex-col items-center justify-center p-1.5 rounded-xl transition-all
                        ${reaction.userReacted ? 'bg-white/10 shadow-inner' : 'hover:bg-white/5'}
                    `}
                >
                    <span className="text-base filter drop-shadow-lg grayscale-[0.3] group-hover:grayscale-0 transition-all">
                        {REACTION_ICONS[reaction.type]}
                    </span>
                    {showCount && reaction.count > 0 && (
                        <span className={`
                            text-[9px] font-bold mt-0.5
                            ${reaction.userReacted ? 'text-white' : 'text-slate-500'}
                        `}>
                            {reaction.count}
                        </span>
                    )}
                </motion.button>
            ))}
        </div>
    );
};
