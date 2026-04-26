import { Alert, AlertDescription, AlertTitle, EmptyState } from '@sentinel/ui';
import { AlertCircle, Loader2, ShieldAlert } from 'lucide-react';

export function AccessControlLoadingState({
    label = 'Loading access control...',
}: {
    label?: string;
}) {
    return (
        <div className="flex min-h-64 items-center justify-center">
            <div className="text-muted-foreground flex items-center gap-3 text-sm">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{label}</span>
            </div>
        </div>
    );
}

export function AccessControlErrorState({
    title = 'Unable to load access control',
    message,
}: {
    title?: string;
    message?: string;
}) {
    return (
        <Alert className="border-destructive/30 bg-destructive/5">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>
                {message || 'Please verify the RBAC schema and API endpoints, then try again.'}
            </AlertDescription>
        </Alert>
    );
}

export function AccessControlEmptyState({
    title,
    description,
    action,
}: {
    title: string;
    description: string;
    action?: React.ReactNode;
}) {
    return (
        <EmptyState
            icon={<ShieldAlert />}
            title={title}
            description={description}
            action={action}
            className="h-[280px]"
        />
    );
}
