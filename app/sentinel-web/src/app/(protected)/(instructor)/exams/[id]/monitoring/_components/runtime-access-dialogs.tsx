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
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
} from '@sentinel/ui';
import { RuntimeAccessAction } from '../_types';
import { RUNTIME_ACTION_CONFIGS } from '../_constants';

type RuntimeAccessDialogsProps = {
    pendingAction: RuntimeAccessAction | null;
    setPendingAction: (action: RuntimeAccessAction | null) => void;
    isUpdatingAccess: boolean;
    handleConfirmAction: () => void;
    isReopenDialogOpen: boolean;
    setIsReopenDialogOpen: (open: boolean) => void;
    reopenMinutes: string;
    setReopenMinutes: (minutes: string) => void;
    handleSubmitReopen: () => void;
};

export function RuntimeAccessDialogs({
    pendingAction,
    setPendingAction,
    isUpdatingAccess,
    handleConfirmAction,
    isReopenDialogOpen,
    setIsReopenDialogOpen,
    reopenMinutes,
    setReopenMinutes,
    handleSubmitReopen,
}: RuntimeAccessDialogsProps) {
    const actionConfig = pendingAction ? RUNTIME_ACTION_CONFIGS[pendingAction] : null;

    return (
        <>
            <AlertDialog
                open={Boolean(pendingAction && actionConfig)}
                onOpenChange={(open) => {
                    if (!open) setPendingAction(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{actionConfig?.title}</AlertDialogTitle>
                        <AlertDialogDescription>{actionConfig?.description}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isUpdatingAccess}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            variant={actionConfig?.confirmVariant ?? 'default'}
                            disabled={isUpdatingAccess}
                            onClick={handleConfirmAction}
                        >
                            {isUpdatingAccess ? 'Saving...' : actionConfig?.confirmLabel}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={isReopenDialogOpen} onOpenChange={setIsReopenDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Reopen exam access</DialogTitle>
                        <DialogDescription>
                            Let students enter again for a short window without changing the base exam schedule.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2">
                        <label htmlFor="reopen-minutes" className="text-sm font-medium">
                            Reopen window in minutes
                        </label>
                        <Input
                            id="reopen-minutes"
                            type="number"
                            min="1"
                            step="1"
                            value={reopenMinutes}
                            onChange={(event) => setReopenMinutes(event.target.value)}
                            disabled={isUpdatingAccess}
                        />
                        <p className="text-muted-foreground text-xs">
                            Students who already submitted are still blocked from creating a duplicate attempt unless you grant a specific retake or makeup override.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsReopenDialogOpen(false)}
                            disabled={isUpdatingAccess}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSubmitReopen} disabled={isUpdatingAccess}>
                            {isUpdatingAccess ? 'Saving...' : 'Reopen exam'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
