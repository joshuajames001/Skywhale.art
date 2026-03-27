import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, User, MapPin, Palette, ArrowRight, Sparkles, Mic } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AnimatedInput } from '../shared/AnimatedInput';
import { AgeSelector } from '../shared/AgeSelector';
import { StyleSelector } from '../shared/StyleSelector';
import { VoicePreviewButton } from '../../../../components/audio/VoicePreviewButton';
import { VOICE_OPTIONS, DEFAULT_VOICE_ID } from '../../../../lib/audio-constants';
import { generateCompleteStory } from '../../../../lib/ai/orchestrator';
import { StoryBook } from '../../../../types';
import { MagicLoading } from '../effects/MagicLoading';
import { checkTopicBlacklist } from '../../../../lib/content-policy';
import { STORY_COSTS, IMAGE_COSTS } from '../../../../lib/constants';

interface CustomModeProps {
    initialData?: any;
    userBalance: number | null;
    onComplete: (story: StoryBook) => Promise<void>;
    onCancel: () => void;
    onOpenStore?: () => void;
    currentLanguage: string;
}

export const CustomMode: React.FC<CustomModeProps> = ({
    initialData,
    userBalance,
    onComplete,
    onCancel,
    onOpenStore,
    currentLanguage
}) => {
    const { t } = useTranslation();
    const [step, setStep] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [creationStatus, setCreationStatus] = useState<string | null>(null);
    const [policyError, setPolicyError] = useState<string | null>(null);

    // CRITICAL FIX: Default length is 5
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        author: initialData?.author || '',
        main_character: initialData?.main_character || '',
        visual_dna: initialData?.visual_dna || '',
        setting: initialData?.setting || '',
        target_audience: initialData?.target_audience || '4-7',
        visual_style: initialData?.visual_style || 'Watercolor',
        length: initialData?.length || 5, // DEFAULT TO 5
        voice_id: initialData?.voice_id || DEFAULT_VOICE_ID,
        hero_image_url: initialData?.hero_image_url || undefined
    });

    const requiredEnergy = (STORY_COSTS[formData.length as keyof typeof STORY_COSTS] || (formData.length + 1) * IMAGE_COSTS.FLUX_PRO) + (formData.voice_id ? formData.length * 20 : 0);
    const hasEnoughEnergy = userBalance !== null && userBalance >= requiredEnergy;

    const handleSubmit = async () => {
        const policyCheck = checkTopicBlacklist(
            [formData.title, formData.main_character, formData.setting].filter(Boolean).join(' ')
        );
        if (policyCheck.blocked) {
            setPolicyError(policyCheck.reason ?? 'Nevhodný obsah.');
            return;
        }
        setPolicyError(null);
        setIsGenerating(true);
        setCreationStatus(t('setup.status.calling_muses'));

        try {
            // STRICT REPLICATION OF MAGIC WAND LOGIC
            // We request Phase 1 (Text) + Phase 2 (Character Sheet) ONLY.
            // The Reader will handle Phase 3 (Pages) manually.

            const payload = {
                title: formData.title,
                author: formData.author || 'Příběhář', // Default author if empty
                main_character: formData.main_character,
                visual_dna: formData.visual_dna || formData.main_character, // Fallback to character desc if no DNA
                setting: formData.setting,
                target_audience: formData.target_audience,
                visual_style: formData.visual_style || 'Watercolor',
                length: formData.length, // Respect user selection
                user_identity_image: formData.hero_image_url || undefined,
                language: currentLanguage
            };

            console.log("🚀 Custom Mode: Submitting Payload:", payload);

            const newStory = await generateCompleteStory(payload, (status) => {
                setCreationStatus(status);
            });

            console.log("✅ Custom Mode: Generation Complete. Handoff to Reader.", newStory);
            setCreationStatus(t('setup.status.euphoria'));

            // Handoff to Reader (StorySpread) which will use the generated character_sheet_url
            await onComplete(newStory);

        } catch (error) {
            console.error("Custom Story Creation Failed:", error);
            setCreationStatus(t('setup.status.failed'));
            setTimeout(() => {
                setIsGenerating(false);
                setCreationStatus(null);
            }, 3000);
        }
    };

    if (isGenerating) {
        return <MagicLoading status={creationStatus} style={formData.visual_style} />;
    }

    return (
        <div className="w-full max-w-5xl mx-auto bg-slate-900/80 backdrop-blur-2xl p-6 md:p-10 sm:rounded-[40px] shadow-2xl relative flex flex-col border-y sm:border border-white/10 min-h-screen sm:min-h-fit my-10 animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={onCancel}
                    className="text-slate-400 hover:text-slate-600 font-bold uppercase text-xs tracking-widest transition-colors flex items-center gap-2"
                >
                    <ArrowRight className="rotate-180" size={14} /> {t('setup.back_to_select')}
                </button>
                <div className="flex gap-2">
                    {[0, 1].map(i => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'w-8 bg-violet-600' : 'w-2 bg-slate-200'}`} />
                    ))}
                </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-title font-bold text-white mb-1 flex items-center gap-3">
                {formData.title || t('setup.new_book_default')}
                {formData.length === 5 && <span className="text-xs bg-cyan-900 text-cyan-200 px-2 py-1 rounded-full border border-cyan-500/30">TEST MODE</span>}
            </h2>

            <AnimatePresence mode='wait'>
                {step === 0 ? (
                    <motion.div
                        key="step0"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-1"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <AnimatedInput
                                    label={t('setup.fields.title')}
                                    icon={Book}
                                    value={formData.title}
                                    onChange={(e: any) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder={t('setup.fields.title_placeholder')}
                                />
                                <AnimatedInput
                                    label={t('setup.fields.hero')}
                                    icon={User}
                                    value={formData.main_character}
                                    onChange={(e: any) => setFormData({ ...formData, main_character: e.target.value })}
                                    placeholder={t('setup.fields.hero_placeholder')}
                                />
                                <AnimatedInput
                                    label={t('setup.fields.setting')}
                                    icon={MapPin}
                                    value={formData.setting}
                                    onChange={(e: any) => setFormData({ ...formData, setting: e.target.value })}
                                    placeholder={t('setup.fields.setting_placeholder')}
                                />
                            </div>

                            {/* Preview */}
                            <div className="relative hidden md:block">
                                <div className="absolute inset-0 bg-white/5 rounded-[32px] -z-10 opacity-50" />
                                <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-6">
                                    <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full shadow-xl flex items-center justify-center text-indigo-200 relative">
                                        <User size={40} />
                                    </div>
                                    <p className="text-sm text-indigo-200/50">
                                        {formData.main_character || t('setup.hero_preview_hint')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 flex justify-end">
                            <button
                                onClick={() => setStep(1)}
                                disabled={!formData.title}
                                className="bg-slate-900 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-violet-600 transition-colors shadow-xl shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                            >
                                {t('setup.next')} <ArrowRight size={20} />
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-1 space-y-8"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <label className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-wider text-xs">
                                    <User size={14} /> {t('setup.fields.target_audience')}
                                </label>
                                <AgeSelector
                                    selected={formData.target_audience}
                                    onSelect={(val: string) => setFormData({ ...formData, target_audience: val })}
                                />

                                <label className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-wider text-xs mt-6">
                                    <Mic size={14} /> {t('setup.fields.voice')}
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {VOICE_OPTIONS.map((voice) => (
                                        <div
                                            key={voice.id}
                                            onClick={() => setFormData({ ...formData, voice_id: formData.voice_id === voice.id ? '' : voice.id })}
                                            className={`p-3 rounded-xl border-2 transition-all flex items-center justify-between gap-3 cursor-pointer ${formData.voice_id === voice.id ? 'border-violet-500 bg-violet-500/10 text-white' : 'border-white/10 bg-white/5 hover:border-white/30 text-slate-300'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">{voice.emoji}</span>
                                                <div className="text-xs font-bold">{voice.name}</div>
                                            </div>
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <VoicePreviewButton previewUrl={voice.previewUrl || ''} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <label className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-wider text-xs">
                                    <Palette size={14} /> {t('setup.fields.style')}
                                </label>
                                <StyleSelector
                                    selected={formData.visual_style}
                                    onSelect={(val: string) => setFormData({ ...formData, visual_style: val })}
                                />
                            </div>
                        </div>

                        {/* LENGTH SELECTOR - CRITICAL FIX */}
                        <div className="space-y-6 border-t border-white/10 pt-6">
                            <label className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-wider text-xs">
                                <Book size={14} /> {t('setup.fields.length')}
                            </label>
                            <div className="grid grid-cols-4 gap-4">
                                {[5, 10, 15, 25].map((len) => {
                                    const baseCost = STORY_COSTS[len as keyof typeof STORY_COSTS] || (len + 1) * IMAGE_COSTS.FLUX_PRO;
                                    const audioCost = formData.voice_id ? len * 20 : 0;
                                    const cost = baseCost + audioCost;
                                    const isAffordable = userBalance !== null && userBalance >= cost;
                                    const isSelected = formData.length === len;

                                    return (
                                        <button
                                            key={len}
                                            onClick={() => setFormData({ ...formData, length: len })}
                                            className={`p-4 rounded-xl border-2 transition-all relative overflow-hidden ${isSelected ? 'border-violet-500 bg-violet-500/10' : 'border-white/10 bg-white/5 hover:border-white/30'}`}
                                        >
                                            <div className="text-2xl font-bold text-white mb-1">{len} {t('setup.energy.pages')}</div>
                                            <div className="text-xs font-bold uppercase tracking-wider text-indigo-200">{cost} ⚡</div>
                                            {!isAffordable && (
                                                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                                                    <span className="text-[10px] font-bold text-red-300 uppercase bg-red-900/80 px-2 py-1 rounded">{t('setup.energy.insufficient')}</span>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-8 flex justify-between items-center bg-slate-900/60 backdrop-blur sticky bottom-0 py-4 border-t border-white/5">
                            <button
                                onClick={() => setStep(0)}
                                className="text-slate-400 font-bold hover:text-slate-600 px-6 py-4"
                            >
                                {t('setup.back')}
                            </button>
                            <div className="flex flex-col items-end gap-2">
                                {policyError && (
                                    <p className="text-red-400 text-sm text-right">{policyError}</p>
                                )}
                                <button
                                    onClick={handleSubmit}
                                    disabled={!hasEnoughEnergy}
                                    className={`bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-12 py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-fuchsia-500/30 transition-all transform hover:scale-105 flex items-center gap-3 ${!hasEnoughEnergy ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                                >
                                    <Sparkles size={20} className="animate-spin-slow" />
                                    {hasEnoughEnergy ? t('setup.create_action') : t('setup.energy.insufficient_button')}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
