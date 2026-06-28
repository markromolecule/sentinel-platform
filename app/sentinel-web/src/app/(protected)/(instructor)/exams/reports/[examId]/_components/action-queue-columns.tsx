import { ColumnDef } from '@tanstack/react-table';
import type { ExamReportActionItem } from '@sentinel/shared/types';
import { Button } from '@sentinel/ui';
import Link from 'next/link';

type ActionQueueColumnsArgs = {
    actionLabel?: string;
    onAction?: (item: ExamReportActionItem) => void;
    activeActionId?: string | null;
    examId: string;
};

/**
 * Generates column definitions for the Action Queue DataTable.
 *
 * @param args - Callback functions and action configuration.
 */
export const getActionQueueColumns = (args: ActionQueueColumnsArgs): ColumnDef<ExamReportActionItem>[] => [
    {
        accessorKey: 'lastName',
        header: 'Student',
        cell: ({ row }) => {
            const item = row.original;
            return (
                <div className="space-y-1">
                    <div className="font-medium">
                        {item.lastName}, {item.firstName}
                    </div>
                    <div className="text-muted-foreground text-sm">
                        {item.studentNo}
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'reason',
        header: 'Reason',
        cell: ({ row }) => row.original.reason,
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const item = row.original;
            return (
                <div className="flex items-center gap-2">
                    {args.actionLabel && args.onAction && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => args.onAction?.(item)}
                            disabled={args.activeActionId === item.studentId}
                        >
                            {args.activeActionId === item.studentId
                                ? 'Applying...'
                                : args.actionLabel}
                        </Button>
                    )}
                    {item.attemptId ? (
                        <Button size="sm" variant="ghost" asChild>
                            <Link href={`/exams/reports/${args.examId}/${item.attemptId}`}>
                                View Attempt
                            </Link>
                        </Button>
                    ) : (
                        <span className="text-muted-foreground text-sm">No attempt</span>
                    )}
                </div>
            );
        },
    },
];
