'use client';

import { Button } from '@sentinel/ui';
import { Database, FolderPlus, Plus } from 'lucide-react';

export function FlatQuestionBucketToolbar({
    questionCount,
    onImport,
    onAddQuestion,
}: {
    questionCount: number;
    onImport: () => void;
    onAddQuestion: () => void;
}) {
    return (
        <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
                <h3 className="text-sm font-semibold">Questions ({questionCount})</h3>
                <p className="text-muted-foreground text-xs">
                    Drag the handle to reorder questions.
                </p>
            </div>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onImport}
                    className="h-8 gap-1.5 text-xs"
                >
                    <Database className="h-3.5 w-3.5" />
                    Import from Bank
                </Button>
                <Button
                    size="sm"
                    onClick={onAddQuestion}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 gap-1.5 text-xs"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Add Question
                </Button>
            </div>
        </div>
    );
}

export function SectionedQuestionBucketToolbar({
    questionCount,
    totalPoints,
    onAddSection,
}: {
    questionCount: number;
    totalPoints: number;
    onAddSection?: () => void;
}) {
    return (
        <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">Questions ({questionCount})</h3>
                    <span className="text-xs font-normal text-zinc-400 select-none">
                        · {totalPoints} pt{totalPoints === 1 ? '' : 's'} total
                    </span>
                </div>
                <p className="text-muted-foreground text-xs">
                    Organize questions into sections where they belong.
                </p>
            </div>

            {onAddSection ? (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onAddSection}
                    className="h-8 gap-1.5 text-xs"
                >
                    <FolderPlus className="h-3.5 w-3.5" />
                    Add Section
                </Button>
            ) : null}
        </div>
    );
}
