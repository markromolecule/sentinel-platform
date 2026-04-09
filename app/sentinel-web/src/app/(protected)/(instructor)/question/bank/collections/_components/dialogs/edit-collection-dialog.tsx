import * as React from 'react';
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
    Label,
} from '@sentinel/ui';
import { useUpdateQuestionBankCollectionMutation } from '@sentinel/hooks';

export interface EditCollectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    collectionId?: string;
    initialName?: string;
    initialDescription?: string | null;
}

export function EditCollectionDialog({
    open,
    onOpenChange,
    collectionId,
    initialName,
    initialDescription,
}: EditCollectionDialogProps) {
    const [name, setName] = React.useState(initialName ?? '');
    const [description, setDescription] = React.useState(initialDescription ?? '');

    React.useEffect(() => {
        if (!open) return;

        setName(initialName ?? '');
        setDescription(initialDescription ?? '');
    }, [open, initialDescription, initialName]);

    const updateMutation = useUpdateQuestionBankCollectionMutation({
        onSuccess: () => {
            onOpenChange(false);
        },
    });

    const isPending = updateMutation.isPending;
    const trimmedName = name.trim();
    const normalizedInitialName = initialName?.trim() ?? '';
    const normalizedInitialDescription = initialDescription ?? '';
    const hasChanges =
        trimmedName !== normalizedInitialName || description !== normalizedInitialDescription;

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!collectionId || !trimmedName || !hasChanges) {
            return;
        }

        await updateMutation.mutateAsync({
            id: collectionId,
            payload: {
                name: trimmedName,
                description: description.trim() ? description.trim() : null,
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Collection</DialogTitle>
                    <DialogDescription>
                        Rename this collection and update its description.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="collection-name">Collection Name</Label>
                        <Input
                            id="collection-name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Enter collection name"
                            disabled={isPending}
                            maxLength={255}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="collection-description">Description</Label>
                        <Input
                            id="collection-description"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            placeholder="Add a short description"
                            disabled={isPending}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending || !trimmedName || !hasChanges || !collectionId}
                            className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                        >
                            {isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
