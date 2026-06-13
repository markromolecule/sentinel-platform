'use client';

import * as React from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
    useExamsQuery,
    useExamSectionAssignmentsQuery,
} from '@sentinel/hooks';
import {
    PageHeader,
    Separator,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Label,
    Spinner,
} from '@sentinel/ui';
import { Plus, BookOpen } from 'lucide-react';
import { type Exam } from '@sentinel/shared/types';
import { ExamsPageShell } from '../../_components/layout';
import { ExamSectionAssignmentList } from './exam-section-assignment-list';
import { AddExamSectionAssignmentDialog } from './add-exam-section-assignment-dialog';

export function InstructorAssignmentContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isAddOpen, setIsAddOpen] = React.useState(false);

    const currentExamId = searchParams.get('examId') || '';

    // Fetch exams
    const { data: exams = [], isLoading: isExamsLoading } = useExamsQuery();

    // Fetch assignments for the currently selected exam
    const {
        data: assignments = [],
        isLoading: isAssignmentsLoading,
    } = useExamSectionAssignmentsQuery(currentExamId);

    const handleExamChange = (newExamId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (newExamId === 'none') {
            params.delete('examId');
        } else {
            params.set('examId', newExamId);
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    const selectedExam = (exams as Exam[]).find((e: Exam) => e.id === currentExamId);

    return (
        <ExamsPageShell>
            <PageHeader
                title="Exam Section Assignments"
                description="Link sections, assign proctors, and schedule classroom locations for examinations."
            />

            <Separator />

            <div className="grid gap-6">
                {/* Exam Selector Card */}
                <Card className="bg-white dark:bg-zinc-900 border shadow-xs">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base font-semibold">Select Examination</CardTitle>
                        <CardDescription>
                            Choose an exam from the list to view and manage its active section assignments.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-2 max-w-md">
                            <Label htmlFor="exam-selector" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                Active Examination
                            </Label>
                            {isExamsLoading ? (
                                <div className="border-input flex h-10 items-center px-3 rounded-md border">
                                    <Spinner className="text-primary size-4 mr-2" />
                                    <span className="text-sm text-zinc-500">Loading exams...</span>
                                </div>
                            ) : (
                                <Select
                                    value={currentExamId || 'none'}
                                    onValueChange={handleExamChange}
                                >
                                    <SelectTrigger id="exam-selector" className="w-full">
                                        <SelectValue placeholder="Select an exam to manage..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Select an exam...</SelectItem>
                                        {(exams as Exam[]).map((exam: Exam) => (
                                            <SelectItem key={exam.id} value={exam.id}>
                                                {exam.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Section Assignments List */}
                {currentExamId ? (
                    <Card className="bg-white dark:bg-zinc-900 border shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <div>
                                <CardTitle className="text-base font-semibold">
                                    Assignments for: {selectedExam?.title || 'Exam'}
                                </CardTitle>
                                <CardDescription>
                                    Manage the sections, proctors, and rooms assigned to this exam.
                                </CardDescription>
                            </div>
                            <Button
                                onClick={() => setIsAddOpen(true)}
                                className="bg-[#323d8f] hover:bg-[#323d8f]/90 text-white shadow-xs"
                                size="sm"
                            >
                                <Plus className="mr-1.5 h-4 w-4" />
                                Assign Section
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <ExamSectionAssignmentList
                                examId={currentExamId}
                                assignments={assignments}
                                isLoading={isAssignmentsLoading}
                                onAssignClick={() => setIsAddOpen(true)}
                            />
                        </CardContent>
                    </Card>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center bg-zinc-50/50 dark:bg-zinc-950/20">
                        <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 rounded-full p-4 mb-4">
                            <BookOpen className="h-8 w-8" />
                        </div>
                        <h3 className="text-md font-semibold text-zinc-900 dark:text-zinc-100">
                            No Exam Selected
                        </h3>
                        <p className="text-muted-foreground mt-2 max-w-sm text-sm">
                            Please select an examination from the dropdown menu above to begin managing its section and proctor assignments.
                        </p>
                    </div>
                )}
            </div>

            {currentExamId && (
                <AddExamSectionAssignmentDialog
                    open={isAddOpen}
                    onOpenChange={setIsAddOpen}
                    examId={currentExamId}
                />
            )}
        </ExamsPageShell>
    );
}
