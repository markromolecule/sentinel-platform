'use client';

import type { MonitoringLifecycleAction, StudentSession } from '@sentinel/shared/types';
import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@sentinel/ui';
import { Ban, Lock, LockOpen, RotateCcw, ShieldCheck, Undo2, MoreVertical } from 'lucide-react';

type AttemptLifecycleActionsProps = {
    student: StudentSession;
    activeLifecycleActionId?: string | null;
    onAction?: (student: StudentSession, action: MonitoringLifecycleAction) => void;
};

const ACTIONS: Array<{
    action: MonitoringLifecycleAction;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
}> = [
    { action: 'lock', icon: Lock, label: 'Lock' },
    { action: 'reopen', icon: LockOpen, label: 'Reopen' },
    { action: 'reset', icon: RotateCcw, label: 'Reset' },
    { action: 'close', icon: Ban, label: 'Close' },
    { action: 'makeup', icon: Undo2, label: 'Makeup' },
    { action: 'retake', icon: ShieldCheck, label: 'Retake' },
];

export function AttemptLifecycleActions({
    student,
    activeLifecycleActionId,
    onAction,
}: AttemptLifecycleActionsProps) {
    const isTerminal =
        student.lifecycleState === 'CLOSED' || student.lifecycleState === 'SUPERSEDED';
    const studentName = `${student.firstName} ${student.lastName}`.trim() || 'selected student';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0 rounded-full"
                    aria-label={`Manage attempt for ${studentName}`}
                    title={`Manage attempt for ${studentName}`}
                    onClick={(event) => {
                        event.stopPropagation();
                    }}
                >
                    <MoreVertical className="h-3.5 w-3.5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-40"
                onClick={(event) => {
                    event.stopPropagation();
                }}
            >
                {ACTIONS.map(({ action, icon: Icon, label }) => {
                    const actionId = `${student.attemptId}:${action}`;
                    const disabled =
                        !onAction ||
                        (isTerminal && ['lock', 'close', 'reset'].includes(action)) ||
                        (student.lifecycleState === 'LOCKED' && action === 'lock') ||
                        (student.lifecycleState === 'IN_PROGRESS' && action === 'reopen');

                    return (
                        <DropdownMenuItem
                            key={action}
                            disabled={disabled || activeLifecycleActionId === actionId}
                            className="gap-2 cursor-pointer text-xs"
                            aria-label={`${label} attempt for ${studentName}`}
                            title={`${label} attempt for ${studentName}`}
                            onClick={(event) => {
                                event.stopPropagation();
                                onAction?.(student, action);
                            }}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            <span>{label}</span>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
