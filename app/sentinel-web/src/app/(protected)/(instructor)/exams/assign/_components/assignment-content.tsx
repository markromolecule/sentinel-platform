'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import {
    Label,
    PageHeader,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Separator,
    Spinner,
} from '@sentinel/ui';
import { useExamsQuery, useExamSectionAssignmentsQuery, useProfileQuery } from '@sentinel/hooks';
import { type ProctorExam } from '@sentinel/shared/types';
import { ExamsPageShell } from '../../_components/layout';
import { AddExamSectionAssignmentDialog } from './add-exam-section-assignment-dialog';
import { ExamSectionAssignmentList } from './exam-section-assignment-list';
import { buildInstructorExamAssignHref } from '@/lib/routes/exam-management-routes';

/**
 * InstructorAssignmentContent renders the exam selector and section assignment manager.
 */
export function InstructorAssignmentContent({ initialExamId }: { initialExamId?: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentExamId = initialExamId ?? (searchParams.get('examId') || '');
    const [isAssignDialogOpen, setIsAssignDialogOpen] = React.useState(false);
    const { profile } = useProfileQuery();

    const { data: exams = [], isLoading: isExamsLoading } = useExamsQuery({
        institutionId: profile?.institutionId || undefined,
    });
    const { data: assignments = [], isLoading: isAssignmentsLoading } =
        useExamSectionAssignmentsQuery(currentExamId);

    const handleExamChange = (newExamId: string) => {
        if (newExamId === 'none') {
            router.push('/exams/assign');
            return;
        }

        if (initialExamId) {
            router.push(buildInstructorExamAssignHref(newExamId));
            return;
        }

        const params = new URLSearchParams(searchParams.toString());
        params.set('examId', newExamId);
        const query = params.toString();
        router.push(`${pathname}${query ? `?${query}` : ''}`);
    };

    const selectedExam = (exams as ProctorExam[]).find((exam) => exam.id === currentExamId);

    return (
        <ExamsPageShell>
            <PageHeader
                title="Select Examination"
                description="Choose an exam from the list to view and manage its active section assignments."
            >
                <div className="flex w-full shrink-0 flex-col gap-1.5 md:w-80">
                    <Label
                        htmlFor="exam-selector"
                        className="text-xs font-semibold tracking-wider text-zinc-500 uppercase"
                    >
                        Active Examination
                    </Label>
                    {isExamsLoading ? (
                        <div className="border-input flex h-10 items-center rounded-md border px-3">
                            <Spinner className="text-primary mr-2 size-4" />
                            <span className="text-sm text-zinc-500">Loading exams...</span>
                        </div>
                    ) : (
                        <Select value={currentExamId || 'none'} onValueChange={handleExamChange}>
                            <SelectTrigger id="exam-selector" className="w-full">
                                <SelectValue placeholder="Select an exam to manage..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Select an exam...</SelectItem>
                                {(exams as ProctorExam[]).map((exam: ProctorExam) => (
                                    <SelectItem key={exam.id} value={exam.id}>
                                        {exam.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </PageHeader>

            <Separator />

            {currentExamId ? (
                <>
                    <ExamSectionAssignmentList
                        examId={currentExamId}
                        subjectId={selectedExam?.subjectId}
                        assignments={assignments}
                        isLoading={isAssignmentsLoading}
                        onAssignClick={() => setIsAssignDialogOpen(true)}
                    />

                    <AddExamSectionAssignmentDialog
                        examId={currentExamId}
                        examTitle={selectedExam?.title}
                        subjectId={selectedExam?.subjectId}
                        currentAssignments={assignments}
                        open={isAssignDialogOpen}
                        onOpenChange={setIsAssignDialogOpen}
                    />
                </>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-zinc-50/50 p-12 text-center dark:bg-zinc-950/20">
                    <div className="mb-4 rounded-full bg-zinc-100 p-4 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600">
                        <BookOpen className="h-8 w-8" />
                    </div>
                    <h3 className="text-md font-semibold text-zinc-900 dark:text-zinc-100">
                        No Exam Selected
                    </h3>
                    <p className="text-muted-foreground mt-2 max-w-sm text-sm">
                        Please select an examination from the dropdown menu above to begin managing
                        its classroom and proctor assignments.
                    </p>
                </div>
            )}
        </ExamsPageShell>
    );
}
