import { motion } from 'framer-motion';
import { Egg, Ship, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AgeSelectorProps {
    selected: string;
    onSelect: (value: string) => void;
}

export const AgeSelector = ({ selected, onSelect }: AgeSelectorProps) => {
    const { t } = useTranslation();
    const options = [
        { id: '1-3', label: t('setup.ages.toddler'), icon: Egg, desc: t('setup.ages.years_1_3') },
        { id: '4-7', label: t('setup.ages.explorer'), icon: Ship, desc: t('setup.ages.years_4_7') },
        { id: '8-11', label: t('setup.ages.hero'), icon: Shield, desc: t('setup.ages.years_8_11') },
    ];

    return (
        <div className="grid grid-cols-3 gap-3 md:gap-4">
            {options.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selected === opt.id;
                return (
                    <motion.button
                        key={opt.id}
                        onClick={() => onSelect(opt.id)}
                        className={`relative p-3 md:p-4 rounded-2xl flex flex-col items-center gap-2 md:gap-3 border-2 transition-all duration-300 ease-out ${isSelected ? 'border-violet-500 bg-violet-500/20 shadow-[0_0_20px_rgba(139,92,246,0.3)]' : 'border-white/5 bg-white/5 md:hover:border-white/20'}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        <div className={`p-2 md:p-3 rounded-full transition-colors duration-300 ${isSelected ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30' : 'bg-white/5 text-indigo-200/40'}`}>
                            <Icon size={20} className="md:w-6 md:h-6" />
                        </div>
                        <div className="text-center">
                            <span className={`block font-bold text-xs md:text-sm transition-colors duration-300 ${isSelected ? 'text-white' : 'text-indigo-200/50'}`}>{opt.label}</span>
                            <span className="hidden md:block text-[10px] text-indigo-200/30 font-bold uppercase">{opt.desc}</span>
                        </div>
                    </motion.button>
                );
            })}
        </div>
    );
};
