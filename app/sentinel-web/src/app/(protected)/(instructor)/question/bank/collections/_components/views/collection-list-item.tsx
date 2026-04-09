"use client";

import { 
    Badge, 
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger 
} from "@sentinel/ui";
import { Database, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Collection } from "@/app/(protected)/(instructor)/question/bank/collections/_types";

interface CollectionListItemProps {
    collection: Collection;
    onOpen?: () => void;
    onDelete?: (id: string) => void;
    onEdit?: (collection: Collection) => void;
}

export function CollectionListItem({ collection, onOpen, onDelete, onEdit }: CollectionListItemProps) {
    return (
        <div
            className="group bg-white dark:bg-zinc-900 border border-border hover:border-primary/40 hover:shadow-md transition-all rounded-2xl p-4 cursor-pointer flex items-center justify-between"
            onClick={onOpen}
        >
            <div className="flex min-w-0 items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Database className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                    <h3
                        className="truncate font-semibold text-zinc-900 dark:text-zinc-100"
                        title={collection.name}
                    >
                        {collection.name}
                    </h3>
                    <p className="truncate text-xs text-zinc-500">Updated {collection.lastUpdated}</p>
                </div>
            </div>

            <div className="ml-4 flex shrink-0 items-center gap-6">
                <Badge variant="secondary" className="bg-primary/5 text-primary border-none">
                    {collection.questionCount} Questions
                </Badge>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8" onClick={(e) => {
                        e.stopPropagation();
                        onOpen?.();
                    }}>
                        Open
                    </Button>
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem
                                onClick={() => onEdit?.(collection)}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <Pencil className="w-4 h-4" />
                                Edit Collection
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                variant="destructive" 
                                onClick={() => onDelete?.(collection.id)}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Collection
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}
