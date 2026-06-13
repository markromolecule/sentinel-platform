'use client';

import { Badge, DialogDescription, DialogTitle } from '@sentinel/ui';
import { Database } from 'lucide-react';

export function ImportModalHeader({ selectedCount }: { selectedCount: number }) {
    return (
        <div className="bg-background flex flex-col gap-1 border-b px-6 py-5">
            <div className="flex items-start justify-between gap-4 pr-8">
                <div className="space-y-1">
                    <DialogTitle className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                        <Database className="text-primary h-5 w-5" />
                        Import from Question Bank
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-sm">
                        Browse your library and select questions for this exam.
                    </DialogDescription>
                </div>
                <div className="flex items-center gap-2 pt-1">
                    <Badge
                        variant="secondary"
                        className="rounded-md px-2.5 py-1 text-xs font-medium"
                    >
                        {selectedCount} Selected
                    </Badge>
                </div>
            </div>
        </div>
    );
}
