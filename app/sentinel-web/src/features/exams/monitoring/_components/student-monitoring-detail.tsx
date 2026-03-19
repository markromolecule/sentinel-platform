"use client";

import { StudentSession } from '@sentinel/shared/types';
import {
    StudentDetailHeader,
    StudentIdentityCard,
    LiveFeedMonitor,
    IntegrityTimelineCard
} from "@/features/exams/monitoring/_components";

interface StudentMonitoringDetailProps {
    student: StudentSession;
    examId: string;
}

export function StudentMonitoringDetail({ student, examId }: StudentMonitoringDetailProps) {
    return (
        <div className="flex flex-col gap-5 h-[calc(100vh-10rem)] max-w-7xl mx-auto w-full px-4 pb-4 overflow-hidden">
            {/* Action Bar */}
            <StudentDetailHeader examId={examId} />

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 grid-rows-[1fr] gap-6 flex-1 min-h-0 overflow-hidden">
                {/* Left Column: Student Info & Feed */}
                <div className="lg:col-span-4 min-h-0 flex flex-col gap-4 overflow-y-auto scrollbar-thin scrollbar-thumb-border/70 hover:scrollbar-thumb-border pr-2">
                    <StudentIdentityCard student={student} />
                    <LiveFeedMonitor />

                    <div className="mt-auto py-2 opacity-40">
                        <p className="text-[10px] text-center font-mono tracking-[0.2em]">
                            SESSION_ID: {student.id.toUpperCase()}
                        </p>
                    </div>
                </div>

                {/* Right Column: Timeline */}
                <div className="lg:col-span-8 min-h-0 flex flex-col overflow-hidden">
                    <IntegrityTimelineCard flags={student.flags} />
                </div>
            </div>
        </div>
    );
}
