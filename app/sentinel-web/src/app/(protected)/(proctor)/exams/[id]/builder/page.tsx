"use client";

import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@sentinel/ui";
import { Badge } from "@sentinel/ui";
import { Separator } from "@sentinel/ui";
import {
    Settings,
    Save,
    LayoutGrid,
} from "lucide-react";
import { Suspense, useState } from "react";
import {
    QuestionTypeSelectorDialog,
    QuestionBuilderForm,
    QuestionBucketTable,
    QuestionType,
    ExamQuestion
} from "@/features/exams";
import { toast } from "sonner";

function ExamBuilderContent() {
    const searchParams = useSearchParams();
    const title = searchParams.get("title") || "Untitled Exam";

    const [questions, setQuestions] = useState<ExamQuestion[]>([]);
    const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
    const [activeQuestionType, setActiveQuestionType] = useState<QuestionType | null>(null);

    const handleSelectQuestionType = (type: QuestionType) => {
        setIsTypeSelectorOpen(false);
        setActiveQuestionType(type);
    };

    const handleCreateQuestion = (question: ExamQuestion) => {
        setQuestions([...questions, { ...question, id: crypto.randomUUID() }]);
        setActiveQuestionType(null);
        toast.success("Question created!");
    };

    const handleDuplicateQuestion = (question: ExamQuestion) => {
        setQuestions([...questions, { ...question, id: crypto.randomUUID() }]);
        toast.success("Question duplicated!");
    };

    const handleEditQuestion = () => {
        // For now just toggle type selector as demo of edit
        toast.info("Edit functionality coming soon!");
    };

    const handleDeleteQuestion = (index: number) => {
        const newQuestions = [...questions];
        newQuestions.splice(index, 1);
        setQuestions(newQuestions);
        toast.success("Question deleted!");
    };

    const handleBackFromBuilder = () => {
        setActiveQuestionType(null);
    };

    return (
        <div className="flex min-h-screen flex-col gap-6 md:p-6 p-4">
            <PageHeader
                title={title}
                description="Build and organize questions for this exam."
            >
                <Badge variant="secondary">Draft</Badge>
                <Button variant="ghost" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                </Button>
                <Button variant="outline" className="gap-2">
                    <Save className="h-4 w-4" />
                    Save
                </Button>
                <Button className="gap-2">
                    <LayoutGrid className="h-4 w-4" />
                    Publish
                </Button>
            </PageHeader>

            <Separator />

            <main className="flex-1">
                <div className="mx-auto w-full max-w-5xl">
                    {activeQuestionType ? (
                        <QuestionBuilderForm
                            type={activeQuestionType}
                            onBack={handleBackFromBuilder}
                            onCreate={handleCreateQuestion}
                            onDuplicate={handleDuplicateQuestion}
                        />
                    ) : (
                        <div className="space-y-6">
                            <div className="space-y-1">
                                <h2 className="text-xl font-semibold tracking-tight">Exam Structure</h2>
                                <p className="text-sm text-muted-foreground">
                                    Add, edit, or rearrange questions in the bucket.
                                </p>
                            </div>

                            <div className="flex justify-center">
                                <QuestionBucketTable
                                    questions={questions}
                                    onAdd={() => setIsTypeSelectorOpen(true)}
                                    onEdit={handleEditQuestion}
                                    onDelete={handleDeleteQuestion}
                                />
                            </div>

                        </div>
                    )}
                </div>
            </main>

            <QuestionTypeSelectorDialog
                open={isTypeSelectorOpen}
                onOpenChange={setIsTypeSelectorOpen}
                onSelect={handleSelectQuestionType}
            />
        </div>
    );
}

export default function ExamBuilderPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen text-sm text-muted-foreground">Loading builder...</div>}>
            <ExamBuilderContent />
        </Suspense>
    );
}
