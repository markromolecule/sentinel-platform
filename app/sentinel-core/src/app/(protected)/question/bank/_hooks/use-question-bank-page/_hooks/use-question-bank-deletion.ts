import { useState } from 'react';
import { useDeleteQuestionMutation } from '@sentinel/hooks';
import type { QuestionRecord } from '@sentinel/services';
import { toast } from 'sonner';

export function useQuestionBankDeletion() {
    const [isDeleteQuestionsDialogOpen, setIsDeleteQuestionsDialogOpenState] = useState(false);
    const [questionsPendingDeletion, setQuestionsPendingDeletion] = useState<QuestionRecord[]>([]);

    const deleteQuestionMutation = useDeleteQuestionMutation();

    const handleDeleteQuestion = async (question: QuestionRecord) => {
        setQuestionsPendingDeletion([question]);
        setIsDeleteQuestionsDialogOpenState(true);
    };

    const handleDeleteSelectedQuestions = async (selectedQuestions: QuestionRecord[]) => {
        if (selectedQuestions.length === 0) return;
        setQuestionsPendingDeletion(selectedQuestions);
        setIsDeleteQuestionsDialogOpenState(true);
    };

    const handleConfirmDeleteQuestions = async () => {
        if (questionsPendingDeletion.length === 0) return;

        const pendingQuestions = [...questionsPendingDeletion];
        await Promise.all(
            pendingQuestions.map((question) => deleteQuestionMutation.mutateAsync(question.id)),
        );

        toast.success(
            `${pendingQuestions.length} question${pendingQuestions.length === 1 ? '' : 's'} deleted successfully.`,
        );

        setIsDeleteQuestionsDialogOpenState(false);
        setQuestionsPendingDeletion([]);
    };

    const setIsDeleteQuestionsDialogOpen = (open: boolean) => {
        setIsDeleteQuestionsDialogOpenState(open);
        if (!open) {
            setQuestionsPendingDeletion([]);
        }
    };

    return {
        isDeleteQuestionsDialogOpen,
        questionsPendingDeletion,
        isDeletingQuestions: deleteQuestionMutation.isPending,
        handleDeleteQuestion,
        handleDeleteSelectedQuestions,
        handleConfirmDeleteQuestions,
        setIsDeleteQuestionsDialogOpen,
    };
}
