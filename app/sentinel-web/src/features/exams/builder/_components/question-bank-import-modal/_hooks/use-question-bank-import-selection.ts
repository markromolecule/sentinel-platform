'use client';

import { useMemo, useState } from 'react';
import type { QuestionType } from '@sentinel/shared/types';
import { ALL_COLLECTIONS_ID } from '../constants';
import { toggleAllSelectionIds, toggleSelectionId } from '../utils';

export function useQuestionBankImportSelection() {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [alreadyAddedIds, setAlreadyAddedIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedQuestionType, setSelectedQuestionType] = useState<QuestionType | 'all'>('all');
    const [selectedCollectionId, setSelectedCollectionId] = useState<string>(ALL_COLLECTIONS_ID);

    const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
    const alreadyAddedIdSet = useMemo(() => new Set(alreadyAddedIds), [alreadyAddedIds]);

    const resetState = (options?: { preserveAlreadyAddedIds?: string[] }) => {
        setSelectedIds([]);
        setAlreadyAddedIds(options?.preserveAlreadyAddedIds ?? []);
        setSearchQuery('');
        setSelectedQuestionType('all');
        setSelectedCollectionId(ALL_COLLECTIONS_ID);
    };

    const toggleQuestion = (id: string) => {
        if (alreadyAddedIdSet.has(id)) {
            return;
        }

        setSelectedIds((currentSelectedIds) => toggleSelectionId(currentSelectedIds, id));
    };

    const toggleSelectAllFilteredQuestions = (filteredQuestionIds: string[]) => {
        const importableQuestionIds = filteredQuestionIds.filter(
            (questionId) => !alreadyAddedIdSet.has(questionId),
        );

        setSelectedIds((currentSelectedIds) =>
            toggleAllSelectionIds(
                currentSelectedIds,
                importableQuestionIds,
                importableQuestionIds.length > 0 &&
                    importableQuestionIds.every((questionId) =>
                        currentSelectedIds.includes(questionId),
                    ),
            ),
        );
    };

    return {
        selectedIds,
        selectedIdSet,
        alreadyAddedIds,
        alreadyAddedIdSet,
        searchQuery,
        selectedQuestionType,
        selectedCollectionId,
        setAlreadyAddedIds,
        setSearchQuery,
        setSelectedQuestionType,
        setSelectedCollectionId,
        toggleQuestion,
        toggleSelectAllFilteredQuestions,
        resetState,
    };
}
