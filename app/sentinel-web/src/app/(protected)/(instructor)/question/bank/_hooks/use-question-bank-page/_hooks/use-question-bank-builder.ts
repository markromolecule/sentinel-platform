import { useMemo, useState } from 'react';
import {
    useCreateQuestionMutation,
    useQuestionTypesQuery,
    useUpdateQuestionMutation,
} from '@sentinel/hooks';
import type { QuestionRecord } from '@sentinel/services';
import type { QuestionType } from '@sentinel/shared/types';
import { toast } from 'sonner';
import type { QuestionBuilderPayload } from '@/features/exams/builder/_components/_types';
import { mapQuestionRecordToExamQuestion } from '@/features/questions/_utils/question-record';

function buildQuestionPayload(payload: QuestionBuilderPayload) {
    return {
        type: payload.type,
        difficulty: payload.difficulty,
        points: payload.points,
        content: payload.content,
    };
}

export function useQuestionBankBuilder() {
    const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
    const [isQuestionBuilderOpen, setIsQuestionBuilderOpen] = useState(false);
    const [activeQuestionType, setActiveQuestionType] = useState<QuestionType | null>(null);
    const [editingQuestion, setEditingQuestion] = useState<ReturnType<
        typeof mapQuestionRecordToExamQuestion
    > | null>(null);

    const { data: questionTypes = [], isLoading: isQuestionTypesLoading } = useQuestionTypesQuery();

    const createQuestionMutation = useCreateQuestionMutation();
    const updateQuestionMutation = useUpdateQuestionMutation();

    const activeQuestionTypeDefinition = useMemo(
        () => questionTypes.find((qt) => qt.value === activeQuestionType),
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

    return {
        isTypeSelectorOpen,
        isQuestionBuilderOpen,
        activeQuestionType,
        editingQuestion,
        questionTypes,
        activeQuestionTypeDefinition,
        isQuestionTypesLoading,
        setIsTypeSelectorOpen,
        handleOpenCreateQuestion,
        handleSelectQuestionType,
        handleCloseQuestionBuilder,
        handleCreateQuestion,
        handleUpdateQuestion,
        handleDuplicateQuestionPayload,
        handleEditQuestion,
        handleDuplicateQuestion,
    };
}
