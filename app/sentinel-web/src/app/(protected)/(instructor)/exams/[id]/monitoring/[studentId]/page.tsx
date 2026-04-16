'use client';

import { useParams } from 'next/navigation';
import { StudentMonitoringDetail } from '@/features/exams/monitoring/_components/student-monitoring-detail';
import { MOCK_MONITORING_STUDENTS as MOCK_STUDENTS } from '@sentinel/shared/constants';

export default function StudentMonitoringPage() {
    const params = useParams();
    const studentId = params.studentId as string;
    const examId = params.id as string;

    // TODO: Remove this when we have a proper way to handle student data
    // This should be a fetch call
    const student = MOCK_STUDENTS.find((s) => s.id === studentId);

    if (!student) {
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <div className="text-center">
                    <h2 className="text-foreground mb-2 text-2xl font-bold">Student Not Found</h2>
                    <p className="text-muted-foreground">
                        The student you are looking for does not exist or has no active session.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <StudentMonitoringDetail student={student} examId={examId} />
        </div>
    );
}
