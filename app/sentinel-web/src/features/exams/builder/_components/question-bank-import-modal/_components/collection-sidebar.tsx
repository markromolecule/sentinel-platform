'use client';

import { Badge, ScrollArea } from '@sentinel/ui';
import { ChevronRight } from 'lucide-react';
import { cn } from '@sentinel/ui';
import type { QuestionBankCollectionRecord } from '@sentinel/services';

interface CollectionSidebarProps {
    collections: QuestionBankCollectionRecord[];
    questionCount: number;
    selectedCollectionId: string;
    isCollectionsLoading: boolean;
    onSelectCollection: (collectionId: string) => void;
}

export function CollectionSidebar({
    collections,
    questionCount,
    selectedCollectionId,
    isCollectionsLoading,
    onSelectCollection,
}: CollectionSidebarProps) {
    return (
        <aside className="bg-muted/10 hidden min-h-0 w-[240px] shrink-0 border-r lg:flex lg:flex-col">
            <div className="border-b px-4 py-3">
                <p className="text-sm font-medium">Collections</p>
                <p className="text-muted-foreground text-xs">
                    Narrow the import list by collection.
                </p>
            </div>

            <ScrollArea className="min-h-0 flex-1">
                <div className="space-y-1 p-3">
                    <button
                        type="button"
                        onClick={() => onSelectCollection('all')}
                        className={cn(
                            'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors',
                            selectedCollectionId === 'all'
                                ? 'bg-background ring-border shadow-sm ring-1'
                                : 'hover:bg-background/70',
                        )}
                    >
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium">All Questions</p>
                            <p className="text-muted-foreground text-xs">Entire question bank</p>
                        </div>
                        <Badge variant="outline" className="ml-3 shrink-0 text-[10px]">
                            {questionCount}
                        </Badge>
                    </button>

                    {isCollectionsLoading ? (
                        <p className="text-muted-foreground px-3 py-2 text-xs">
                            Loading collections...
                        </p>
                    ) : (
                        collections.map((collection) => (
                            <button
                                key={collection.id}
                                type="button"
                                onClick={() => onSelectCollection(collection.id)}
                                className={cn(
                                    'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors',
                                    selectedCollectionId === collection.id
                                        ? 'bg-background ring-border shadow-sm ring-1'
                                        : 'hover:bg-background/70',
                                )}
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">
                                        {collection.name}
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                        {collection.questionCount} question
                                        {collection.questionCount === 1 ? '' : 's'}
                                    </p>
                                </div>
                                <ChevronRight className="text-muted-foreground ml-3 h-3.5 w-3.5 shrink-0" />
                            </button>
                        ))
                    )}
                </div>
            </ScrollArea>
        </aside>
    );
}
