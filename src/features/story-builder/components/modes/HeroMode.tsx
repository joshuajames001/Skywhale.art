import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, User, MapPin, Palette, ArrowRight, Sparkles, Mic, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AnimatedInput } from '../shared/AnimatedInput';
import { AgeSelector } from '../shared/AgeSelector';
import { StyleSelector } from '../shared/StyleSelector';
import { VoicePreviewButton } from '../../../../components/audio/VoicePreviewButton';
import { VOICE_OPTIONS, DEFAULT_VOICE_ID } from '../../../../lib/audio-constants';
import { generateCompleteStory } from '../../../../lib/ai/orchestrator';
import { StoryBook } from '../../../../types';
import { MagicLoading } from '../effects/MagicLoading';
import { MagicFlash } from '../effects/MagicFlash';
import { checkTopicBlacklist, validateImageFile } from '../../../../lib/content-policy';
import { STORY_COSTS, IMAGE_COSTS } from '../../../../lib/constants';
import { useHeroUpload } from '../../hooks/useHeroUpload';

interface HeroModeProps {
    userBalance: number | null;
    onComplete: (story: StoryBook) => Promise<void>;
    onCancel: () => void;
    onOpenStore?: () => void;
    currentLanguage: string;
}

export const HeroMode: React.FC<HeroModeProps> = ({
    userBalance,
    onComplete,
    onCancel,
    onOpenStore,
    currentLanguage
}) => {
    const { t } = useTranslation();
    const [step, setStep] = useState(0); // 0 = Upload, 1 = Details, 2 = Advanced
    const [isGenerating, setIsGenerating] = useState(false);
    const [creationStatus, setCreationStatus] = useState<string | null>(null);
    const [policyError, setPolicyError] = useState<string | null>(null);
    const { isUploading, uploadHeroImage } = useHeroUpload();

    // CRITICAL FIX: Default length is 5
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        main_character: '', // Will be derived from file or input
        visual_dna: '',
        setting: '',
        target_audience: '4-7',
        visual_style: 'Watercolor',
        length: 5, // DEFAULT TO 5
        voice_id: DEFAULT_VOICE_ID,
        hero_image_url: '' as string
    });

    const requiredEnergy = (STORY_COSTS[formData.length as keyof typeof STORY_COSTS] || (formData.length + 1) * IMAGE_COSTS.FLUX_PRO) + (formData.voice_id ? formData.length * 20 : 0);
    const hasEnoughEnergy = userBalance !== null && userBalance >= requiredEnergy;

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const fileCheck = validateImageFile(file);
        if (fileCheck.blocked) { alert(fileCheck.reason); return; }

        const { url, error } = await uploadHeroImage(file);
        if (url) {
            setFormData({ ...formData, hero_image_url: url });
            setStep(1);
        } else {
            alert(error || t('setup.status.failed'));
        }
    };

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
        setCreationStatus(t('setup.status.dreaming'));

        try {
            const newStory = await generateCompleteStory({
                title: formData.title,
                author: formData.author,
                main_character: formData.main_character,
                visual_dna: formData.visual_dna,
                setting: formData.setting,
                target_audience: formData.target_audience,
                visual_style: formData.visual_style || 'Watercolor',
                length: formData.length,
                user_identity_image: formData.hero_image_url || undefined,
                language: currentLanguage
            }, (status) => {
                setCreationStatus(status);
            });

            setCreationStatus(t('setup.status.euphoria'));
            await onComplete(newStory);
        } catch (error) {
            console.error("Hero Story Creation Failed:", error);
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
        <div className="w-full max-w-5xl mx-auto bg-gradient-to-br from-emerald-950/90 to-slate-900/90 backdrop-blur-2xl p-6 md:p-10 sm:rounded-[40px] shadow-2xl relative flex flex-col border border-emerald-500/20 my-10 animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <button onClick={onCancel} className="text-emerald-400 hover:text-emerald-300 font-bold uppercase text-xs tracking-widest transition-colors flex items-center gap-2">
                    <ArrowRight className="rotate-180" size={14} /> {t('setup.back_to_select')}
                </button>
                <div className="flex gap-2">
                    {[0, 1, 2].map(i => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'w-8 bg-emerald-500' : 'w-2 bg-emerald-900/50'}`} />
                    ))}
                </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-title font-bold text-white mb-6 flex items-center gap-3">
                Hero Mode <span className="text-emerald-500 text-sm font-mono border border-emerald-500/50 px-2 py-0.5 rounded">BETA</span>
            </h2>

            <AnimatePresence mode='wait'>
                {step === 0 && (
                    <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col items-center justify-center py-10">
                        <div className="w-full max-w-md text-center space-y-8">
                            <div className="relative group cursor-pointer">
                                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" id="hero-upload-initial" />
                                <label htmlFor="hero-upload-initial" className="block">
                                    <div className="w-48 h-48 sm:w-64 sm:h-64 mx-auto rounded-3xl border-4 border-dashed border-emerald-500/30 hover:border-emerald-400/80 hover:bg-emerald-500/10 transition-all flex flex-col items-center justify-center p-6 group-hover:scale-105">
                                        {isUploading ? (
                                            <Sparkles className="animate-spin text-emerald-400" size={48} />
                                        ) : (
                                            <>
                                                <Upload className="text-emerald-400 mb-4" size={48} />
                                                <h3 className="text-white font-bold text-lg">{t('setup.fields.hero_upload')}</h3>
                                                <p className="text-emerald-200/50 text-sm mt-2">{t('setup.fields.hero_upload_hint')}</p>
                                            </>
                                        )}
                                    </div>
                                </label>
                            </div>
                            <button onClick={() => setStep(1)} className="text-emerald-400 text-sm hover:underline">{t('setup.skip_upload_for_now')}</button>
                        </div>
                    </motion.div>
                )}

                {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12">
                            <div className="space-y-8">
                                <AnimatedInput label={t('setup.fields.title')} icon={Book} value={formData.title} onChange={(e: any) => setFormData({ ...formData, title: e.target.value })} placeholder={t('setup.fields.title_placeholder')} />
                                <AnimatedInput label={t('setup.fields.hero')} icon={User} value={formData.main_character} onChange={(e: any) => setFormData({ ...formData, main_character: e.target.value })} placeholder={t('setup.fields.hero_placeholder')} />
                                <AnimatedInput label={t('setup.fields.setting')} icon={MapPin} value={formData.setting} onChange={(e: any) => setFormData({ ...formData, setting: e.target.value })} placeholder={t('setup.fields.setting_placeholder')} />
                            </div>
                            <div className="flex flex-col items-center justify-center p-8 bg-emerald-900/20 rounded-[32px] border border-emerald-500/10">
                                {formData.hero_image_url ? (
                                    <img src={formData.hero_image_url} className="w-40 h-40 object-cover rounded-2xl shadow-xl shadow-emerald-500/20" />
                                ) : (
                                    <div className="w-40 h-40 bg-emerald-900/40 rounded-2xl flex items-center justify-center"><User size={40} className="text-emerald-500/50" /></div>
                                )}
                                <p className="text-emerald-200/60 mt-4 text-sm font-medium">{t('setup.hero_preview_title')}</p>
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button onClick={() => setStep(2)} disabled={!formData.title} className="bg-emerald-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-emerald-500 transition-colors shadow-xl shadow-emerald-900/20 disabled:opacity-50 flex items-center gap-3">
                                {t('setup.next')} <ArrowRight size={20} />
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 space-y-8">
                        {/* Similar to Custom Mode Step 2 but Emerald Themed */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="text-emerald-500 font-bold uppercase text-xs">{t('setup.fields.target_audience')}</label>
                                <AgeSelector selected={formData.target_audience} onSelect={(val: string) => setFormData({ ...formData, target_audience: val })} />
                            </div>
                            <div className="space-y-4">
                                <label className="text-emerald-500 font-bold uppercase text-xs">{t('setup.fields.style')}</label>
                                <StyleSelector selected={formData.visual_style} onSelect={(val: string) => setFormData({ ...formData, visual_style: val })} />
                            </div>
                        </div>

                        {/* LENGTH SELECTOR */}
                        <div className="space-y-6 border-t border-emerald-500/10 pt-6">
                            <label className="text-emerald-500 font-bold uppercase text-xs">{t('setup.fields.length')}</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[5, 10, 15, 25].map((len) => {
                                    const cost = (STORY_COSTS[len as keyof typeof STORY_COSTS] || (len + 1) * IMAGE_COSTS.FLUX_PRO) + (formData.voice_id ? len * 20 : 0);
                                    const isAffordable = userBalance !== null && userBalance >= cost;
                                    return (
                                        <button key={len} onClick={() => setFormData({ ...formData, length: len })} className={`p-4 rounded-xl border-2 transition-all relative ${formData.length === len ? 'border-emerald-500 bg-emerald-500/10' : 'border-emerald-500/10 bg-black/20 hover:border-emerald-500/30'}`}>
                                            <div className="text-2xl font-bold text-white mb-1">{len} {t('setup.energy.pages')}</div>
                                            <div className="text-xs font-bold uppercase tracking-wider text-emerald-200">{cost} ⚡</div>
                                            {!isAffordable && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><span className="text-[10px] text-red-300 bg-red-900 px-2 rounded">LOW ENERGY</span></div>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-8 flex justify-between items-center pt-4 border-t border-emerald-500/10">
                            <button onClick={() => setStep(1)} className="text-slate-400 font-bold hover:text-white px-6 py-4">{t('setup.back')}</button>
                            <div className="flex flex-col items-end gap-2">
                                {policyError && (
                                    <p className="text-red-400 text-sm text-right">{policyError}</p>
                                )}
                                <button onClick={handleSubmit} disabled={!hasEnoughEnergy} className={`bg-emerald-600 text-white px-6 sm:px-12 py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-emerald-500/30 transition-all transform hover:scale-105 flex items-center gap-3 ${!hasEnoughEnergy ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <Sparkles size={20} /> {hasEnoughEnergy ? t('setup.create_action') : t('setup.energy.insufficient_button')}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
