'use client';

import { useDeferredValue, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, PageHeader, Separator } from '@sentinel/ui';
import { ArrowLeft } from 'lucide-react';
import {
    useQuestionsQuery,
    useUpdateQuestionMutation,
    useDeleteQuestionMutation,
    useStableValue,
} from '@sentinel/hooks';
import type { ColumnFiltersState, ColumnFilter } from '@tanstack/react-table';
import type { QuestionType, QuestionDifficulty } from '@sentinel/shared/types';
import { QuestionsTable } from '@/app/(protected)/question/bank/_components/tables/questions-table';
import { QuestionBankPageShell } from '@/app/(protected)/question/_components/layout';
import type { QuestionTableItem } from '@/app/(protected)/question/bank/_components/tables/columns';
import { toast } from 'sonner';

export default function RetiredQuestionsPage() {
    const router = useRouter();
    const [searchQuery, setSearchQueryState] = useState('');
    const [columnFilters, setColumnFiltersState] = useState<ColumnFiltersState>([]);
    const [pagination, setPaginationState] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const deferredSearchQuery = useDeferredValue(searchQuery);

    const typeFilter = useStableValue(
        () =>
            columnFilters.find((f: ColumnFilter) => f.id === 'type')?.value as
                | QuestionType
                | undefined,
        [columnFilters],
    );

    const difficultyFilter = useStableValue(
        () =>
            columnFilters.find((f: ColumnFilter) => f.id === 'difficulty')?.value as
                | QuestionDifficulty
                | undefined,
        [columnFilters],
    );

    const {
        data: questionsPage,
        isLoading,
        isFetching,
    } = useQuestionsQuery({
        search: deferredSearchQuery || undefined,
        type: typeFilter,
        difficulty: difficultyFilter,
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        status: 'RETIRED',
    });

    const updateMutation = useUpdateQuestionMutation({
        onSuccess: () => toast.success('Question restored successfully.'),
        onError: (err) => toast.error(err.message || 'Failed to restore question.'),
    });

    const deleteMutation = useDeleteQuestionMutation({
        onSuccess: () => toast.success('Question deleted permanently.'),
        onError: (err) => toast.error(err.message || 'Failed to delete question.'),
    });

    const handleRestoreQuestion = async (question: QuestionTableItem) => {
        await updateMutation.mutateAsync({
            id: question.id,
            payload: {
                status: 'ACTIVE',
            },
        });
    };

    const handleDeleteQuestion = async (question: QuestionTableItem) => {
        await deleteMutation.mutateAsync(question.id);
    };

    const handleDeleteSelectedQuestions = async (questions: QuestionTableItem[]) => {
        try {
            await Promise.all(questions.map((q) => deleteMutation.mutateAsync(q.id)));
            toast.success('Selected questions deleted permanently.');
        } catch (err) {
            toast.error('Failed to delete some selected questions.');
        }
    };

    const setSearchQuery = (value: string) => {
        setSearchQueryState(value);
        setPaginationState((current) => ({ ...current, pageIndex: 0 }));
    };

    const setPagination = (nextPagination: { pageIndex: number; pageSize: number }) => {
        setPaginationState(nextPagination);
    };

    const setColumnFilters = (nextFilters: ColumnFiltersState) => {
        setColumnFiltersState(nextFilters);
        setPaginationState((current) => ({ ...current, pageIndex: 0 }));
    };

    const questions = questionsPage?.items ?? [];
    const totalQuestions = questionsPage?.total ?? 0;
    const pageCount = questionsPage?.totalPages ?? 0;

    return (
        <QuestionBankPageShell>
            {/* Back navigation */}
            <div className="flex items-center">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/question/bank/tos')}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to TOS Matrix
                </Button>
            </div>

            {/* Page header */}
            <PageHeader
                title="Retired Questions"
                description="Manage questions that have been retired from exams and active question banks. You can restore them to make them active again."
            />

            <Separator />

            <div className="flex-1">
                <QuestionsTable
                    questions={questions}
                    isLoading={isLoading || isFetching}
                    searchValue={searchQuery}
                    totalCount={totalQuestions}
                    pageCount={pageCount}
                    pagination={{
                        pageIndex: pagination.pageIndex,
                        pageSize: pagination.pageSize,
                    }}
                    onSearchChange={setSearchQuery}
                    onPaginationChange={setPagination}
                    columnFilters={columnFilters}
                    onColumnFiltersChange={setColumnFilters}
                    onRestore={handleRestoreQuestion}
                    onDelete={handleDeleteQuestion}
                    onDeleteSelected={handleDeleteSelectedQuestions}
                    isDeleting={deleteMutation.isPending}
                />
            </div>
        </QuestionBankPageShell>
    );
}
