/** Generate a short random ID (9 chars, base-36). */
export const generateId = () => Math.random().toString(36).substr(2, 9);
