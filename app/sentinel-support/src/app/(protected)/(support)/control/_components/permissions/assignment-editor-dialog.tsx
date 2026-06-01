

import { useState } from 'react';
import { useDebounce, useStableValue, useUsersQuery } from '@sentinel/hooks';
import { SUPPORT_ASSIGNABLE_ROLE_NAMES } from '@sentinel/shared/constants';
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
    ScrollArea,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@sentinel/ui';
import type { AccessControlRole } from '@sentinel/shared/types';
import type { User } from '@sentinel/services';
import { formatRoleLabel } from '@/app/(protected)/(support)/control/_lib/control-presenters';

type AssignmentEditorDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    roles: AccessControlRole[];
    isPending?: boolean;
    onSubmit: (payload: { userId: string; roleId: number }) => void;
};

export function AssignmentEditorDialog({
    open,
    onOpenChange,
    roles,
    isPending,
    onSubmit,
}: AssignmentEditorDialogProps) {
    const [selectedRoleId, setSelectedRoleId] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const { data: users = [] } = useUsersQuery({
        search: debouncedSearchTerm,
        role: [...SUPPORT_ASSIGNABLE_ROLE_NAMES],
        enabled: open,
    });

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
        return [...users].sort((left, right) => {
            const leftName = `${left.firstName ?? ''} ${left.lastName ?? ''}`.trim() || left.email;
            const rightName =
                `${right.firstName ?? ''} ${right.lastName ?? ''}`.trim() || right.email;
            return leftName.localeCompare(rightName);
        });
    }, [users]);

    const selectedUser = useStableValue(
        () => users.find((user) => user.id === selectedUserId),
        [selectedUserId, users],
    );
    const isDisabled = isPending || !selectedRoleId || !selectedUserId;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create Assignment</DialogTitle>
                    <DialogDescription>
                        Select a superadmin, admin, or instructor, then assign the next role they
                        should hold.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Target Role</Label>
                        <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((role) => (
                                    <SelectItem
                                        key={role.id}
                                        value={String(role.id)}
                                    >
                                        {formatRoleLabel(role.name)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Search User</Label>
                        <Input
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Search by name, email, role, or institution..."
                        />
                    </div>

                    <ScrollArea className="h-72 rounded-md border bg-muted/5">
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
                                        className={`flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition-colors ${isSelected ? 'bg-primary/5' : 'hover:bg-muted/40'
                                            }`}
                                    >
                                        <div className="space-y-0.5">
                                            <div className="text-foreground text-sm font-semibold">
                                                {displayName}
                                            </div>
                                            <div className="text-muted-foreground text-xs">
                                                {user.email}
                                            </div>
                                        </div>
                                        <div className="text-muted-foreground space-y-0.5 text-right text-xs">
                                            <div className="text-foreground font-semibold">
                                                {user.role ? formatRoleLabel(user.role) : 'No role'}
                                            </div>
                                            {user.institution ? (
                                                <div className="opacity-70">{user.institution}</div>
                                            ) : null}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </ScrollArea>

                    {selectedUser ? (
                        <div className="text-muted-foreground border bg-muted/5 rounded-md px-4 py-3 text-sm">
                            Selected user:{' '}
                            <span className="text-foreground font-semibold">{selectedUser.email}</span>
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
                        className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                        disabled={isDisabled}
                    >
                        {isPending ? 'Saving...' : 'Create Assignment'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
