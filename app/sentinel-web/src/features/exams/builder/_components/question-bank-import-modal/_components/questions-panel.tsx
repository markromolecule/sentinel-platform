'use client';

import { useEffect, useRef } from 'react';
import { Checkbox, Input } from '@sentinel/ui';
import { Search, Library } from 'lucide-react';
import type { QuestionBankCollectionRecord, QuestionRecord } from '@sentinel/services';
import { QuestionPanelEmptyState } from './question-panel-empty-state';
import { QuestionRow } from './question-row';

interface QuestionsPanelProps {
    selectedCollection: QuestionBankCollectionRecord | null;
    searchQuery: string;
    questionRecords: QuestionRecord[];
    selectedIds: string[];
    totalQuestionCount: number;
    hasMoreQuestions: boolean;
    isFetchingMoreQuestions: boolean;
    isQuestionsLoading: boolean;
    isSelectedCollectionLoading: boolean;
    questionsScrollContainerRef: React.RefObject<HTMLDivElement | null>;
    onSearchChange: (value: string) => void;
    onToggleSelectAll: () => void;
    onToggleQuestion: (id: string) => void;
    onLoadMore: () => void;
}

export function QuestionsPanel({
    selectedCollection,
    searchQuery,
    questionRecords,
    selectedIds,
    totalQuestionCount,
    hasMoreQuestions,
    isFetchingMoreQuestions,
    isQuestionsLoading,
    isSelectedCollectionLoading,
    questionsScrollContainerRef,
    onSearchChange,
    onToggleSelectAll,
    onToggleQuestion,
    onLoadMore,
}: QuestionsPanelProps) {
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const root = questionsScrollContainerRef.current;
        const target = loadMoreRef.current;

        if (!root || !target || !hasMoreQuestions) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting && !isFetchingMoreQuestions) {
                    onLoadMore();
                }
            },
            {
                root,
                rootMargin: '160px 0px',
            },
        );

        observer.observe(target);

        return () => {
            observer.disconnect();
        };
    }, [hasMoreQuestions, isFetchingMoreQuestions, onLoadMore, questionsScrollContainerRef]);

    const allFilteredSelected =
        questionRecords.length > 0 &&
        questionRecords.every((question) => selectedIds.includes(question.id));

    return (
        <div className="bg-background flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="bg-background flex flex-col gap-3 border-b px-4 py-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground lg:hidden">
                    <Library className="h-3.5 w-3.5" />
                    <span className="truncate">
                        {selectedCollection ? selectedCollection.name : 'All Questions'}
                    </span>
                </div>
                <div className="group relative">
                    <Search className="group-focus-within:text-primary absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400 transition-colors" />
                    <Input
                        placeholder="Search by topic, tags, or question content..."
                        className="h-9 rounded-lg border-zinc-200 bg-background pl-10 text-sm shadow-none"
                        value={searchQuery}
                        onChange={(event) => onSearchChange(event.target.value)}
                    />
                </div>

                <div className="flex items-center justify-between px-1">
                    <p className="text-xs text-muted-foreground">
                        Showing <span className="font-medium text-foreground">{questionRecords.length}</span> of{' '}
                        <span className="font-medium text-foreground">{totalQuestionCount}</span>{' '}
                        question{totalQuestionCount !== 1 ? 's' : ''}
                    </p>
                    {questionRecords.length > 0 ? (
                        <div
                            role="button"
                            tabIndex={0}
                            className="flex h-auto cursor-pointer items-center gap-2 px-0 py-0 text-xs text-muted-foreground transition-colors hover:text-foreground"
                            onClick={onToggleSelectAll}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    onToggleSelectAll();
                                }
                            }}
                        >
                            <Checkbox
                                checked={allFilteredSelected}
                                className="pointer-events-none h-4 w-4 rounded-md"
                            />
                            <span>Select Page</span>
                        </div>
                    ) : null}
                </div>
            </div>

            <div
                ref={questionsScrollContainerRef}
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
            >
                <div className="space-y-2 p-4">
                    {isQuestionsLoading || isSelectedCollectionLoading ? (
                        <QuestionPanelEmptyState
                            title="Loading questions"
                            description={
                                selectedCollection
                                    ? `Loading questions from ${selectedCollection.name}...`
                                    : 'Fetching your question bank...'
                            }
                        />
                    ) : questionRecords.length === 0 ? (
                        <QuestionPanelEmptyState
                            title="No questions found"
                            description="Adjust your criteria or try a different collection."
                            icon={<Search className="h-8 w-8 text-muted-foreground" />}
                        />
                    ) : (
                        <div className="grid grid-cols-1 gap-2">
                            {questionRecords.map((question) => (
                                <QuestionRow
                                    key={question.id}
                                    question={question}
                                    selected={selectedIds.includes(question.id)}
                                    onToggle={() => onToggleQuestion(question.id)}
                                />
                            ))}
                            {hasMoreQuestions ? (
                                <div
                                    ref={loadMoreRef}
                                    className="flex items-center justify-center py-3 text-xs text-muted-foreground"
                                >
                                    {isFetchingMoreQuestions ? 'Loading more questions...' : 'Scroll to load more'}
                                </div>
                            ) : totalQuestionCount > 0 ? (
                                <div className="flex items-center justify-center py-3 text-xs text-muted-foreground">
                                    All questions loaded
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
