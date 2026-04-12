import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ExamQuestion } from '@sentinel/shared/types';
import { GenerateQuestionPreviewResponse } from '@sentinel/shared';
import { apiClient } from '@/data/api/client';
import { useAiImportStore } from '../../../../_components/dialogs/import-modal/_hooks/use-ai-import-store';

/**
 * Hook to manage primary actions for question import preview.
 * Handles updating individual questions, soft deletion, and final persistence.
 */
export function usePreviewActions(
    previewData: GenerateQuestionPreviewResponse | null,
    selectedQuestions: Set<number>,
) {
    const router = useRouter();
    const {
        isSaving,
        saveTarget,
        setIsSaving,
        updateQuestion,
        reset,
    } = useAiImportStore();

    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [isDiscarding, setIsDiscarding] = useState(false);

    // 1. Commit updates for an individual question back to the store
    const handleUpdateQuestion = useCallback(
        (_id: string, updates: Partial<ExamQuestion>) => {
            if (editingIndex === null) return;

            const { content, difficulty, points } = updates;

            // Type cast: internal store expects AI response format
            updateQuestion(editingIndex, {
                content: content as Record<string, unknown>,
                difficulty,
                points,
            } as Partial<GenerateQuestionPreviewResponse['questions'][number]>);

            setEditingIndex(null);
            toast.success('Question updated successfully');
        },
        [editingIndex, updateQuestion],
    );

    // 2. Persist all selected questions to the backend
    const handleSave = async () => {
        if (!previewData) return;

        setIsSaving(true);
        try {
            const questionsToSave = previewData.questions.filter((_, i) =>
                selectedQuestions.has(i),
            );

            if (questionsToSave.length === 0) {
                toast.error('Please select at least one question to save.');
                setIsSaving(false);
                return;
            }

            const payload = {
                ...previewData.savePayload,
                questions: questionsToSave,
            };

            // Destination-specific API endpoint and payload
            if (saveTarget.mode === 'append_to_collection') {
                await apiClient(`/question-bank/collections/${saveTarget.collectionId}/questions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ questions: questionsToSave }),
                });
            } else {
                await apiClient(previewData.saveEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            }

            toast.success('Questions imported successfully!', {
                description:
                    saveTarget.mode === 'append_to_collection'
                        ? `Added ${questionsToSave.length} questions to ${saveTarget.collectionName ?? 'the collection'}.`
                        : `Created a new collection with ${questionsToSave.length} questions.`,
            });

            // Cleanup local state and navigate back
            reset();
            router.push(
                saveTarget.mode === 'append_to_collection'
                    ? `/question/bank/collections/${saveTarget.collectionId}`
                    : '/question/bank',
            );
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Failed to save questions.', {
                description: error instanceof Error ? error.message : 'Please try again.',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDiscard = () => {
        setIsDiscarding(true);
        reset();
        router.push(
            saveTarget.mode === 'append_to_collection'
                ? `/question/bank/collections/${saveTarget.collectionId}`
                : '/question/bank',
        );
    };

    return {
        isSaving,
        isDiscarding,
        editingIndex,
        setEditingIndex,
        handleUpdateQuestion,
        handleDiscard,
        handleSave,
    };
}
