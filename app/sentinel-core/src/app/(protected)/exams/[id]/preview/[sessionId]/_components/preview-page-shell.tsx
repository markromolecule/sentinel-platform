'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Badge, Button, cn } from '@sentinel/ui';
import { ArrowLeft, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

export type PreviewStepId = 'instruction' | 'privacy' | 'checkup' | 'lobby' | 'attempt';

export const PREVIEW_STEPS: Array<{ id: PreviewStepId; label: string }> = [
    { id: 'instruction', label: 'Instruction' },
    { id: 'privacy', label: 'Privacy' },
    { id: 'checkup', label: 'Checkup' },
    { id: 'lobby', label: 'Lobby' },
    { id: 'attempt', label: 'Attempt' },
];

export function buildPreviewHref(examId: string, sessionId: string, step: PreviewStepId) {
    return `/exams/${examId}/preview/${sessionId}/${step}`;
}

type PreviewPageShellProps = {
    examId: string;
    sessionId: string;
    examTitle: string;
    step: PreviewStepId;
    title: string;
    description: string;
    children: ReactNode;
    footer?: ReactNode;
    viewportClassName?: string;
    frameClassName?: string;
    bodyClassName?: string;
};

export function PreviewPageShell({
    examId,
    sessionId,
    examTitle,
    step,
    title,
    description,
    children,
    footer,
    viewportClassName,
    frameClassName,
    bodyClassName,
}: PreviewPageShellProps) {
    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,_rgba(248,250,252,1)_0%,_rgba(241,245,249,1)_100%)]">
            <div
                className={cn(
                    'mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8',
                    viewportClassName,
                )}
            >
                <div className="border-border/60 bg-background/90 mb-6 rounded-3xl border px-5 py-4 shadow-sm backdrop-blur sm:px-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <Button variant="ghost" size="sm" asChild className="h-8 px-2">
                                <Link href={`/exams/${examId}/builder`}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to builder
                                </Link>
                            </Button>

                            <Badge
                                variant="outline"
                                className="border-primary/15 bg-primary/5 text-primary"
                            >
                                <Eye className="mr-1.5 h-3.5 w-3.5" />
                                Instructor preview
                            </Badge>
                        </div>

                        <div className="space-y-1">
                            <p className="text-muted-foreground text-xs tracking-[0.18em] uppercase">
                                Student flow simulation
                            </p>
                            <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
                                {examTitle}
                            </h1>
                            <p className="text-muted-foreground text-sm leading-6">{description}</p>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-5">
                            {PREVIEW_STEPS.map((item, index) => {
                                const isActive = item.id === step;

                                return (
                                    <Link
                                        key={item.id}
                                        href={buildPreviewHref(examId, sessionId, item.id)}
                                        className={cn(
                                            'rounded-2xl border px-4 py-3 transition',
                                            isActive
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-border/60 bg-background hover:bg-muted/50',
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={cn(
                                                    'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold',
                                                    isActive
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-muted text-foreground',
                                                )}
                                            >
                                                {index + 1}
                                            </span>
                                            <span className="text-sm font-medium">
                                                {item.label}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div
                    className={cn(
                        'border-border/60 bg-background flex flex-1 flex-col overflow-hidden rounded-[32px] border shadow-[0_24px_70px_-36px_rgba(15,23,42,0.35)]',
                        frameClassName,
                    )}
                >
                    <div className="border-border/60 border-b px-6 py-6 sm:px-8">
                        <p className="text-primary text-[11px] font-semibold tracking-[0.18em] uppercase">
                            {title}
                        </p>
                    </div>
                    <div className={cn('min-h-0 flex-1', bodyClassName)}>{children}</div>
                    {footer ? (
                        <div className="border-border/60 border-t px-6 py-4 sm:px-8">{footer}</div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

type PreviewFooterNavProps = {
    examId: string;
    sessionId: string;
    previousStep?: PreviewStepId;
    nextStep?: PreviewStepId;
    nextLabel?: string;
};

export function PreviewFooterNav({
    examId,
    sessionId,
    previousStep,
    nextStep,
    nextLabel,
}: PreviewFooterNavProps) {
    return (
        <div className="flex items-center justify-between gap-3">
            <div>
                {previousStep ? (
                    <Button asChild variant="outline">
                        <Link href={buildPreviewHref(examId, sessionId, previousStep)}>
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Previous
                        </Link>
                    </Button>
                ) : null}
            </div>

            <div>
                {nextStep ? (
                    <Button asChild>
                        <Link href={buildPreviewHref(examId, sessionId, nextStep)}>
                            {nextLabel ?? 'Next'}
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                ) : null}
            </div>
        </div>
    );
}
