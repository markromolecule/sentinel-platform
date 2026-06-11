'use client';

import React from 'react';
import { Check, X, ShieldAlert } from 'lucide-react';
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
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center justify-between gap-6 px-6 py-3.5 bg-background/95 backdrop-blur-md border border-border shadow-2xl rounded-full w-[90%] max-w-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2.5 text-sm font-semibold text-foreground shrink-0 select-none">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">
                    {selectedCount}
                </div>
                <span>selected</span>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    onClick={onDismissBulk}
                    disabled={isSubmitting}
                    variant="outline"
                    className="rounded-full h-8 px-4 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                >
                    <X className="mr-1.5 h-3.5 w-3.5" />
                    Dismiss
                </Button>
                <Button
                    onClick={onConfirmBulk}
                    disabled={isSubmitting}
                    className="rounded-full h-8 px-4 text-xs font-semibold bg-red-600 text-white hover:bg-red-700"
                >
                    <Check className="mr-1.5 h-3.5 w-3.5" />
                    Confirm
                </Button>
                <div className="h-4 w-px bg-border mx-1" />
                <Button
                    onClick={onClearSelection}
                    disabled={isSubmitting}
                    variant="ghost"
                    className="rounded-full h-8 px-3 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                    Clear
                </Button>
            </div>
        </div>
    );
}
