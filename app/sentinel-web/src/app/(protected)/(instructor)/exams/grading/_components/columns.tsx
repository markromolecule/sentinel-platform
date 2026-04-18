'use client';

import { ColumnDef } from '@tanstack/react-table';
import { GradingExam } from '@sentinel/shared/types';
import { StatusBadge } from '@/components/common/displays/status-badge';
import { Button } from '@sentinel/ui';
import Link from 'next/link';
import { Eye } from 'lucide-react';

export const columns: ColumnDef<GradingExam>[] = [
    {
        accessorKey: 'title',
        header: 'Exam Title',
        cell: ({ row }) => <div className="font-medium">{row.getValue('title')}</div>,
    },
    {
        accessorKey: 'subject',
        header: 'Subject',
    },
    {
        accessorKey: 'scheduledDate',
        header: 'Date',
        cell: ({ row }) => {
            const scheduledDate = row.getValue('scheduledDate') as string | null;

            if (!scheduledDate) {
                return <div className="text-muted-foreground">Not scheduled</div>;
            }

            return <div>{new Date(scheduledDate).toLocaleDateString()}</div>;
        },
    },
    {
        accessorKey: 'progress',
        header: 'Progress',
        cell: ({ row }) => {
            const total = row.original.totalStudents;
            const submitted = row.original.submittedCount;
            const graded = row.original.gradedCount;
            const progressBase = submitted > 0 ? submitted : total;
            const percentage = progressBase > 0 ? Math.round((graded / progressBase) * 100) : 0;

            return (
                <div className="flex items-center gap-2">
                    <div className="bg-secondary h-2 w-full max-w-[100px] overflow-hidden rounded-full">
                        <div className="bg-primary h-full" style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="text-muted-foreground text-xs">
                        {graded}/{progressBase}
                        {submitted !== total ? ` graded • ${submitted}/${total} submitted` : ''}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue('status') as string;
            return <StatusBadge status={status} />;
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const exam = row.original;

            return (
                <div className="flex justify-end pr-4">
                    <Button asChild variant="ghost" size="sm" className="h-8 gap-2">
                        <Link href={`/exams/grading/${exam.id}`}>
                            <Eye className="h-4 w-4" />
                            View Grades
                        </Link>
                    </Button>
                </div>
            );
        },
    },
];
