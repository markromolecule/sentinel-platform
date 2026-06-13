'use client';

import { useRef, useState } from 'react';

const DRAG_SCROLL_THRESHOLD_PX = 4;

export function useQuestionNavigationDragScroll() {
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const pointerIdRef = useRef<number | null>(null);
    const pointerDownRef = useRef(false);
    const dragStateRef = useRef({ startY: 0, startScrollTop: 0 });
    const didDragRef = useRef(false);
    const [isDragging, setIsDragging] = useState(false);

    const resetPointerState = (pointerId?: number) => {
        const scrollContainer = scrollContainerRef.current;

        if (pointerId !== undefined && scrollContainer?.hasPointerCapture(pointerId)) {
            scrollContainer.releasePointerCapture(pointerId);
        }

        pointerDownRef.current = false;
        pointerIdRef.current = null;
        setIsDragging(false);
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        if (event.pointerType === 'mouse' && event.button !== 0) {
            return;
        }

        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) {
            return;
        }

        dragStateRef.current = {
            startY: event.clientY,
            startScrollTop: scrollContainer.scrollTop,
        };

        pointerDownRef.current = true;
        pointerIdRef.current = event.pointerId;
        didDragRef.current = false;
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        const scrollContainer = scrollContainerRef.current;
        if (
            !scrollContainer ||
            !pointerDownRef.current ||
            pointerIdRef.current !== event.pointerId
        ) {
            return;
        }

        if (event.pointerType === 'mouse' && (event.buttons & 1) !== 1) {
            resetPointerState(event.pointerId);
            return;
        }

        const deltaY = event.clientY - dragStateRef.current.startY;

        if (!isDragging && Math.abs(deltaY) < DRAG_SCROLL_THRESHOLD_PX) {
            return;
        }

        if (!isDragging) {
            scrollContainer.setPointerCapture(event.pointerId);
            setIsDragging(true);
        }

        didDragRef.current = true;
        scrollContainer.scrollTop = dragStateRef.current.startScrollTop - deltaY;
    };

    const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
        if (pointerIdRef.current !== event.pointerId) {
            return;
        }

        resetPointerState(event.pointerId);
    };

    const handlePointerLeave = (event: React.PointerEvent<HTMLDivElement>) => {
        if (event.pointerType === 'mouse' && (event.buttons & 1) !== 1) {
            resetPointerState(pointerIdRef.current ?? undefined);
        }
    };

    const handleClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!didDragRef.current) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        didDragRef.current = false;
    };

    return {
        scrollContainerRef,
        isDragging,
        interactionProps: {
            onPointerDown: handlePointerDown,
            onPointerMove: handlePointerMove,
            onPointerUp: handlePointerEnd,
            onPointerCancel: handlePointerEnd,
            onPointerLeave: handlePointerLeave,
            onClickCapture: handleClickCapture,
        },
    };
}
