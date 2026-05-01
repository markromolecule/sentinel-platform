'use client';

import { ChevronDown, ChevronRight, CircleHelp } from 'lucide-react';
import {
    Badge,
    Button,
    TableCell,
    TableRow,
    Popover,
    PopoverContent,
    PopoverTrigger,
    cn,
} from '@sentinel/ui';
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
        <TableRow className="border border-r border-l border-[#323d8f]/20 bg-[#f4faff] transition-colors hover:bg-[#ebf5ff]">
            <TableCell colSpan={6} className="p-0">
                <button
                    type="button"
                    className="flex w-full items-center justify-between px-6 py-3.5 text-left"
                    onClick={onToggle}
                >
                    <span className="flex items-center gap-3">
                        {isCollapsed ? (
                            <ChevronRight
                                className="text-muted-foreground/80 h-4 w-4"
                                strokeWidth={3}
                            />
                        ) : (
                            <ChevronDown
                                className="text-muted-foreground/80 h-4 w-4"
                                strokeWidth={3}
                            />
                        )}
                        <span className="text-foreground text-[14px] font-semibold tracking-tight">
                            {label}
                        </span>
                    </span>
                    <div className="border-muted/50 bg-background text-foreground flex h-6 items-center justify-center rounded-none border px-2 text-[11px] font-semibold">
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
        <TableRow className="bg-muted/15 hover:bg-muted/20 border border-r border-l border-[#323d8f]/10 transition-colors">
            <TableCell colSpan={6} className="p-0">
                <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-10 py-3 text-left"
                    onClick={onToggle}
                >
                    <div className="flex items-center gap-3">
                        {isCollapsed ? (
                            <ChevronRight
                                className="text-muted-foreground/60 h-3.5 w-3.5"
                                strokeWidth={3}
                            />
                        ) : (
                            <ChevronDown
                                className="text-muted-foreground/60 h-3.5 w-3.5"
                                strokeWidth={3}
                            />
                        )}
                        <span className="text-foreground/90 block text-[14px] font-semibold">
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
        <TableRow className="group bg-background hover:bg-muted/30 border border-r border-l-2 border-[#323d8f]/10 border-l-[#323d8f]/30 transition-colors">
            <TableCell className="border-muted/30 border-r py-3 pl-14 align-middle">
                <div className="flex items-center justify-between gap-2 pr-2">
                    <div className="min-w-0 space-y-0.5">
                        <div className="text-foreground text-[14px] leading-snug font-normal">
                            {permission.name}
                        </div>
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon-xs"
                                className="text-foreground/40 hover:text-foreground size-5 shrink-0"
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
                                    <div className="text-[14px] font-semibold tracking-tight">
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
            <TableCell className="border-muted/30 border-r py-3 text-center align-middle">
                <Badge
                    variant="outline"
                    className="bg-background border-muted/50 h-6 rounded-none px-2 text-[11px] font-semibold"
                >
                    {formatActionLabel(permission.actionKey)}
                </Badge>
            </TableCell>
            <TableCell className="border-muted/30 border-r py-3 text-center align-middle">
                <span className="text-foreground text-[12px] font-semibold">
                    {getPermissionScopeLabel(permission.scope)}
                </span>
            </TableCell>
            <TableCell className="border-muted/30 border-r py-3 text-center align-middle">
                <div className="flex justify-center">
                    {permission.isSystem ? (
                        <div
                            className="size-2 rounded-none bg-amber-500"
                            title="System Permission"
                        />
                    ) : (
                        <div
                            className="size-2 rounded-none bg-blue-500"
                            title="Custom Permission"
                        />
                    )}
                </div>
            </TableCell>
            <TableCell className="border-muted/30 border-r py-3 text-center align-middle">
                <div className="flex items-center justify-center gap-2">
                    <div className="text-foreground text-[13px] font-semibold">
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
                        className="hover:bg-primary/5 hover:text-primary h-8 rounded-none px-3 text-[12px] font-semibold"
                    >
                        Edit
                    </Button>
                    {!permission.isSystem && onDelete && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/5 h-8 rounded-none px-3 text-[12px] font-semibold"
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
