"use client";

import { PageHeader, Button } from "@sentinel/ui";
import { FolderPlus, Upload } from "lucide-react";

interface CollectionHeaderProps {
    onImport: () => void;
    onAddCollection: () => void;
}

export function CollectionHeader({ onImport, onAddCollection }: CollectionHeaderProps) {
    return (
        <PageHeader
            title="Collections"
            description="Organize your question bank into reusable groups for easier exam building."
        >
            <div className="flex gap-2">
                <Button
                    variant="ghost"
                    onClick={onImport}
                    className="gap-2"
                >
                    <Upload className="w-4 h-4" />
                    Import / Upload
                </Button>
                <Button
                    variant="outline"
                    className="gap-2"
                    onClick={onAddCollection}
                >
                    <FolderPlus className="w-4 h-4" />
                    New Collection
                </Button>
            </div>
        </PageHeader>
    );
}
