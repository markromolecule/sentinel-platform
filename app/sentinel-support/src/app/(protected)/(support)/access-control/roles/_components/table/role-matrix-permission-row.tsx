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
} from '@/app/(protected)/(support)/access-control/_lib/access-control-presenters';

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
        <TableRow key={permission.id} className="bg-background hover:bg-muted/30 transition-colors border border-[#323d8f]/10 border-l-2 border-l-[#323d8f]/30 border-r">
            <TableCell className="bg-inherit sticky left-0 z-10 border-r border-muted/30 align-middle whitespace-normal pl-14 py-3">
                <div className="flex items-center justify-between gap-2 pr-2">
                    <div className="min-w-0 space-y-0.5">
                        <div className="text-foreground text-[14px] font-medium leading-snug">{permission.name}</div>
                        <div className="text-muted-foreground text-[11px] font-bold leading-tight opacity-60">
                            {formatActionLabel(permission.actionKey)} ·{' '}
                            {getPermissionScopeLabel(permission.scope)}
                        </div>
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon-xs"
                                className="text-muted-foreground/40 hover:text-foreground shrink-0 size-5"
                                aria-label={`View purpose of ${permission.name}`}
                            >
                                <CircleHelp className="h-3.5 w-3.5" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" side="right" className="w-80 p-5 rounded-none shadow-2xl border-muted/50">
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <div className="text-[14px] font-bold tracking-tight">{permission.name}</div>
                                    <div className="text-[11px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded-none inline-block">
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
                    <TableCell key={`${permission.id}-${role.id}`} className="border-r border-muted/30 text-center align-middle">
                        <div className="flex justify-center">
                            <Checkbox
                                className="rounded-none size-4"
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
