"use client";

import * as React from "react";
import { useExamBuilderStore } from "../_stores/use-exam-builder-store";
import { QuestionBucketTable } from "./question-bucket-table";
import { QuestionTypeSelectorDialog } from "./question-type-selector-dialog";
import { QuestionBankImportModal } from "./question-bank-import-modal";
import { type QuestionType, type ExamQuestion } from "@sentinel/shared/types";
import { toast } from "sonner";

export function QuestionList() {
    const { questions, deleteQuestion, addQuestion, importQuestions } = useExamBuilderStore();
    const [isSelectorOpen, setIsSelectorOpen] = React.useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);

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

    const handleImportClick = () => {
        setIsImportModalOpen(true);
    };

    const handleImport = (importedQuestions: ExamQuestion[]) => {
        importQuestions(importedQuestions);
        toast.success(`Imported ${importedQuestions.length} questions from bank`, {
            description: "Questions have been added to the end of the exam.",
        });
        setIsImportModalOpen(false);
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
                onImport={handleImportClick}
            />
            <QuestionTypeSelectorDialog
                open={isSelectorOpen}
                onOpenChange={setIsSelectorOpen}
                onSelect={handleTypeSelect}
            />
            <QuestionBankImportModal
                open={isImportModalOpen}
                onOpenChange={setIsImportModalOpen}
                onImport={handleImport}
            />
        </React.Fragment>
    );
}
