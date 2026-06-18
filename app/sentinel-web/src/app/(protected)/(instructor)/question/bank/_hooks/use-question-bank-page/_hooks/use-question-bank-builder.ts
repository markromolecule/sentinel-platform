import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    useCreateQuestionMutation,
    useQuestionTypesQuery,
    useStableValue,
    useUpdateQuestionMutation,
} from '@sentinel/hooks';
import type { QuestionRecord } from '@sentinel/services';
import type { QuestionType } from '@sentinel/shared/types';
import { toast } from 'sonner';
import type { QuestionBuilderPayload } from '@/features/exams/builder/_components/_types';

function buildQuestionPayload(payload: QuestionBuilderPayload) {
    return {
        type: payload.type,
        difficulty: payload.difficulty,
        points: payload.points,
        tags: payload.tags,
        content: payload.content,
        passageContent: payload.passageContent ?? null,
        passageType: payload.passageType ?? 'plain',
    };
}

export function useQuestionBankBuilder() {
    const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
    const [isQuestionBuilderOpen, setIsQuestionBuilderOpen] = useState(false);
    const [activeQuestionType, setActiveQuestionType] = useState<QuestionType | null>(null);
    const router = useRouter();

    const { data: questionTypes = [], isLoading: isQuestionTypesLoading } = useQuestionTypesQuery();

    const createQuestionMutation = useCreateQuestionMutation();
    const updateQuestionMutation = useUpdateQuestionMutation();

    const activeQuestionTypeDefinition = useStableValue(
        () => questionTypes.find((qt) => qt.value === activeQuestionType),
        [activeQuestionType, questionTypes],
    );

    const handleOpenCreateQuestion = () => {
        setActiveQuestionType(null);
        setIsTypeSelectorOpen(true);
    };

    const handleSelectQuestionType = (type: QuestionType) => {
        setActiveQuestionType(type);
        setIsTypeSelectorOpen(false);
        setIsQuestionBuilderOpen(true);
    };

    const handleCloseQuestionBuilder = () => {
        setIsQuestionBuilderOpen(false);
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
        router.push(`/question/bank/${question.id}/builder`);
    };

    const handleDuplicateQuestion = async (question: QuestionRecord) => {
        await createQuestionMutation.mutateAsync({
            type: question.type,
            difficulty: question.difficulty,
            points: question.points,
            tags: question.tags,
            content: question.content,
            passageContent: question.passageContent ?? null,
            passageType: question.passageType ?? 'plain',
            subjectId: question.subjectId ?? undefined,
            institutionId: question.institutionId ?? undefined,
        });
        toast.success('Question duplicated successfully.');
    };

    return {
        isTypeSelectorOpen,
        isQuestionBuilderOpen,
        activeQuestionType,
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
