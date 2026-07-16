'use client';

import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Input,
    cn,
} from '@sentinel/ui';
import type { InstitutionPdfBranding } from '@/data';

type BrandingUploadCardProps = {
    branding?: InstitutionPdfBranding | null;
    disabled?: boolean;
    onUpload: (file: File) => void;
    onRemove: () => void;
    isUploading?: boolean;
    isRemoving?: boolean;
    variant?: 'card' | 'panel';
    className?: string;
    globalMessage?: string | null;
};

export function BrandingUploadCard({
    branding,
    disabled,
    onUpload,
    onRemove,
    isUploading,
    isRemoving,
    variant = 'card',
    className,
    globalMessage,
}: BrandingUploadCardProps) {
    const content = globalMessage ? (
        <div className="text-muted-foreground rounded-xl border border-dashed p-4 text-sm">
            {globalMessage}
        </div>
    ) : (
        <div className="space-y-4">
            <div className="grid gap-2">
                <Input
                    type="file"
                    accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml"
                    disabled={disabled || isUploading}
                    onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                            onUpload(file);
                            event.currentTarget.value = '';
                        }
                    }}
                />
                <p className="text-muted-foreground text-xs">
                    Use a clean SVG or high-resolution PNG for best PDF output.
                </p>
            </div>

            {branding ? (
                <div className="rounded-xl border p-3 text-sm">
                    <p className="font-medium">{branding.logo_original_name}</p>
                    <p className="text-muted-foreground mt-1">
                        {branding.logo_mime_type} • {branding.logo_size_bytes.toLocaleString()}{' '}
                        bytes
                    </p>
                    <Button
                        variant="outline"
                        className="mt-3"
                        disabled={disabled || isRemoving}
                        onClick={onRemove}
                    >
                        {isRemoving ? 'Removing...' : 'Remove logo'}
                    </Button>
                </div>
            ) : (
                <div className="text-muted-foreground rounded-xl border border-dashed p-4 text-sm">
                    No institution logo uploaded yet.
                </div>
            )}
        </div>
    );

    if (variant === 'panel') {
        return (
            <section className={cn('bg-background space-y-4 rounded-2xl border p-4', className)}>
                <div>
                    <h3 className="text-base font-semibold">Institution branding</h3>
                    <p className="text-muted-foreground text-sm">
                        Upload one institution logo for PDF headers. Supported staff can replace or
                        remove it.
                    </p>
                </div>
                {content}
            </section>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Institution branding</CardTitle>
                <CardDescription>
                    Upload one institution logo for PDF headers. Supported staff can replace or
                    remove it.
                </CardDescription>
            </CardHeader>
            <CardContent>{content}</CardContent>
        </Card>
    );
}
