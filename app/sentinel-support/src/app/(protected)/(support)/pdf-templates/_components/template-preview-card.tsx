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
import { Download, Eye } from 'lucide-react';

type TemplatePreviewCardProps = {
    previewBlob: Blob | null;
    isGenerating: boolean;
    onGeneratePreview: () => void;
    variant?: 'card' | 'panel';
    className?: string;
};

export function TemplatePreviewCard({
    previewBlob,
    isGenerating,
    onGeneratePreview,
    variant = 'card',
    className,
}: TemplatePreviewCardProps) {
    const previewUrl = React.useMemo(
        () => (previewBlob ? URL.createObjectURL(previewBlob) : null),
        [previewBlob],
    );

    React.useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const content = (
        <>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h3 className="text-base font-semibold">Preview</h3>
                    <p className="text-muted-foreground text-sm">
                        Render a sample PDF using the current form values before publishing.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={onGeneratePreview} disabled={isGenerating}>
                        <Eye className="mr-2 h-4 w-4" />
                        {isGenerating ? 'Generating...' : 'Generate preview'}
                    </Button>
                    {previewUrl ? (
                        <Button variant="outline" asChild>
                            <a href={previewUrl} download="pdf-template-preview.pdf">
                                <Download className="mr-2 h-4 w-4" />
                                Download preview
                            </a>
                        </Button>
                    ) : null}
                </div>
            </div>

            {previewUrl ? (
                <iframe
                    title="PDF preview"
                    src={previewUrl}
                    className="mt-4 h-[720px] w-full rounded-xl border bg-white"
                />
            ) : (
                <div className="text-muted-foreground mt-4 flex h-[420px] items-center justify-center rounded-xl border border-dashed text-sm">
                    Generate a preview to inspect the current header and footer layout.
                </div>
            )}
        </>
    );

    if (variant === 'panel') {
        return (
            <section className={cn('bg-background rounded-2xl border p-4', className)}>
                {content}
            </section>
        );
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
