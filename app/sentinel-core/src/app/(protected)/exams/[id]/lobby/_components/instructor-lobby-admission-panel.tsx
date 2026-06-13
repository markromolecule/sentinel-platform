'use client';

import { Badge, Button, Card, CardContent, Avatar, AvatarFallback, ScrollArea } from '@sentinel/ui';
import type { ExamLobbyWaitingStudent } from '@sentinel/services';
import type { ReactNode } from 'react';
import { User, Clock, Activity, CheckCircle, Users } from 'lucide-react';

type InstructorLobbyAdmissionPanelProps = {
    lobbyAdmissions: ExamLobbyWaitingStudent[];
    isUpdatingLobbyAdmissions: boolean;
    onUpdateLobbyAdmissions: (
        studentIds: string[],
        status: 'APPROVED' | 'REJECTED',
    ) => Promise<void>;
};

function formatCheckedInAt(value: string | null) {
    if (!value) return 'N/A';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? 'N/A'
        : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getInitials(name: string) {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function StudentLobbyCard({
    student,
    children,
}: {
    student: ExamLobbyWaitingStudent;
    children?: ReactNode;
}) {
    return (
        <div className="bg-card hover:border-primary/20 flex flex-col gap-3 rounded-xl border p-3 transition-all">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Avatar size="sm" className="size-8">
                        <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
                            {getInitials(student.studentName)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="truncate text-sm leading-none font-bold">
                            {student.studentName}
                        </p>
                        <div className="text-muted-foreground mt-1.5 flex items-center gap-1.5 text-[10px] font-medium">
                            <span className="bg-muted rounded px-1 tracking-tighter uppercase">
                                {student.studentNumber ?? 'N/A'}
                            </span>
                            <span>•</span>
                            <span>{formatCheckedInAt(student.checkedInAt)}</span>
                        </div>
                    </div>
                </div>
                <Badge
                    variant={student.reconnectCount >= 3 ? 'destructive' : 'outline'}
                    className="h-fit px-1.5 py-0 text-[9px] font-bold"
                >
                    {student.reconnectCount}RC
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
        <div className="grid items-start gap-6 lg:grid-cols-3">
            {/* Column 1: Waiting */}
            <Card className="bg-muted/20 flex h-[700px] flex-col gap-0 overflow-hidden rounded-2xl border p-0 shadow-none">
                <div className="bg-muted/30 flex items-center justify-between border-b px-4 py-3">
                    <div className="flex items-center gap-2.5">
                        <Clock className="text-muted-foreground h-4 w-4" />
                        <span className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                            Waiting
                        </span>
                        <Badge
                            variant="secondary"
                            className="bg-muted/50 h-5 border-none px-1.5 font-mono text-[10px] shadow-none"
                        >
                            {waitingStudents.length}
                        </Badge>
                    </div>
                    <Button
                        variant="link"
                        size="sm"
                        className="text-primary h-auto p-0 text-[11px] font-bold hover:no-underline"
                        disabled={isUpdatingLobbyAdmissions || waitingStudents.length === 0}
                        onClick={() =>
                            void onUpdateLobbyAdmissions(
                                waitingStudents.map((student) => student.studentId),
                                'APPROVED',
                            )
                        }
                    >
                        Admit All
                    </Button>
                </div>
                <CardContent className="flex-1 overflow-hidden p-0">
                    <ScrollArea className="h-full">
                        <div className="space-y-3 p-3">
                            {waitingStudents.length === 0 ? (
                                <div className="text-muted-foreground flex flex-col items-center justify-center py-20 opacity-10">
                                    <Users className="mb-2 h-10 w-10" />
                                    <p className="text-[10px] font-bold tracking-widest uppercase">
                                        Empty
                                    </p>
                                </div>
                            ) : (
                                waitingStudents.map((student) => (
                                    <StudentLobbyCard key={student.admissionId} student={student}>
                                        <div className="mt-1 flex gap-2">
                                            <Button
                                                size="sm"
                                                className="h-7 flex-1 text-[10px] font-bold"
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
                                                className="h-7 flex-1 text-[10px] font-bold"
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
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Column 2: Approved */}
            <Card className="bg-muted/20 flex h-[700px] flex-col gap-0 overflow-hidden rounded-2xl border p-0 shadow-none">
                <div className="bg-muted/30 flex items-center gap-2.5 border-b px-4 py-3">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                        Approved
                    </span>
                    <Badge
                        variant="secondary"
                        className="bg-muted/50 h-5 border-none px-1.5 font-mono text-[10px] shadow-none"
                    >
                        {approvedStudents.length}
                    </Badge>
                </div>
                <CardContent className="flex-1 overflow-hidden p-0">
                    <ScrollArea className="h-full">
                        <div className="space-y-3 p-3">
                            {approvedStudents.length === 0 ? (
                                <div className="text-muted-foreground flex flex-col items-center justify-center py-20 opacity-10">
                                    <CheckCircle className="mb-2 h-10 w-10" />
                                    <p className="text-[10px] font-bold tracking-widest uppercase">
                                        Empty
                                    </p>
                                </div>
                            ) : (
                                approvedStudents.map((student) => (
                                    <StudentLobbyCard key={student.admissionId} student={student} />
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Column 3: In Attempt */}
            <Card className="flex h-[700px] flex-col gap-0 overflow-hidden rounded-2xl border bg-emerald-500/5 p-0 shadow-none ring-1 ring-emerald-500/10">
                <div className="flex items-center gap-2.5 border-b bg-emerald-500/10 px-4 py-3">
                    <Activity className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-bold tracking-widest text-emerald-700 uppercase">
                        In Attempt
                    </span>
                    <Badge className="h-5 border-none bg-emerald-500/20 px-1.5 font-mono text-[10px] text-emerald-800 shadow-none">
                        {inAttemptStudents.length}
                    </Badge>
                </div>
                <CardContent className="flex-1 overflow-hidden p-0">
                    <ScrollArea className="h-full">
                        <div className="space-y-3 p-3">
                            {inAttemptStudents.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-emerald-600/10">
                                    <User className="mb-1 h-10 w-10" />
                                    <p className="text-[10px] font-bold tracking-widest uppercase">
                                        Empty
                                    </p>
                                </div>
                            ) : (
                                inAttemptStudents.map((student) => (
                                    <StudentLobbyCard key={student.admissionId} student={student}>
                                        <div className="mt-0.5 flex items-center gap-1.5">
                                            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                                            <p className="text-[10px] leading-none font-bold tracking-widest text-emerald-700 uppercase">
                                                {student.attemptStatus === 'IN_PROGRESS'
                                                    ? 'Writing'
                                                    : (student.attemptStatus ?? 'In Progress')}
                                            </p>
                                        </div>
                                    </StudentLobbyCard>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
