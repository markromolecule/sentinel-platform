import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { GenerateQuestionPreviewResponse } from '@sentinel/shared';

/**
 * Hook to manage selection state for previewed questions.
 * Handles individual toggling, selecting all on a page, and initial load auto-selection.
 */
export function usePreviewSelection(
    previewData: GenerateQuestionPreviewResponse | null,
    hasHydrated: boolean,
    currentPageIndexes: number[],
) {
    // 0. Synchronization State: Track previous data to reset selection if it changes
    const [prevPreviewData, setPrevPreviewData] = useState(previewData);
    const [prevHasHydrated, setPrevHasHydrated] = useState(hasHydrated);

    const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(() => {
        if (hasHydrated && previewData?.questions) {
            return new Set(previewData.questions.map((_, i) => i));
        }
        return new Set();
    });

    // 1. Synchronize selection when previewData or hydration state changes
    // This pattern avoids cascading renders by adjusting state during the render phase.
    if (previewData !== prevPreviewData || hasHydrated !== prevHasHydrated) {
        setPrevPreviewData(previewData);
        setPrevHasHydrated(hasHydrated);

        if (hasHydrated && previewData?.questions) {
            setSelectedQuestions(new Set(previewData.questions.map((_, i) => i)));
        } else if (!previewData) {
            setSelectedQuestions(new Set());
        }
    }

    // 2. Toggle individual question selection
    const handleToggleQuestion = useCallback((index: number) => {
        setSelectedQuestions((prev) => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    }, []);

    // 3. Toggle selection for all questions currently visible on the page
    const handleToggleSelectAll = useCallback(() => {
        if (!previewData || currentPageIndexes.length === 0) return;

        setSelectedQuestions((prev) => {
            const next = new Set(prev);
            const isEntirePageSelected = currentPageIndexes.every((index) => next.has(index));

            currentPageIndexes.forEach((index) => {
                if (isEntirePageSelected) {
                    next.delete(index);
                } else {
                    next.add(index);
                }
            });
            return next;
        });
    }, [previewData, currentPageIndexes]);

    // 4. Handle soft-delete from selection
    const handleDeleteQuestion = useCallback((index: number) => {
        setSelectedQuestions((prev) => {
            const next = new Set(prev);
            next.delete(index);
            return next;
        });
        toast.info('Question removed from import selection');
    }, []);

    return {
        selectedQuestions,
        setSelectedQuestions,
        handleToggleQuestion,
        handleToggleSelectAll,
        handleDeleteQuestion,
    };
}
