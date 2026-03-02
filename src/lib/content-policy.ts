/**
 * Content Policy — synchronní blacklist pro dětskou platformu.
 * Bez network callu, nulová latence.
 * Záměrně NEBLOKUJE obecné pohádkové násilí ("zabít draka", "rytíř bojoval").
 * Hloubková AI moderace (moderateContent) nastupuje až při generování obsahu.
 */

export interface PolicyCheckResult {
    blocked: boolean;
    reason?: string;
}

const BLACKLIST: RegExp[] = [
    // Sexual / adult content
    /\bporno\w*|\berotik\w*|\bnah[áý]\b|\bnaked\b|\bsex(?:uáln[íý])?\b|\bvulva\b|\bpenis\b|\bvagína\b|\bkurv[ao]\b/iu,
    // Self-harm / suicide
    /\bsebevražd\w*|\bsuicid\w*|\bsebepoškoz\w*/iu,
    // Graphic torture / execution (not general fairy-tale fighting)
    /\bmučen\w*|\bpoprav\w*|\bkrveprolití/iu,
    // Drugs
    /\bdrogy\b|\bkokain\b|\bheroin\b|\bmarihuana\b|\bcannabis\b/iu,
    // Occult / satanic
    /\bsatan\w*|\bsatanism\b|\bpentagram\b/iu,
];

export function checkTopicBlacklist(text: string): PolicyCheckResult {
    for (const pattern of BLACKLIST) {
        if (pattern.test(text)) {
            return { blocked: true, reason: 'Tento obsah není vhodný pro dětskou platformu.' };
        }
    }
    return { blocked: false };
}

export function validateNickname(nick: string): PolicyCheckResult {
    const trimmed = nick.trim();
    if (trimmed.length < 3) return { blocked: true, reason: 'Přezdívka musí mít alespoň 3 znaky.' };
    if (trimmed.length > 30) return { blocked: true, reason: 'Přezdívka může mít nejvýše 30 znaků.' };
    if (!/^[\p{L}\p{N} \-_]+$/u.test(trimmed)) return { blocked: true, reason: 'Přezdívka obsahuje nepovolené znaky.' };
    return checkTopicBlacklist(trimmed);
}
