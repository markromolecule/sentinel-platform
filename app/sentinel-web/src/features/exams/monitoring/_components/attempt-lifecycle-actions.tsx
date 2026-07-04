'use client';

import type { MonitoringLifecycleAction, StudentSession } from '@sentinel/shared/types';
import { Button } from '@sentinel/ui';
import { Ban, Lock, LockOpen, RotateCcw, ShieldCheck, Undo2 } from 'lucide-react';

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

/**
 * Renders compact per-attempt lifecycle tools for instructor monitoring cards.
 */
export function AttemptLifecycleActions({
    student,
    activeLifecycleActionId,
    onAction,
}: AttemptLifecycleActionsProps) {
    const isTerminal =
        student.lifecycleState === 'CLOSED' || student.lifecycleState === 'SUPERSEDED';
    const studentName = `${student.firstName} ${student.lastName}`.trim() || 'selected student';

    return (
        <div className="flex flex-wrap gap-2">
            {ACTIONS.map(({ action, icon: Icon, label }) => {
                const actionId = `${student.attemptId}:${action}`;
                const disabled =
                    !onAction ||
                    (isTerminal && ['lock', 'close', 'reset'].includes(action)) ||
                    (student.lifecycleState === 'LOCKED' && action === 'lock') ||
                    (student.lifecycleState === 'IN_PROGRESS' && action === 'reopen');

                return (
                    <Button
                        key={action}
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={disabled || activeLifecycleActionId === actionId}
                        className="h-8 gap-1.5 px-2.5 text-[11px]"
                        aria-label={`${label} attempt for ${studentName}`}
                        title={`${label} attempt for ${studentName}`}
                        onClick={(event) => {
                            event.stopPropagation();
                            onAction?.(student, action);
                        }}
                    >
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                    </Button>
                );
            })}
        </div>
    );
}
