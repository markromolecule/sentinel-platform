'use client';

import { Button } from '@sentinel/ui';
import { Edit, Copy, Trash2 } from 'lucide-react';

/*
 * Renders the primary action buttons for the question preview.
 */
export function QuestionActions({
    onEdit,
    onDuplicate,
    onDelete,
}: {
    onEdit?: () => void;
    onDuplicate?: () => void;
    onDelete?: () => void;
}) {
    return (
        <div className="border-border/50 absolute right-0 bottom-0 left-0 flex gap-3 border-t bg-white/80 p-6 backdrop-blur-md dark:bg-zinc-950/80">
            <Button className="bg-primary hover:bg-primary/90 flex-1 gap-2" onClick={onEdit}>
                <Edit className="h-4 w-4" /> Edit Question
            </Button>
            <Button variant="outline" className="flex-1 gap-2" onClick={onDuplicate}>
                <Copy className="h-4 w-4" /> Duplicate
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10"
                onClick={onDelete}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}
