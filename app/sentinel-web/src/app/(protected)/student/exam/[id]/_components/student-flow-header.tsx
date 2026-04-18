'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button, cn } from '@sentinel/ui';

type StudentFlowHeaderProps = {
    maxWidthClassName?: string;
    showBackButton?: boolean;
};

export function StudentFlowHeader({
    maxWidthClassName = 'max-w-4xl',
    showBackButton = false,
}: StudentFlowHeaderProps) {
    if (!showBackButton) {
        return null;
    }

    return (
        <header className="bg-background mb-3 sm:mb-4">
            <div
                className={cn(
                    'mx-auto flex w-full px-4 pt-4 sm:px-6 sm:pt-5 lg:px-8',
                    maxWidthClassName,
                )}
            >
                <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-muted-foreground -ml-2 h-8 w-fit gap-2 px-2"
                >
                    <Link href="/student/exam">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="text-sm font-medium">Back to Exams</span>
                    </Link>
                </Button>
            </div>
        </header>
    );
}
