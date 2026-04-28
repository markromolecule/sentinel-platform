'use client';

import { StudentExamLoadingState } from '@/app/(protected)/student/exam/[id]/_components/student-exam-loading-state';
import { AttemptView } from '@/app/(protected)/student/exam/[id]/attempt/_components/attempt-view';
import { useStudentExamAttempt } from '@/app/(protected)/student/exam/[id]/attempt/_hooks/use-student-exam-attempt';

export default function StudentExamAttemptPage() {
    const { isLoading, isInitializingSession, isRedirectingHistory } = useStudentExamAttempt();

    if (isLoading || isInitializingSession || isRedirectingHistory) {
        return <StudentExamLoadingState />;
    }

    return <AttemptView />;
}
