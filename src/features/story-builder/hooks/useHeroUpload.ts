import { useState } from 'react';
import { supabase } from '../../../lib/supabase';

export const useHeroUpload = () => {
    const [isUploading, setIsUploading] = useState(false);

    const uploadHeroImage = async (file: File): Promise<{ url: string | null; error?: string }> => {
        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `hero_${crypto.randomUUID()}.${fileExt}`;
            const filePath = `temp/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('story-assets')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('story-assets')
                .getPublicUrl(filePath);

            return { url: publicUrl };
        } catch (err: any) {
            return { url: null, error: err.message || 'Upload failed' };
        } finally {
            setIsUploading(false);
        }
    };

    return { isUploading, uploadHeroImage };
};
