import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, cn } from '@sentinel/ui';
import type { PdfTemplate } from '@/data';

type TemplateStatusCardProps = {
    template: PdfTemplate | null;
    scopeLabel: string;
    hasUnsavedChanges: boolean;
    variant?: 'card' | 'inline';
    className?: string;
};

function TemplateStatusContent({
    template,
    scopeLabel,
    hasUnsavedChanges,
}: Omit<TemplateStatusCardProps, 'variant' | 'className'>) {
    return (
        <>
            <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{scopeLabel}</Badge>
                <Badge variant="outline">Version {template?.version ?? 1}</Badge>
                <Badge variant="outline">{template?.status ?? 'DRAFT'}</Badge>
                {hasUnsavedChanges ? <Badge variant="outline">Unsaved changes</Badge> : null}
            </div>
            <div className="text-muted-foreground text-sm">
                {template ? (
                    <>
                        Last updated{' '}
                        {template.updated_at
                            ? new Date(template.updated_at).toLocaleString()
                            : 'recently'}
                        .
                    </>
                ) : (
                    <>No template has been saved yet for this scope.</>
                )}
            </div>
        </>
    );
}

export function TemplateStatusCard({
    template,
    scopeLabel,
    hasUnsavedChanges,
    variant = 'card',
    className,
}: TemplateStatusCardProps) {
    if (variant === 'inline') {
        return (
            <div className={cn('space-y-2', className)}>
                <p className="text-sm font-medium">Template status</p>
                <TemplateStatusContent
                    template={template}
                    scopeLabel={scopeLabel}
                    hasUnsavedChanges={hasUnsavedChanges}
                />
            </div>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Template status</CardTitle>
                <CardDescription>
                    Current scope, version, and whether the editor has unpublished local changes.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <TemplateStatusContent
                    template={template}
                    scopeLabel={scopeLabel}
                    hasUnsavedChanges={hasUnsavedChanges}
                />
            </CardContent>
        </Card>
    );
}
