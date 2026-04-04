'use client';

import { Button } from "@sentinel/ui";
import { ArrowLeft } from "lucide-react";
import { QuestionBuilderForm } from "@/features/exams";
import { ExamQuestion } from "@sentinel/shared/types";

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
    onUpdate 
}: EditQuestionViewProps) {
    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 max-w-5xl">
            <div className="mb-8 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Edit Question {editingIndex + 1}</h1>
                    <p className="text-muted-foreground text-sm">Refine the generated question content.</p>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-900 border rounded-xl p-8 shadow-sm">
                <QuestionBuilderForm 
                    type={editingQuestion.type}
                    initialData={editingQuestion}
                    onBack={onBack}
                    onUpdate={onUpdate}
                    onCreate={() => {}}
                    onDuplicate={() => {}}
                />
            </div>
        </div>
    );
}
