'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@sentinel/ui';

export interface DeleteQuestionsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    questionCount: number;
    questionLabel?: string;
    isDeleting: boolean;
    onConfirm: () => void;
}

export function DeleteQuestionsDialog({
    open,
    onOpenChange,
    questionCount,
    questionLabel,
    isDeleting,
    onConfirm,
}: DeleteQuestionsDialogProps) {
    const isSingleQuestion = questionCount === 1;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {isSingleQuestion
                            ? 'Delete this question?'
                            : `Delete ${questionCount} questions?`}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {isSingleQuestion
                            ? `This will permanently remove "${questionLabel ?? 'this question'}" from your question bank.`
                            : `This will permanently remove ${questionCount} selected questions from your question bank.`}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(event) => {
                            event.preventDefault();
                            onConfirm();
                        }}
                        disabled={isDeleting}
                        variant="destructive"
                    >
                        {isDeleting
                            ? 'Deleting...'
                            : isSingleQuestion
                              ? 'Delete Question'
                              : 'Delete Questions'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
