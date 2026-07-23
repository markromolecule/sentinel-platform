import { DEFAULT_STUDENT_EXAM_FLOW, STUDENT_EXAM_FLOW_STORAGE_PREFIX } from './_constants';
import type { StoredStudentExamFlow } from './_types';
import {
    normalizeMediaPipeCalibrationProfile,
    normalizeStoredActivationSource,
    normalizeStoredDate,
} from './_utils';

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

function buildStudentExamFlowStorageKey(examId: string): string {
    return `${STUDENT_EXAM_FLOW_STORAGE_PREFIX}:${examId}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Reads the student exam flow state from sessionStorage.
 * Returns the default flow state when running server-side or when no stored value is found.
 */
export function readStoredStudentExamFlow(examId: string): StoredStudentExamFlow {
    if (typeof window === 'undefined') {
        return DEFAULT_STUDENT_EXAM_FLOW;
    }

    const rawValue = window.sessionStorage.getItem(buildStudentExamFlowStorageKey(examId));

    if (!rawValue) {
        return DEFAULT_STUDENT_EXAM_FLOW;
    }

    try {
        const parsedValue = JSON.parse(rawValue) as Partial<StoredStudentExamFlow> | null;

        return {
            privacyAccepted: parsedValue?.privacyAccepted === true,
            checkupCompleted: parsedValue?.checkupCompleted === true,
            mediaPipeActivatedAt: normalizeStoredDate(parsedValue?.mediaPipeActivatedAt),
            mediaPipeCalibrationCompletedAt: normalizeStoredDate(
                parsedValue?.mediaPipeCalibrationCompletedAt,
            ),
            mediaPipeActivationSource: normalizeStoredActivationSource(
                parsedValue?.mediaPipeActivationSource,
            ),
            mediaPipeCalibrationProfile: normalizeMediaPipeCalibrationProfile(
                parsedValue?.mediaPipeCalibrationProfile,
            ),
        };
    } catch {
        window.sessionStorage.removeItem(buildStudentExamFlowStorageKey(examId));
        return DEFAULT_STUDENT_EXAM_FLOW;
    }
}

/**
 * Writes the full student exam flow state to sessionStorage.
 */
export function writeStoredStudentExamFlow(examId: string, value: StoredStudentExamFlow): void {
    if (typeof window === 'undefined') {
        return;
    }

    window.sessionStorage.setItem(buildStudentExamFlowStorageKey(examId), JSON.stringify(value));
}

/**
 * Applies a partial patch to the stored student exam flow state and writes it back.
 * Returns the merged result.
 */
export function patchStoredStudentExamFlow(
    examId: string,
    patch: Partial<StoredStudentExamFlow>,
): StoredStudentExamFlow {
    const currentValue = readStoredStudentExamFlow(examId);
    const nextValue: StoredStudentExamFlow = {
        ...currentValue,
        ...patch,
    };

    writeStoredStudentExamFlow(examId, nextValue);

    return nextValue;
}
