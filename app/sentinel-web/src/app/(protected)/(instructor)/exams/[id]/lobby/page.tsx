'use client';

import { useParams } from 'next/navigation';
import { MonitoringLobbyTabs } from '@/features/exams/_components/monitoring-lobby-tabs';
import { InstructorLobbyAdmissionPanel } from './_components/instructor-lobby-admission-panel';
import { useInstructorLobby } from './_hooks/use-instructor-lobby';

export default function InstructorLobbyPage() {
    const params = useParams();
    const examId = params.id as string;
    const { lobbyAdmissions, isUpdatingLobbyAdmissions, handleUpdateLobbyAdmissions } =
        useInstructorLobby(examId);

    return (
        <div className="flex min-h-full flex-col space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{examId ? 'Exam Lobby' : 'Exam Lobby'}</h1>
                    <p className="text-muted-foreground text-sm">
                        Manage real-time student admissions and active attempts.
                    </p>
                </div>
                <MonitoringLobbyTabs examId={examId} />
            </div>

            <InstructorLobbyAdmissionPanel
                lobbyAdmissions={lobbyAdmissions}
                isUpdatingLobbyAdmissions={isUpdatingLobbyAdmissions}
                onUpdateLobbyAdmissions={handleUpdateLobbyAdmissions}
            />
        </div>
    );
}
