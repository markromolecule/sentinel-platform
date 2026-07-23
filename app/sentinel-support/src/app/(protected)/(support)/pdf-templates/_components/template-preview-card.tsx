'use client';

import * as React from 'react';
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    cn,
} from '@sentinel/ui';
import { Eye, ExternalLink } from 'lucide-react';

type TemplatePreviewCardProps = {
    isGenerating: boolean;
    onGeneratePreview: () => void;
    variant?: 'card' | 'panel' | 'inline';
    className?: string;
};

export function TemplatePreviewCard({
    isGenerating,
    onGeneratePreview,
    variant = 'card',
    className,
}: TemplatePreviewCardProps) {
    const content = (
        <>
            <div className="space-y-3">
                <div className="space-y-1">
                    <p className="text-foreground/80 text-[11px] font-semibold tracking-[0.14em] uppercase">
                        Preview
                    </p>
                    <h3 className="text-sm font-semibold">Open PDF in a new tab</h3>
                </div>
                <Button
                    size="sm"
                    className="w-full"
                    onClick={onGeneratePreview}
                    disabled={isGenerating}
                >
                    <Eye className="mr-2 h-4 w-4" />
                    {isGenerating ? 'Generating preview...' : 'Generate preview'}
                    {!isGenerating ? <ExternalLink className="ml-2 h-4 w-4" /> : null}
                </Button>
            </div>
        </>
    );

    if (variant === 'panel') {
        return (
            <section className={cn('bg-background rounded-2xl border p-4', className)}>
                {content}
            </section>
        );
    }

    if (variant === 'inline') {
        return <section className={cn('space-y-3', className)}>{content}</section>;
    }

    return (
        <Card className={cn('overflow-hidden', className)}>
            <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                    Render a sample PDF using the current form values before publishing.
                </CardDescription>
            </CardHeader>
            <CardContent>{content}</CardContent>
        </Card>
    );
}
