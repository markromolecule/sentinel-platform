'use client';

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
    ScrollArea,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@sentinel/ui';
import type { AccessControlRole } from '@sentinel/shared/types';
import type { User } from '@sentinel/services';
import { formatRoleLabel } from '@/app/(protected)/(support)/access-control/_lib/access-control-presenters';

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
            <DialogContent className="border-muted/50 overflow-hidden rounded-none p-0 shadow-2xl sm:max-w-2xl">
                <DialogHeader className="bg-muted/5 border-muted/50 border-b p-8">
                    <DialogTitle className="text-[18px] font-bold tracking-tight">
                        Create Assignment
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground mt-2 text-[14px] leading-relaxed">
                        Select a superadmin, admin, or instructor, then assign the next role they
                        should hold.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 p-8">
                    <div className="space-y-2">
                        <label className="text-foreground text-[12px] font-bold">Target Role</label>
                        <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                            <SelectTrigger className="border-muted/50 h-10 rounded-none text-[14px]">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent className="border-muted/50 rounded-none">
                                {roles.map((role) => (
                                    <SelectItem
                                        key={role.id}
                                        value={String(role.id)}
                                        className="rounded-none text-[14px]"
                                    >
                                        {formatRoleLabel(role.name)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-foreground text-[12px] font-bold">Search User</label>
                        <Input
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Search by name, email, role, or institution..."
                            className="border-muted/50 h-10 rounded-none text-[14px]"
                        />
                    </div>

                    <ScrollArea className="border-muted/50 h-72 rounded-none border">
                        <div className="divide-muted/30 divide-y">
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
                                        className={`flex w-full items-start justify-between gap-3 px-5 py-4 text-left transition-colors ${
                                            isSelected ? 'bg-primary/5' : 'hover:bg-muted/40'
                                        }`}
                                    >
                                        <div className="space-y-0.5">
                                            <div className="text-foreground text-[14px] font-bold">
                                                {displayName}
                                            </div>
                                            <div className="text-muted-foreground text-[12px]">
                                                {user.email}
                                            </div>
                                        </div>
                                        <div className="text-muted-foreground space-y-0.5 text-right text-[12px]">
                                            <div className="text-foreground font-bold">
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
                        <div className="text-muted-foreground border-muted/50 bg-muted/5 rounded-none border px-4 py-3 text-[13px]">
                            Selected user:{' '}
                            <span className="text-foreground font-bold">{selectedUser.email}</span>
                        </div>
                    ) : null}
                </div>

                <DialogFooter className="bg-muted/5 border-muted/50 gap-3 border-t p-8">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                        className="border-muted/50 h-11 rounded-none px-8 text-[12px] font-bold"
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
                        className="h-11 rounded-none bg-[#323d8f] px-8 text-[12px] font-bold hover:bg-[#323d8f]/90"
                        disabled={isDisabled}
                    >
                        {isPending ? 'Saving...' : 'Create Assignment'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
