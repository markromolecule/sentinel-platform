'use client';

import { Button, EmptyState } from "@sentinel/ui";
import { FolderPlus } from "lucide-react";

interface CollectionsEmptyStateProps {
    onCreateCollection: () => void;
}

export function CollectionsEmptyState({ onCreateCollection }: CollectionsEmptyStateProps) {
    return (
        <EmptyState
            icon="📂"
            title="No collections yet"
            description="You haven't created any question bank collections yet. Create one to start organizing your questions into reusable groups."
            action={
                <Button variant="outline" className="gap-2" onClick={onCreateCollection}>
                    <FolderPlus className="w-4 h-4" />
                    New Collection
                </Button>
            }
            className="animate-in fade-in-50"
        />
    );
}
