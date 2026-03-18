"use client";

import * as React from "react";
import { useExamBuilderStore } from "../../_stores/use-exam-builder-store";
import { QuestionBucketTable } from "./question-bucket-table";
import { QuestionTypeSelectorDialog } from "./question-type-selector-dialog";
import { QuestionType as StoreQuestionType } from "@sentinel/shared/types";
import { QuestionType as UICopyQuestionType } from "../../types";

export function QuestionList() {
    const { questions, deleteQuestion, addQuestion } = useExamBuilderStore();
    const [isSelectorOpen, setIsSelectorOpen] = React.useState(false);

    const handleEdit = (index: number) => {
        // TODO: Implement editing logic. 
        // For now, we'll just log it. 
        console.log("Edit question:", questions[index]);
    };

    const handleDelete = (index: number) => {
        const question = questions[index];
        if (question?.id) {
            deleteQuestion(question.id);
        }
    };

    const handleAdd = () => {
        setIsSelectorOpen(true);
    };

    const handleTypeSelect = (type: UICopyQuestionType) => {
        // Convert UI lowercase type to Store UPPERCASE type
        const storeType = type.toUpperCase() as StoreQuestionType;
        addQuestion(storeType);
        setIsSelectorOpen(false);
    };

    // Map store questions to the UI component expected format
    const mappedQuestions = questions.map((q) => ({
        id: q.id,
        type: q.type.toLowerCase() as UICopyQuestionType,
        prompt: q.content.prompt,
        points: q.points,
        options: q.content.options,
        correctOption: typeof q.content.correctAnswer === 'number' ? q.content.correctAnswer : undefined,
        correctBoolean: typeof q.content.correctAnswer === 'boolean' ? q.content.correctAnswer : undefined,
        acceptedAnswers: q.content.acceptedAnswers,
    }));

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
