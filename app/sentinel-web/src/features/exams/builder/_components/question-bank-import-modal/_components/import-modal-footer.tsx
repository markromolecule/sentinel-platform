'use client';

import { Button, DialogFooter, Separator } from '@sentinel/ui';
import { LayoutGrid } from 'lucide-react';

interface ImportModalFooterProps {
    selectedCount: number;
    onCancel: () => void;
    onImport: () => void;
}

export function ImportModalFooter({
    selectedCount,
    onCancel,
    onImport,
}: ImportModalFooterProps) {
    return (
        <>
            <Separator />

            <DialogFooter className="bg-background flex items-center justify-end gap-3 px-4 py-3">
                <Button
                    variant="ghost"
                    className="h-9 rounded-lg px-4 text-sm font-medium text-muted-foreground hover:text-foreground"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
                <Button
                    disabled={selectedCount === 0}
                    onClick={onImport}
                    className="h-9 gap-2 rounded-lg px-5 text-sm font-medium"
                >
                    <LayoutGrid className="h-4 w-4" />
                    <span>Import {selectedCount > 0 ? `${selectedCount} ` : ''}Questions</span>
                </Button>
            </DialogFooter>
        </>
    );
}
