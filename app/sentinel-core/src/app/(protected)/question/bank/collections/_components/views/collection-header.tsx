'use client';

import { PageHeader, Button } from '@sentinel/ui';
import { FolderPlus } from 'lucide-react';

interface CollectionHeaderProps {
    onAddCollection: () => void;
}

export function CollectionHeader({ onAddCollection }: CollectionHeaderProps) {
    return (
        <PageHeader
            title="Collections"
            description="Organize your question bank into reusable groups for easier exam building."
        >
            <div className="flex gap-2">
                <Button variant="outline" className="gap-2" onClick={onAddCollection}>
                    <FolderPlus className="h-4 w-4" />
                    New Collection
                </Button>
            </div>
        </PageHeader>
    );
}
