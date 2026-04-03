"use client";

import * as React from "react";
import type { QuestionBucketTableProps } from "../_types";
import { FlatQuestionBucketToolbar } from "./question-bucket-toolbar";
import { QuestionRowsTable } from "./question-rows-table";
import { QUESTION_DND_MIME_TYPE, QuestionBucketEmptyState, getTotalPoints } from "./shared";

export function FlatQuestionBucketTable({
    questions,
    onEdit,
    onDelete,
    onReorder,
    onAdd,
    onImport,
}: QuestionBucketTableProps) {
    const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
    const [dropTargetIndex, setDropTargetIndex] = React.useState<number | null>(null);

    const totalPoints = getTotalPoints(questions);

    const resetDragState = React.useCallback(() => {
        setDraggedIndex(null);
        setDropTargetIndex(null);
    }, []);

    const handleDragStart = React.useCallback((index: number) => {
        return (event: React.DragEvent<HTMLButtonElement>) => {
            setDraggedIndex(index);
            setDropTargetIndex(index);
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData(QUESTION_DND_MIME_TYPE, JSON.stringify({ index }));
            event.dataTransfer.setData("text/plain", index.toString());
        };
    }, []);

    const handleDragOver = React.useCallback((index: number) => {
        return (event: React.DragEvent<HTMLTableRowElement>) => {
            event.preventDefault();
            if (draggedIndex === null) {
                return;
            }

            if (dropTargetIndex !== index) {
                setDropTargetIndex(index);
            }

            event.dataTransfer.dropEffect = "move";
        };
    }, [draggedIndex, dropTargetIndex]);

    const handleDrop = React.useCallback((index: number) => {
        return (event: React.DragEvent<HTMLTableRowElement>) => {
            event.preventDefault();

            const payload = event.dataTransfer.getData(QUESTION_DND_MIME_TYPE);
            const parsedPayload = payload ? JSON.parse(payload) as { index?: number } : null;
            const startIndex = draggedIndex ?? parsedPayload?.index;

            if (typeof startIndex !== "number" || Number.isNaN(startIndex) || startIndex === index) {
                resetDragState();
                return;
            }

            onReorder?.(startIndex, index);
            resetDragState();
        };
    }, [draggedIndex, onReorder, resetDragState]);

    if (questions.length === 0) {
        return (
            <QuestionBucketEmptyState
                onImport={() => onImport()}
                onAddQuestion={() => onAdd()}
            />
        );
    }

    return (
        <div className="w-full space-y-3">
            <FlatQuestionBucketToolbar
                questionCount={questions.length}
                onImport={() => onImport()}
                onAddQuestion={() => onAdd()}
            />

            <div className="overflow-hidden rounded-xl border border-border/60">
                <QuestionRowsTable
                    questions={questions}
                    footerLabel="Total Points"
                    footerPoints={totalPoints}
                    draggedIndex={draggedIndex}
                    dropTargetIndex={dropTargetIndex}
                    onDragStart={handleDragStart}
                    onDragEnd={resetDragState}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            </div>
        </div>
    );
}
