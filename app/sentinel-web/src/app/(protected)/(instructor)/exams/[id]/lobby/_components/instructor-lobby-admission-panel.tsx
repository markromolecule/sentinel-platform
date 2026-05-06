'use client';

import {
    Badge,
    Button,
    Card,
    CardContent,
    Avatar,
    AvatarFallback,
    ScrollArea
} from '@sentinel/ui';
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
    return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getInitials(name: string) {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function StudentLobbyCard({
    student,
    children,
}: {
    student: ExamLobbyWaitingStudent;
    children?: ReactNode;
}) {
    return (
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 transition-all hover:border-primary/20">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Avatar size="sm" className="size-8">
                        <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
                            {getInitials(student.studentName)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="font-bold text-sm truncate leading-none">{student.studentName}</p>
                        <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] mt-1.5 font-medium">
                            <span className="bg-muted px-1 rounded uppercase tracking-tighter">{student.studentNumber ?? 'N/A'}</span>
                            <span>•</span>
                            <span>{formatCheckedInAt(student.checkedInAt)}</span>
                        </div>
                    </div>
                </div>
                <Badge
                    variant={student.reconnectCount >= 3 ? 'destructive' : 'outline'}
                    className="h-fit py-0 px-1.5 text-[9px] font-bold"
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
        <div className="grid gap-6 lg:grid-cols-3 items-start">
            {/* Column 1: Waiting */}
            <Card className="flex flex-col h-[700px] border shadow-none bg-muted/20 overflow-hidden p-0 gap-0 rounded-2xl">
                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                    <div className="flex items-center gap-2.5">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Waiting</span>
                        <Badge variant="secondary" className="font-mono text-[10px] h-5 px-1.5 shadow-none bg-muted/50 border-none">{waitingStudents.length}</Badge>
                    </div>
                    <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-[11px] font-bold text-primary hover:no-underline"
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
                <CardContent className="p-0 flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                        <div className="p-3 space-y-3">
                            {waitingStudents.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-10">
                                    <Users className="h-10 w-10 mb-2" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">Empty</p>
                                </div>
                            ) : (
                                waitingStudents.map((student) => (
                                    <StudentLobbyCard key={student.admissionId} student={student}>
                                        <div className="flex gap-2 mt-1">
                                            <Button
                                                size="sm"
                                                className="flex-1 h-7 text-[10px] font-bold"
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
                                                className="flex-1 h-7 text-[10px] font-bold"
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
            <Card className="flex flex-col h-[700px] border shadow-none bg-muted/20 overflow-hidden p-0 gap-0 rounded-2xl">
                <div className="flex items-center gap-2.5 px-4 py-3 border-b bg-muted/30">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Approved</span>
                    <Badge variant="secondary" className="font-mono text-[10px] h-5 px-1.5 shadow-none bg-muted/50 border-none">{approvedStudents.length}</Badge>
                </div>
                <CardContent className="p-0 flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                        <div className="p-3 space-y-3">
                            {approvedStudents.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-10">
                                    <CheckCircle className="h-10 w-10 mb-2" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">Empty</p>
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
            <Card className="flex flex-col h-[700px] border shadow-none bg-emerald-500/5 ring-1 ring-emerald-500/10 overflow-hidden p-0 gap-0 rounded-2xl">
                <div className="flex items-center gap-2.5 px-4 py-3 border-b bg-emerald-500/10">
                    <Activity className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">In Attempt</span>
                    <Badge className="bg-emerald-500/20 text-emerald-800 border-none font-mono text-[10px] h-5 px-1.5 shadow-none">{inAttemptStudents.length}</Badge>
                </div>
                <CardContent className="p-0 flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                        <div className="p-3 space-y-3">
                            {inAttemptStudents.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-emerald-600/10">
                                    <User className="h-10 w-10 mb-1" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">Empty</p>
                                </div>
                            ) : (
                                inAttemptStudents.map((student) => (
                                    <StudentLobbyCard key={student.admissionId} student={student}>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <p className="text-emerald-700 font-bold text-[10px] uppercase tracking-widest leading-none">
                                                {student.attemptStatus === 'IN_PROGRESS' ? 'Writing' : student.attemptStatus ?? 'In Progress'}
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
