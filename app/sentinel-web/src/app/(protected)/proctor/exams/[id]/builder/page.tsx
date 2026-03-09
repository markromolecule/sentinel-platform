"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@sentinel/ui";
import { Input } from "@sentinel/ui";
import { Textarea } from "@sentinel/ui";
import { Save, ArrowLeft, Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useExamBuilderStore } from "@/app/(protected)/proctor/exams/_stores/use-exam-builder-store";
import { QuestionList } from "@/app/(protected)/proctor/exams/_components/builder";
import { QuestionType } from "@sentinel/shared/types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function ExamBuilderPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const {
        title,
        description,
        questions,
        addQuestion,
        isSubmitting,
        setSubmitting,
        setTitle,
        setDescription,
    } = useExamBuilderStore();

    const [isEditingTitle, setIsEditingTitle] = React.useState(false);
    const [isEditingDescription, setIsEditingDescription] = React.useState(false);
    const titleInputRef = React.useRef<HTMLInputElement>(null);
    const descriptionInputRef = React.useRef<HTMLTextAreaElement>(null);

    React.useEffect(() => {
        if (isEditingTitle && titleInputRef.current) {
            titleInputRef.current.focus();
            titleInputRef.current.select();
        }
    }, [isEditingTitle]);

    React.useEffect(() => {
        if (isEditingDescription && descriptionInputRef.current) {
            descriptionInputRef.current.focus();
        }
    }, [isEditingDescription]);

    const handleSaveDraft = async () => {
        try {
            setSubmitting(true);
            await new Promise(resolve => setTimeout(resolve, 800));
            toast.success("Draft saved successfully");
            router.push("/proctor/exams");
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Failed to save draft");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddClick = (type: QuestionType) => {
        addQuestion(type);
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            setIsEditingTitle(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 md:p-6 p-4 max-w-5xl mx-auto w-full">
            <div className="flex items-center gap-4">
                <div className="flex-1 space-y-1.5">
                    {isEditingTitle ? (
                        <Input
                            ref={titleInputRef}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={() => setIsEditingTitle(false)}
                            onKeyDown={handleTitleKeyDown}
                            placeholder="Enter exam title..."
                            className="text-2xl font-bold tracking-tight h-auto py-1 border-0 border-b-2 border-blue-600 rounded-none px-0 focus-visible:ring-0 bg-transparent"
                        />
                    ) : (
                        <h1
                            className="text-2xl font-bold tracking-tight cursor-pointer group flex items-center gap-2 hover:text-blue-700 transition-colors"
                            onClick={() => setIsEditingTitle(true)}
                            title="Click to edit title"
                        >
                            Builder: {title || "Untitled Exam"}
                            <Pencil className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                        </h1>
                    )}
                    {isEditingDescription ? (
                        <Textarea
                            ref={descriptionInputRef}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onBlur={() => setIsEditingDescription(false)}
                            placeholder="Enter exam description..."
                            className="text-muted-foreground text-sm resize-none border-0 border-b-2 border-blue-600 rounded-none px-0 py-1 focus-visible:ring-0 bg-transparent min-h-[36px]"
                            rows={2}
                        />
                    ) : (
                        <p
                            className="text-muted-foreground cursor-pointer group flex items-center gap-2 hover:text-blue-700 transition-colors"
                            onClick={() => setIsEditingDescription(true)}
                            title="Click to edit description"
                        >
                            {description || "Click to add a description…"}
                            <Pencil className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => router.push("/proctor/exams")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <Button onClick={handleSaveDraft} disabled={isSubmitting} className="bg-[#323d8f] hover:bg-[#323d8f]/90">
                        <Save className="mr-2 h-4 w-4" />
                        {isSubmitting ? "Saving..." : "Save Draft"}
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-4 mt-4">
                {questions.length === 0 ? (
                    <div className="text-center p-12 border-2 border-dashed rounded-lg bg-slate-50 text-slate-500">
                        <p className="text-lg font-medium">No questions added yet</p>
                        <p className="text-sm mb-4">Click the button below to start building the exam.</p>
                        <Button onClick={() => handleAddClick('MULTIPLE_CHOICE')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add First Question
                        </Button>
                    </div>
                ) : (
                    <QuestionList />
                )}
            </div>
        </div>
    );
}
