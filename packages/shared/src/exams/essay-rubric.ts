/**
 * Metadata representing a single criterion in the standardized essay grading rubric.
 */
export interface EssayRubricCriterion {
    key: string;
    name: string;
    weight: number; // e.g. 0.30, 0.20, 0.15
    description: string;
    levels: Record<number, string>;
}

/**
 * Standard performance level descriptions applied across all rubric criteria.
 */
export const ESSAY_RUBRIC_LEVELS: Record<number, string> = {
    4: 'Exceptional quality, fully meets and exceeds all criteria expectations.',
    3: 'High quality, meets all criteria with only minor, negligible flaws.',
    2: 'Average quality, meets basic criteria requirements but lacks depth.',
    1: 'Substandard quality, fails to meet multiple basic requirements, incoherent.',
    0: 'Empty submission or completely unrelated response.',
};

/**
 * The 5 core criteria for evaluating student essays, with their point definitions and weights.
 */
export const ESSAY_RUBRIC_CRITERIA: EssayRubricCriterion[] = [
    {
        key: 'contentSubstance',
        name: 'Content & Substance',
        weight: 0.30,
        description: 'Depth of analysis, relevance of content to the prompt, and detail.',
        levels: ESSAY_RUBRIC_LEVELS,
    },
    {
        key: 'structureOrganization',
        name: 'Structure & Organization',
        weight: 0.20,
        description: 'Clarity of thesis, logical flow, transitions, and paragraph structure.',
        levels: ESSAY_RUBRIC_LEVELS,
    },
    {
        key: 'argumentationSupport',
        name: 'Argumentation & Support',
        weight: 0.20,
        description: 'Strength of claims, reasoning, and evidence/examples provided.',
        levels: ESSAY_RUBRIC_LEVELS,
    },
    {
        key: 'styleTone',
        name: 'Style & Tone',
        weight: 0.15,
        description: 'Consistency of formal tone, word choice, and clarity of expression.',
        levels: ESSAY_RUBRIC_LEVELS,
    },
    {
        key: 'grammarConventions',
        name: 'Grammar & Conventions',
        weight: 0.15,
        description: 'Adherence to spelling, punctuation, grammar, and syntax standards.',
        levels: ESSAY_RUBRIC_LEVELS,
    },
];

/**
 * Calculates the overall weighted score for an essay question normalized to the question's total points.
 * Formula: (Sum of (criterion_score * weight) / 4) * maxPoints
 *
 * @param scores - A record of the 5 criteria keys mapped to their scores (0 to 4).
 * @param maxPoints - The maximum points assigned to the essay question.
 * @returns The weighted score rounded to the nearest two decimal places.
 */
export function calculateEssayWeightedScore(
    scores: Record<string, number>,
    maxPoints: number,
): number {
    let weightedSum = 0;

    for (const criterion of ESSAY_RUBRIC_CRITERIA) {
        const score = scores[criterion.key] ?? 0;
        weightedSum += score * criterion.weight;
    }

    // Scale by the question's max points and normalize by the max criterion points (4)
    const rawScore = (weightedSum / 4) * maxPoints;

    // Eliminate float precision noise (e.g. 7.124999999999999 -> 7.125) before rounding to 2 decimal places
    const precisionScore = Math.round(rawScore * 10000) / 10000;

    return Math.round(precisionScore * 100) / 100;
}

