'use client';

import { useMemo, useState } from 'react';
import { ALL_COLLECTIONS_ID } from '../constants';
import { toggleAllSelectionIds, toggleSelectionId } from '../utils';

export function useQuestionBankImportSelection() {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCollectionId, setSelectedCollectionId] = useState<string>(ALL_COLLECTIONS_ID);

    const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

    const resetState = () => {
        setSelectedIds([]);
        setSearchQuery('');
        setSelectedCollectionId(ALL_COLLECTIONS_ID);
    };

    const toggleQuestion = (id: string) => {
        setSelectedIds((currentSelectedIds) => toggleSelectionId(currentSelectedIds, id));
    };

    const toggleSelectAllFilteredQuestions = (filteredQuestionIds: string[]) => {
        setSelectedIds((currentSelectedIds) =>
            toggleAllSelectionIds(
                currentSelectedIds,
                filteredQuestionIds,
                filteredQuestionIds.length > 0 &&
                    filteredQuestionIds.every((questionId) => currentSelectedIds.includes(questionId)),
            ),
        );
    };

    return {
        selectedIds,
        selectedIdSet,
        searchQuery,
        selectedCollectionId,
        setSearchQuery,
        setSelectedCollectionId,
        toggleQuestion,
        toggleSelectAllFilteredQuestions,
        resetState,
    };
}
