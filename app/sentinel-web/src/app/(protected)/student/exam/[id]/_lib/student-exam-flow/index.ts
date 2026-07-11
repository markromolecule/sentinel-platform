import {
    DEFAULT_STUDENT_EXAM_FLOW,
    STUDENT_EXAM_FLOW_STORAGE_PREFIX,
    STUDENT_EXAM_MEDIAPIPE_ACTIVATION_MAX_AGE_MS,
} from './_constants';
import type { StoredStudentExamFlow, StudentExamStage } from './_types';
import {
    normalizeMediaPipeCalibrationProfile,
    normalizeStoredActivationSource,
    normalizeStoredDate,
} from './_utils';

export * from './_types';
export * from './_constants';
export * from './_utils';

function buildStudentExamFlowStorageKey(examId: string) {
    return `${STUDENT_EXAM_FLOW_STORAGE_PREFIX}:${examId}`;
}

export function buildStudentExamHref(examId: string, stage: StudentExamStage) {
    return `/student/exam/${examId}/${stage}`;
}

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

export function writeStoredStudentExamFlow(examId: string, value: StoredStudentExamFlow) {
    if (typeof window === 'undefined') {
        return;
    }

    window.sessionStorage.setItem(buildStudentExamFlowStorageKey(examId), JSON.stringify(value));
}

export function patchStoredStudentExamFlow(examId: string, patch: Partial<StoredStudentExamFlow>) {
    const currentValue = readStoredStudentExamFlow(examId);
    const nextValue = {
        ...currentValue,
        ...patch,
    };

    writeStoredStudentExamFlow(examId, nextValue);

    return nextValue;
}

export function resolveStoredStudentExamCheckupReadiness(args: {
    examId: string;
    requiresMediaPipeActivation: boolean;
    maxAgeMs?: number;
    nowMs?: number;
}) {
    const storedFlow = readStoredStudentExamFlow(args.examId);
    const mediaPipeActivation = resolveStoredStudentExamMediaPipeActivation({
        examId: args.examId,
        required: args.requiresMediaPipeActivation,
        maxAgeMs: args.maxAgeMs,
        nowMs: args.nowMs,
    });

    return {
        storedFlow,
        mediaPipeActivation,
        isReady:
            storedFlow.privacyAccepted &&
            storedFlow.checkupCompleted &&
            mediaPipeActivation.isValid,
    };
}

export function resolveStoredStudentExamMediaPipeActivation(args: {
    examId: string;
    required: boolean;
    maxAgeMs?: number;
    nowMs?: number;
}) {
    const storedFlow = readStoredStudentExamFlow(args.examId);

    if (!args.required) {
        return {
            status: 'not-required' as const,
            isValid: true,
            storedFlow,
            ageMs: null,
        };
    }

    if (
        storedFlow.mediaPipeActivationSource !== 'checkup' ||
        !storedFlow.mediaPipeActivatedAt ||
        !storedFlow.mediaPipeCalibrationCompletedAt
    ) {
        return {
            status: 'missing' as const,
            isValid: false,
            storedFlow,
            ageMs: null,
        };
    }

    const activatedAtMs = new Date(storedFlow.mediaPipeActivatedAt).getTime();
    const ageMs = Math.max(0, (args.nowMs ?? Date.now()) - activatedAtMs);

    if (ageMs > (args.maxAgeMs ?? STUDENT_EXAM_MEDIAPIPE_ACTIVATION_MAX_AGE_MS)) {
        return {
            status: 'stale' as const,
            isValid: false,
            storedFlow,
            ageMs,
        };
    }

    return {
        status: 'ready' as const,
        isValid: true,
        storedFlow,
        ageMs,
    };
}
