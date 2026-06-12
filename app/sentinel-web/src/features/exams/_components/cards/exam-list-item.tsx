'use client';

import { format } from 'date-fns';
import Link from 'next/link';
import { ProctorExam } from '@sentinel/shared/types';
import {
    Badge,
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Spinner,
} from '@sentinel/ui';
import {
    CalendarDays,
    Clock3,
    FileText,
    MoreHorizontal,
    Pencil,
    Trash2,
} from 'lucide-react';
import { useExamCard } from '@/features/exams/_hooks/use-exam-card';
import { ExamCardDeleteAlert } from './exam-card/exam-card-delete-alert';
import { ExamEditDialog } from '@/features/exams/_components/dialogs/exam-edit-dialog';

interface ExamListItemProps {
    exam: ProctorExam;
}

function formatExamDate(value?: string) {
    if (!value) {
        return 'Unscheduled';
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return 'Unscheduled';
    }

    return format(parsed, 'MMM d, yyyy');
}

export function ExamListItem({ exam }: ExamListItemProps) {
    const {
        showDeleteAlert,
        setShowDeleteAlert,
        showEdit,
        setShowEdit,
        handleDelete,
        primaryActions,
    } = useExamCard({ exam });

    return (
        <>
            <div className="border-border/60 bg-background hover:border-border flex flex-col gap-4 rounded-xl border px-4 py-4 shadow-none transition sm:px-5 sm:py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1 space-y-3">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-foreground truncate text-sm font-semibold sm:text-base">
                                {exam.title}
                            </h3>
                            <Badge
                                variant="outline"
                                className="text-[10px] tracking-wide uppercase"
                            >
                                {exam.status.replace('_', ' ')}
                            </Badge>
                        </div>
                        {exam.description ? (
                            <p className="text-muted-foreground mt-1 line-clamp-1 text-sm">
                                {exam.description}
                            </p>
                        ) : null}
                    </div>

                    <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm">
                        <span className="inline-flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5" />
                            {exam.classroomName || exam.subject || 'No classroom'}
                        </span>
                        <span>
                            {[exam.subject || null, exam.section || null]
                                .filter(Boolean)
                                .join(' • ') || 'No classroom scope'}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {formatExamDate(exam.scheduledDate)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <Clock3 className="h-3.5 w-3.5" />
                            {exam.duration} min
                        </span>
                        <span>{exam.questionCount || 0} questions</span>
                        <span>{exam.room ? `Room ${exam.room}` : 'No room assigned'}</span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:ml-6 lg:justify-end lg:self-start">
                    {primaryActions.map((action) => {
                        const content = (
                            <>
                                {action.isLoading ? (
                                    <Spinner className="h-4 w-4" />
                                ) : (
                                    <action.icon className="h-4 w-4" />
                                )}
                                <span>{action.label}</span>
                            </>
                        );

                        if (action.href && !action.disabled) {
                            return (
                                <Button
                                    key={action.label}
                                    asChild
                                    size="sm"
                                    variant={action.variant || 'default'}
                                    className="h-8 gap-2"
                                >
                                    <Link href={action.href} onClick={action.onClick}>
                                        {content}
                                    </Link>
                                </Button>
                            );
                        }

                        return (
                            <Button
                                key={action.label}
                                size="sm"
                                variant={action.variant || 'default'}
                                className="h-8 gap-2"
                                onClick={action.onClick}
                                disabled={action.disabled}
                            >
                                {content}
                            </Button>
                        );
                    })}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px]">
                            <DropdownMenuItem
                                onClick={() => setShowEdit(true)}
                                className="cursor-pointer"
                            >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setShowDeleteAlert(true)}
                                className="cursor-pointer text-red-500 focus:text-red-500"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <ExamCardDeleteAlert
                open={showDeleteAlert}
                onOpenChange={setShowDeleteAlert}
                title={exam.title}
                onDelete={handleDelete}
            />
            <ExamEditDialog open={showEdit} onOpenChange={setShowEdit} exam={exam} />
        </>
    );
}
