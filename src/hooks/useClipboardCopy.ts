import { useState } from 'react';

export const useClipboardCopy = (resetMs = 1500) => {
    const [copied, setCopied] = useState<string | null>(null);

    const copy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(text);
        setTimeout(() => setCopied(null), resetMs);
    };

    return { copied, copy };
};
