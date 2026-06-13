'use client';

import Link from 'next/link';
import { Badge, Button } from '@sentinel/ui';
import { ArrowLeft } from 'lucide-react';

type PreviewHeaderProps = {
    examId: string;
    badgeLabel?: string;
};

export function PreviewHeader({ examId, badgeLabel = 'Orientation' }: PreviewHeaderProps) {
    return (
        <header className="bg-background/95 sticky top-0 z-20 -mt-6 mb-8 border-b backdrop-blur">
            <div className="flex h-14 items-center justify-between px-6">
                <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-muted-foreground -ml-2 h-8 gap-2 px-2"
                >
                    <Link href={`/exams/${examId}/builder`}>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="text-sm font-medium">Back to Builder</span>
                    </Link>
                </Button>

                <Badge
                    variant="outline"
                    className="border-border/70 bg-background text-[11px] font-medium"
                >
                    {badgeLabel}
                </Badge>
            </div>
        </header>
    );
}
