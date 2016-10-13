

/**
 * Generates a random id that is unique enough for our purposes.
 */
export const uniqueId = () => Math.random().toString(24).slice(2);
