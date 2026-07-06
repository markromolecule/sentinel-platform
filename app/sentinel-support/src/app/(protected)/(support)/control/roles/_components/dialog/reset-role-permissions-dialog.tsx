'use client';

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

interface ResetRolePermissionsDialogProps {
    role: AccessControlRole | null;
    onClose: () => void;
    onReset: (roleId: number) => void;
    isPending: boolean;
}

export function ResetRolePermissionsDialog({
    role,
    onClose,
    onReset,
    isPending,
}: ResetRolePermissionsDialogProps) {
    return (
        <AlertDialog open={Boolean(role)} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent className="rounded-none border-muted/50 max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-foreground text-[16px] font-bold">
                        Reset role permissions
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground text-[14px]">
                        Are you sure you want to reset the permissions of the system role{' '}
                        <strong className="text-foreground font-bold">
                            &ldquo;{role ? formatRoleLabel(role.name) : ''}&rdquo;
                        </strong>{' '}
                        back to its hardcoded code-blueprint defaults? This will erase all Support customizations for this role.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-6">
                    <AlertDialogCancel
                        disabled={isPending}
                        className="border-muted/50 text-foreground hover:bg-muted/10 h-10 rounded-none px-4 text-[13px] font-semibold transition-colors"
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(event) => {
                            event.preventDefault();
                            if (!role) return;
                            onReset(role.id);
                        }}
                        disabled={isPending}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 rounded-none px-4 text-[13px] font-semibold transition-colors"
                    >
                        {isPending ? 'Resetting...' : 'Reset permissions'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
