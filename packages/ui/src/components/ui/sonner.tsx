'use client';

import {
    CircleCheckIcon,
    InfoIcon,
    Loader2Icon,
    OctagonXIcon,
    TriangleAlertIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = 'system' } = useTheme();

    return (
        <Sonner
            theme={theme as ToasterProps['theme']}
            className="toaster group"
            position="top-right"
            richColors
            expand={true}
            toastOptions={{
                classNames: {
                    toast: 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl group-[.toaster]:border-2',
                    description: 'group-[.toast]:text-muted-foreground',
                    actionButton:
                        'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
                    cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
                    success:
                        'group-[.toaster]:!bg-green-50 group-[.toaster]:!text-green-700 group-[.toaster]:!border-green-200 dark:group-[.toaster]:!bg-green-950 dark:group-[.toaster]:!text-green-300 dark:group-[.toaster]:!border-green-900',
                    error: 'group-[.toaster]:!bg-red-50 group-[.toaster]:!text-red-700 group-[.toaster]:!border-red-200 dark:group-[.toaster]:!bg-red-950 dark:group-[.toaster]:!text-red-300 dark:group-[.toaster]:!border-red-900',
                },
            }}
            icons={{
                success: <CircleCheckIcon className="size-5" />,
                info: <InfoIcon className="size-5" />,
                warning: <TriangleAlertIcon className="size-5" />,
                error: <OctagonXIcon className="size-5" />,
                loading: <Loader2Icon className="size-5 animate-spin" />,
            }}
            style={
                {
                    '--normal-bg': 'var(--popover)',
                    '--normal-text': 'var(--popover-foreground)',
                    '--normal-border': 'var(--border)',
                    '--border-radius': 'var(--radius)',
                } as React.CSSProperties
            }
            {...props}
        />
    );
};

export { Toaster };
