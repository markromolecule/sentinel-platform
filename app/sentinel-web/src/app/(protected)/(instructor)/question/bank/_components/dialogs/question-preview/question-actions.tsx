"use client";

import { Button } from "@sentinel/ui";
import { Edit, Copy, Trash2 } from "lucide-react";

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
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-t border-border/50 flex gap-3">
            <Button className="flex-1 gap-2 bg-primary hover:bg-primary/90" onClick={onEdit}>
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
