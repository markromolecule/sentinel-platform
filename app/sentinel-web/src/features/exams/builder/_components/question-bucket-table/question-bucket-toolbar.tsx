"use client";

import { Badge, Button } from "@sentinel/ui";
import { Database, FolderPlus, Plus } from "lucide-react";

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
            <div className="space-y-1">
                <h3 className="text-base font-semibold">Questions ({questionCount})</h3>
                <p className="text-sm text-muted-foreground">Drag the # handle to reorder questions.</p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={onImport} className="gap-2">
                    <Database className="h-4 w-4" />
                    Import from Bank
                </Button>
                <Button variant="outline" onClick={onAddQuestion} className="gap-2">
                    <Plus className="h-4 w-4" />
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
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
                <h3 className="text-base font-semibold">Questions ({questionCount})</h3>
                <p className="text-sm text-muted-foreground">
                    Organize questions into sections. Add and import questions inside the section where they belong.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                    <Badge variant="secondary">{totalPoints} pts total</Badge>
                </div>
            </div>

            {onAddSection ? (
                <Button variant="outline" onClick={onAddSection} className="gap-2 self-start">
                    <FolderPlus className="h-4 w-4" />
                    Add Section
                </Button>
            ) : null}
        </div>
    );
}
