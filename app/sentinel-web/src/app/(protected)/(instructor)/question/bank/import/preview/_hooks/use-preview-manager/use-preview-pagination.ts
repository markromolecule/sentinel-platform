import { useState, useMemo } from 'react';
import { GenerateQuestionPreviewResponse } from '@sentinel/shared';
import { QUESTIONS_PER_PAGE } from '../../_constants';
import { getPaginationIndices } from './_utils';

/**
 * Hook to manage pagination logic for the preview list.
 * Handles page state, boundary checks, and deriving paginated data subsets.
 */
export function usePreviewPagination(
    previewData: GenerateQuestionPreviewResponse | null,
    hasHydrated: boolean,
) {
    // 0. Synchronization State: Reset pagination if data changes
    const [prevPreviewData, setPrevPreviewData] = useState(previewData);
    const [prevHasHydrated, setPrevHasHydrated] = useState(hasHydrated);

    const [currentPage, setCurrentPage] = useState(1);

    // 1. Calculate total pages based on constant bank size
    const totalPages = useMemo(
        () =>
            previewData
                ? Math.max(1, Math.ceil(previewData.questions.length / QUESTIONS_PER_PAGE))
                : 1,
        [previewData],
    );

    if (previewData !== prevPreviewData || hasHydrated !== prevHasHydrated) {
        setPrevPreviewData(previewData);
        setPrevHasHydrated(hasHydrated);

        if (hasHydrated && previewData?.questions) {
            setCurrentPage(1);
        }
    }

    // 3. Ensure current page is always within bounds (relevant if total pages decreases)
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const { pageStartIndex, pageEndIndex } = getPaginationIndices(safeCurrentPage, QUESTIONS_PER_PAGE);

    // 4. Derive current page's questions and their absolute indices in the full dataset
    const paginatedQuestions = useMemo(
        () => previewData?.questions.slice(pageStartIndex, pageEndIndex) ?? [],
        [previewData, pageStartIndex, pageEndIndex],
    );

    const currentPageIndexes = useMemo(
        () => paginatedQuestions.map((_, index) => pageStartIndex + index),
        [paginatedQuestions, pageStartIndex],
    );

    return {
        currentPage: safeCurrentPage,
        totalPages,
        paginatedQuestions,
        currentPageIndexes,
        setCurrentPage,
    };
}
