'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button, cn } from '@sentinel/ui';

import {
    STUDENT_EXAM_STAGES,
    type StudentExamStage,
    buildStudentExamHref,
} from '../_lib/student-exam-flow';

type StudentExamStageFrameProps = {
    examId: string;
    currentStage: StudentExamStage;
    examTitle: string;
    children: ReactNode;
};

const STAGE_LABELS: Record<StudentExamStage, string> = {
    instruction: 'Instruction',
    privacy: 'Privacy',
    checkup: 'Checkup',
    lobby: 'Lobby',
    attempt: 'Attempt',
};

export function StudentExamStageFrame({
    examId,
    currentStage,
    examTitle,
    children,
}: StudentExamStageFrameProps) {
    const currentStageIndex = STUDENT_EXAM_STAGES.indexOf(currentStage);
    const previousStage =
        currentStageIndex > 0 ? STUDENT_EXAM_STAGES[currentStageIndex - 1] : null;

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-background">
            <div className="border-border/60 border-b">
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 py-5 sm:px-8">
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">
                                Student Exam Flow
                            </p>
                            <h1 className="mt-2 truncate text-xl font-semibold tracking-tight sm:text-2xl">
                                {examTitle}
                            </h1>
                        </div>

                        {previousStage ? (
                            <Button variant="outline" asChild>
                                <Link href={buildStudentExamHref(examId, previousStage)}>
                                    <ChevronLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Link>
                            </Button>
                        ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {STUDENT_EXAM_STAGES.map((stage, index) => {
                            const isActive = stage === currentStage;
                            const isCompleted = index < currentStageIndex;

                            return (
                                <div
                                    key={stage}
                                    className={cn(
                                        'rounded-full border px-3 py-1.5 text-xs font-medium',
                                        isActive &&
                                            'border-primary bg-primary/10 text-primary',
                                        !isActive &&
                                            isCompleted &&
                                            'border-emerald-200 bg-emerald-50 text-emerald-700',
                                        !isActive &&
                                            !isCompleted &&
                                            'border-border/60 text-muted-foreground',
                                    )}
                                >
                                    {index + 1}. {STAGE_LABELS[stage]}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8 sm:py-8">{children}</div>
        </div>
    );
}
