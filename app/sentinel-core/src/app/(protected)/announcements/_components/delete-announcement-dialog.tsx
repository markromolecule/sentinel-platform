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
import { useDeleteAnnouncementMutation } from '@sentinel/hooks';

interface DeleteAnnouncementDialogProps {
    announcementId: string;
    announcementTitle: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * Dialog to confirm deletion of an announcement.
 *
 * @param props Component properties.
 * @returns React element representing the delete announcement dialog.
 */
export function DeleteAnnouncementDialog({
    announcementId,
    announcementTitle,
    open,
    onOpenChange,
}: DeleteAnnouncementDialogProps) {
    const mutation = useDeleteAnnouncementMutation({
        onSuccess: () => {
            onOpenChange(false);
        },
    });

    const handleConfirm = () => {
        mutation.mutate(announcementId);
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete the announcement &ldquo;{announcementTitle}&rdquo;?
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={mutation.isPending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleConfirm();
                        }}
                        disabled={mutation.isPending}
                        className="bg-destructive hover:bg-destructive/90 text-white"
                    >
                        {mutation.isPending ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
