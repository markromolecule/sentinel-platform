"use client";

import { Badge, Button } from "@sentinel/ui";
import { Database, MoreVertical } from "lucide-react";
import { Collection } from "@/app/(protected)/(instructor)/question/bank/collections/_types";

interface CollectionCardProps {
    collection: Collection;
    onClick?: () => void;
}

export function CollectionCard({ collection, onClick }: CollectionCardProps) {
    return (
        <div
            onClick={onClick}
            className="group bg-white dark:bg-zinc-900 border border-border hover:border-primary/40 hover:shadow-lg transition-all rounded-2xl p-4 cursor-pointer flex flex-col gap-4 h-full"
        >
            <div className="flex items-start justify-between w-full">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Database className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{collection.name}</h3>
                        <p className="text-xs text-zinc-500">Updated {collection.lastUpdated}</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                    <MoreVertical className="w-4 h-4" />
                </Button>
            </div>

            <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/50">
                <Badge variant="secondary" className="bg-primary/5 text-primary border-none">
                    {collection.questionCount} Questions
                </Badge>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${collection.isPublic ? 'text-green-500' : 'text-zinc-400'}`}>
                    {collection.isPublic ? 'Public' : 'Private'}
                </span>
            </div>
        </div>
    );
}
