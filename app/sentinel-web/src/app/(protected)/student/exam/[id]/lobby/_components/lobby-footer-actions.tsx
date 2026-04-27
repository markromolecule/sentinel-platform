import { PreviewFooterActions } from '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_components/common/preview-footer-actions';
import { buildStudentExamHref } from '../../_lib/student-exam-flow';
import type { ExamRuntimeAccess } from '@sentinel/shared/types';
import { type StoredExamSession } from '../../_lib/exam-session-storage';

export type LobbyFooterActionsProps = {
    examId: string;
    isStartingSession: boolean;
    runtimeAccess?: ExamRuntimeAccess | null;
    storedSession?: StoredExamSession | null;
    hasCompletedFlow: boolean;
    canEnterExam: boolean;
    onEnterExam: () => void;
};

export function LobbyFooterActions({
    examId,
    isStartingSession,
    runtimeAccess,
    storedSession,
    hasCompletedFlow,
    canEnterExam,
    onEnterExam,
}: LobbyFooterActionsProps) {
    const getPrimaryLabel = () => {
        if (isStartingSession) return 'Preparing Exam Session';
        if (runtimeAccess?.canResume) return 'Resume Exam';

        switch (runtimeAccess?.state) {
            case 'lobby_waiting':
                return runtimeAccess.reasonCode === 'LOBBY_REJECTED'
                    ? 'Waiting for Re-approval'
                    : 'Waiting for Approval';
            case 'lobby_approved':
                return 'Approved to Continue';
            case 'closed':
                return 'Exam Closed';
            case 'locked':
                return 'Exam Locked';
            case 'before_start':
                return 'Awaiting Start Time';
            default:
                return storedSession ? 'Resume Exam' : 'Continue to Attempt';
        }
    };

    return (
        <PreviewFooterActions
            primaryLabel={getPrimaryLabel()}
            primaryDisabled={!hasCompletedFlow || isStartingSession || !canEnterExam}
            primaryOnClick={onEnterExam}
            secondaryLabel="Previous Step"
            secondaryHref={buildStudentExamHref(examId, 'checkup')}
        />
    );
}
