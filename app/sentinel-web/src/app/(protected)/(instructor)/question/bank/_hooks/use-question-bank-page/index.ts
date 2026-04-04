import { useDeferredValue, useMemo, useState } from 'react';
import {
    useCreateQuestionMutation,
    useDeleteQuestionMutation,
    useQuestionsQuery,
    useQuestionTypesQuery,
    useUpdateQuestionMutation,
} from '@sentinel/hooks';
import type { QuestionRecord } from '@sentinel/services';
import type { QuestionType } from '@sentinel/shared/types';
import { toast } from 'sonner';
import type { QuestionBuilderPayload } from '@/features/exams/builder/_components/_types';
import { mapQuestionRecordToExamQuestion } from '@/features/questions/_utils/question-record';
import type { UseQuestionBankPageResult } from './_types';

function buildQuestionPayload(payload: QuestionBuilderPayload) {
    return {
        type: payload.type,
        difficulty: payload.difficulty,
        points: payload.points,
        content: payload.content,
    };
}

export function useQuestionBankPage(): UseQuestionBankPageResult {
    const [searchQuery, setSearchQueryState] = useState('');
    const [pagination, setPaginationState] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const deferredSearchQuery = useDeferredValue(searchQuery);
    const { data: questionsPage, isLoading: isQuestionsLoading, isFetching: isQuestionsFetching } =
        useQuestionsQuery({
            search: deferredSearchQuery || undefined,
            page: pagination.pageIndex + 1,
            pageSize: pagination.pageSize,
        });
    const { data: questionTypes = [], isLoading: isQuestionTypesLoading } = useQuestionTypesQuery();
    const questions = questionsPage?.items ?? [];

    const createQuestionMutation = useCreateQuestionMutation();
    const updateQuestionMutation = useUpdateQuestionMutation();
    const deleteQuestionMutation = useDeleteQuestionMutation();

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
    const [isQuestionBuilderOpen, setIsQuestionBuilderOpen] = useState(false);
    const [isDeleteQuestionsDialogOpen, setIsDeleteQuestionsDialogOpen] = useState(false);
    const [activeQuestionType, setActiveQuestionType] = useState<QuestionType | null>(null);
    const [editingQuestion, setEditingQuestion] = useState<ReturnType<
        typeof mapQuestionRecordToExamQuestion
    > | null>(null);
    const [questionsPendingDeletion, setQuestionsPendingDeletion] = useState<QuestionRecord[]>([]);

    const activeQuestionTypeDefinition = useMemo(
        () => questionTypes.find((questionType) => questionType.value === activeQuestionType),
        [activeQuestionType, questionTypes],
    );

    const handleOpenCreateQuestion = () => {
        setEditingQuestion(null);
        setActiveQuestionType(null);
        setIsTypeSelectorOpen(true);
    };

    const handleSelectQuestionType = (type: QuestionType) => {
        setEditingQuestion(null);
        setActiveQuestionType(type);
        setIsTypeSelectorOpen(false);
        setIsQuestionBuilderOpen(true);
    };

    const handleCloseQuestionBuilder = () => {
        setIsQuestionBuilderOpen(false);
        setEditingQuestion(null);
        setActiveQuestionType(null);
    };

    const handleCreateQuestion = async (payload: QuestionBuilderPayload) => {
        await createQuestionMutation.mutateAsync(buildQuestionPayload(payload));
        handleCloseQuestionBuilder();
    };

    const handleUpdateQuestion = async (id: string, payload: QuestionBuilderPayload) => {
        await updateQuestionMutation.mutateAsync({
            id,
            payload: buildQuestionPayload(payload),
        });
        handleCloseQuestionBuilder();
    };

    const handleDuplicateQuestionPayload = async (payload: QuestionBuilderPayload) => {
        await createQuestionMutation.mutateAsync(buildQuestionPayload(payload));
    };

    const handleEditQuestion = (question: QuestionRecord) => {
        setEditingQuestion(mapQuestionRecordToExamQuestion(question));
        setActiveQuestionType(question.type);
        setIsQuestionBuilderOpen(true);
    };

    const handleDuplicateQuestion = async (question: QuestionRecord) => {
        await createQuestionMutation.mutateAsync({
            type: question.type,
            difficulty: question.difficulty,
            points: question.points,
            tags: question.tags,
            content: question.content,
            subjectId: question.subjectId ?? undefined,
            institutionId: question.institutionId ?? undefined,
        });
        toast.success('Question duplicated successfully.');
    };

    const handleDeleteQuestion = async (question: QuestionRecord) => {
        setQuestionsPendingDeletion([question]);
        setIsDeleteQuestionsDialogOpen(true);
    };

    const handleDeleteSelectedQuestions = async (selectedQuestions: QuestionRecord[]) => {
        if (selectedQuestions.length === 0) {
            return;
        }

        setQuestionsPendingDeletion(selectedQuestions);
        setIsDeleteQuestionsDialogOpen(true);
    };

    const handleConfirmDeleteQuestions = async () => {
        if (questionsPendingDeletion.length === 0) {
            return;
        }

        const pendingQuestions = [...questionsPendingDeletion];
        await Promise.all(
            pendingQuestions.map((question) => deleteQuestionMutation.mutateAsync(question.id)),
        );

        toast.success(
            `${pendingQuestions.length} question${pendingQuestions.length === 1 ? '' : 's'} deleted successfully.`,
        );
        setIsDeleteQuestionsDialogOpen(false);
        setQuestionsPendingDeletion([]);
    };

    const setSearchQuery = (value: string) => {
        setSearchQueryState(value);
        setPaginationState((currentPagination) => ({
            ...currentPagination,
            pageIndex: 0,
        }));
    };

    const setPagination = (nextPagination: { pageIndex: number; pageSize: number }) => {
        setPaginationState(nextPagination);
    };

    return {
        questions,
        totalQuestions: questionsPage?.total ?? 0,
        pageCount: questionsPage?.totalPages ?? 0,
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        searchQuery,
        questionTypes,
        activeQuestionType,
        activeQuestionTypeDefinition,
        editingQuestion,
        isQuestionsLoading: isQuestionsLoading || isQuestionsFetching,
        isQuestionTypesLoading,
        isDeletingQuestions: deleteQuestionMutation.isPending,
        isImportModalOpen,
        isQuestionBuilderOpen,
        isTypeSelectorOpen,
        isDeleteQuestionsDialogOpen,
        questionsPendingDeletion,
        setIsImportModalOpen,
        setIsTypeSelectorOpen,
        setIsDeleteQuestionsDialogOpen: (open) => {
            setIsDeleteQuestionsDialogOpen(open);
            if (!open) {
                setQuestionsPendingDeletion([]);
            }
        },
        setSearchQuery,
        setPagination,
        handleOpenCreateQuestion,
        handleSelectQuestionType,
        handleCloseQuestionBuilder,
        handleCreateQuestion,
        handleUpdateQuestion,
        handleDuplicateQuestionPayload,
        handleEditQuestion,
        handleDuplicateQuestion,
        handleDeleteQuestion,
        handleDeleteSelectedQuestions,
        handleConfirmDeleteQuestions,
    };
}
