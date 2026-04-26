'use client';

import { ChevronDown, ChevronRight, CircleHelp } from 'lucide-react';
import { Badge, Button, TableCell, TableRow, Popover, PopoverContent, PopoverTrigger, cn } from '@sentinel/ui';
import type { AccessControlPermission } from '@sentinel/shared/types';
import { formatActionLabel, getPermissionScopeLabel } from '../../_lib/access-control-presenters';

type CategoryRowProps = {
    label: string;
    count: number;
    isCollapsed: boolean;
    onToggle: () => void;
};

export function PermissionCategoryRow({ label, count, isCollapsed, onToggle }: CategoryRowProps) {
    return (
        <TableRow
            className="transition-colors border border-[#323d8f]/20 bg-[#f4faff] hover:bg-[#ebf5ff] border-l border-r"
        >
            <TableCell colSpan={6} className="p-0">
                <button
                    type="button"
                    className="flex w-full items-center justify-between px-6 py-3.5 text-left"
                    onClick={onToggle}
                >
                    <span className="flex items-center gap-3">
                        {isCollapsed ? (
                            <ChevronRight className="h-4 w-4 text-muted-foreground/80" strokeWidth={3} />
                        ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground/80" strokeWidth={3} />
                        )}
                        <span className="text-foreground text-[14px] font-semibold tracking-tight">
                            {label}
                        </span>
                    </span>
                    <div className="flex px-2 h-6 items-center justify-center rounded-none border border-muted/50 bg-background text-[11px] font-semibold text-foreground">
                        {count}
                    </div>
                </button>
            </TableCell>
        </TableRow>
    );
}

type ModuleRowProps = {
    label: string;
    description?: string;
    count: number;
    isCollapsed: boolean;
    onToggle: () => void;
};

export function PermissionModuleRow({ label, count, isCollapsed, onToggle }: ModuleRowProps) {
    return (
        <TableRow
            className="transition-colors border border-[#323d8f]/10 bg-muted/15 hover:bg-muted/20 border-l border-r"
        >
            <TableCell colSpan={6} className="p-0">
                <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-10 py-3 text-left"
                    onClick={onToggle}
                >
                    <div className="flex items-center gap-3">
                        {isCollapsed ? (
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" strokeWidth={3} />
                        ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/60" strokeWidth={3} />
                        )}
                        <span className="block text-[14px] font-semibold text-foreground/90">
                            {label}
                        </span>
                    </div>
                    <span className="text-muted-foreground text-[12px] font-semibold">
                        {count} permissions
                    </span>
                </button>
            </TableCell>
        </TableRow>
    );
}

type DataRowProps = {
    permission: AccessControlPermission;
    onEdit: (permission: AccessControlPermission) => void;
    onDelete?: (permission: AccessControlPermission) => void;
};

export function PermissionDataRow({ permission, onEdit, onDelete }: DataRowProps) {
    return (
        <TableRow className="group transition-colors bg-background hover:bg-muted/30 border border-[#323d8f]/10 border-l-2 border-l-[#323d8f]/30 border-r">
            <TableCell className="py-3 pl-14 align-middle border-r border-muted/30">
                <div className="flex items-center justify-between gap-2 pr-2">
                    <div className="min-w-0 space-y-0.5">
                        <div className="text-foreground text-[14px] font-normal leading-snug">{permission.name}</div>
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon-xs"
                                className="text-foreground/40 hover:text-foreground shrink-0 size-5"
                                aria-label={`View purpose of ${permission.name}`}
                            >
                                <CircleHelp className="h-3.5 w-3.5" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" side="right" className="w-80 p-5 rounded-none shadow-2xl border-muted/50">
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <div className="text-[14px] font-semibold tracking-tight">{permission.name}</div>
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
            <TableCell className="py-3 align-middle border-r border-muted/30 text-center">
                <Badge variant="outline" className="h-6 rounded-none px-2 text-[11px] font-semibold bg-background border-muted/50">
                    {formatActionLabel(permission.actionKey)}
                </Badge>
            </TableCell>
            <TableCell className="py-3 align-middle border-r border-muted/30 text-center">
                <span className="text-[12px] font-semibold text-foreground">
                    {getPermissionScopeLabel(permission.scope)}
                </span>
            </TableCell>
            <TableCell className="py-3 align-middle border-r border-muted/30 text-center">
                <div className="flex justify-center">
                    {permission.isSystem ? (
                        <div className="size-2 rounded-none bg-amber-500" title="System Permission" />
                    ) : (
                        <div className="size-2 rounded-none bg-blue-500" title="Custom Permission" />
                    )}
                </div>
            </TableCell>
            <TableCell className="py-3 align-middle border-r border-muted/30 text-center">
                <div className="flex justify-center items-center gap-2">
                    <div className="text-[13px] font-semibold text-foreground">
                        {permission.roleCount}
                    </div>
                    <div className="text-foreground text-[12px] font-semibold opacity-30">/</div>
                    <div className="text-foreground text-[12px] font-semibold">
                        {permission.overrideCount}
                    </div>
                </div>
            </TableCell>
            <TableCell className="py-3 pr-6 align-middle">
                <div className="flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(permission)}
                        className="h-8 px-3 text-[12px] font-semibold hover:bg-primary/5 hover:text-primary rounded-none"
                    >
                        Edit
                    </Button>
                    {!permission.isSystem && onDelete && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-[12px] font-semibold text-destructive hover:bg-destructive/5 rounded-none"
                            onClick={() => onDelete(permission)}
                        >
                            Delete
                        </Button>
                    )}
                </div>
            </TableCell>
        </TableRow>
    );
}
