import i18n from './i18n';
import { getBookMediaUrl } from './supabase';

export const VOICE_OPTIONS = [
    { id: 'Xb7hH8MSUJpSbSDYk0k2', name: i18n.t('audio.voices.tante_label'), emoji: '👩', description: i18n.t('audio.voices.tante_desc'), previewUrl: getBookMediaUrl('Audio-preview/preview/Laskava teta.mp3') },
    { id: 'CwhRBWXzGAHq8TQ4Fs17', name: i18n.t('audio.voices.papa_label'), emoji: '👨', description: i18n.t('audio.voices.papa_desc'), previewUrl: getBookMediaUrl('Audio-preview/preview/Klidny tata.mp3') },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: i18n.t('audio.voices.grandma_label'), emoji: '🧙‍♀️', description: i18n.t('audio.voices.grandma_desc'), previewUrl: getBookMediaUrl('Audio-preview/preview/Babicka.mp3') },
    { id: 'TX3LPaxmHKxFdv7VOQHJ', name: i18n.t('audio.voices.friend_label'), emoji: '👦', description: i18n.t('audio.voices.friend_desc'), previewUrl: getBookMediaUrl('Audio-preview/preview/Kamos.mp3') }
];

export const DEFAULT_VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2';
