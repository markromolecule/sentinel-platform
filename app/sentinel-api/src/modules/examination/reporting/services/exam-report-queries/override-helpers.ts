import type { StudentExamAccessOverride } from '../../../student-overrides/student-overrides.dto';
import { parseDateValue } from './date-utils';

/**
 * Compares two student exam access overrides to determine their recency.
 * Used for sorting overrides based on update/creation/availability times.
 *
 * @param left - The first override to compare.
 * @param right - The second override to compare.
 * @returns A positive number if right is more recent, negative if left is more recent, or 0.
 */
export function compareOverrideRecency(
    left: StudentExamAccessOverride,
    right: StudentExamAccessOverride,
) {
    const leftTime =
        parseDateValue(left.updatedAt)?.getTime() ??
        parseDateValue(left.createdAt)?.getTime() ??
        parseDateValue(left.availableUntil)?.getTime() ??
        0;
    const rightTime =
        parseDateValue(right.updatedAt)?.getTime() ??
        parseDateValue(right.createdAt)?.getTime() ??
        parseDateValue(right.availableUntil)?.getTime() ??
        0;

    return rightTime - leftTime;
}

/**
 * Builds recency maps for active exam overrides and specific attempt kinds.
 *
 * @param accessOverrides - An array of student exam access overrides.
 * @returns An object containing `overrideAttemptKindMap` and `activeOverrideMap`.
 */
export function buildOverrideRecencyMaps(accessOverrides: StudentExamAccessOverride[]) {
    const overrideAttemptKindMap = new Map<string, 'makeup' | 'retake'>();
    const activeOverrideMap = new Map<string, StudentExamAccessOverride['overrideType']>();
    const now = new Date();

    for (const accessOverride of [...accessOverrides].sort(compareOverrideRecency)) {
        for (const usedAttemptId of accessOverride.usedAttemptIds) {
            if (accessOverride.overrideType === 'MAKEUP') {
                overrideAttemptKindMap.set(usedAttemptId, 'makeup');
            }

            if (accessOverride.overrideType === 'RETAKE') {
                overrideAttemptKindMap.set(usedAttemptId, 'retake');
            }
        }

        const availableUntil = parseDateValue(accessOverride.availableUntil);

        if (
            availableUntil &&
            availableUntil.getTime() >= now.getTime() &&
            accessOverride.usedAttempts < accessOverride.allowedAttempts &&
            (accessOverride.overrideType !== 'REOPEN' || Boolean(accessOverride.sourceAttemptId)) &&
            !activeOverrideMap.has(accessOverride.studentId)
        ) {
            activeOverrideMap.set(accessOverride.studentId, accessOverride.overrideType);
        }
    }

    return {
        overrideAttemptKindMap,
        activeOverrideMap,
    };
}
