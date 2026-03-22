export const getLanguageName = (code: string) => {
    const shortCode = code.substring(0, 2).toLowerCase();
    switch (shortCode) {
        case 'en': return 'English';
        case 'cs': return 'Czech (čeština)';
        default: return 'Czech (čeština)';
    }
}

export const getTextFieldName = (code: string) => {
    const shortCode = code.substring(0, 2).toLowerCase();
    switch (shortCode) {
        case 'en': return 'text_en';
        case 'cs': return 'text_cz';
        default: return 'text_cz';
    }
}

export const getTitleFieldName = (code: string) => {
    const shortCode = code.substring(0, 2).toLowerCase();
    switch (shortCode) {
        case 'en': return 'title_en';
        case 'cs': return 'title_cz';
        default: return 'title_cz';
    }
}
