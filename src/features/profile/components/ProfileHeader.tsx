import { motion } from 'framer-motion';
import { Edit2, LogOut, Check, X, Zap, Plus, Book, ArrowLeft } from 'lucide-react';
import { UserStats } from '../hooks/useProfileStats';

interface ProfileHeaderProps {
    user: any;
    nickname: string;
    avatarEmoji: string;
    level: number;
    balance: number;
    stats: UserStats;
    isEditingNickname: boolean;
    tempNickname: string;
    setTempNickname: (val: string) => void;
    onSaveNickname: () => void;
    onCancelNickname: () => void;
    onEditNickname: () => void;
    onAvatarClick: () => void;
    onLogin?: () => void;
    onLogout?: () => void;
    onNavigate?: (view: any) => void;
    onBack: () => void;
}

export const ProfileHeader = ({
    user,
    nickname,
    avatarEmoji,
    level,
    balance,
    stats,
    isEditingNickname,
    tempNickname,
    setTempNickname,
    onSaveNickname,
    onCancelNickname,
    onEditNickname,
    onAvatarClick,
    onLogin,
    onLogout,
    onNavigate,
    onBack
}: ProfileHeaderProps) => {
    return (
        <>
            {/* Header / Nav */}
            <div className="absolute top-6 left-6 z-50">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors uppercase tracking-wider text-xs font-bold bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg"
                >
                    <ArrowLeft size={16} /> Zpět
                </button>
            </div>

            {/* 1. Identity Card */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex flex-col md:flex-row items-center gap-8 mb-16"
            >
                {/* AVATAR */}
                <div className="relative group">
                    <button
                        onClick={onAvatarClick}
                        className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-tr from-pink-400 via-purple-400 to-blue-400 p-1.5 shadow-2xl shadow-purple-300/50 hover:scale-105 hover:rotate-3 transition-all cursor-pointer relative"
                    >
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center border-4 border-white overflow-hidden text-6xl md:text-7xl shadow-inner">
                            {avatarEmoji}
                        </div>
                        {/* Edit icon overlay */}
                        {user && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-pink-500/80 to-purple-500/80 rounded-full pointer-events-none">
                                <Edit2 size={24} className="text-white drop-shadow-lg" />
                            </div>
                        )}
                    </button>
                    {user && (
                        <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-400 border-2 border-white px-3 py-1 rounded-full text-xs font-black text-white shadow-lg">
                            LVL {level} ⭐
                        </div>
                    )}
                </div>

                {/* INFO */}
                <div className="text-center md:text-left flex-1 flex flex-col items-center md:items-start">
                    {/* Nickname/Email */}
                    {isEditingNickname ? (
                        <div className="flex items-center gap-2 mb-2">
                            <input
                                type="text"
                                value={tempNickname}
                                onChange={(e) => setTempNickname(e.target.value)}
                                className="bg-white text-slate-800 text-3xl font-black px-4 py-2 rounded-2xl border-2 border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-200 shadow-lg"
                                placeholder="Tvoje přezdívka"
                                autoFocus
                            />
                            <button onClick={onSaveNickname} className="p-3 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white rounded-2xl shadow-lg hover:scale-105 transition-transform">
                                <Check size={20} />
                            </button>
                            <button onClick={onCancelNickname} className="p-3 bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 text-white rounded-2xl shadow-lg hover:scale-105 transition-transform">
                                <X size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                                {nickname || user?.email?.split('@')[0] || "Anonymní Návštěvník"}
                            </h1>
                            {user && (
                                <button
                                    onClick={onEditNickname}
                                    className="p-2 hover:bg-purple-100 rounded-xl transition-colors text-purple-400 hover:text-purple-600"
                                >
                                    <Edit2 size={18} />
                                </button>
                            )}
                        </div>
                    )}
                    <p className="text-slate-600 text-lg mb-6 font-semibold">{user ? "Novic Spisovatel 📖" : "Pro uložení postupu se prosím přihlas"}</p>

                    {!user && onLogin && (
                        <button
                            onClick={onLogin}
                            className="mb-6 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-full shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
                        >
                            Přihlásit se
                        </button>
                    )}

                    {user && onLogout && (
                        <button
                            onClick={onLogout}
                            className="mb-6 px-6 py-2 bg-white hover:bg-red-50 text-red-500 hover:text-red-600 font-bold rounded-full border-2 border-red-200 hover:border-red-400 transition-all text-sm flex items-center gap-2 shadow-lg"
                        >
                            <LogOut size={14} /> Odhlásit se
                        </button>
                    )}

                    {/* Stats Row */}
                    {user && (
                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <div
                                className="bg-white border-2 border-amber-200 px-6 py-3 rounded-2xl flex items-center gap-3 cursor-pointer hover:border-amber-400 hover:shadow-xl transition-all hover:scale-105"
                                onClick={() => onNavigate && onNavigate('energy_store')}
                            >
                                <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-2 rounded-xl text-white shadow-lg">
                                    <Zap size={20} className="fill-white" />
                                </div>
                                <div className="text-left">
                                    <div className="text-xs text-amber-600 font-bold uppercase tracking-wider flex items-center gap-1">
                                        Energie <Plus size={10} className="text-amber-500" />
                                    </div>
                                    <div className="text-xl font-black text-slate-800">{balance || 0}</div>
                                </div>
                            </div>

                            <div className="bg-white border-2 border-purple-200 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg">
                                <div className="bg-gradient-to-br from-purple-400 to-pink-500 p-2 rounded-xl text-white shadow-lg">
                                    <Book size={20} />
                                </div>
                                <div className="text-left">
                                    <div className="text-xs text-purple-600 font-bold uppercase tracking-wider">Příběhy</div>
                                    <div className="text-xl font-black text-slate-800">{stats.booksCount}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </>
    );
};
