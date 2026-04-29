'use client';

import { Badge, Button } from '@sentinel/ui';
import type { ExamLobbyWaitingStudent } from '@sentinel/services';
import type { ReactNode } from 'react';

type InstructorLobbyAdmissionPanelProps = {
    lobbyAdmissions: ExamLobbyWaitingStudent[];
    isUpdatingLobbyAdmissions: boolean;
    onUpdateLobbyAdmissions: (
        studentIds: string[],
        status: 'APPROVED' | 'REJECTED',
    ) => Promise<void>;
};

function formatCheckedInAt(value: string | null) {
    if (!value) {
        return 'No check-in time';
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'No check-in time' : date.toLocaleString();
}

function StudentLobbyCard({
    student,
    children,
}: {
    student: ExamLobbyWaitingStudent;
    children?: ReactNode;
}) {
    return (
        <div className="space-y-2 rounded-md border p-3">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="font-medium">{student.studentName}</p>
                    <p className="text-muted-foreground text-xs">
                        {student.studentNumber ?? 'No student number'}
                    </p>
                    <p className="text-muted-foreground text-xs">
                        Checked in {formatCheckedInAt(student.checkedInAt)}
                    </p>
                </div>
                <Badge variant={student.reconnectCount >= 3 ? 'destructive' : 'outline'}>
                    {student.reconnectCount} reconnect
                    {student.reconnectCount === 1 ? '' : 's'}
                </Badge>
            </div>
            {children}
        </div>
    );
}

export function InstructorLobbyAdmissionPanel({
    lobbyAdmissions,
    isUpdatingLobbyAdmissions,
    onUpdateLobbyAdmissions,
}: InstructorLobbyAdmissionPanelProps) {
    const waitingStudents = lobbyAdmissions.filter(
        (student) => student.status === 'WAITING' && !student.hasActiveAttempt,
    );
    const approvedStudents = lobbyAdmissions.filter(
        (student) => student.status === 'APPROVED' && !student.hasActiveAttempt,
    );
    const inAttemptStudents = lobbyAdmissions.filter((student) => student.hasActiveAttempt);

    return (
        <section className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Lobby admission</h2>
                    <p className="text-muted-foreground text-sm">
                        Admit students from the waiting lobby without changing the exam runtime
                        lock, reopen, or close state.
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={isUpdatingLobbyAdmissions || waitingStudents.length === 0}
                    onClick={() =>
                        void onUpdateLobbyAdmissions(
                            waitingStudents.map((student) => student.studentId),
                            'APPROVED',
                        )
                    }
                >
                    Admit All Waiting
                </Button>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="space-y-3 rounded-lg border p-3">
                    <h3 className="font-medium">Waiting in lobby</h3>
                    {waitingStudents.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                            No students are waiting for approval.
                        </p>
                    ) : (
                        waitingStudents.map((student) => (
                            <StudentLobbyCard key={student.admissionId} student={student}>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        disabled={isUpdatingLobbyAdmissions}
                                        onClick={() =>
                                            void onUpdateLobbyAdmissions(
                                                [student.studentId],
                                                'APPROVED',
                                            )
                                        }
                                    >
                                        Admit
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={isUpdatingLobbyAdmissions}
                                        onClick={() =>
                                            void onUpdateLobbyAdmissions(
                                                [student.studentId],
                                                'REJECTED',
                                            )
                                        }
                                    >
                                        Reject
                                    </Button>
                                </div>
                            </StudentLobbyCard>
                        ))
                    )}
                </div>

                <div className="space-y-3 rounded-lg border p-3">
                    <h3 className="font-medium">Approved to continue</h3>
                    {approvedStudents.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                            No approved students are waiting to enter.
                        </p>
                    ) : (
                        approvedStudents.map((student) => (
                            <StudentLobbyCard key={student.admissionId} student={student} />
                        ))
                    )}
                </div>

                <div className="space-y-3 rounded-lg border p-3">
                    <h3 className="font-medium">Already in attempt</h3>
                    {inAttemptStudents.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                            No admitted students have entered the attempt yet.
                        </p>
                    ) : (
                        inAttemptStudents.map((student) => (
                            <StudentLobbyCard key={student.admissionId} student={student}>
                                <p className="text-muted-foreground text-xs">
                                    {student.attemptStatus ?? 'IN_PROGRESS'}
                                </p>
                            </StudentLobbyCard>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
