'use client';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@sentinel/ui';

import type { ExamSecurityLockReason } from '@/app/(protected)/student/exam/[id]/_hooks/use-exam-monitoring';

type ExamAttemptRuntimeSecurityProps = {
    isSubmitDialogOpen: boolean;
    onOpenChangeSubmitDialog: (open: boolean) => void;
    unansweredCount: number;
    unansweredQuestionLabels: string[];
    isRedirectingToTurnIn: boolean;
    onProceedToTurnIn: () => void;
    securityLockReason: ExamSecurityLockReason | null;
    isResumingExam: boolean;
    onResumeExam: () => Promise<void>;
};

export function ExamAttemptRuntimeSecurity({
    isSubmitDialogOpen,
    onOpenChangeSubmitDialog,
    unansweredCount,
    unansweredQuestionLabels,
    isRedirectingToTurnIn,
    onProceedToTurnIn,
    securityLockReason,
    isResumingExam,
    onResumeExam,
}: ExamAttemptRuntimeSecurityProps) {
    return (
        <>
            <AlertDialog open={isSubmitDialogOpen} onOpenChange={onOpenChangeSubmitDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Submit with unanswered questions?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You still have {unansweredCount} unanswered question
                            {unansweredCount === 1 ? '' : 's'}.
                            {unansweredQuestionLabels.length
                                ? ` Remaining: ${unansweredQuestionLabels.join(', ')}${unansweredCount > unansweredQuestionLabels.length ? ', ...' : ''}.`
                                : ''}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isRedirectingToTurnIn}>Go Back</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isRedirectingToTurnIn}
                            onClick={() => {
                                onOpenChangeSubmitDialog(false);
                                onProceedToTurnIn();
                            }}
                        >
                            {isRedirectingToTurnIn ? 'Preparing...' : 'Proceed to Turn In'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={Boolean(securityLockReason)} onOpenChange={() => undefined}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {securityLockReason === 'screen-capture'
                                ? 'Screen capture is not allowed'
                                : 'Return to the secured exam view'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {securityLockReason === 'focus-loss'
                                ? 'The exam detected that you moved away from the active exam window. Continue only after returning to the protected session.'
                                : null}
                            {securityLockReason === 'fullscreen-exit'
                                ? 'This exam requires fullscreen mode. Restore fullscreen before continuing.'
                                : null}
                            {securityLockReason === 'screen-capture'
                                ? 'Screenshot and screen capture shortcuts are monitored for this exam. Close any capture tool before resuming.'
                                : null}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction
                            disabled={isResumingExam}
                            onClick={() => {
                                void onResumeExam();
                            }}
                        >
                            {isResumingExam
                                ? 'Restoring...'
                                : securityLockReason === 'fullscreen-exit'
                                    ? 'Return to Fullscreen'
                                    : 'Resume Exam'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
