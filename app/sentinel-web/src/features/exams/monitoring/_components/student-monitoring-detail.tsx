'use client';

import { StudentSession } from '@sentinel/shared/types';
import {
    StudentDetailHeader,
    StudentIdentityCard,
    LiveFeedMonitor,
    IntegrityTimelineCard,
} from '@/features/exams/monitoring/_components';

interface StudentMonitoringDetailProps {
    student: StudentSession;
    examId: string;
    onRefresh?: () => void;
    isRefreshing?: boolean;
}

export function StudentMonitoringDetail({
    student,
    examId,
    onRefresh,
    isRefreshing,
}: StudentMonitoringDetailProps) {
    return (
        <div className="mx-auto flex h-[calc(100vh-10rem)] w-full max-w-7xl flex-col gap-5 overflow-hidden px-4 pb-4">
            {/* Action Bar */}
            <StudentDetailHeader examId={examId} />

            {/* Main Content Layout */}
            <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[1fr] gap-6 overflow-hidden lg:grid-cols-12">
                {/* Left Column: Student Info & Feed */}
                <div
                    data-lenis-prevent
                    className="scrollbar-thin scrollbar-thumb-border/70 hover:scrollbar-thumb-border flex min-h-0 flex-col gap-4 overflow-y-auto pr-2 lg:col-span-4"
                >
                    <StudentIdentityCard student={student} />
                    <LiveFeedMonitor />

                    <div className="mt-auto py-2 opacity-40">
                        <p className="text-center font-mono text-[10px] tracking-[0.2em]">
                            SESSION_ID: {student.attemptId.toUpperCase()}
                        </p>
                    </div>
                </div>

                {/* Right Column: Timeline */}
                <div
                    data-lenis-prevent
                    className="scrollbar-thin scrollbar-thumb-border/70 hover:scrollbar-thumb-border min-h-0 overflow-y-auto pr-2 lg:col-span-8"
                >
                    <IntegrityTimelineCard
                        flags={student.flags ?? []}
                        lifecycleEvents={student.lifecycleEvents ?? []}
                        onRefresh={onRefresh}
                        isRefreshing={isRefreshing}
                    />
                </div>
            </div>
        </div>
    );
}
