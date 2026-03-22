"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@sentinel/ui";
import { Badge } from "@sentinel/ui";
import { Separator } from "@sentinel/ui";
import {
    Settings,
    Save,
    LayoutGrid,
} from "lucide-react";
import { Suspense } from "react";
import { useExamBuilder } from "./hooks/use-exam-builder";
import {
    QuestionTypeSelectorDialog,
    QuestionBuilderForm,
    QuestionBucketTable,
} from "@/features/exams";

function ExamBuilderContent() {
    const {
        title,
        description,
        status,
        questions,
        titleParam,
        isTypeSelectorOpen,
        activeQuestionType,
        editingQuestion,
        setIsTypeSelectorOpen,
        handleSelectQuestionType,
        handleCreateQuestion,
        handleDuplicateQuestion,
        handleEditQuestion,
        handleUpdateQuestion,
        handleDeleteQuestion,
        handleBackFromBuilder,
        handleSave,
        handlePublish,
    } = useExamBuilder();

    const router = useRouter();

    return (
        <div className="flex min-h-screen flex-col gap-6 md:p-6 p-4">
            <PageHeader
                title={title || titleParam}
                description="Build and organize questions for this exam."
            >
                <Badge variant={status === "published" ? "default" : "secondary"}>
                    {status === "published" ? "Published" : "Draft"}
                </Badge>
                <Button variant="ghost" className="gap-2" onClick={() => router.push("/configuration")}>
                    <Settings className="h-4 w-4" />
                    Settings
                </Button>
                <Button variant="outline" className="gap-2" onClick={handleSave}>
                    <Save className="h-4 w-4" />
                    Save Draft
                </Button>
                <Button className="gap-2" onClick={handlePublish}>
                    <LayoutGrid className="h-4 w-4" />
                    Publish
                </Button>
            </PageHeader>

            <Separator />

            {description && (
                <div className="mx-auto w-full max-w-5xl px-4 md:px-0">
                    <h3 className="text-sm font-semibold tracking-tight mb-2">Test Description</h3>
                    <p className="text-sm text-muted-foreground bg-muted p-4 rounded-md border border-border/50 break-words whitespace-pre-wrap">
                        {description}
                    </p>
                </div>
            )}

            <main className="flex-1">
                <div className="mx-auto w-full max-w-5xl">
                    {activeQuestionType ? (
                        <QuestionBuilderForm
                            key={`${activeQuestionType}-${editingQuestion?.id || 'new'}`}
                            type={activeQuestionType}
                            initialData={editingQuestion || undefined}
                            onBack={handleBackFromBuilder}
                            onCreate={handleCreateQuestion}
                            onUpdate={handleUpdateQuestion}
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
