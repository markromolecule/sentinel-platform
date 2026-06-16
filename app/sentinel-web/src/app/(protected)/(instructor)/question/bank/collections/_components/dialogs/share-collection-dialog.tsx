'use client';

import * as React from 'react';
import { Search, X, Plus } from 'lucide-react';
import {
    Badge,
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
    ScrollArea,
    Separator,
} from '@sentinel/ui';
import {
    useQuestionBankCollectionSharesQuery,
    useShareQuestionBankCollectionMutation,
    useUserQuery,
    useUsersQuery,
} from '@sentinel/hooks';

type SharedUser = {
    userId: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
};

function getDisplayName(user: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
}) {
    const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
    return name || user.email || 'Unknown user';
}

/**
 * Allows a creator to replace the collection's shared user list.
 */
export function ShareCollectionDialog({
    open,
    onOpenChange,
    collectionId,
    collectionName,
    currentUserId,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    collectionId?: string;
    collectionName?: string;
    currentUserId?: string | null;
}) {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedUsers, setSelectedUsers] = React.useState<SharedUser[]>([]);

    const currentUserQuery = useUserQuery(currentUserId ?? '');
    const collectionSharesQuery = useQuestionBankCollectionSharesQuery(collectionId);
    const shareMutation = useShareQuestionBankCollectionMutation({
        onSuccess: () => onOpenChange(false),
    });

    const institutionId = currentUserQuery.data?.institutionId ?? undefined;
    const normalizedSearch = searchTerm.trim();

    const usersQuery = useUsersQuery({
        search: normalizedSearch.length >= 2 ? normalizedSearch : undefined,
        institutionId,
        includeInstitutionUsers: true,
        enabled: open && normalizedSearch.length >= 2 && Boolean(institutionId),
    });

    React.useEffect(() => {
        if (!open) {
            setSearchTerm('');
            setSelectedUsers([]);
            return;
        }

        setSelectedUsers(collectionSharesQuery.data ?? []);
    }, [collectionSharesQuery.data, open]);

    const selectedUserIds = selectedUsers.map((user) => user.userId);

    const availableUsers = (usersQuery.data ?? []).filter(
        (user) => user.id !== currentUserId && !selectedUserIds.includes(user.id),
    );

    const initialUserIds = collectionSharesQuery.data?.map((share) => share.userId) ?? [];
    const hasChanges =
        initialUserIds.length !== selectedUserIds.length ||
        initialUserIds.some((userId) => !selectedUserIds.includes(userId));

    const removeUser = (userId: string) => {
        setSelectedUsers((current) => current.filter((user) => user.userId !== userId));
    };

    const addUser = (user: { id: string; firstName: string; lastName: string; email: string }) => {
        setSelectedUsers((current) =>
            current.some((item) => item.userId === user.id)
                ? current
                : [
                      ...current,
                      {
                          userId: user.id,
                          firstName: user.firstName ?? null,
                          lastName: user.lastName ?? null,
                          email: user.email ?? null,
                      },
                  ],
        );
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!collectionId || !hasChanges) {
            return;
        }

        await shareMutation.mutateAsync({
            id: collectionId,
            payload: {
                userIds: selectedUserIds,
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Share Collection</DialogTitle>
                    <DialogDescription>
                        {collectionName
                            ? `Choose which users in this institution can access "${collectionName}".`
                            : 'Choose which users in this institution can access this collection.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Currently shared</p>
                                <p className="text-xs text-zinc-500">
                                    These users can view and edit the collection.
                                </p>
                            </div>
                            <Badge variant="secondary">{selectedUserIds.length} selected</Badge>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {selectedUsers.length > 0 ? (
                                selectedUsers.map((user) => (
                                    <div
                                        key={user.userId}
                                        className="bg-muted text-muted-foreground flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm"
                                    >
                                        <span>{getDisplayName(user)}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeUser(user.userId)}
                                            className="hover:text-foreground rounded-full p-0.5 transition-colors"
                                            aria-label={`Remove ${getDisplayName(user)}`}
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-zinc-500">No users are shared yet.</p>
                            )}
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                        <div className="relative">
                            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                            <Input
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search users by name or email"
                                className="pl-9"
                                disabled={shareMutation.isPending}
                            />
                        </div>

                        <ScrollArea className="h-64 rounded-xl border">
                            <div className="divide-y">
                                {normalizedSearch.length < 2 ? (
                                    <div className="p-4 text-sm text-zinc-500">
                                        Type at least 2 characters to search users in this
                                        institution.
                                    </div>
                                ) : usersQuery.isLoading ? (
                                    <div className="p-4 text-sm text-zinc-500">Searching...</div>
                                ) : availableUsers.length === 0 ? (
                                    <div className="p-4 text-sm text-zinc-500">
                                        No matching users found.
                                    </div>
                                ) : (
                                    availableUsers.map((user) => (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => addUser(user)}
                                            className="hover:bg-muted flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors"
                                        >
                                            <div className="min-w-0">
                                                <div className="truncate text-sm font-medium">
                                                    {getDisplayName(user)}
                                                </div>
                                                <div className="truncate text-xs text-zinc-500">
                                                    {user.email}
                                                </div>
                                            </div>
                                            <Plus className="text-muted-foreground h-4 w-4 shrink-0" />
                                        </button>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={shareMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!collectionId || !hasChanges || shareMutation.isPending}
                            className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                        >
                            {shareMutation.isPending ? 'Saving...' : 'Save Shares'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
