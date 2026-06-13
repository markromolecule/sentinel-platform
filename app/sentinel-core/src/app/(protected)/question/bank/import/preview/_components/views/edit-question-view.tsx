'use client';

import { Badge } from '@sentinel/ui';
import { Button } from '@sentinel/ui';
import { ArrowLeft } from 'lucide-react';
import { QuestionBuilderForm } from '@/features/exams';
import { ExamQuestion } from '@sentinel/shared/types';

interface EditQuestionViewProps {
    editingIndex: number;
    editingQuestion: ExamQuestion;
    onBack: () => void;
    onUpdate: (id: string, updates: Partial<ExamQuestion>) => void;
}

export function EditQuestionView({
    editingIndex,
    editingQuestion,
    onBack,
    onUpdate,
}: EditQuestionViewProps) {
    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:p-6">
            <div className="mb-8 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Edit Question {editingIndex + 1}</h1>
                    <p className="text-muted-foreground text-sm">
                        Refine the generated question content.
                    </p>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">
                    {editingQuestion.sourceOrigin === 'AI_PDF'
                        ? `${editingQuestion.sourceFileName} • Page ${editingQuestion.sourcePageNumber}`
                        : 'Manual entry'}
                </Badge>
                {editingQuestion.sourceEvidence ? (
                    <p className="text-muted-foreground text-sm">
                        Evidence: &quot;{editingQuestion.sourceEvidence}&quot;
                    </p>
                ) : null}
            </div>
            <div className="rounded-xl border bg-white p-8 shadow-sm dark:bg-slate-900">
                <QuestionBuilderForm
                    type={editingQuestion.type}
                    initialData={editingQuestion}
                    onBack={onBack}
                    onUpdate={onUpdate}
                    onCreate={() => {}}
                />
            </div>
        </div>
    );
}
