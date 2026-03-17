"use client";

import { useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { QuestionBucketTable } from "../_components/QuestionBucketTable";
import { QuestionTypeSelectorDialog } from "../_components/QuestionTypeSelectorDialog";
import { QuestionBuilderForm } from "../_components/QuestionBuilderForm";
import { mockExams } from "../_mock/exams";
import type { ExamQuestion, QuestionType } from "../types";
import { Button } from "@sentinel/ui";
import { ArrowLeft, Save, Play, Settings } from "lucide-react";
import { Badge } from "@sentinel/ui";
import { Suspense } from "react";

function ExamBuilderContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const examId = searchParams.get("id");
    const isNew = searchParams.get("new") === "true";
    const initialTitle = searchParams.get("title") || "Untitled Exam";

    const [questions, setQuestions] = useState<ExamQuestion[]>(
        examId ? mockExams.find(e => e.id === examId)?.questions || [] : []
    );

    const [view, setView] = useState<"table" | "form">("table");
    const [selectedType, setSelectedType] = useState<QuestionType | null>(null);
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);

    // Complex branching logic
    const handleAddQuestion = () => setIsSelectorOpen(true);
    
    const handleSelectType = (type: QuestionType) => {
        setSelectedType(type);
        setIsSelectorOpen(false);
        setView("form");
    };

    const handleCreate = (newQuestion: ExamQuestion) => {
        const qWithId = { ...newQuestion, id: `temp-${Date.now()}` };
        setQuestions([...questions, qWithId]);
        setView("table");
        setIsSelectorOpen(true); // Automatically open selector for next question
    };

    const handleDuplicate = (newQuestion: ExamQuestion) => {
        const qWithId = { ...newQuestion, id: `temp-${Date.now()}` };
        setQuestions([...questions, qWithId]);
        // Stay in form view with same type, essentially "clearing" is handled by component remount/reset if needed
        // For this mock, we just alert or show a success toast in a real app.
        // We trigger a re-render by slightly changing the key or just let the user continue editing the same fields.
        // But the prompt says "clears the input fields, but keeps the user in the same question type form".
        // To "clear", we can force a reset by briefly toggling type or using a key.
        setSelectedType(null);
        setTimeout(() => setSelectedType(newQuestion.type), 10);
    };

    const handleBack = () => {
        setView("table");
        setSelectedType(null);
    };

    const handleDelete = (index: number) => {
        const newQs = [...questions];
        newQs.splice(index, 1);
        setQuestions(newQs);
    };

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Top Navigation / Header */}
            <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
                <div className="flex items-center gap-6">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9 rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <h1 className="text-lg font-bold truncate max-w-[300px]">
                            {initialTitle}
                        </h1>
                        <Badge variant="secondary" className="bg-primary/10 text-primary font-bold px-2 py-0.5 border-primary/20">
                            {isNew ? "Draft" : "Editing"}
                        </Badge>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="font-semibold text-muted-foreground hover:text-foreground">
                        <Settings className="h-4 w-4 mr-2" /> Settings
                    </Button>
                    <div className="h-4 w-[1px] bg-border mx-2" />
                    <Button variant="outline" size="sm" className="font-bold border-2 border-primary/20 hover:border-primary/50">
                        <Save className="h-4 w-4 mr-2" /> Save Progress
                    </Button>
                    <Button size="sm" className="font-bold shadow-lg shadow-primary/20 px-6">
                        <Play className="h-4 w-4 mr-2 fill-current" /> Publish Exam
                    </Button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-secondary/5">
                {/* Stepper / Progress if needed */}
                <div className="max-w-6xl mx-auto py-8 px-8">
                    {view === "table" ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="flex flex-col gap-1">
                                <h2 className="text-3xl font-extrabold tracking-tight">Exam Structure</h2>
                                <p className="text-muted-foreground text-lg italic">
                                    Assemble your questionnaire by adding, editing, or rearranging items in the bucket.
                                </p>
                            </div>

                            <QuestionBucketTable 
                                questions={questions} 
                                onAdd={handleAddQuestion}
                                onDelete={handleDelete}
                                onEdit={(idx) => {
                                    setSelectedType(questions[idx].type);
                                    setView("form");
                                }}
                            />
                        </div>
                    ) : (
                        selectedType && (
                            <QuestionBuilderForm 
                                key={`${selectedType}-${questions.length}`} // Reset form on duplicate (length change) or type change
                                type={selectedType}
                                onBack={handleBack}
                                onCreate={handleCreate}
                                onDuplicate={handleDuplicate}
                            />
                        )
                    )}
                </div>
            </main>

            <QuestionTypeSelectorDialog 
                open={isSelectorOpen} 
                onOpenChange={setIsSelectorOpen} 
                onSelect={handleSelectType}
            />
        </div>
    );
}

export default function ExamBuilderPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading builder...</div>}>
            <ExamBuilderContent />
        </Suspense>
    );
}
