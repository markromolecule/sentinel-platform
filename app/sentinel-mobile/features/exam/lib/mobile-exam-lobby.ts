import type { ExamRuntimeAccess } from '@sentinel/shared/types';

export function getMobileExamLobbyEntryLabel({
    isStartingSession,
    canEnterExam,
    runtimeAccess,
}: {
    isStartingSession: boolean;
    canEnterExam: boolean;
    runtimeAccess?: ExamRuntimeAccess;
}) {
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
