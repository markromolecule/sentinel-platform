'use client';

import * as React from 'react';
import { hasDragType, SECTION_DND_MIME_TYPE } from '../shared';

type SectionDragPayload = {
    sectionIndex?: number;
};

function parseSectionDragPayload(event: React.DragEvent<HTMLElement>) {
    const payload = event.dataTransfer.getData(SECTION_DND_MIME_TYPE);

    if (!payload) {
        return null;
    }

    try {
        return JSON.parse(payload) as SectionDragPayload;
    } catch {
        return null;
    }
}

export function useSectionDragAndDrop(
    onReorderSections?: (startIndex: number, endIndex: number) => void,
) {
    const [draggedSectionIndex, setDraggedSectionIndex] = React.useState<number | null>(null);
    const [dropSectionIndex, setDropSectionIndex] = React.useState<number | null>(null);

    const resetSectionDragState = React.useCallback(() => {
        setDraggedSectionIndex(null);
        setDropSectionIndex(null);
    }, []);

    const handleSectionDragStart = React.useCallback((sectionIndex: number) => {
        return (event: React.DragEvent<HTMLButtonElement>) => {
            setDraggedSectionIndex(sectionIndex);
            setDropSectionIndex(sectionIndex);
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData(SECTION_DND_MIME_TYPE, JSON.stringify({ sectionIndex }));
            event.dataTransfer.setData('text/plain', `section:${sectionIndex}`);
        };
    }, []);

    const handleSectionDragEnter = React.useCallback(
        (sectionIndex: number) => {
            return (event: React.DragEvent<HTMLDivElement>) => {
                if (
                    !hasDragType(event.dataTransfer, SECTION_DND_MIME_TYPE) ||
                    draggedSectionIndex === null
                ) {
                    return;
                }

                event.preventDefault();

                if (dropSectionIndex !== sectionIndex) {
                    setDropSectionIndex(sectionIndex);
                }
            };
        },
        [draggedSectionIndex, dropSectionIndex],
    );

    const handleSectionDragOver = React.useCallback(
        (sectionIndex: number) => {
            return (event: React.DragEvent<HTMLDivElement>) => {
                if (
                    !hasDragType(event.dataTransfer, SECTION_DND_MIME_TYPE) ||
                    draggedSectionIndex === null
                ) {
                    return;
                }

                event.preventDefault();

                if (dropSectionIndex !== sectionIndex) {
                    setDropSectionIndex(sectionIndex);
                }

                event.dataTransfer.dropEffect = 'move';
            };
        },
        [draggedSectionIndex, dropSectionIndex],
    );

    const handleSectionDrop = React.useCallback(
        (sectionIndex: number) => {
            return (event: React.DragEvent<HTMLDivElement>) => {
                if (
                    !hasDragType(event.dataTransfer, SECTION_DND_MIME_TYPE) &&
                    draggedSectionIndex === null
                ) {
                    return;
                }

                event.preventDefault();

                const parsedPayload = parseSectionDragPayload(event);
                const startIndex = draggedSectionIndex ?? parsedPayload?.sectionIndex;

                if (
                    typeof startIndex !== 'number' ||
                    Number.isNaN(startIndex) ||
                    startIndex === sectionIndex
                ) {
                    resetSectionDragState();
                    return;
                }

                onReorderSections?.(startIndex, sectionIndex);
                resetSectionDragState();
            };
        },
        [draggedSectionIndex, onReorderSections, resetSectionDragState],
    );

    const getSectionDragState = React.useCallback(
        (sectionIndex: number) => {
            return {
                isSectionDragging: draggedSectionIndex === sectionIndex,
                isSectionDropTarget:
                    dropSectionIndex === sectionIndex && draggedSectionIndex !== sectionIndex,
            };
        },
        [draggedSectionIndex, dropSectionIndex],
    );

    return {
        resetSectionDragState,
        handleSectionDragStart,
        handleSectionDragEnter,
        handleSectionDragOver,
        handleSectionDrop,
        getSectionDragState,
    };
}
