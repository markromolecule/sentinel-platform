import type { ExamConfiguration, ExamRuntimeAccess } from '@sentinel/shared/types';
import { startExamSession } from '@sentinel/services';
import { writeStoredMobileExamSession } from '@/features/exam/lib/mobile-exam-storage';

export type LobbyAdmissionStatus = 'WAITING' | 'APPROVED' | 'REJECTED' | null;

/**
 * Safely generates a unique UUID request ID with runtime crypto fallback.
 */
export function generateResumeRequestId(): string {
    if (typeof globalThis.crypto?.randomUUID === 'function') {
        return globalThis.crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/**
 * Checks if the runtime state is an immutable hard block that prevents lobby entry.
 */
export function isHardRuntimeBlock(state?: ExamRuntimeAccess['state']): boolean {
    return state === 'closed' || state === 'locked' || state === 'before_start';
}

/**
 * Resolves the effective admission status for the student lobby.
 */
export function resolveLobbyAdmissionStatus(args: {
    configuration?: ExamConfiguration;
    admissionDataStatus?: LobbyAdmissionStatus;
}): LobbyAdmissionStatus {
    const { configuration, admissionDataStatus } = args;
    const requiresInstructorAdmission =
        configuration?.lobbyAdmissionMode === 'INSTRUCTOR_GATED';

    return admissionDataStatus ?? (!requiresInstructorAdmission ? 'APPROVED' : null);
}

/**
 * Evaluates whether the student can enter or resume the exam from the lobby.
 */
export function canEnterMobileExamLobby(args: {
    runtimeAccess?: ExamRuntimeAccess;
    admissionStatus: LobbyAdmissionStatus;
    requiresInstructorAdmission: boolean;
    isMediaPipeCalibrated: boolean;
    isAudioReady: boolean;
}): boolean {
    const {
        runtimeAccess,
        admissionStatus,
        requiresInstructorAdmission,
        isMediaPipeCalibrated,
        isAudioReady,
    } = args;

    const hardBlock = isHardRuntimeBlock(runtimeAccess?.state);
    if (hardBlock || !isMediaPipeCalibrated || !isAudioReady) {
        return false;
    }

    const hasApprovedInstructorAdmission = admissionStatus === 'APPROVED' && !hardBlock;

    if (requiresInstructorAdmission) {
        return hasApprovedInstructorAdmission;
    }

    return Boolean(runtimeAccess?.canStart || runtimeAccess?.canResume);
}

/**
 * Returns the contextual label for the primary action button in the exam lobby.
 */
export function getMobileExamLobbyEntryLabel({
    isStartingSession,
    canEnterExam,
    runtimeAccess,
}: {
    isStartingSession: boolean;
    canEnterExam: boolean;
    runtimeAccess?: ExamRuntimeAccess;
}): string {
    if (isStartingSession) {
        return 'Entering...';
    }

    if (runtimeAccess?.canResume) {
        return 'Resume Exam';
    }

    if (canEnterExam) {
        return 'Continue';
    }

    switch (runtimeAccess?.state) {
        case 'lobby_waiting':
            return 'Waiting for Approval';
        case 'before_start':
            return 'Awaiting Start Time';
        case 'closed':
            return 'Exam Closed';
        case 'locked':
            return 'Exam Locked';
        default:
            return 'Enter Exam';
    }
}

export interface ExecuteLobbySessionStartArgs {
    apiClient: any;
    examId: string;
    router: { replace: (url: string) => void };
}

/**
 * Initiates the exam session from the lobby, persists the session token to storage,
 * and navigates the student directly to the active exam session screen.
 */
export async function executeLobbySessionStart({
    apiClient,
    examId,
    router,
}: ExecuteLobbySessionStartArgs): Promise<{ sessionId: string; isResumed?: boolean }> {
    const resumeRequestId = generateResumeRequestId();
    const examSession = await startExamSession(apiClient, {
        examId,
        resumeRequestId,
    });

    if (!examSession.sessionId) {
        throw new Error(examSession.error || 'Exam session could not be initialized.');
    }

    await writeStoredMobileExamSession({
        examId,
        sessionId: examSession.sessionId,
        isResumed: Boolean(examSession.isResumed),
    });

    router.replace(`/exam/${examId}/session/${examSession.sessionId}`);

    return {
        sessionId: examSession.sessionId,
        isResumed: Boolean(examSession.isResumed),
    };
}
