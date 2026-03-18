"use client";

import * as React from "react";
import { useExamBuilderStore } from "../_stores/use-exam-builder-store";
import { QuestionBucketTable } from "./question-bucket-table";
import { QuestionTypeSelectorDialog } from "./question-type-selector-dialog";
import { type QuestionType, type ExamQuestion } from "@sentinel/shared/types";

export function QuestionList() {
    const { questions, deleteQuestion, addQuestion } = useExamBuilderStore();
    const [isSelectorOpen, setIsSelectorOpen] = React.useState(false);

    const handleEdit = (id: string) => {
        // TODO: Implement editing logic. 
        // For now, we'll just log it. 
        const question = questions.find(q => q.id === id);
        console.log("Edit question:", question);
    };

    const handleDelete = (id: string) => {
        deleteQuestion(id);
    };

    const handleAdd = () => {
        setIsSelectorOpen(true);
    };

    const handleTypeSelect = (type: QuestionType) => {
        addQuestion(type);
        setIsSelectorOpen(false);
    };

    // Pass questions directly to the bucket table
    const mappedQuestions: ExamQuestion[] = questions;

    return (
        <React.Fragment>
            <QuestionBucketTable
                questions={mappedQuestions}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAdd={handleAdd}
            />
            <QuestionTypeSelectorDialog
                open={isSelectorOpen}
                onOpenChange={setIsSelectorOpen}
                onSelect={handleTypeSelect}
            />
        </React.Fragment>
    );
}
