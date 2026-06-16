'use client';

import {
    Badge,
    Button,
    cn,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@sentinel/ui';
import {
    Clock,
    Database,
    Globe,
    Layers,
    Lock,
    MoreVertical,
    Pencil,
    Share2,
    Trash2,
    User,
} from 'lucide-react';
import { useQuestionBankCollectionSharesQuery } from '@sentinel/hooks';
import { Collection } from '@/app/(protected)/(instructor)/question/bank/collections/_types';

interface CollectionCardProps {
    collection: Collection;
    currentUserId?: string | null;
    onClick?: () => void;
    onDelete?: (id: string) => void;
    onEdit?: (collection: Collection) => void;
    onShare?: (collection: Collection) => void;
}

/**
 * Renders a collection card with permission-aware actions.
 */
export function CollectionCard({
    collection,
    currentUserId,
    onClick,
    onDelete,
    onEdit,
    onShare,
}: CollectionCardProps) {
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
    const questionLabel =
        collection.questionCount === 1 ? '1 Question' : `${collection.questionCount} Questions`;

    return (
        <div
            onClick={onClick}
            className="group border-border/70 bg-card hover:border-primary/35 relative flex h-full cursor-pointer flex-col rounded-xl border p-5 transition-all duration-200 hover:shadow-md"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="bg-primary/8 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                    <Database className="h-4 w-4" />
                </div>

                <div className="flex items-center gap-1">
                    {!isCreator && isSharedWithCurrentUser ? (
                        <Badge
                            variant="outline"
                            className="text-muted-foreground h-6 border-dashed px-2 text-[10px] font-medium tracking-wide uppercase"
                        >
                            Shared
                        </Badge>
                    ) : null}

                    {canManageCollection ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-foreground h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100"
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

            <div className="mt-4 flex flex-1 flex-col gap-2">
                <h3
                    className="text-foreground line-clamp-2 text-base leading-snug font-semibold tracking-tight"
                    title={collection.name}
                >
                    {collection.name}
                </h3>

                {collection.description ? (
                    <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                        {collection.description}
                    </p>
                ) : null}

                <div className="mt-auto space-y-1.5 pt-3">
                    {collection.author ? (
                        <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                            <User className="h-3 w-3 shrink-0 opacity-70" />
                            <span className="truncate">{collection.author}</span>
                        </div>
                    ) : null}
                    <div className="text-muted-foreground/80 flex items-center gap-1.5 text-xs">
                        <Clock className="h-3 w-3 shrink-0 opacity-70" />
                        <span>Updated {collection.lastUpdated}</span>
                    </div>
                </div>
            </div>

            <div className="border-border/50 mt-4 flex items-center justify-between gap-2 border-t pt-3">
                <Badge
                    variant="secondary"
                    className="bg-primary/5 text-primary gap-1.5 border-none px-2.5 py-0.5 font-normal"
                >
                    <Layers className="h-3 w-3" />
                    {questionLabel}
                </Badge>

                <Badge
                    variant="outline"
                    className={cn(
                        'gap-1 px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase',
                        collection.isPublic
                            ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400'
                            : 'text-muted-foreground border-border/70 bg-muted/40',
                    )}
                >
                    {collection.isPublic ? (
                        <Globe className="h-3 w-3" />
                    ) : (
                        <Lock className="h-3 w-3" />
                    )}
                    {collection.isPublic ? 'Public' : 'Private'}
                </Badge>
            </div>
        </div>
    );
}
