'use client';

import {
    Badge,
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@sentinel/ui';
import { Database, MoreVertical, Pencil, Share2, Trash2 } from 'lucide-react';
import { useQuestionBankCollectionSharesQuery } from '@sentinel/hooks';
import { Collection } from '@/app/(protected)/question/bank/collections/_types';

interface CollectionListItemProps {
    collection: Collection;
    currentUserId?: string | null;
    onOpen?: () => void;
    onDelete?: (id: string) => void;
    onEdit?: (collection: Collection) => void;
    onShare?: (collection: Collection) => void;
}

/**
 * Renders a compact collection row with creator-aware actions.
 */
export function CollectionListItem({
    collection,
    currentUserId,
    onOpen,
    onDelete,
    onEdit,
    onShare,
}: CollectionListItemProps) {
    const isCreator = collection.createdById === currentUserId;
    const shouldLoadShares = Boolean(
        currentUserId && collection.createdById && collection.createdById !== currentUserId,
    );
    const sharedUsersQuery = useQuestionBankCollectionSharesQuery(
        shouldLoadShares ? collection.id : undefined,
    );
    const isSharedWithCurrentUser =
        isCreator ||
        (sharedUsersQuery.data?.some((sharedUser) => sharedUser.userId === currentUserId) ?? false);
    const canManageCollection = isCreator || isSharedWithCurrentUser;

    return (
        <div
            className="group border-border hover:border-primary/40 flex cursor-pointer items-center justify-between rounded-2xl border bg-white p-4 transition-all hover:shadow-md dark:bg-zinc-900"
            onClick={onOpen}
        >
            <div className="flex min-w-0 items-center gap-3">
                <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                    <Database className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                    <h3
                        className="truncate font-semibold text-zinc-900 dark:text-zinc-100"
                        title={collection.name}
                    >
                        {collection.name}
                    </h3>
                    {collection.author && (
                        <p className="truncate text-xs text-zinc-500">By {collection.author}</p>
                    )}
                    <p className="truncate text-xs text-zinc-500">
                        Updated {collection.lastUpdated}
                    </p>
                </div>
            </div>

            <div className="ml-4 flex shrink-0 items-center gap-6">
                <Badge variant="secondary" className="bg-primary/5 text-primary border-none">
                    {collection.questionCount} Questions
                </Badge>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8"
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpen?.();
                        }}
                    >
                        Open
                    </Button>

                    {canManageCollection ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                {isCreator ? (
                                    <DropdownMenuItem
                                        onClick={() => onShare?.(collection)}
                                        className="flex cursor-pointer items-center gap-2"
                                    >
                                        <Share2 className="h-4 w-4" />
                                        Share Collection
                                    </DropdownMenuItem>
                                ) : null}
                                {isSharedWithCurrentUser ? (
                                    <DropdownMenuItem
                                        onClick={() => onEdit?.(collection)}
                                        className="flex cursor-pointer items-center gap-2"
                                    >
                                        <Pencil className="h-4 w-4" />
                                        Edit Collection
                                    </DropdownMenuItem>
                                ) : null}
                                {isCreator ? (
                                    <DropdownMenuItem
                                        variant="destructive"
                                        onClick={() => onDelete?.(collection.id)}
                                        className="flex cursor-pointer items-center gap-2"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete Collection
                                    </DropdownMenuItem>
                                ) : null}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
