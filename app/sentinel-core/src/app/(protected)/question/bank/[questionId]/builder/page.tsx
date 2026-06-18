'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useCreateQuestionMutation, useQuestionQuery, useQuestionTypesQuery, useStableValue, useUpdateQuestionMutation } from '@sentinel/hooks';
import { QuestionBuilderForm } from '@/features/exams';
import type { QuestionBuilderPayload } from '@/features/exams/builder/_components/_types';
import { mapQuestionRecordToExamQuestion } from '@/features/questions/_utils/question-record';
import { toast } from 'sonner';

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

/**
 * Routes instructors into the question bank builder for editing an existing question.
 */
export default function QuestionBankBuilderPage() {
    const router = useRouter();
    const params = useParams<{ questionId: string }>();
    const questionId = params.questionId;

    const { data: question, isLoading: isQuestionLoading } = useQuestionQuery(questionId);
    const { data: questionTypes = [], isLoading: isQuestionTypesLoading } = useQuestionTypesQuery();

    const updateQuestionMutation = useUpdateQuestionMutation();
    const createQuestionMutation = useCreateQuestionMutation();

    const questionTypeDefinition = useStableValue(
        () => questionTypes.find((questionType) => questionType.value === question?.type),
        [question?.type, questionTypes],
    );

    const initialData = useStableValue(
        () => (question ? mapQuestionRecordToExamQuestion(question) : null),
        [question],
    );

    useEffect(() => {
        if (isQuestionLoading || question) {
            return;
        }

        toast.error('Question not found.');
        router.push('/question/bank');
    }, [isQuestionLoading, question, router]);

    const handleBack = () => {
        router.push('/question/bank');
    };

    const handleUpdate = async (id: string, payload: QuestionBuilderPayload) => {
        await updateQuestionMutation.mutateAsync({
            id,
            payload: buildQuestionPayload(payload),
        });
        handleBack();
    };

    const handleDuplicate = async (payload: QuestionBuilderPayload) => {
        await createQuestionMutation.mutateAsync(buildQuestionPayload(payload));
        handleBack();
    };

    if (isQuestionLoading || isQuestionTypesLoading || !initialData || !questionTypeDefinition) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground text-sm">Loading question builder...</p>
            </div>
        );
    }

    return (
        <div className="w-full p-4 md:p-6">
            <QuestionBuilderForm
                key={initialData.id}
                type={initialData.type}
                initialData={initialData}
                questionTypeDefinition={questionTypeDefinition}
                builderMode
                onBack={handleBack}
                onCreate={async () => {}}
                onUpdate={handleUpdate}
                onDuplicate={handleDuplicate}
            />
        </div>
    );
}
