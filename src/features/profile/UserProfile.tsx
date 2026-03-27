import { useState } from 'react';
import { useEnergy } from '../../hooks/useEnergy';
import { useProfileStats } from './hooks/useProfileStats';

// Sub-components
import { ProfileHeader } from './components/ProfileHeader';
import { StatsGrid } from './components/StatsGrid';
import { EnergyCard } from './components/EnergyCard';
import { ReferralCard } from './components/ReferralCard';
import { AchievementGrid } from './components/AchievementGrid';
import { AvatarPicker } from './components/AvatarPicker';

interface UserProfileProps {
    user: any;
    onBack: () => void;
    onLogin?: () => void;
    onLogout?: () => void;
    onNavigate?: (view: any) => void;
}

export const UserProfile = ({ user, onBack, onLogin, onLogout, onNavigate }: UserProfileProps) => {
    const { balance } = useEnergy();
    const {
        stats,
        achievements,
        loading,
        nickname,
        avatarEmoji,
        level,
        referralCode,
        updateAvatar,
        updateNickname
    } = useProfileStats(user);

    // UI State
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const [isEditingNickname, setIsEditingNickname] = useState(false);
    const [tempNickname, setTempNickname] = useState('');

    const handleNicknameEdit = () => {
        setTempNickname(nickname);
        setIsEditingNickname(true);
    };

    const handleNicknameSave = async () => {
        await updateNickname(tempNickname);
        setIsEditingNickname(false);
    };

    const handleNicknameCancel = () => {
        setTempNickname('');
        setIsEditingNickname(false);
    };

    const handleAvatarChange = async (emoji: string) => {
        await updateAvatar(emoji);
        // Modal close is handled by prop or strictly here?
        // Original code didn't close it in handleAvatarChange, but the Picker might.
        // Let's keep it consistent.
    };

    return (
        <div className="h-screen w-full relative overflow-y-auto bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 text-slate-800 font-sans custom-scrollbar">
            {/* Playful Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="hidden sm:block absolute top-10 left-10 text-6xl opacity-40">☁️</div>
                <div className="hidden sm:block absolute top-32 right-20 text-5xl opacity-30">☁️</div>
                <div className="hidden sm:block absolute top-64 left-1/3 text-7xl opacity-20">☁️</div>
                <div className="absolute top-20 right-1/4 text-3xl animate-pulse">⭐</div>
                <div className="absolute top-96 left-1/4 text-2xl animate-pulse" style={{ animationDelay: '0.5s' }}>✨</div>
                <div className="absolute bottom-32 right-1/3 text-3xl animate-pulse" style={{ animationDelay: '1s' }}>🌟</div>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto p-4 sm:p-8 pt-24">
                <ProfileHeader
                    user={user}
                    nickname={nickname}
                    avatarEmoji={avatarEmoji}
                    level={level}
                    balance={balance || 0}
                    stats={stats}
                    isEditingNickname={isEditingNickname}
                    tempNickname={tempNickname}
                    setTempNickname={setTempNickname}
                    onSaveNickname={handleNicknameSave}
                    onCancelNickname={handleNicknameCancel}
                    onEditNickname={handleNicknameEdit}
                    onAvatarClick={() => user && setShowAvatarPicker(true)}
                    onLogin={onLogin}
                    onLogout={onLogout}
                    onNavigate={onNavigate}
                    onBack={onBack}
                />

                {user && (
                    <>
                        <StatsGrid stats={stats} />
                        <EnergyCard stats={stats} />
                        <ReferralCard referralCode={referralCode} referralCount={stats.referralCount} />
                    </>
                )}

                <AchievementGrid achievements={achievements} stats={stats} loading={loading} />
            </div>

            {/* Avatar Picker Modal */}
            {showAvatarPicker && (
                <AvatarPicker
                    currentAvatar={avatarEmoji}
                    onSelect={handleAvatarChange}
                    onClose={() => setShowAvatarPicker(false)}
                />
            )}
        </div>
    );
};
