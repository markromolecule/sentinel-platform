/**
 * Computes the integrity rate as a percentage of completed sessions without flags.
 * Result is clamped to the [0, 100] range and safe against zero-division.
 *
 * @param completed - Total number of completed exam sessions.
 * @param flagged - Number of flagged sessions within completed sessions.
 * @returns Integrity rate as a whole-number percentage (0–100).
 */
export function computeIntegrityRate(completed: number, flagged: number): number {
    if (completed <= 0) return 0;
    const rate = ((completed - (flagged ?? 0)) / completed) * 100;
    return Math.max(0, Math.min(100, Math.round(rate)));
}

/**
 * Returns the risk tier label for an integrity rate value.
 *
 * @param rate - Integrity rate (0–100).
 * @returns 'high' | 'medium' | 'low'
 */
export function getIntegrityTier(rate: number): 'high' | 'medium' | 'low' {
    if (rate >= 95) return 'high';
    if (rate >= 85) return 'medium';
    return 'low';
}
