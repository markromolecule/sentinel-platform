import { StudentFlowFooterActions } from '../../../_components/student-flow-primitives';
import { buildStudentExamHref } from '../../_lib/student-exam-flow';
import type { ExamRuntimeAccess } from '@sentinel/shared/types';
import { type StoredExamSession } from '../../_lib/exam-session-storage';
import type { ExamLobbyAdmissionStatus } from '@sentinel/services';

export type LobbyFooterActionsProps = {
    examId: string;
    isStartingSession: boolean;
    runtimeAccess?: ExamRuntimeAccess | null;
    admissionStatus?: ExamLobbyAdmissionStatus | null;
    storedSession?: StoredExamSession | null;
    hasCompletedFlow: boolean;
    canEnterExam: boolean;
    onEnterExam: () => void;
};

export function LobbyFooterActions({
    examId,
    isStartingSession,
    runtimeAccess,
    admissionStatus,
    storedSession,
    hasCompletedFlow,
    canEnterExam,
    onEnterExam,
}: LobbyFooterActionsProps) {
    const isWaitingForAdmission =
        admissionStatus === 'WAITING' ||
        admissionStatus === 'REJECTED' ||
        (admissionStatus !== 'APPROVED' &&
            runtimeAccess?.state === 'lobby_waiting' &&
            (runtimeAccess.reasonCode === 'LOBBY_WAITING' ||
                runtimeAccess.reasonCode === 'LOBBY_REJECTED'));

    const getPrimaryLabel = () => {
        if (isStartingSession) return 'Preparing Exam Session';
        if (runtimeAccess?.canResume) return 'Resume Exam';
        if (admissionStatus === 'APPROVED') {
            return storedSession ? 'Resume Exam' : 'Continue to Attempt';
        }
        if (admissionStatus === 'WAITING') return 'Waiting for Approval';
        if (admissionStatus === 'REJECTED') return 'Waiting for Re-approval';

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
        <StudentFlowFooterActions
            primaryLabel={getPrimaryLabel()}
            primaryDisabled={
                !hasCompletedFlow || isStartingSession || !canEnterExam || isWaitingForAdmission
            }
            primaryOnClick={onEnterExam}
            secondaryLabel="Previous Step"
            secondaryHref={buildStudentExamHref(examId, 'checkup')}
        />
    );
}
