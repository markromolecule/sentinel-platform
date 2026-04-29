'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@sentinel/ui';
import { InstructorLobbyAdmissionPanel } from './_components/instructor-lobby-admission-panel';
import { useInstructorLobby } from './_hooks/use-instructor-lobby';

export default function InstructorLobbyPage() {
    const params = useParams();
    const examId = params.id as string;
    const { lobbyAdmissions, isUpdatingLobbyAdmissions, handleUpdateLobbyAdmissions } =
        useInstructorLobby(examId);

    return (
        <div className="flex min-h-full flex-col space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Exam Lobby</h1>
                    <p className="text-muted-foreground text-sm">
                        Review waiting students and admit them into the active attempt.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button asChild variant="default">
                        <Link href={`/exams/${examId}/lobby`}>Lobby</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href={`/exams/${examId}/monitoring`}>Monitoring</Link>
                    </Button>
                </div>
            </div>

            <InstructorLobbyAdmissionPanel
                lobbyAdmissions={lobbyAdmissions}
                isUpdatingLobbyAdmissions={isUpdatingLobbyAdmissions}
                onUpdateLobbyAdmissions={handleUpdateLobbyAdmissions}
            />
        </div>
    );
}
