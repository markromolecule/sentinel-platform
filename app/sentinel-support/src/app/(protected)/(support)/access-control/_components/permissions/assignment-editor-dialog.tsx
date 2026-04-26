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
            <DialogContent className="sm:max-w-2xl rounded-none border-muted/50 shadow-2xl p-0 overflow-hidden">
                <DialogHeader className="p-8 bg-muted/5 border-b border-muted/50">
                    <DialogTitle className="text-[18px] font-bold tracking-tight">Create Assignment</DialogTitle>
                    <DialogDescription className="text-[14px] leading-relaxed text-muted-foreground mt-2">
                        Select a superadmin, admin, or instructor, then assign the next role they
                        should hold.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-8 grid gap-6">
                    <div className="space-y-2">
                        <label className="text-[12px] font-bold text-foreground">Target Role</label>
                        <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                            <SelectTrigger className="rounded-none border-muted/50 h-10 text-[14px]">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent className="rounded-none border-muted/50">
                                {roles.map((role) => (
                                    <SelectItem key={role.id} value={String(role.id)} className="rounded-none text-[14px]">
                                        {formatRoleLabel(role.name)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[12px] font-bold text-foreground">Search User</label>
                        <Input
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Search by name, email, role, or institution..."
                            className="rounded-none border-muted/50 h-10 text-[14px]"
                        />
                    </div>

                    <ScrollArea className="h-72 rounded-none border border-muted/50">
                        <div className="divide-y divide-muted/30">
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
                                            <div className="text-[14px] font-bold text-foreground">{displayName}</div>
                                            <div className="text-muted-foreground text-[12px]">
                                                {user.email}
                                            </div>
                                        </div>
                                        <div className="text-muted-foreground text-right text-[12px] space-y-0.5">
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
                        <div className="text-muted-foreground rounded-none border border-muted/50 px-4 py-3 text-[13px] bg-muted/5">
                            Selected user:{' '}
                            <span className="text-foreground font-bold">
                                {selectedUser.email}
                            </span>
                        </div>
                    ) : null}
                </div>

                <DialogFooter className="p-8 bg-muted/5 border-t border-muted/50 gap-3">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                        className="rounded-none h-11 px-8 text-[12px] font-bold border-muted/50"
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
                        className="rounded-none h-11 px-8 text-[12px] font-bold bg-[#323d8f] hover:bg-[#323d8f]/90"
                        disabled={isDisabled}
                    >
                        {isPending ? 'Saving...' : 'Create Assignment'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
