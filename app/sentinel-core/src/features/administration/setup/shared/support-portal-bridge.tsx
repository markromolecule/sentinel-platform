'use client';

import { ArrowUpRight, Info, Lock, Settings } from 'lucide-react';
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Alert,
    AlertDescription,
    AlertTitle,
} from '@sentinel/ui';
import { useAcademicScope } from '@/hooks/use-academic-scope';
import { useCoreAdminCapabilities } from '@/hooks/use-core-admin-capabilities';
import { getSupportPortalUrl } from '@/lib/support-portal';

export interface SupportPortalBridgeProps {
    title: string;
    description: string;
    resourceKey: 'institutions' | 'departments' | 'semesters';
}

/**
 * A capability-driven bridge component that provides a unified visual experience
 * for resources owned by the Sentinel Support portal. It dynamically adjusts its
 * layout, labels, and actions depending on whether the active user has read-only or
 * management capabilities.
 */
export function SupportPortalBridge({
    title,
    description,
    resourceKey,
}: SupportPortalBridgeProps) {
    const { isReadOnlyFor } = useAcademicScope();
    const { canViewPage, isLoading } = useCoreAdminCapabilities();

    const isReadOnly = isReadOnlyFor(resourceKey);
    const supportUrl = `${getSupportPortalUrl()}/${resourceKey}`;
    const hasViewPermission = canViewPage(resourceKey);

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!hasViewPermission) {
        return (
            <div className="mx-auto max-w-2xl p-4 md:p-6">
                <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                    <Lock className="h-5 w-5" />
                    <AlertTitle className="ml-2 font-bold text-destructive">Access Denied</AlertTitle>
                    <AlertDescription className="mt-2 text-sm text-destructive/80">
                        You do not have the required permissions to view this resource.
                        Please contact your administrator if you believe this is in error.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
            <Card className="border-muted/40 bg-card/50 shadow-lg backdrop-blur-sm">
                <CardHeader className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 text-primary rounded-lg p-2">
                            <Settings className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold">{title}</CardTitle>
                            <CardDescription className="text-muted-foreground text-sm">
                                {description}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        To maintain system integrity and a singular database workflow, settings for{' '}
                        <strong className="text-foreground capitalize">{resourceKey}</strong> are managed centrally within the
                        Sentinel Support Portal. You can access the official workspace below to perform any authorized actions.
                    </p>

                    {isReadOnly ? (
                        <Alert className="border-sky-500/20 bg-sky-500/5 dark:bg-sky-500/[0.02]">
                            <Info className="h-5 w-5 text-sky-500" />
                            <AlertTitle className="ml-2 font-semibold text-sky-600 dark:text-sky-400">
                                Read-Only Access Mode
                            </AlertTitle>
                            <AlertDescription className="mt-2 text-sm text-sky-700/80 dark:text-sky-300/80">
                                You are authorized with read-only capabilities for this setup portal. You can browse and review settings, but any create, edit, or delete actions will be locked.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <Alert className="border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/[0.02]">
                            <Settings className="h-5 w-5 text-emerald-500" />
                            <AlertTitle className="ml-2 font-semibold text-emerald-600 dark:text-emerald-400">
                                Management Access Mode
                            </AlertTitle>
                            <AlertDescription className="mt-2 text-sm text-emerald-700/80 dark:text-emerald-300/80">
                                You are authorized with active management privileges. You can fully create, update, or decommission records within the Support Portal workspace.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
                <CardFooter className="bg-muted/10 flex flex-col gap-3 rounded-b-xl border-t p-6 sm:flex-row sm:justify-end">
                    <Button
                        asChild
                        variant={isReadOnly ? 'secondary' : 'default'}
                        className="group flex w-full items-center justify-center font-medium sm:w-auto"
                    >
                        <a href={supportUrl} target="_blank" rel="noopener noreferrer">
                            {isReadOnly ? 'View in Support Portal' : 'Open Support Portal Manager'}
                            <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </a>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
