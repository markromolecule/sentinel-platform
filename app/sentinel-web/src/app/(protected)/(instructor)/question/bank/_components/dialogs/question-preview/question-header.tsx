'use client';

import { Badge, SheetDescription, SheetHeader, SheetTitle } from '@sentinel/ui';
import { Calendar } from 'lucide-react';

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
export function QuestionHeader({ typeLabel, tags, prompt, timeAgo, points }: QuestionHeaderProps) {
    return (
        <SheetHeader className="px-5 pb-5 text-left sm:px-6">
            <div className="mb-2 flex flex-wrap items-center gap-2 pt-4">
                <Badge variant="secondary" className="text-[10px] tracking-wider uppercase">
                    {typeLabel}
                </Badge>
                <div className="flex flex-wrap gap-1">
                    {tags.map((tag) => (
                        <Badge
                            key={tag}
                            variant="outline"
                            className="border-primary/20 bg-primary/5 px-1 py-0 text-[10px]"
                        >
                            {tag}
                        </Badge>
                    ))}
                    {tags.length === 0 && (
                        <span className="text-muted-foreground text-[10px] italic">No tags</span>
                    )}
                </div>
            </div>
            <SheetTitle className="text-lg leading-tight text-zinc-900 sm:text-xl dark:text-zinc-50">
                {prompt}
            </SheetTitle>
            <SheetDescription className="flex flex-wrap items-center gap-3 pt-2">
                <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Calendar className="h-3.5 w-3.5" />
                    Created {timeAgo}
                </span>
                <span className="text-primary text-xs font-semibold">{points} Points</span>
            </SheetDescription>
        </SheetHeader>
    );
}
