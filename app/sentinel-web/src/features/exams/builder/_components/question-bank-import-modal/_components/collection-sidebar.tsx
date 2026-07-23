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
        <aside className="hidden min-h-0 w-[240px] shrink-0 overflow-x-hidden border-r bg-zinc-50/30 lg:flex lg:flex-col dark:bg-zinc-950/10">
            <div className="shrink-0 border-b px-4 py-3">
                <p className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                    Collections
                </p>
                <p className="text-muted-foreground text-xs">
                    Narrow the import list by collection.
                </p>
            </div>

            <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto py-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <button
                    type="button"
                    onClick={() => onSelectCollection('all')}
                    className={cn(
                        'flex w-full cursor-pointer items-center justify-between rounded-none border-y border-r-[3px] border-l px-4 py-3 text-left transition-colors outline-none focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none',
                        selectedCollectionId === 'all'
                            ? 'bg-primary/5 border-r-primary text-primary dark:bg-primary/10 dark:border-r-primary dark:text-primary border-y-transparent border-l-transparent font-semibold dark:border-y-transparent dark:border-l-transparent'
                            : 'border-transparent text-zinc-600 hover:bg-zinc-100/50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/40 dark:hover:text-zinc-200',
                    )}
                >
                    <div className="min-w-0 pr-2">
                        <p className="text-sm">All Questions</p>
                        <p className="truncate text-[11px] font-normal text-zinc-400 dark:text-zinc-500">
                            Entire question bank
                        </p>
                    </div>
                    <Badge
                        variant="outline"
                        className={cn(
                            'ml-2 shrink-0 border-zinc-200 px-1.5 py-0.5 text-[10px] transition-colors',
                            selectedCollectionId === 'all' &&
                                'border-primary/20 bg-primary/10 text-primary dark:border-primary/35 dark:bg-primary/20 dark:text-primary',
                        )}
                    >
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
                                    'flex w-full cursor-pointer items-center justify-between rounded-none border-y border-r-[3px] border-l px-4 py-3 text-left transition-colors outline-none focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none',
                                    isSelected
                                        ? 'bg-primary/5 border-r-primary text-primary dark:bg-primary/10 dark:border-r-primary dark:text-primary border-y-transparent border-l-transparent font-semibold dark:border-y-transparent dark:border-l-transparent'
                                        : 'border-transparent text-zinc-600 hover:bg-zinc-100/50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/40 dark:hover:text-zinc-200',
                                )}
                            >
                                <div className="min-w-0 pr-2">
                                    <p className="truncate text-sm">{collection.name}</p>
                                    <p className="truncate text-[11px] font-normal text-zinc-400 dark:text-zinc-500">
                                        {collection.questionCount} question
                                        {collection.questionCount === 1 ? '' : 's'}
                                    </p>
                                </div>
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        'ml-2 shrink-0 border-zinc-200 px-1.5 py-0.5 text-[10px] transition-colors',
                                        isSelected &&
                                            'border-primary/20 bg-primary/10 text-primary dark:border-primary/35 dark:bg-primary/20 dark:text-primary',
                                    )}
                                >
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
