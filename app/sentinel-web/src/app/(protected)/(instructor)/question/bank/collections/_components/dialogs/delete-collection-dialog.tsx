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
import { useDeleteQuestionBankCollectionMutation } from '@sentinel/hooks';

export interface DeleteCollectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    collectionId?: string;
    onSuccess?: () => void;
}

export function DeleteCollectionDialog({
    open,
    onOpenChange,
    collectionId,
    onSuccess,
}: DeleteCollectionDialogProps) {
    const deleteMutation = useDeleteQuestionBankCollectionMutation({
        onSuccess: () => {
            onOpenChange(false);
            onSuccess?.();
        },
    });

    const isDeleting = deleteMutation.isPending;

    const handleConfirm = async () => {
        if (!collectionId) return;
        await deleteMutation.mutateAsync(collectionId);
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the collection
                        and all its associations.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            void handleConfirm();
                        }}
                        disabled={isDeleting}
                        variant="destructive"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Collection'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
