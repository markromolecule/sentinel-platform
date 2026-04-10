'use client';

import { useState } from 'react';
import { useStableValue } from '@sentinel/hooks';
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
    ScrollArea,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@sentinel/ui';
import type { AccessControlRole } from '@sentinel/shared/types';
import type { User } from '@sentinel/services';

type AssignmentEditorDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    roles: AccessControlRole[];
    users: User[];
    isPending?: boolean;
    onSubmit: (payload: { userId: string; roleId: number }) => void;
};

export function AssignmentEditorDialog({
    open,
    onOpenChange,
    roles,
    users,
    isPending,
    onSubmit,
}: AssignmentEditorDialogProps) {
    const [selectedRoleId, setSelectedRoleId] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [prevOpen, setPrevOpen] = useState(open);
    if (open !== prevOpen) {
        setPrevOpen(open);
        if (open) {
            setSelectedRoleId('');
            setSelectedUserId('');
            setSearchTerm('');
        }
    }

    const filteredUsers = useStableValue(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        const sortedUsers = [...users].sort((left, right) => {
            const leftName = `${left.firstName ?? ''} ${left.lastName ?? ''}`.trim() || left.email;
            const rightName =
                `${right.firstName ?? ''} ${right.lastName ?? ''}`.trim() || right.email;
            return leftName.localeCompare(rightName);
        });

        if (!normalizedSearch) {
            return sortedUsers.slice(0, 80);
        }

        return sortedUsers
            .filter((user) =>
                [
                    `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
                    user.email,
                    user.role,
                    user.institution,
                ]
                    .filter(Boolean)
                    .some((value) => value!.toLowerCase().includes(normalizedSearch)),
            )
            .slice(0, 80);
    }, [searchTerm, users]);

    const selectedUser = useStableValue(
        () => users.find((user) => user.id === selectedUserId),
        [selectedUserId, users],
    );
    const isDisabled = isPending || !selectedRoleId || !selectedUserId;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create assignment</DialogTitle>
                    <DialogDescription>
                        Link a user to a role so Support can control who can manage each module and
                        global setting.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Role</label>
                        <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((role) => (
                                    <SelectItem key={role.id} value={String(role.id)}>
                                        {role.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Search user</label>
                        <Input
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Search by name, email, role, or institution..."
                        />
                    </div>

                    <ScrollArea className="h-72 rounded-lg border">
                        <div className="divide-y">
                            {filteredUsers.map((user) => {
                                const isSelected = user.id === selectedUserId;
                                const displayName =
                                    `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() ||
                                    user.email;

                                return (
                                    <button
                                        key={user.id}
                                        type="button"
                                        onClick={() => setSelectedUserId(user.id)}
                                        className={`flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition-colors ${
                                            isSelected ? 'bg-primary/5' : 'hover:bg-muted/40'
                                        }`}
                                    >
                                        <div>
                                            <div className="font-medium">{displayName}</div>
                                            <div className="text-muted-foreground text-sm">
                                                {user.email}
                                            </div>
                                        </div>
                                        <div className="text-muted-foreground text-right text-sm">
                                            <div className="text-foreground font-medium">
                                                {user.role || 'No role'}
                                            </div>
                                            {user.institution ? (
                                                <div>{user.institution}</div>
                                            ) : null}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </ScrollArea>

                    {selectedUser ? (
                        <div className="text-muted-foreground rounded-lg border px-3 py-3 text-sm">
                            Selected user:{' '}
                            <span className="text-foreground font-medium">
                                {selectedUser.email}
                            </span>
                        </div>
                    ) : null}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() =>
                            onSubmit({
                                userId: selectedUserId,
                                roleId: Number(selectedRoleId),
                            })
                        }
                        disabled={isDisabled}
                    >
                        {isPending ? 'Saving...' : 'Create assignment'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
