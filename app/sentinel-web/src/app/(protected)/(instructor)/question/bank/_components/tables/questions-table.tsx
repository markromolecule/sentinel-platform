import { useEffect, useMemo, useState } from 'react';
import type { PaginationState } from '@tanstack/react-table';
import { DataTable } from '@sentinel/ui';
import { QUESTION_TYPE_OPTIONS } from '@sentinel/shared/constants';
import {
    getQuestionColumns,
    QuestionTableItem,
} from '@/app/(protected)/(instructor)/question/bank/_components/tables/columns';
import { QuestionPreviewSheet } from '@/app/(protected)/(instructor)/question/bank/_components/dialogs/question-preview-sheet';
import { FloatingActionBar } from '@/app/(protected)/(instructor)/question/bank/_components/views/floating-action-bar';

interface QuestionsTableProps {
    questions: QuestionTableItem[];
    isLoading?: boolean;
    searchValue?: string;
    totalCount?: number;
    pageCount?: number;
    pagination?: PaginationState;
    onSearchChange?: (value: string) => void;
    onPaginationChange?: (pagination: PaginationState) => void;
    readOnly?: boolean;
    onEdit?: (question: QuestionTableItem) => void;
    onDuplicate?: (question: QuestionTableItem) => Promise<void>;
    onDelete?: (question: QuestionTableItem) => Promise<void>;
    onDeleteSelected?: (questions: QuestionTableItem[]) => Promise<void>;
}

export function QuestionsTable({
    questions,
    isLoading = false,
    searchValue,
    totalCount,
    pageCount,
    pagination,
    onSearchChange,
    onPaginationChange,
    readOnly = false,
    onEdit,
    onDuplicate,
    onDelete,
    onDeleteSelected,
}: QuestionsTableProps) {
    const columns = useMemo(() => getQuestionColumns(readOnly), [readOnly]);
    const [selectedQuestion, setSelectedQuestion] = useState<QuestionTableItem | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
    const isManualPagination = Boolean(pagination && onPaginationChange);

    useEffect(() => {
        setRowSelection({});
    }, [questions]);

    const handleRowClick = (question: QuestionTableItem) => {
        setSelectedQuestion(question);
        setIsPreviewOpen(true);
    };

    const selectedQuestions = useMemo(
        () =>
            Object.entries(rowSelection)
                .filter(([, isSelected]) => Boolean(isSelected))
                .map(([rowId]) => questions[Number(rowId)])
                .filter((question): question is QuestionTableItem => Boolean(question)),
        [questions, rowSelection],
    );

    const selectedCount = selectedQuestions.length;

    return (
        <>
            <DataTable
                columns={columns}
                data={questions}
                searchKey="prompt"
                searchPlaceholder="Search questions..."
                searchValue={searchValue}
                onSearchChange={onSearchChange}
                onRowClick={handleRowClick}
                isLoading={isLoading}
                facets={
                    isManualPagination
                        ? undefined
                        : [
                              {
                                  columnKey: 'type',
                                  title: 'Type',
                                  options: QUESTION_TYPE_OPTIONS.map((option) => ({
                                      label: option.label,
                                      value: option.value,
                                  })),
                              },
                              {
                                  columnKey: 'difficulty',
                                  title: 'Difficulty',
                                  options: [
                                      { label: 'Easy', value: 'EASY' },
                                      { label: 'Moderate', value: 'MODERATE' },
                                      { label: 'Hard', value: 'HARD' },
                                  ],
                              },
                          ]
                }
                pagination={pagination}
                onPaginationChange={onPaginationChange}
                pageCount={pageCount}
                totalCount={totalCount}
                manualPagination={isManualPagination}
                rowSelection={rowSelection}
                onRowSelectionChange={setRowSelection}
                meta={{
                    rowSelection,
                    setRowSelection,
                    onEdit,
                    onDelete,
                }}
            />

            <QuestionPreviewSheet
                question={selectedQuestion}
                open={isPreviewOpen}
                onOpenChange={setIsPreviewOpen}
                onEdit={onEdit}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
            />

            {!readOnly ? (
                <FloatingActionBar
                    selectedCount={selectedCount}
                    onClear={() => setRowSelection({})}
                    onAddToExam={() => console.log('Add to exam:', selectedQuestions)}
                    onBulkEditTags={() => console.log('Bulk edit tags:', selectedQuestions)}
                    onDelete={() => void onDeleteSelected?.(selectedQuestions)}
                />
            ) : null}
        </>
    );
}
