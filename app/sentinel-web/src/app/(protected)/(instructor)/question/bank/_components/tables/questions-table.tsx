import { useState } from 'react';
import { useStableValue } from '@sentinel/hooks';
import { QUESTION_BANK_FACETS } from '@/features/questions/constants/facets';
import { DataTable } from '@sentinel/ui';
import {
    getQuestionColumns,
    QuestionTableItem,
} from '@/app/(protected)/(instructor)/question/bank/_components/tables/columns';
import { QuestionPreviewSheet } from '@/app/(protected)/(instructor)/question/bank/_components/dialogs/question-preview-sheet';
import { FloatingActionBar } from '@/app/(protected)/(instructor)/question/bank/_components/views/floating-action-bar';
import { QuestionsTableProps } from '@/app/(protected)/(instructor)/question/bank/_components/tables/_types';

export function QuestionsTable({
    questions,
    isLoading = false,
    searchValue,
    totalCount,
    pageCount,
    pagination,
    columnFilters,
    onSearchChange,
    onPaginationChange,
    onColumnFiltersChange,
    readOnly = false,
    onEdit,
    onRestore,
    onDuplicate,
    onDelete,
    onDeleteSelected,
    isDeleting = false,
}: QuestionsTableProps) {
    const columns = useStableValue(() => getQuestionColumns(readOnly), [readOnly]);
    const [selectedQuestion, setSelectedQuestion] = useState<QuestionTableItem | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
    const isManualPagination = Boolean(pagination && onPaginationChange);

    const [prevQuestions, setPrevQuestions] = useState(questions);

    if (questions !== prevQuestions) {
        setPrevQuestions(questions);
        setRowSelection({});
    }

    const handleRowClick = (question: QuestionTableItem) => {
        setSelectedQuestion(question);
        setIsPreviewOpen(true);
    };

    const selectedQuestions = useStableValue(
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
                facets={QUESTION_BANK_FACETS}
                columnFilters={columnFilters}
                onColumnFiltersChange={onColumnFiltersChange}
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
                    onRestore,
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
                    isDeleting={isDeleting}
                />
            ) : null}
        </>
    );
}
