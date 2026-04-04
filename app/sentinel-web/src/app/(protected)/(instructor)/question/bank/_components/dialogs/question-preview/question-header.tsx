"use client";

import {
    Badge,
    SheetDescription,
    SheetHeader,
    SheetTitle
} from "@sentinel/ui";
import { Calendar } from "lucide-react";

interface QuestionHeaderProps {
    typeLabel: string;
    tags: string[];
    prompt: string;
    timeAgo: string;
    points: number;
}

/*
 * Renders the header section of the question preview.
 */
export function QuestionHeader({
    typeLabel,
    tags,
    prompt,
    timeAgo,
    points
}: QuestionHeaderProps) {
    return (
        <SheetHeader className="pb-6 px-8 text-left">
            <div className="flex items-center gap-2 mb-2 pt-4">
                <Badge variant="secondary" className="uppercase text-[10px] tracking-wider">
                    {typeLabel}
                </Badge>
                <div className="flex gap-1">
                    {tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px] py-0 px-1 border-primary/20 bg-primary/5">
                            {tag}
                        </Badge>
                    ))}
                    {tags.length === 0 && (
                        <span className="text-[10px] text-muted-foreground italic">No tags</span>
                    )}
                </div>
            </div>
            <SheetTitle className="text-xl leading-tight text-zinc-900 dark:text-zinc-50">
                {prompt}
            </SheetTitle>
            <SheetDescription className="flex items-center gap-4 pt-2">
                <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Calendar className="h-3.5 w-3.5" />
                    Created {timeAgo}
                </span>
                <span className="text-xs font-semibold text-primary">
                    {points} Points
                </span>
            </SheetDescription>
        </SheetHeader>
    );
}
