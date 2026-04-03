import { useMemo, useState } from 'react';
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
        points: payload.points,
        content: payload.content,
    };
}

export function useQuestionBankPage(): UseQuestionBankPageResult {
    const { data: questions = [], isLoading: isQuestionsLoading } = useQuestionsQuery();
    const { data: questionTypes = [], isLoading: isQuestionTypesLoading } = useQuestionTypesQuery();

    const createQuestionMutation = useCreateQuestionMutation();
    const updateQuestionMutation = useUpdateQuestionMutation();
    const deleteQuestionMutation = useDeleteQuestionMutation();

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
    const [isQuestionBuilderOpen, setIsQuestionBuilderOpen] = useState(false);
    const [activeQuestionType, setActiveQuestionType] = useState<QuestionType | null>(null);
    const [editingQuestion, setEditingQuestion] = useState<ReturnType<
        typeof mapQuestionRecordToExamQuestion
    > | null>(null);

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
            points: question.points,
            tags: question.tags,
            content: question.content,
            subjectId: question.subjectId ?? undefined,
            institutionId: question.institutionId ?? undefined,
        });
        toast.success('Question duplicated successfully.');
    };

    const handleDeleteQuestion = async (question: QuestionRecord) => {
        const confirmed = window.confirm(
            `Delete "${question.prompt ?? question.content.prompt}" from the question bank?`,
        );

        if (!confirmed) {
            return;
        }

        await deleteQuestionMutation.mutateAsync(question.id);
    };

    const handleDeleteSelectedQuestions = async (selectedQuestions: QuestionRecord[]) => {
        if (selectedQuestions.length === 0) {
            return;
        }

        const confirmed = window.confirm(
            `Delete ${selectedQuestions.length} selected question${selectedQuestions.length === 1 ? '' : 's'}?`,
        );

        if (!confirmed) {
            return;
        }

        await Promise.all(
            selectedQuestions.map((question) => deleteQuestionMutation.mutateAsync(question.id)),
        );
        toast.success(
            `${selectedQuestions.length} question${selectedQuestions.length === 1 ? '' : 's'} deleted successfully.`,
        );
    };

    return {
        questions,
        questionTypes,
        activeQuestionType,
        activeQuestionTypeDefinition,
        editingQuestion,
        isQuestionsLoading,
        isQuestionTypesLoading,
        isImportModalOpen,
        isQuestionBuilderOpen,
        isTypeSelectorOpen,
        setIsImportModalOpen,
        setIsTypeSelectorOpen,
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
    };
}
