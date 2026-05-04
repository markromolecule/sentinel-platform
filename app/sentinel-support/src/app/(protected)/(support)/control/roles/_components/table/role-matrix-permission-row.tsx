import {
    TableRow,
    TableCell,
    Button,
    Checkbox,
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@sentinel/ui';
import { CircleHelp } from 'lucide-react';
import type { AccessControlPermission, AccessControlRole } from '@sentinel/shared/types';
import {
    formatActionLabel,
    formatRoleLabel,
    getPermissionScopeLabel,
} from '@/app/(protected)/(support)/control/_lib/control-presenters';

interface RoleMatrixPermissionRowProps {
    permission: AccessControlPermission;
    sortedRoles: AccessControlRole[];
    draftPermissionIdsByRoleId: Record<number, string[]>;
    onPermissionToggle: (roleId: number, permissionId: string, checked: boolean) => void;
}

export function RoleMatrixPermissionRow({
    permission,
    sortedRoles,
    draftPermissionIdsByRoleId,
    onPermissionToggle,
}: RoleMatrixPermissionRowProps) {
    return (
        <TableRow
            key={permission.id}
            className="bg-background hover:bg-muted/30 border border-r border-l-2 border-[#323d8f]/10 border-l-[#323d8f]/30 transition-colors"
        >
            <TableCell className="border-muted/30 sticky left-0 z-10 border-r bg-inherit py-3 pl-14 align-middle whitespace-normal">
                <div className="flex items-center justify-between gap-2 pr-2">
                    <div className="min-w-0 space-y-0.5">
                        <div className="text-foreground text-[14px] leading-snug font-medium">
                            {permission.name}
                        </div>
                        <div className="text-muted-foreground text-[11px] leading-tight font-bold opacity-60">
                            {formatActionLabel(permission.actionKey)} ·{' '}
                            {getPermissionScopeLabel(permission.scope)}
                        </div>
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon-xs"
                                className="text-muted-foreground/40 hover:text-foreground size-5 shrink-0"
                                aria-label={`View purpose of ${permission.name}`}
                            >
                                <CircleHelp className="h-3.5 w-3.5" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            align="start"
                            side="right"
                            className="border-muted/50 w-80 rounded-none p-5 shadow-2xl"
                        >
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <div className="text-[14px] font-bold tracking-tight">
                                        {permission.name}
                                    </div>
                                    <div className="text-muted-foreground bg-muted inline-block rounded-none px-1.5 py-0.5 font-mono text-[11px]">
                                        {permission.key}
                                    </div>
                                </div>
                                <p className="text-muted-foreground text-[13px] leading-relaxed">
                                    {permission.description ||
                                        'No purpose has been written for this permission yet.'}
                                </p>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </TableCell>
            {sortedRoles.map((role) => {
                const isChecked = (draftPermissionIdsByRoleId[role.id] ?? []).includes(
                    permission.id,
                );

                return (
                    <TableCell
                        key={`${permission.id}-${role.id}`}
                        className="border-muted/30 border-r text-center align-middle"
                    >
                        <div className="flex justify-center">
                            <Checkbox
                                className="size-4 rounded-none"
                                checked={isChecked}
                                onCheckedChange={(checked) =>
                                    onPermissionToggle(role.id, permission.id, Boolean(checked))
                                }
                                aria-label={`${permission.name} for ${formatRoleLabel(role.name)}`}
                            />
                        </div>
                    </TableCell>
                );
            })}
        </TableRow>
    );
}
