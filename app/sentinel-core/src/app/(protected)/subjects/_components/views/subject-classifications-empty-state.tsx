'use client';

import { Button, Card, CardContent } from '@sentinel/ui';
import { FolderTree, Plus } from 'lucide-react';

interface SubjectClassificationsEmptyStateProps {
    searchTerm?: string;
    canCreate?: boolean;
    onCreate?: () => void;
}

export function SubjectClassificationsEmptyState({
    searchTerm,
    canCreate = false,
    onCreate,
}: SubjectClassificationsEmptyStateProps) {
    return (
        <Card className="bg-muted/20 border-dashed">
            <CardContent className="flex min-h-[320px] flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="rounded-full bg-[#323d8f]/10 p-4 text-[#323d8f] ring-8 ring-[#323d8f]/5">
                    <FolderTree className="h-10 w-10" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold tracking-tight">
                        {searchTerm ? 'No matching groups' : 'Organize Your Catalog'}
                    </h3>
                    <p className="text-muted-foreground mx-auto max-w-sm text-sm leading-relaxed">
                        {searchTerm
                            ? `We couldn't find any subject classification group matching "${searchTerm}".`
                            : 'Create shared grouping cards for the institutional subject catalog to help students and staff browse subjects easily.'}
                    </p>
                </div>
                {canCreate && !searchTerm && onCreate ? (
                    <Button
                        onClick={onCreate}
                        className="mt-2 bg-[#323d8f] shadow-md hover:bg-[#323d8f]/90"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Your First Group
                    </Button>
                ) : null}
            </CardContent>
        </Card>
    );
}
