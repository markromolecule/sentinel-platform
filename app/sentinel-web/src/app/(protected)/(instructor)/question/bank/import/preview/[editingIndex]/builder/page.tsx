'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useStableValue, useQuestionTypesQuery } from '@sentinel/hooks';
import type { ExamQuestion } from '@sentinel/shared/types';
import { QuestionBuilderForm } from '@/features/exams';
import { PreviewLoadingState } from '@/app/(protected)/(instructor)/question/bank/import/preview/_components/layout/preview-loading-state';
import { useAiImportStore } from '@/app/(protected)/(instructor)/question/bank/_components/dialogs/import-modal/_hooks/use-ai-import-store';
import { transformAiQuestionToExamQuestion } from '@/app/(protected)/(instructor)/question/bank/import/preview/_hooks/use-preview-manager/_utils';

/**
 * Builder route for editing a generated import-preview question in place.
 */
export default function PreviewQuestionBuilderPage() {
    const router = useRouter();
    const params = useParams<{ editingIndex: string }>();
    const editingIndex = Number(params.editingIndex);

    const { previewData, isGenerating, hasHydrated, updateQuestion } = useAiImportStore();
    const { data: questionTypes = [], isLoading: isQuestionTypesLoading } = useQuestionTypesQuery();

    useEffect(() => {
        if (!hasHydrated) {
            return;
        }

        if (isGenerating || previewData) {
            return;
        }

        toast.error('No preview data found. Please start the import process again.');
        router.push('/question/bank');
    }, [hasHydrated, isGenerating, previewData, router]);

    useEffect(() => {
        if (!hasHydrated || isGenerating || !previewData) {
            return;
        }

        if (
            Number.isNaN(editingIndex) ||
            editingIndex < 0 ||
            editingIndex >= previewData.questions.length
        ) {
            toast.error('No preview data found. Please start the import process again.');
            router.push('/question/bank');
        }
    }, [editingIndex, hasHydrated, isGenerating, previewData, router]);

    const editingQuestion = useStableValue(() => {
        if (
            !previewData ||
            Number.isNaN(editingIndex) ||
            editingIndex < 0 ||
            editingIndex >= previewData.questions.length
        ) {
            return null;
        }

        return transformAiQuestionToExamQuestion(editingIndex, previewData);
    }, [editingIndex, previewData]);

    const questionTypeDefinition = useStableValue(
        () => questionTypes.find((qt) => qt.value === editingQuestion?.type),
        [editingQuestion?.type, questionTypes],
    );

    const handleBack = () => {
        router.push('/question/bank/import/preview');
    };

    const handleUpdateQuestion = (_id: string, updates: any) => {
        if (!previewData || !editingQuestion) {
            return;
        }

        const { content, difficulty, points, tags, passageContent, passageType } = updates;

        updateQuestion(editingIndex, {
            content: content as Record<string, unknown>,
            difficulty,
            points,
            tags,
            passageContent,
            passageType,
        });

        toast.success('Question updated successfully');
        handleBack();
    };

    if (
        !hasHydrated ||
        isGenerating ||
        !previewData ||
        !editingQuestion ||
        isQuestionTypesLoading ||
        !questionTypeDefinition
    ) {
        return <PreviewLoadingState />;
    }

    return (
        <div className="w-full p-4 md:p-6">
            <QuestionBuilderForm
                key={editingQuestion.id}
                type={editingQuestion.type}
                initialData={editingQuestion}
                questionTypeDefinition={questionTypeDefinition}
                builderMode
                onBack={handleBack}
                onCreate={async () => {}}
                onUpdate={handleUpdateQuestion}
            />
        </div>
    );
}
