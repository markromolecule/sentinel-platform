/**
 * Creates a sparse synthetic YAMNet score vector with 521 output classes.
 *
 * @param entries Sparse class-score overrides.
 * @returns A synthetic YAMNet score vector for deterministic tests.
 */
function createScores(entries: Array<[number, number]>): Float32Array {
    const scores = new Float32Array(521);

    for (const [classId, value] of entries) {
        scores[classId] = value;
    }

    return scores;
}

export const TALKING_SCORES = createScores([
    [0, 0.91],
    [1, 0.72],
]);

export const TYPING_SCORES = createScores([
    [378, 0.88],
    [379, 0.51],
]);

export const TAPPING_SCORES = createScores([[354, 0.86]]);

export const MOUTH_BREATHING_SCORES = createScores([[36, 0.78]]);

export const BACKGROUND_NOISE_SCORES = createScores([
    [500, 0.73],
    [507, 0.69],
]);

export const SILENCE_FRAME = new Float32Array(15_600).fill(0.0);

export const MIXED_SPEECH_TYPING_SCORES = createScores([
    [0, 0.81],
    [378, 0.9],
]);
