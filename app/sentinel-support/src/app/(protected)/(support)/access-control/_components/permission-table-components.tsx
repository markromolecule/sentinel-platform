'use client';

import { ChevronDown, ChevronRight, CircleHelp } from 'lucide-react';
import { Badge, Button, TableCell, TableRow, Popover, PopoverContent, PopoverTrigger, cn } from '@sentinel/ui';
import type { AccessControlPermission } from '@sentinel/shared/types';
import { formatActionLabel, getPermissionScopeLabel } from '../_lib/access-control-presenters';

type CategoryRowProps = {
    label: string;
    count: number;
    isCollapsed: boolean;
    onToggle: () => void;
};

export function PermissionCategoryRow({ label, count, isCollapsed, onToggle }: CategoryRowProps) {
    return (
        <TableRow className="bg-muted/30 transition-colors hover:bg-muted/40 border-none">
            <TableCell colSpan={6} className="p-0">
                <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-6 py-3.5 text-left"
                    onClick={onToggle}
                >
                    <span className="flex items-center gap-3">
                        <div className="flex size-6 items-center justify-center rounded-md bg-background/50 shadow-sm border">
                            {isCollapsed ? (
                                <ChevronRight className="size-3.5 text-muted-foreground" />
                            ) : (
                                <ChevronDown className="size-3.5 text-muted-foreground" />
                            )}
                        </div>
                        <span className="text-sm font-bold uppercase tracking-wider text-foreground/80">
                            {label}
                        </span>
                    </span>
                    <Badge variant="secondary" className="bg-background/50 text-[10px] font-bold">
                        {count} Entries
                    </Badge>
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

export function PermissionModuleRow({ label, description, count, isCollapsed, onToggle }: ModuleRowProps) {
    return (
        <TableRow className="bg-muted/10 transition-colors hover:bg-muted/20 border-none">
            <TableCell colSpan={6} className="p-0">
                <button
                    type="button"
                    className="flex w-full items-start justify-between gap-4 px-8 py-3 text-left border-l-4 border-primary/20"
                    onClick={onToggle}
                >
                    <div className="flex items-start gap-4">
                        <div className="mt-0.5 flex size-5 items-center justify-center rounded-sm bg-background border">
                            {isCollapsed ? (
                                <ChevronRight className="size-3 text-muted-foreground" />
                            ) : (
                                <ChevronDown className="size-3 text-muted-foreground" />
                            )}
                        </div>
                        <div className="space-y-0.5">
                            <span className="block text-[13px] font-bold text-foreground/90">
                                {label}
                            </span>
                            {description && (
                                <span className="text-muted-foreground block text-[11px] font-medium opacity-70">
                                    {description}
                                </span>
                            )}
                        </div>
                    </div>
                    <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-tight opacity-60">
                        {count} Actions
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
        <TableRow className="group transition-colors hover:bg-primary/[0.02]">
            <TableCell className="py-3 pl-12 align-middle">
                <div className="flex items-center gap-3">
                    <div className="space-y-0.5">
                        <div className="text-sm font-bold tracking-tight text-foreground/90">
                            {permission.name}
                        </div>
                        <div className="text-[10px] font-bold tabular-nums tracking-widest text-primary/60 uppercase">
                            {permission.key}
                        </div>
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon-xs"
                                className="text-muted-foreground hover:text-foreground shrink-0"
                            >
                                <CircleHelp className="size-3.5" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" side="right" className="w-80 p-4 rounded-2xl shadow-xl border-primary/10">
                            <div className="space-y-2">
                                <div className="text-sm font-bold text-foreground uppercase tracking-tight">{permission.name}</div>
                                <p className="text-muted-foreground text-[11px] font-medium leading-relaxed">
                                    {permission.description || 'No detailed purpose has been recorded for this permission.'}
                                </p>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </TableCell>
            <TableCell className="py-3 align-middle">
                <Badge variant="outline" className="h-5 rounded-md px-1.5 text-[10px] font-bold uppercase tracking-wider bg-background border-muted-foreground/20">
                    {formatActionLabel(permission.actionKey)}
                </Badge>
            </TableCell>
            <TableCell className="py-3 align-middle">
                <span className="text-[11px] font-bold text-muted-foreground/80 lowercase">
                    {getPermissionScopeLabel(permission.scope)}
                </span>
            </TableCell>
            <TableCell className="py-3 align-middle">
                <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider",
                    permission.isSystem ? "text-amber-600/80" : "text-blue-600/80"
                )}>
                    {permission.isSystem ? 'System' : 'Custom'}
                </span>
            </TableCell>
            <TableCell className="py-3 align-middle">
                <div className="flex items-center gap-3">
                    <div className="text-[11px] font-bold text-foreground/80">
                        {permission.roleCount} Roles
                    </div>
                    <div className="text-muted-foreground text-[10px] font-medium opacity-40">/</div>
                    <div className="text-muted-foreground text-[10px] font-medium opacity-60">
                        {permission.overrideCount} Ex
                    </div>
                </div>
            </TableCell>
            <TableCell className="py-3 pr-6 align-middle">
                <div className="flex justify-end gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(permission)}
                        className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider hover:bg-primary/10 hover:text-primary"
                    >
                        Edit
                    </Button>
                    {!permission.isSystem && onDelete && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider text-destructive hover:bg-destructive/10"
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
