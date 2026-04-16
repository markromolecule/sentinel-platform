'use client';

import { Button } from '@sentinel/ui';
import { Trash2, X } from 'lucide-react';

interface FloatingActionBarProps {
    selectedCount: number;
    onClear: () => void;
    onUnoffer: () => void;
    isPending?: boolean;
}

export function FloatingActionBar({
    selectedCount,
    onClear,
    onUnoffer,
    isPending = false,
}: FloatingActionBarProps) {
    if (selectedCount === 0) return null;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 fixed bottom-8 left-1/2 z-50 -translate-x-1/2 duration-300">
            <div className="border-border flex min-w-[300px] items-center gap-2 rounded-2xl border bg-white p-2 shadow-2xl dark:bg-zinc-900">
                <div className="border-border bg-primary/5 mr-2 flex items-center gap-2 rounded-xl border-r px-4 py-2">
                    <span className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold">
                        {selectedCount}
                    </span>
                    <span className="text-sm font-semibold">Selected</span>
                </div>

                <div className="flex flex-1 items-center gap-1 px-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onUnoffer}
                        disabled={isPending}
                        className="text-destructive hover:bg-destructive/10 h-9 gap-2 rounded-xl"
                    >
                        <Trash2 className="h-4 w-4" />
                        {isPending ? 'Removing...' : 'Unoffer Subjects'}
                    </Button>
                </div>

                <div className="border-border border-l pr-1 pl-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClear}
                        className="hover:bg-muted h-8 w-8 rounded-full"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
