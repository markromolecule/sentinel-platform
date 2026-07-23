import type { ExamRuntimeAccess, ExamRuntimeAccessState } from '@sentinel/shared';
import { STUDENT_EXAM_MEDIAPIPE_ACTIVATION_MAX_AGE_MS } from './_constants';
import { readStoredStudentExamFlow } from './_storage';

// ---------------------------------------------------------------------------
// MediaPipe Activation
// ---------------------------------------------------------------------------

/**
 * Resolves whether a student's MediaPipe activation stored in session is currently valid.
 * Handles the three possible states: not-required, missing, stale, and ready.
 */
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

// ---------------------------------------------------------------------------
// Checkup Readiness
// ---------------------------------------------------------------------------

/**
 * Evaluates the combined readiness of a student's checkup, privacy consent,
 * and MediaPipe calibration state for a given exam.
 */
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

// ---------------------------------------------------------------------------
// Admission State
// ---------------------------------------------------------------------------

/**
 * Normalises instructor-gated admission state from varying runtime access shapes
 * into a canonical 'pending' | 'approved' | 'rejected' | null value.
 */
export function resolveStudentExamAdmissionState(
    runtimeAccess?:
        | ExamRuntimeAccess
        | {
              state?: ExamRuntimeAccessState | null;
              reasonCode?: string | null;
              admissionStatus?:
                  'pending' | 'approved' | 'rejected' | 'APPROVED' | 'WAITING' | 'REJECTED' | null;
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

    if (runtimeAccess.state === 'lobby_waiting' || runtimeAccess.reasonCode === 'LOBBY_WAITING') {
        return 'pending';
    }

    return null;
}
