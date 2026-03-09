"use client";

import * as React from "react";
import { ExamQuestion, QuestionType } from "@sentinel/shared/types";
import { useExamBuilderStore } from "../../_stores/use-exam-builder-store";
import { Card, CardContent } from "@sentinel/ui";
import { Input } from "@sentinel/ui";
import { Button } from "@sentinel/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@sentinel/ui";
import { Label } from "@sentinel/ui";
import { Trash2, Copy, GripVertical, Circle } from "lucide-react";
import { cn } from "@sentinel/ui";
import { QUESTION_TYPE_OPTIONS } from "@sentinel/shared/constants";
import { McqForm } from "./mcq-form";
import { TrueFalseForm } from "./true-false-form";
import { EssayForm } from "./essay-form";
import { IdentificationForm } from "./identification-form";
import { EnumerationForm } from "./enumeration-form";

interface QuestionCardProps {
    question: ExamQuestion;
    isActive: boolean;
    onActivate: () => void;
}

export function QuestionCard({ question, isActive, onActivate }: QuestionCardProps) {
    const { updateQuestion, updateQuestionContent, deleteQuestion, addQuestion } = useExamBuilderStore();

    const handleTypeChange = (value: QuestionType) => {
        let newContent: ExamQuestion["content"] = { prompt: question.content.prompt };

        switch (value) {
            case "MULTIPLE_CHOICE":
                newContent = { ...newContent, options: ["Option 1"], correctAnswer: "Option 1" };
                break;
            case "TRUE_FALSE":
                newContent = { ...newContent, correctAnswer: "True" };
                break;
            case "IDENTIFICATION":
            case "ENUMERATION":
                newContent = { ...newContent, acceptedAnswers: [""] };
                break;
            case "ESSAY":
                newContent = { ...newContent, rubric: "", maxLength: 1000 };
                break;
        }

        updateQuestion(question.id, { type: value, content: newContent });
    };

    const handleContentChange = (updates: Partial<ExamQuestion["content"]>) => {
        updateQuestionContent(question.id, updates);
    };

    const handleDuplicate = (e: React.MouseEvent) => {
        e.stopPropagation();
        addQuestion(question.type);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        deleteQuestion(question.id);
    };

    // ── Render question-type-specific form ──────────────────────────
    const renderQuestionForm = () => {
        const formProps = { content: question.content, onChange: handleContentChange };

        switch (question.type) {
            case "MULTIPLE_CHOICE":
                return <McqForm {...formProps} />;
            case "TRUE_FALSE":
                return <TrueFalseForm {...formProps} />;
            case "ESSAY":
                return <EssayForm {...formProps} />;
            case "IDENTIFICATION":
                return <IdentificationForm {...formProps} />;
            case "ENUMERATION":
                return <EnumerationForm {...formProps} />;
            default:
                return null;
        }
    };

    return (
        <Card
            className={cn(
                "relative transition-all duration-200 border-l-[6px]",
                isActive
                    ? "border-l-blue-600 shadow-md ring-1 ring-slate-200"
                    : "border-l-transparent hover:border-l-slate-300 shadow-sm cursor-pointer"
            )}
            onClick={!isActive ? onActivate : undefined}
        >
            <div className="absolute top-2 left-1/2 -translate-x-1/2 opacity-0 hover:opacity-100 cursor-grab text-slate-300">
                <GripVertical className="w-5 h-5" />
            </div>

            <CardContent className="pt-4 pb-3 px-6">
                {!isActive ? (
                    // ── PREVIEW MODE ────────────────────────────────────
                    <div className="space-y-2">
                        <div className="flex gap-4 items-start">
                            <h3 className="flex-1 text-base font-medium">
                                {question.orderIndex + 1}. {question.content.prompt || "Untitled Question"}
                            </h3>
                            <span className="text-sm text-slate-500 whitespace-nowrap bg-slate-100 px-2 py-1 rounded">
                                {question.points} pts
                            </span>
                        </div>
                        {question.type === "MULTIPLE_CHOICE" && (
                            <div className="space-y-2 pl-4">
                                {question.content.options?.map((opt, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                                        <Circle className="w-4 h-4 text-slate-300" />
                                        {opt}
                                    </div>
                                ))}
                            </div>
                        )}
                        {(question.type === "IDENTIFICATION" || question.type === "ESSAY") && (
                            <div className="border-b border-dashed border-slate-300 w-2/3 mt-3"></div>
                        )}
                    </div>
                ) : (
                    // ── EDIT MODE ───────────────────────────────────────
                    <div className="space-y-4">
                        <div className="flex gap-4 items-start justify-end">
                            <Select value={question.type} onValueChange={handleTypeChange}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {QUESTION_TYPE_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {renderQuestionForm()}

                        <div className="flex items-center justify-end gap-4 pt-3 mt-3 border-t border-slate-100">
                            <div className="flex items-center gap-2 mr-auto text-sm">
                                <Label>Points</Label>
                                <Input
                                    type="number"
                                    className="w-20 h-8"
                                    value={question.points}
                                    onChange={(e) => updateQuestion(question.id, { points: parseInt(e.target.value) || 0 })}
                                />
                            </div>

                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900" onClick={handleDuplicate} title="Duplicate">
                                    <Copy className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-slate-500 hover:text-red-600" onClick={handleDelete} title="Delete">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
