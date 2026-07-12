'use client';

import { Badge } from '@sentinel/ui';
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
        <aside className="bg-zinc-50/30 hidden min-h-0 w-[240px] shrink-0 border-r lg:flex lg:flex-col overflow-x-hidden dark:bg-zinc-950/10">
            <div className="border-b px-4 py-3 shrink-0">
                <p className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Collections</p>
                <p className="text-muted-foreground text-xs">
                    Narrow the import list by collection.
                </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <button
                    type="button"
                    onClick={() => onSelectCollection('all')}
                    className={cn(
                        'flex w-full items-center justify-between px-4 py-3 text-left transition-colors cursor-pointer border-y border-l border-r-[3px] rounded-none outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0',
                        selectedCollectionId === 'all'
                            ? 'bg-primary/5 border-y-transparent border-l-transparent border-r-primary text-primary dark:bg-primary/10 dark:border-y-transparent dark:border-l-transparent dark:border-r-primary dark:text-primary font-semibold'
                            : 'border-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/50 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/40',
                    )}
                >
                    <div className="min-w-0 pr-2">
                        <p className="text-sm">All Questions</p>
                        <p className="text-zinc-400 text-[11px] truncate dark:text-zinc-500 font-normal">Entire question bank</p>
                    </div>
                    <Badge variant="outline" className={cn(
                        'ml-2 shrink-0 text-[10px] px-1.5 py-0.5 border-zinc-200 transition-colors',
                        selectedCollectionId === 'all' && 'border-primary/20 bg-primary/10 text-primary dark:border-primary/35 dark:bg-primary/20 dark:text-primary'
                    )}>
                        {questionCount}
                    </Badge>
                </button>

                {isCollectionsLoading ? (
                    <p className="text-muted-foreground px-4 py-2 text-xs">
                        Loading collections...
                    </p>
                ) : (
                    collections.map((collection) => {
                        const isSelected = selectedCollectionId === collection.id;
                        return (
                            <button
                                key={collection.id}
                                type="button"
                                onClick={() => onSelectCollection(collection.id)}
                                className={cn(
                                    'flex w-full items-center justify-between px-4 py-3 text-left transition-colors cursor-pointer border-r-[3px] border-y border-l rounded-none outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0',
                                    isSelected
                                        ? 'bg-primary/5 border-y-transparent border-l-transparent border-r-primary text-primary dark:bg-primary/10 dark:border-y-transparent dark:border-l-transparent dark:border-r-primary dark:text-primary font-semibold'
                                        : 'border-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/50 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/40',
                                )}
                            >
                                <div className="min-w-0 pr-2">
                                    <p className="truncate text-sm">
                                        {collection.name}
                                    </p>
                                    <p className="text-zinc-400 text-[11px] truncate dark:text-zinc-500 font-normal">
                                        {collection.questionCount} question
                                        {collection.questionCount === 1 ? '' : 's'}
                                    </p>
                                </div>
                                <Badge variant="outline" className={cn(
                                    'ml-2 shrink-0 text-[10px] px-1.5 py-0.5 border-zinc-200 transition-colors',
                                    isSelected && 'border-primary/20 bg-primary/10 text-primary dark:border-primary/35 dark:bg-primary/20 dark:text-primary'
                                )}>
                                    {collection.questionCount}
                                </Badge>
                              </button>
                        );
                    })
                )}
            </div>
        </aside>
    );
}
