'use client';

import type { ReactNode, RefObject } from 'react';
import Link from 'next/link';
import { ArrowRight, Camera, CheckCircle2, Info, type LucideIcon } from 'lucide-react';
import { Badge, Button, cn } from '@sentinel/ui';
import { PRIVACY_POLICIES } from '@/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]/_constants/preview-constants';

export type StudentFlowHighlight = {
    label: string;
    value: string;
    icon: LucideIcon;
};

export type StudentFlowDisclosure = {
    label: string;
    desc: string;
    icon: LucideIcon;
};

export type StudentFlowCheckStatusItem = {
    label: string;
    description: string;
    state: PermissionState | 'granted' | 'idle' | 'blocked';
    icon: LucideIcon;
};

type StudentFlowFooterActionsProps = {
    primaryLabel: string;
    primaryHref?: string;
    primaryOnClick?: () => void;
    primaryDisabled?: boolean;
    primaryIcon?: LucideIcon;
    secondaryLabel?: string;
    secondaryHref?: string;
    title?: string;
    description?: string;
    children?: ReactNode;
};

type StudentFlowDevicePreviewPanelProps = {
    videoRef: RefObject<HTMLVideoElement | null>;
    overlayCanvasRef?: RefObject<HTMLCanvasElement | null>;
    streamActive: boolean;
    isRequesting: boolean;
    errorMessage: string | null;
    onRequestAccess: () => void;
    className?: string;
    supplementaryContent?: ReactNode;
};

/**
 * Renders the shared title and description block for student flow screens.
 */
export function StudentFlowPageHeader({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="space-y-2">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-[30px]">
                {title}
            </h1>
            <p className="text-muted-foreground text-sm leading-6 sm:text-[15px]">{description}</p>
        </div>
    );
}

/**
 * Renders the shared responsive highlights grid used across student flow screens.
 */
export function StudentFlowHighlightsList({
    highlights,
    className,
    columns = 4,
}: {
    highlights: StudentFlowHighlight[];
    columns?: number;
    className?: string;
}) {
    const gridColsClass =
        {
            2: 'sm:grid-cols-2',
            3: 'sm:grid-cols-3',
            4: 'sm:grid-cols-2 lg:grid-cols-4',
        }[columns] || 'sm:grid-cols-2 lg:grid-cols-4';

    return (
        <div className={cn('grid gap-x-8 gap-y-4 pt-2', gridColsClass, className)}>
            {highlights.map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                    <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl">
                        <item.icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.18em]">
                            {item.label}
                        </p>
                        <p className="text-foreground text-sm font-semibold sm:text-[15px]">
                            {item.value}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

/**
 * Provides a shared responsive grid for two-column student flow content.
 */
export function StudentFlowSplitLayout({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <section
            className={cn(
                'grid items-stretch gap-4 py-6 sm:gap-5 sm:py-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.9fr)] lg:gap-8 xl:gap-10',
                className,
            )}
        >
            {children}
        </section>
    );
}

/**
 * Wraps shared student flow cards and panels with a consistent responsive surface.
 */
export function StudentFlowPanel({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'border-border/60 bg-background flex h-full flex-col space-y-4 rounded-2xl border p-4 sm:p-5 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0',
                className,
            )}
        >
            {children}
        </div>
    );
}

/**
 * Renders the small section label used on side panels in the checkup flow.
 */
export function StudentFlowSideLabel({
    icon: Icon,
    label,
}: {
    icon: LucideIcon;
    label: string;
}) {
    return (
        <div className="flex items-center gap-2 px-1">
            <Icon className="text-primary h-4 w-4" />
            <h2 className="text-muted-foreground/80 text-[11px] font-bold tracking-[0.2em] uppercase">
                {label}
            </h2>
        </div>
    );
}

/**
 * Renders the shared student footer action area for flow navigation.
 */
export function StudentFlowFooterActions({
    primaryLabel,
    primaryHref,
    primaryOnClick,
    primaryDisabled = false,
    primaryIcon: PrimaryIcon = ArrowRight,
    secondaryLabel,
    secondaryHref,
    title,
    description,
    children,
}: StudentFlowFooterActionsProps) {
    const hasLeadingContent = Boolean(title || description || children);
    const hasSecondaryAction = Boolean(secondaryLabel && secondaryHref);

    return (
        <section
            className={`flex w-full flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center ${
                hasLeadingContent || hasSecondaryAction ? 'sm:justify-between' : 'sm:justify-end'
            }`}
        >
            {(title || description) && (
                <div className="max-w-2xl">
                    {title && <p className="text-sm font-semibold">{title}</p>}
                    {description && (
                        <p className="text-muted-foreground text-sm leading-6">{description}</p>
                    )}
                </div>
            )}

            {children && !title && !description && <div>{children}</div>}

            {!hasLeadingContent && hasSecondaryAction && secondaryLabel && secondaryHref && (
                <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-muted-foreground order-2 w-full justify-center sm:order-none sm:w-auto sm:justify-start"
                >
                    <Link href={secondaryHref}>{secondaryLabel}</Link>
                </Button>
            )}

            <div className="order-1 flex w-full flex-col-reverse gap-3 sm:order-none sm:w-auto sm:flex-row sm:items-center">
                {hasLeadingContent && secondaryLabel && secondaryHref && (
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-muted-foreground w-full justify-center sm:w-auto sm:justify-start"
                    >
                        <Link href={secondaryHref}>{secondaryLabel}</Link>
                    </Button>
                )}

                {primaryHref ? (
                    <Button
                        asChild
                        disabled={primaryDisabled}
                        className="h-10 w-full justify-center rounded-lg px-4 text-sm font-medium shadow-none sm:w-auto"
                    >
                        <Link href={primaryHref}>
                            {primaryLabel}
                            <PrimaryIcon className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                ) : (
                    <Button
                        type="button"
                        onClick={primaryOnClick}
                        disabled={primaryDisabled}
                        className="h-10 w-full justify-center rounded-lg px-4 text-sm font-medium shadow-none sm:w-auto"
                    >
                        {primaryLabel}
                        <PrimaryIcon className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
        </section>
    );
}

/**
 * Renders the shared readiness bullet list for student flow guidance.
 */
export function StudentFlowReadinessList({ items }: { items: string[] }) {
    return (
        <ul className="space-y-3">
            {items.map((item) => (
                <li
                    key={item}
                    className="text-muted-foreground flex items-start gap-3 text-sm leading-6"
                >
                    <CheckCircle2 className="text-primary mt-1 h-4 w-4 shrink-0" />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}

/**
 * Renders the privacy disclosure list used by student consent screens.
 */
export function StudentFlowDisclosureList({ items }: { items: StudentFlowDisclosure[] }) {
    return (
        <div className="space-y-5">
            {items.map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                    <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                        <item.icon className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-semibold">{item.label}</h3>
                        <p className="text-muted-foreground text-sm leading-6 sm:text-[15px]">
                            {item.desc}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

/**
 * Renders the shared privacy policy section list for student consent screens.
 */
export function StudentFlowPrivacyPolicySections() {
    return (
        <div className="space-y-4">
            <h2 className="text-base font-semibold sm:text-lg">Policies & terms</h2>
            <div className="space-y-4 text-sm leading-6 sm:text-[15px]">
                {PRIVACY_POLICIES.map((policy) => (
                    <div key={policy.title} className="space-y-1.5">
                        <p className="text-foreground font-semibold">{policy.title}</p>
                        <div className="text-muted-foreground">{policy.content}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * Renders the shared camera preview and permission CTA used in the checkup flow.
 */
export function StudentFlowDevicePreviewPanel({
    videoRef,
    overlayCanvasRef,
    streamActive,
    isRequesting,
    errorMessage,
    onRequestAccess,
    className,
    supplementaryContent,
}: StudentFlowDevicePreviewPanelProps) {
    return (
        <div className={cn('flex flex-col gap-6', className)}>
            <div className="border-border/60 relative aspect-[4/3] overflow-hidden rounded-2xl border bg-slate-950 shadow-md">
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                />
                <canvas
                    ref={overlayCanvasRef}
                    className="pointer-events-none absolute inset-0 h-full w-full"
                />

                {!streamActive ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 p-8 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-white/40 ring-1 ring-white/10">
                            <Camera className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">Camera Preview</h3>
                        <p className="mt-2 max-w-xs text-sm leading-6 text-white/60">
                            Allow camera and microphone access to verify your setup before
                            continuing.
                        </p>
                    </div>
                ) : null}
            </div>

            <div className="flex flex-col items-center gap-4">
                {supplementaryContent}

                <Button
                    type="button"
                    onClick={onRequestAccess}
                    disabled={isRequesting}
                    className="shadow-primary/10 h-12 w-full justify-center rounded-xl px-8 text-sm font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
                >
                    {isRequesting
                        ? 'Requesting permissions...'
                        : streamActive
                          ? 'Reset Device Access'
                          : 'Grant Device Permissions'}
                </Button>

                {errorMessage ? (
                    <p className="text-destructive animate-in fade-in slide-in-from-top-1 text-center text-sm font-medium">
                        {errorMessage}
                    </p>
                ) : (
                    <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
                        <Info className="h-3.5 w-3.5" />
                        <span>Grant access once, then verify your status below</span>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Renders the shared readiness state cards used in the device checkup flow.
 */
export function StudentFlowCheckupStatusCard({
    checks,
}: {
    checks: readonly StudentFlowCheckStatusItem[];
}) {
    return (
        <div className="space-y-4">
            {checks.map((item) => (
                <div
                    key={item.label}
                    className="group border-border/40 bg-background/50 hover:border-border/80 hover:bg-background relative flex flex-col gap-2 rounded-xl border p-4 shadow-sm transition-all"
                >
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="bg-primary/5 text-primary group-hover:bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg transition-colors">
                                <item.icon className="h-4.5 w-4.5" />
                            </div>
                            <p className="text-sm font-semibold">{item.label}</p>
                        </div>

                        <Badge
                            variant={
                                item.state === 'granted'
                                    ? 'secondary'
                                    : item.state === 'blocked'
                                      ? 'destructive'
                                      : 'outline'
                            }
                            className="h-5.5 px-2.5 text-[10px] font-bold tracking-wider uppercase"
                        >
                            {item.state === 'granted'
                                ? 'Ready'
                                : item.state === 'blocked'
                                  ? 'Blocked'
                                  : 'Pending'}
                        </Badge>
                    </div>

                    <p className="text-muted-foreground text-xs leading-5">{item.description}</p>
                </div>
            ))}
        </div>
    );
}
