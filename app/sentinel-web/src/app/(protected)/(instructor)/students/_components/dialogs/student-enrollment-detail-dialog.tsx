'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/data/api/client';
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    Separator,
} from '@sentinel/ui';
import { type Student } from '@sentinel/shared/types';

type StudentEnrollmentDetail = {
    id: string;
    subject: string;
    classroom: string;
    section: string;
    term: string;
    yearLevel: string | null;
};

type StudentEnrollmentDetailDialogProps = {
    open: boolean;
    onOpenChangeAction: (open: boolean) => void;
    student: Student;
};

export function StudentEnrollmentDetailDialog({
    open,
    onOpenChangeAction,
    student,
}: StudentEnrollmentDetailDialogProps) {
    const {
        data = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ['instructor-student-enrollment-detail', student.userId ?? student.id],
        queryFn: async () => {
            const response = await apiClient(
                `/users/${student.userId ?? student.id}/instructor-enrollments`,
                {
                    method: 'GET',
                },
            );

            if (response.error) {
                throw new Error(response.error as string);
            }

            return (response.data || []) as StudentEnrollmentDetail[];
        },
        enabled: open,
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChangeAction}>
            <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-3xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {student.firstName} {student.lastName}
                    </DialogTitle>
                    <DialogDescription>
                        Current instructor-scoped classroom enrollments for this student.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-3 rounded-lg border p-4 text-sm sm:grid-cols-2">
                    <div>
                        <div className="text-muted-foreground text-xs uppercase">Student No.</div>
                        <div className="font-medium">{student.studentNo}</div>
                    </div>
                    <div>
                        <div className="text-muted-foreground text-xs uppercase">Status</div>
                        <div className="font-medium capitalize">{student.status}</div>
                    </div>
                </div>

                <Separator />

                <div className="space-y-3">
                    <h3 className="text-sm font-semibold">Enrolled Subjects and Classrooms</h3>

                    {isLoading ? (
                        <div className="text-muted-foreground text-sm">Loading enrollments...</div>
                    ) : error ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {error.message}
                        </div>
                    ) : data.length === 0 ? (
                        <div className="text-muted-foreground text-sm">
                            No active classroom enrollments found for this student.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {data.map((enrollment) => (
                                <div
                                    key={enrollment.id}
                                    className="space-y-2 rounded-lg border p-4 text-sm"
                                >
                                    <div className="font-medium">{enrollment.subject}</div>
                                    <div className="grid gap-2 text-sm sm:grid-cols-2">
                                        <div>
                                            <span className="text-muted-foreground">
                                                Classroom:{' '}
                                            </span>
                                            <span>{enrollment.classroom}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Section: </span>
                                            <span>{enrollment.section}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Term: </span>
                                            <span>{enrollment.term}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">
                                                Year Level:{' '}
                                            </span>
                                            <span>{enrollment.yearLevel || '—'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end">
                    <Button variant="outline" onClick={() => onOpenChangeAction(false)}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
