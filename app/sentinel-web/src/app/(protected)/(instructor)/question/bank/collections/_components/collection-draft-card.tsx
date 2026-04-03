"use client";

import * as React from "react";
import {
    Button,
    Input,
    cn,
} from "@sentinel/ui";
import { Database, FolderPlus } from "lucide-react";
import type { ViewMode } from "@/app/(protected)/(instructor)/question/bank/collections/_types";

interface CollectionDraftCardProps {
    name: string;
    view: ViewMode;
    onNameChange: (value: string) => void;
    onSave: () => void;
    onCancel: () => void;
}

export function CollectionDraftCard({
    name,
    view,
    onNameChange,
    onSave,
    onCancel,
}: CollectionDraftCardProps) {
    const isGrid = view === "grid";

    return (
        <div
            className={cn(
                "rounded-2xl border border-dashed border-border bg-background",
                isGrid
                    ? "flex h-full flex-col gap-4 p-4"
                    : "flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between",
            )}
        >
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <FolderPlus className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                    <div className="space-y-1">
                        <h3 className="font-semibold">New Collection</h3>
                        <p className="text-sm text-muted-foreground">
                            Give this collection a title to start organizing questions.
                        </p>
                    </div>
                    <Input
                        value={name}
                        onChange={(event) => onNameChange(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                event.preventDefault();
                                onSave();
                            }

                            if (event.key === "Escape") {
                                event.preventDefault();
                                onCancel();
                            }
                        }}
                        placeholder="e.g. Web Development Finals"
                        autoFocus
                        className="max-w-md"
                    />
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="ghost" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="button" onClick={onSave} className="gap-2">
                    <Database className="h-4 w-4" />
                    Create Collection
                </Button>
            </div>
        </div>
    );
}
