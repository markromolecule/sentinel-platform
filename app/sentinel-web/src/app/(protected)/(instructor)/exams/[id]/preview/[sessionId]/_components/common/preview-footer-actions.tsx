'use client';

import Link from 'next/link';
import { Button } from '@sentinel/ui';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface PreviewFooterActionsProps {
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
}

export function PreviewFooterActions({
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
}: PreviewFooterActionsProps) {
    return (
        <section className="flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
            {(title || description) && (
                <div>
                    {title && <p className="text-sm font-semibold">{title}</p>}
                    {description && (
                        <p className="text-muted-foreground text-sm leading-6">{description}</p>
                    )}
                </div>
            )}

            {children && !title && !description && <div>{children}</div>}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {secondaryLabel && secondaryHref && (
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
