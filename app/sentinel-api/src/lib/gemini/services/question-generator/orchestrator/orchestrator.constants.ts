export const MAX_PASSAGE_REPAIR_ROUNDS = 2;
export const MAX_DEFICIT_REPLENISHMENT_ROUNDS = 2;
export const DEFAULT_BATCH_SIZE = 10;

export const BLOCKING_PASSAGE_VIOLATIONS = new Set([
    'MISSING_ITEM',
    'EMPTY_PASSAGE',
    'ANSWER_EXACT_MATCH',
    'ENUMERATION_LIST_REVEALED',
    'MATCHING_PAIR_REVEALED',
    'TRUE_FALSE_PROPOSITION_RESTATED',
]);

export function isBlockingPassageFailure(failedSlot: { violations: string[] }): boolean {
    return failedSlot.violations.some((violation) => BLOCKING_PASSAGE_VIOLATIONS.has(violation));
}
