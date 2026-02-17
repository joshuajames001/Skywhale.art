import { motion } from 'framer-motion';

interface PageSelectorProps {
    bookPages: string[];
    onSelectImage: (url: string) => void;
}

export const PageSelector = ({ bookPages, onSelectImage }: PageSelectorProps) => {
    return (
        <motion.div
            key="page-select"
            initial={{ opacity: 1, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full h-full overflow-y-auto no-scrollbar pb-8 px-4"
        >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-4 place-items-center">
                {bookPages.map((url, i) => (
                    <motion.button
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => onSelectImage(url)}
                        className="relative group w-full aspect-square rounded-xl overflow-hidden border-2 border-white/10 hover:border-fuchsia-400 hover:shadow-[0_0_30px_rgba(232,121,249,0.3)] transition-all"
                    >
                        <img
                            src={url}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            alt={`Strana ${i + 1}`}
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
};
