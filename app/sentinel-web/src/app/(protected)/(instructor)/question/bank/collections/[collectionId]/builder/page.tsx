'use client';

import { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import {
    useAddQuestionBankCollectionQuestionsMutation,
    useCreateQuestionMutation,
    useQuestionBankCollectionQuery,
    useQuestionQuery,
    useQuestionTypesQuery,
    useStableValue,
    useUpdateQuestionMutation,
} from '@sentinel/hooks';
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
 * Routes a collection-scoped question edit into the builder page.
 */
export default function CollectionQuestionBuilderPage() {
    const router = useRouter();
    const params = useParams<{ collectionId: string }>();
    const searchParams = useSearchParams();
    const collectionId = params.collectionId;
    const questionId = searchParams.get('questionId') ?? '';

    const { data: collection, isLoading: isCollectionLoading } =
        useQuestionBankCollectionQuery(collectionId);
    const { data: question, isLoading: isQuestionLoading } = useQuestionQuery(
        questionId || undefined,
    );
    const { data: questionTypes = [], isLoading: isQuestionTypesLoading } = useQuestionTypesQuery();

    const updateQuestionMutation = useUpdateQuestionMutation();
    const createQuestionMutation = useCreateQuestionMutation();
    const addQuestionsToCollectionMutation = useAddQuestionBankCollectionQuestionsMutation();

    const questionTypeDefinition = useStableValue(
        () => questionTypes.find((questionType) => questionType.value === question?.type),
        [question?.type, questionTypes],
    );

    const initialData = useStableValue(
        () => (question ? mapQuestionRecordToExamQuestion(question) : null),
        [question],
    );

    useEffect(() => {
        if (isCollectionLoading || collection) {
            return;
        }

        toast.error('Collection not found.');
        router.push('/question/bank/collections');
    }, [isCollectionLoading, collection, router]);

    useEffect(() => {
        if (questionId !== '') {
            return;
        }

        toast.error('Question not found.');
        router.push(`/question/bank/collections/${collectionId}`);
    }, [collectionId, questionId, router]);

    useEffect(() => {
        if (questionId === '' || isQuestionLoading || question) {
            return;
        }

        toast.error('Question not found.');
        router.push(`/question/bank/collections/${collectionId}`);
    }, [collectionId, isQuestionLoading, question, questionId, router]);

    const handleBack = () => {
        router.push(`/question/bank/collections/${collectionId}`);
    };

    const handleUpdate = async (id: string, payload: QuestionBuilderPayload) => {
        await updateQuestionMutation.mutateAsync({
            id,
            payload: buildQuestionPayload(payload),
        });
        handleBack();
    };

    const handleCreate = async (payload: QuestionBuilderPayload) => {
        const createdQuestion = await createQuestionMutation.mutateAsync(
            buildQuestionPayload(payload),
        );
        await addQuestionsToCollectionMutation.mutateAsync({
            id: collectionId,
            payload: { questionIds: [createdQuestion.id] },
        });
        handleBack();
    };

    const handleDuplicate = async (payload: QuestionBuilderPayload) => {
        const createdQuestion = await createQuestionMutation.mutateAsync(
            buildQuestionPayload(payload),
        );
        await addQuestionsToCollectionMutation.mutateAsync({
            id: collectionId,
            payload: { questionIds: [createdQuestion.id] },
        });
        handleBack();
    };

    if (
        isCollectionLoading ||
        isQuestionLoading ||
        isQuestionTypesLoading ||
        !collection ||
        !initialData ||
        !questionTypeDefinition
    ) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
                <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
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
                onCreate={handleCreate}
                onUpdate={handleUpdate}
                onDuplicate={handleDuplicate}
            />
        </div>
    );
}
