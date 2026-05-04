import type { AccessControlRole } from '@sentinel/shared/types';
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
import { formatRoleLabel } from '@/app/(protected)/(support)/control/_lib/control-presenters';

interface DeleteRoleDialogProps {
    role: AccessControlRole | null;
    onClose: () => void;
    onDelete: (roleId: number) => void;
    isPending: boolean;
}

export function DeleteRoleDialog({ role, onClose, onDelete, isPending }: DeleteRoleDialogProps) {
    return (
        <AlertDialog open={Boolean(role)} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete role</AlertDialogTitle>
                    <AlertDialogDescription>
                        This removes the role and its permission mapping. Existing assignments to{' '}
                        <strong>{role ? formatRoleLabel(role.name) : ''}</strong> will also be
                        affected.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={(event) => {
                            event.preventDefault();
                            if (!role) return;
                            onDelete(role.id);
                        }}
                        disabled={isPending}
                    >
                        {isPending ? 'Deleting...' : 'Delete role'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
