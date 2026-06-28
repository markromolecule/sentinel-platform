'use client';

import React from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@sentinel/ui';

interface BulkActionsProps {
    selectedCount: number;
    onConfirmBulk: () => void;
    onDismissBulk: () => void;
    onClearSelection: () => void;
    isSubmitting: boolean;
}

export function BulkActions({
    selectedCount,
    onConfirmBulk,
    onDismissBulk,
    onClearSelection,
    isSubmitting,
}: BulkActionsProps) {
    if (selectedCount === 0) return null;

    return (
        <div className="bg-background/95 border-border animate-in fade-in slide-in-from-bottom-4 fixed bottom-6 left-1/2 z-50 flex w-[90%] max-w-lg -translate-x-1/2 items-center justify-between gap-6 rounded-full border px-6 py-3.5 shadow-2xl backdrop-blur-md transition-all duration-300">
            <div className="text-foreground flex shrink-0 items-center gap-2.5 text-sm font-semibold select-none">
                <div className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full text-xs">
                    {selectedCount}
                </div>
                <span>selected</span>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    onClick={onDismissBulk}
                    disabled={isSubmitting}
                    variant="outline"
                    className="h-8 rounded-full border-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                >
                    <X className="mr-1.5 h-3.5 w-3.5" />
                    Dismiss
                </Button>
                <Button
                    onClick={onConfirmBulk}
                    disabled={isSubmitting}
                    className="h-8 rounded-full bg-red-600 px-4 text-xs font-semibold text-white hover:bg-red-700"
                >
                    <Check className="mr-1.5 h-3.5 w-3.5" />
                    Confirm
                </Button>
                <div className="bg-border mx-1 h-4 w-px" />
                <Button
                    onClick={onClearSelection}
                    disabled={isSubmitting}
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground h-8 rounded-full px-3 text-xs font-semibold"
                >
                    Clear
                </Button>
            </div>
        </div>
    );
}
