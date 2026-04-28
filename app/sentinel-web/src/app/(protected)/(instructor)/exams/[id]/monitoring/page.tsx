'use client';

import { useCallback, useEffect, useState } from 'react';
import { useApi, useExamMonitoringOverviewQuery, useStableValue } from '@sentinel/hooks';
import {
    getExamLobbyWaitingList,
    updateExamLobbyAdmissions,
    updateExamRuntimeAccess,
    type ExamLobbyWaitingStudent,
} from '@sentinel/services';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
} from '@sentinel/ui';
import { MonitoringHeader, MonitoringStats, StudentList } from '@/features/exams';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';

type RuntimeAccessAction = 'lock' | 'reset' | 'close';

export default function ExamMonitoringPage() {
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const apiClient = useApi();
    const examId = params.id as string;
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [isUpdatingAccess, setIsUpdatingAccess] = useState(false);
    const [isUpdatingLobbyAdmissions, setIsUpdatingLobbyAdmissions] = useState(false);
    const [lobbyAdmissions, setLobbyAdmissions] = useState<ExamLobbyWaitingStudent[]>([]);
    const [pendingAction, setPendingAction] = useState<RuntimeAccessAction | null>(null);
    const [isReopenDialogOpen, setIsReopenDialogOpen] = useState(false);
    const [reopenMinutes, setReopenMinutes] = useState('30');
    const pageSize = 8;
    const {
        data: monitoring,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useExamMonitoringOverviewQuery(examId);

    const refreshLobbyAdmissions = useCallback(async () => {
        try {
            const admissions = await getExamLobbyWaitingList(apiClient, examId);
            setLobbyAdmissions(admissions);
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Failed to load lobby admissions.';
            toast.error(message);
        }
    }, [apiClient, examId]);

    useEffect(() => {
        void refreshLobbyAdmissions();

        const intervalId = window.setInterval(() => {
            void refreshLobbyAdmissions();
        }, 5000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [refreshLobbyAdmissions]);

    const filteredStudents = useStableValue(() => {
        const students = monitoring?.students ?? [];

        return students.filter((student) => {
            const matchesSearch =
                student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.studentNo.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = filterStatus === 'all' || student.status === filterStatus;
            return matchesSearch && matchesFilter;
        });
    }, [monitoring?.students, searchQuery, filterStatus]);

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setPage(1);
    };

    const handleFilterChange = (value: string) => {
        setFilterStatus(value);
        setPage(1);
    };

    const handleRuntimeAccessUpdate = async (
        state: 'open' | 'locked' | 'reopened' | 'closed',
        reopenedUntil?: string | null,
    ) => {
        setIsUpdatingAccess(true);

        try {
            const runtimeAccess = await updateExamRuntimeAccess(apiClient, {
                id: examId,
                state,
                reopenedUntil,
            });

            toast.success(runtimeAccess.message);
            await refetch();
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Failed to update exam access.';
            toast.error(message);
        } finally {
            setIsUpdatingAccess(false);
        }
    };

    const handleLock = () => {
        setPendingAction('lock');
    };

    const handleReopen = () => {
        setReopenMinutes('30');
        setIsReopenDialogOpen(true);
    };

    const handleReset = () => {
        setPendingAction('reset');
    };

    const handleClose = () => {
        setPendingAction('close');
    };

    const handleConfirmAction = () => {
        if (!pendingAction) {
            return;
        }

        if (pendingAction === 'lock') {
            void handleRuntimeAccessUpdate('locked');
        } else if (pendingAction === 'reset') {
            void handleRuntimeAccessUpdate('open');
        } else {
            void handleRuntimeAccessUpdate('closed');
        }

        setPendingAction(null);
    };

    const handleSubmitReopen = () => {
        const minutes = Number(reopenMinutes);

        if (!Number.isFinite(minutes) || minutes <= 0) {
            toast.error('Enter a valid reopen window in minutes.');
            return;
        }

        const reopenedUntil = new Date(Date.now() + minutes * 60_000).toISOString();
        setIsReopenDialogOpen(false);
        void handleRuntimeAccessUpdate('reopened', reopenedUntil);
    };

    const handleUpdateLobbyAdmissions = async (
        studentIds: string[],
        status: 'APPROVED' | 'REJECTED',
    ) => {
        if (studentIds.length === 0) {
            return;
        }

        setIsUpdatingLobbyAdmissions(true);

        try {
            const result = await updateExamLobbyAdmissions(apiClient, {
                examId,
                studentIds,
                status,
            });

            toast.success(
                `${result.updatedCount} student${result.updatedCount === 1 ? '' : 's'} ${status === 'APPROVED' ? 'updated for entry' : 'returned to the lobby queue'}.`,
            );
            await Promise.all([refreshLobbyAdmissions(), refetch()]);
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Failed to update lobby admissions.';
            toast.error(message);
        } finally {
            setIsUpdatingLobbyAdmissions(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <p className="text-muted-foreground text-sm font-medium">
                    Loading live monitoring...
                </p>
            </div>
        );
    }

    if (isError || !monitoring) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
                <h2 className="text-foreground text-2xl font-bold">Monitoring Unavailable</h2>
                <p className="text-muted-foreground max-w-md text-sm">
                    The real monitoring session could not be loaded for this exam.
                </p>
            </div>
        );
    }

    const actionConfig = pendingAction
        ? {
              lock: {
                  title: 'Lock exam access',
                  description:
                      'Block new students from joining while keeping already-active attempts resumable.',
                  confirmLabel: 'Lock exam',
                  confirmVariant: 'default' as const,
              },
              reset: {
                  title: 'Reset runtime access',
                  description:
                      'Clear the current runtime override and return the exam to its normal schedule rules.',
                  confirmLabel: 'Reset access',
                  confirmVariant: 'default' as const,
              },
              close: {
                  title: 'Close exam now',
                  description:
                      'Immediately block both new joins and resume attempts for this exam session.',
                  confirmLabel: 'Close exam',
                  confirmVariant: 'destructive' as const,
              },
          }[pendingAction]
        : null;
    const waitingStudents = lobbyAdmissions.filter(
        (student) => student.status === 'WAITING' && !student.hasActiveAttempt,
    );
    const approvedStudents = lobbyAdmissions.filter(
        (student) => student.status === 'APPROVED' && !student.hasActiveAttempt,
    );
    const inAttemptStudents = lobbyAdmissions.filter((student) => student.hasActiveAttempt);

    return (
        <>
            <div className="flex min-h-full flex-col space-y-6">
                <div className="flex flex-col gap-4">
                    <MonitoringHeader
                        examTitle={monitoring.exam.title}
                        examSubject={monitoring.exam.subject}
                        runtimeAccess={monitoring.exam.runtimeAccess}
                        onRefresh={() => {
                            void refetch();
                        }}
                        isRefreshing={isFetching}
                        onLock={handleLock}
                        onReopen={handleReopen}
                        onReset={handleReset}
                        onClose={handleClose}
                        isUpdatingAccess={isUpdatingAccess}
                    />

                    <MonitoringStats
                        stats={monitoring.stats}
                        lobbyAdmissions={monitoring.lobbyAdmissions}
                    />
                </div>

                <section className="space-y-4 rounded-lg border p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">Lobby admission</h2>
                            <p className="text-muted-foreground text-sm">
                                Admit students from the waiting lobby without changing the exam
                                runtime lock, reopen, or close state.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={isUpdatingLobbyAdmissions || waitingStudents.length === 0}
                            onClick={() =>
                                void handleUpdateLobbyAdmissions(
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
                                    <div
                                        key={student.admissionId}
                                        className="space-y-2 rounded-md border p-3"
                                    >
                                        <div>
                                            <p className="font-medium">{student.studentName}</p>
                                            <p className="text-muted-foreground text-xs">
                                                {student.studentNumber ?? 'No student number'}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                disabled={isUpdatingLobbyAdmissions}
                                                onClick={() =>
                                                    void handleUpdateLobbyAdmissions(
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
                                                    void handleUpdateLobbyAdmissions(
                                                        [student.studentId],
                                                        'REJECTED',
                                                    )
                                                }
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
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
                                    <div
                                        key={student.admissionId}
                                        className="space-y-1 rounded-md border p-3"
                                    >
                                        <p className="font-medium">{student.studentName}</p>
                                        <p className="text-muted-foreground text-xs">
                                            {student.studentNumber ?? 'No student number'}
                                        </p>
                                    </div>
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
                                    <div
                                        key={student.admissionId}
                                        className="space-y-1 rounded-md border p-3"
                                    >
                                        <p className="font-medium">{student.studentName}</p>
                                        <p className="text-muted-foreground text-xs">
                                            {student.attemptStatus ?? 'IN_PROGRESS'}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                <StudentList
                    students={filteredStudents}
                    selectedId={null}
                    onSelect={(student) => {
                        router.push(`${pathname}/${student.id}`);
                    }}
                    searchQuery={searchQuery}
                    onSearchChange={handleSearchChange}
                    filterStatus={filterStatus}
                    onFilterChange={handleFilterChange}
                    page={page}
                    pageSize={pageSize}
                    totalCount={filteredStudents.length}
                    onPageChange={setPage}
                />
            </div>

            <AlertDialog
                open={Boolean(pendingAction && actionConfig)}
                onOpenChange={(open) => {
                    if (!open) {
                        setPendingAction(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{actionConfig?.title}</AlertDialogTitle>
                        <AlertDialogDescription>{actionConfig?.description}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isUpdatingAccess}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            variant={actionConfig?.confirmVariant ?? 'default'}
                            disabled={isUpdatingAccess}
                            onClick={handleConfirmAction}
                        >
                            {isUpdatingAccess ? 'Saving...' : actionConfig?.confirmLabel}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={isReopenDialogOpen} onOpenChange={setIsReopenDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Reopen exam access</DialogTitle>
                        <DialogDescription>
                            Let students enter again for a short window without changing the base
                            exam schedule.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2">
                        <label htmlFor="reopen-minutes" className="text-sm font-medium">
                            Reopen window in minutes
                        </label>
                        <Input
                            id="reopen-minutes"
                            type="number"
                            min="1"
                            step="1"
                            value={reopenMinutes}
                            onChange={(event) => setReopenMinutes(event.target.value)}
                            disabled={isUpdatingAccess}
                        />
                        <p className="text-muted-foreground text-xs">
                            Students who already submitted are still blocked from creating a
                            duplicate attempt unless you grant a specific retake or makeup override.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsReopenDialogOpen(false)}
                            disabled={isUpdatingAccess}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSubmitReopen} disabled={isUpdatingAccess}>
                            {isUpdatingAccess ? 'Saving...' : 'Reopen exam'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
