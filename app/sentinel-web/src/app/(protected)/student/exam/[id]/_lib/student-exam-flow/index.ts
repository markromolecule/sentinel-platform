import type { ExamRuntimeAccess, ExamRuntimeAccessState } from '@sentinel/shared';
import {
    DEFAULT_STUDENT_EXAM_FLOW,
    STUDENT_EXAM_FLOW_STORAGE_PREFIX,
    STUDENT_EXAM_MEDIAPIPE_ACTIVATION_MAX_AGE_MS,
} from './_constants';
import type {
    StoredStudentExamFlow,
    StudentExamStage,
    StudentExamStageResolverInput,
    StudentExamStageResolverResult,
} from './_types';
import { STUDENT_EXAM_STAGES } from './_types';
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

export function resolveStudentExamAdmissionState(
    runtimeAccess?:
        | ExamRuntimeAccess
        | {
              state?: ExamRuntimeAccessState | null;
              reasonCode?: string | null;
              admissionStatus?:
                  | 'pending'
                  | 'approved'
                  | 'rejected'
                  | 'APPROVED'
                  | 'WAITING'
                  | 'REJECTED'
                  | null;
          }
        | null,
): 'pending' | 'approved' | 'rejected' | null {
    if (!runtimeAccess) return null;

    if ('admissionStatus' in runtimeAccess && runtimeAccess.admissionStatus) {
        const rawStatus = String(runtimeAccess.admissionStatus).toLowerCase();
        if (rawStatus === 'approved') return 'approved';
        if (rawStatus === 'rejected') return 'rejected';
        if (rawStatus === 'waiting' || rawStatus === 'pending') return 'pending';
    }

    if (runtimeAccess.state === 'lobby_approved') {
        return 'approved';
    }

    if (
        (runtimeAccess.state as string) === 'lobby_rejected' ||
        runtimeAccess.reasonCode === 'LOBBY_REJECTED'
    ) {
        return 'rejected';
    }

    if (
        runtimeAccess.state === 'lobby_waiting' ||
        runtimeAccess.reasonCode === 'LOBBY_WAITING'
    ) {
        return 'pending';
    }

    return null;
}

/**
 * Pure stage resolver that calculates the exact single target stage for a student exam session.
 * Enforces stage precedence: Instruction -> Privacy -> Checkup -> Lobby -> Attempt -> Result.
 * Prevents URL jumping, enforces consent & checkup readiness, checks lifecycle blocks, and handles reconnect limits.
 */
export function resolveStudentExamStage(
    input: StudentExamStageResolverInput,
): StudentExamStageResolverResult {
    const {
        requestedStage,
        privacyAccepted,
        checkupCompleted,
        mediaPipeStatus,
        admissionMode,
        admissionState: explicitAdmissionState,
        runtimeAccess,
        configQueryError,
        examQueryError,
    } = input;

    const admissionState =
        explicitAdmissionState ?? resolveStudentExamAdmissionState(runtimeAccess);

    // 1. Turned-in / Completed exam -> Result stage (unless override canStart/canResume is active)
    const isOverrideActive = Boolean(runtimeAccess?.canStart || runtimeAccess?.canResume);
    if (runtimeAccess?.isTurnedIn && !isOverrideActive) {
        return {
            targetStage: 'result',
            reasonCode: 'TURNED_IN',
            shouldRedirect: requestedStage !== 'result',
        };
    }

    // 2. Lifecycle blocked state (Locked, Closed, Superseded) -> Instruction stage (with block banner)
    if (runtimeAccess?.blockedCode) {
        const reasonCode = `BLOCKED_${runtimeAccess.blockedCode}` as const;
        return {
            targetStage: 'instruction',
            reasonCode,
            shouldRedirect: requestedStage !== 'instruction',
        };
    }

    // 3. Unrecoverable configuration or exam query failure -> Fail closed to Instruction
    if (configQueryError && examQueryError) {
        return {
            targetStage: 'instruction',
            reasonCode: 'CONFIG_ERROR',
            shouldRedirect: requestedStage !== 'instruction',
        };
    }

    // 4. Preflight Stage 1: Privacy Consent
    if (!privacyAccepted) {
        if (
            requestedStage === 'checkup' ||
            requestedStage === 'lobby' ||
            requestedStage === 'attempt'
        ) {
            return {
                targetStage: 'privacy',
                reasonCode: 'PRIVACY_REQUIRED',
                shouldRedirect: true,
            };
        }
        const targetStage = requestedStage === 'privacy' ? 'privacy' : 'instruction';
        return {
            targetStage,
            reasonCode: requestedStage === 'privacy' ? 'PRIVACY_REQUIRED' : 'INSTRUCTION',
            shouldRedirect: false,
        };
    }

    // 5. Preflight Stage 2: System Checkup & MediaPipe Calibration
    const isMediaPipeValid = mediaPipeStatus === 'ready' || mediaPipeStatus === 'not-required';
    const isCheckupReady = checkupCompleted && isMediaPipeValid;

    if (!isCheckupReady) {
        if (requestedStage === 'lobby' || requestedStage === 'attempt') {
            return {
                targetStage: 'checkup',
                reasonCode: mediaPipeStatus === 'stale' ? 'MEDIAPIPE_STALE' : 'CHECKUP_REQUIRED',
                shouldRedirect: true,
            };
        }
        if (requestedStage === 'instruction') {
            return {
                targetStage: 'instruction',
                reasonCode: 'INSTRUCTION',
                shouldRedirect: false,
            };
        }
        if (requestedStage === 'privacy') {
            return {
                targetStage: 'privacy',
                reasonCode: 'PRIVACY_ACCEPTED',
                shouldRedirect: false,
            };
        }
        return {
            targetStage: 'checkup',
            reasonCode: mediaPipeStatus === 'stale' ? 'MEDIAPIPE_STALE' : 'CHECKUP_REQUIRED',
            shouldRedirect: false,
        };
    }

    // 6. Preflight Complete: Active Attempt or Reconnect Checks
    const maxReconnect = runtimeAccess?.maxReconnectAttempts ?? 3;
    const reconnectCount = runtimeAccess?.reconnectCount ?? 0;
    const isAttemptActive = Boolean(
        runtimeAccess?.isAttemptActive ||
        (runtimeAccess as { hasActiveAttempt?: boolean })?.hasActiveAttempt ||
        runtimeAccess?.canResume,
    );

    if (isAttemptActive) {
        if (reconnectCount >= maxReconnect && !runtimeAccess?.canResume) {
            return {
                targetStage: 'instruction',
                reasonCode: 'MAX_RECONNECT_EXCEEDED',
                shouldRedirect: requestedStage !== 'instruction',
            };
        }
        return {
            targetStage: 'attempt',
            reasonCode: 'ATTEMPT_ACTIVE',
            shouldRedirect: requestedStage !== 'attempt',
        };
    }

    // 7. Preflight Complete: Lobby / Admission Gating
    if (admissionMode === 'INSTRUCTOR_GATED') {
        if (admissionState === 'rejected') {
            return {
                targetStage: 'lobby',
                reasonCode: 'LOBBY_GATED_REJECTED',
                shouldRedirect: requestedStage !== 'lobby',
            };
        }
        if (admissionState === 'approved') {
            const targetStage =
                requestedStage === 'attempt' ? 'attempt' : (requestedStage as StudentExamStage);
            const validTarget = (STUDENT_EXAM_STAGES as readonly string[]).includes(targetStage)
                ? targetStage
                : 'lobby';
            return {
                targetStage: validTarget as StudentExamStage,
                reasonCode: 'LOBBY_GATED_APPROVED',
                shouldRedirect: requestedStage !== validTarget,
            };
        }
        return {
            targetStage: 'lobby',
            reasonCode: 'LOBBY_GATED_WAITING',
            shouldRedirect: requestedStage === 'attempt',
        };
    }

    // 8. Automatic Admission
    if (requestedStage === 'attempt' && !isAttemptActive) {
        return {
            targetStage: 'lobby',
            reasonCode: 'AUTOMATIC_ADMISSION',
            shouldRedirect: true,
        };
    }

    const validStage = (STUDENT_EXAM_STAGES as readonly string[]).includes(requestedStage)
        ? (requestedStage as StudentExamStage)
        : 'lobby';

    return {
        targetStage: validStage,
        reasonCode: 'AUTOMATIC_ADMISSION',
        shouldRedirect: false,
    };
}

