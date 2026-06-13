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
    Switch,
} from '@sentinel/ui';
import { useUpdateQuestionBankCollectionMutation } from '@sentinel/hooks';

export interface EditCollectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    collectionId?: string;
    initialName?: string;
    initialDescription?: string | null;
    initialIsPublic?: boolean;
}

export function EditCollectionDialog({
    open,
    onOpenChange,
    collectionId,
    initialName,
    initialDescription,
    initialIsPublic,
}: EditCollectionDialogProps) {
    const [name, setName] = React.useState(initialName ?? '');
    const [description, setDescription] = React.useState(initialDescription ?? '');
    const [isPublic, setIsPublic] = React.useState(initialIsPublic ?? false);

    React.useEffect(() => {
        if (!open) return;

        setName(initialName ?? '');
        setDescription(initialDescription ?? '');
        setIsPublic(initialIsPublic ?? false);
    }, [open, initialDescription, initialName, initialIsPublic]);

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
        trimmedName !== normalizedInitialName ||
        description !== normalizedInitialDescription ||
        isPublic !== (initialIsPublic ?? false);

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
                isPublic,
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Collection</DialogTitle>
                    <DialogDescription>
                        Rename this collection and update its description or visibility.
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

                    <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <Label htmlFor="collection-visibility">Public Collection</Label>
                            <p className="text-[11px] text-zinc-500">
                                Share this question collection with other instructors in the
                                institution.
                            </p>
                        </div>
                        <Switch
                            id="collection-visibility"
                            checked={isPublic}
                            onCheckedChange={setIsPublic}
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
