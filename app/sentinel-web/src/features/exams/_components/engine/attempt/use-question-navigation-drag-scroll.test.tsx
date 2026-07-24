import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useQuestionNavigationDragScroll } from './use-question-navigation-drag-scroll';

describe('useQuestionNavigationDragScroll', () => {
    it('scrolls the desktop rail and suppresses the click that follows a drag', () => {
        const { result } = renderHook(() => useQuestionNavigationDragScroll());
        const scrollContainer = document.createElement('div');

        scrollContainer.scrollTop = 120;
        scrollContainer.setPointerCapture = vi.fn();
        result.current.scrollContainerRef.current = scrollContainer;

        act(() => {
            result.current.interactionProps.onPointerDown({
                pointerType: 'mouse',
                button: 0,
                clientY: 100,
                pointerId: 1,
            } as never);
            result.current.interactionProps.onPointerMove({
                pointerType: 'mouse',
                buttons: 1,
                clientY: 76,
                pointerId: 1,
            } as never);
        });

        expect(scrollContainer.scrollTop).toBe(144);

        const preventDefault = vi.fn();
        const stopPropagation = vi.fn();

        result.current.interactionProps.onClickCapture({
            preventDefault,
            stopPropagation,
        } as never);

        expect(preventDefault).toHaveBeenCalledOnce();
        expect(stopPropagation).toHaveBeenCalledOnce();
    });

    it('keeps a stationary desktop rail click available for question selection', () => {
        const { result } = renderHook(() => useQuestionNavigationDragScroll());
        const preventDefault = vi.fn();
        const stopPropagation = vi.fn();

        result.current.interactionProps.onClickCapture({
            preventDefault,
            stopPropagation,
        } as never);

        expect(preventDefault).not.toHaveBeenCalled();
        expect(stopPropagation).not.toHaveBeenCalled();
    });
});
