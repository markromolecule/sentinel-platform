import { EmptyState } from './empty';

interface PermissionDeniedStateProps {
    action?: string;
    className?: string;
    description?: string;
    resourceName: string;
    title?: string;
}

function getPermissionDescription(resourceName: string, action: string) {
    return `Your role no longer has permission to ${action} ${resourceName}. Contact support if you need access restored.`;
}

function getPermissionTitle(resourceName: string) {
    const normalizedResourceName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1);
    return `${normalizedResourceName} access unavailable`;
}

export function PermissionDeniedState({
    action = 'view',
    className,
    description,
    resourceName,
    title,
}: PermissionDeniedStateProps) {
    return (
        <EmptyState
            icon="🔒"
            title={title ?? getPermissionTitle(resourceName)}
            description={description ?? getPermissionDescription(resourceName, action)}
            className={className}
        />
    );
}
