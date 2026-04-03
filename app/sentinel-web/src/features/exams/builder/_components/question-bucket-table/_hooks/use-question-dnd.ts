"use client";

import * as React from "react";
import {
    hasDragType,
    QUESTION_DND_MIME_TYPE,
} from "../shared";

type DraggedQuestion = {
    sectionId: string;
    index: number;
} | null;

type QuestionDragPayload = {
    sectionId?: string;
    index?: number;
};

function parseQuestionDragPayload(event: React.DragEvent<HTMLElement>) {
    const payload = event.dataTransfer.getData(QUESTION_DND_MIME_TYPE);

    if (!payload) {
        return null;
    }

    try {
        return JSON.parse(payload) as QuestionDragPayload;
    } catch {
        return null;
    }
}

export function useQuestionDragAndDrop(
    onReorderInSection?: (sectionId: string, startIndex: number, endIndex: number) => void,
) {
    const [draggedQuestion, setDraggedQuestion] = React.useState<DraggedQuestion>(null);
    const [dropQuestion, setDropQuestion] = React.useState<DraggedQuestion>(null);

    const resetQuestionDragState = React.useCallback(() => {
        setDraggedQuestion(null);
        setDropQuestion(null);
    }, []);

    const handleQuestionDragStart = React.useCallback((sectionId: string, index: number) => {
        return (event: React.DragEvent<HTMLButtonElement>) => {
            setDraggedQuestion({ sectionId, index });
            setDropQuestion({ sectionId, index });
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData(QUESTION_DND_MIME_TYPE, JSON.stringify({ sectionId, index }));
            event.dataTransfer.setData("text/plain", `${sectionId}:${index}`);
        };
    }, []);

    const handleQuestionDragOver = React.useCallback((sectionId: string, index: number) => {
        return (event: React.DragEvent<HTMLTableRowElement>) => {
            if (!hasDragType(event.dataTransfer, QUESTION_DND_MIME_TYPE) && draggedQuestion === null) {
                return;
            }

            event.preventDefault();

            if (!draggedQuestion || draggedQuestion.sectionId !== sectionId) {
                return;
            }

            if (dropQuestion?.sectionId !== sectionId || dropQuestion.index !== index) {
                setDropQuestion({ sectionId, index });
            }

            event.dataTransfer.dropEffect = "move";
        };
    }, [draggedQuestion, dropQuestion]);

    const handleQuestionDrop = React.useCallback((sectionId: string, index: number) => {
        return (event: React.DragEvent<HTMLTableRowElement>) => {
            if (!hasDragType(event.dataTransfer, QUESTION_DND_MIME_TYPE) && draggedQuestion === null) {
                return;
            }

            event.preventDefault();

            const parsedPayload = parseQuestionDragPayload(event);
            const source = draggedQuestion ?? {
                sectionId: parsedPayload?.sectionId || "",
                index: typeof parsedPayload?.index === "number" ? parsedPayload.index : -1,
            };

            if (
                !source.sectionId ||
                source.sectionId !== sectionId ||
                Number.isNaN(source.index) ||
                source.index === index
            ) {
                resetQuestionDragState();
                return;
            }

            onReorderInSection?.(sectionId, source.index, index);
            resetQuestionDragState();
        };
    }, [draggedQuestion, onReorderInSection, resetQuestionDragState]);

    const getQuestionDragState = React.useCallback((sectionId: string) => {
        return {
            draggedIndex: draggedQuestion?.sectionId === sectionId ? draggedQuestion.index : null,
            dropTargetIndex: dropQuestion?.sectionId === sectionId ? dropQuestion.index : null,
        };
    }, [draggedQuestion, dropQuestion]);

    return {
        resetQuestionDragState,
        handleQuestionDragStart,
        handleQuestionDragOver,
        handleQuestionDrop,
        getQuestionDragState,
    };
}
