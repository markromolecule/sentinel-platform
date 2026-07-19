'use client';

import * as React from 'react';
import { Plus, Loader2 } from 'lucide-react';

import { Button } from '@sentinel/ui';

interface AssignmentBuilderFooterProps {
    readinessCount: number;
    totalCount: number;
    isPending: boolean;
    onAddRow: () => void;
    onCancel?: () => void;
    onSubmit: () => void;
}

function AssignmentBuilderFooter({
    readinessCount,
    totalCount,
    isPending,
    onAddRow,
    onCancel,
    onSubmit,
}: AssignmentBuilderFooterProps) {
    return (
        <div className="mt-auto border-t bg-zinc-50 p-4 -mx-6 -mb-6 rounded-b-xl flex flex-col justify-between gap-3 sm:flex-row sm:items-center dark:bg-zinc-950/20">
            <div className="flex items-center gap-3">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onAddRow}
                    disabled={isPending}
                    className="w-full sm:w-auto"
                >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add another classroom
                </Button>
                <span className="hidden text-xs font-semibold text-zinc-500 sm:inline">
                    {readinessCount} of {totalCount} assignments ready
                </span>
            </div>

            <div className="flex w-full gap-2 sm:w-auto">
                <span className="inline-flex items-center text-xs font-semibold text-zinc-500 sm:hidden self-center mr-auto">
                    {readinessCount}/{totalCount} ready
                </span>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onCancel}
                    disabled={isPending}
                    className="w-full sm:w-auto"
                >
                    Cancel
                </Button>
                <Button
                    type="button"
                    size="sm"
                    onClick={onSubmit}
                    disabled={isPending}
                    className="w-full bg-[#323d8f] font-semibold text-white hover:bg-[#323d8f]/90 sm:w-auto"
                >
                    {isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                    Save assignments
                </Button>
            </div>
        </div>
    );
}

export { AssignmentBuilderFooter };
export type { AssignmentBuilderFooterProps };
