import * as React from 'react';
import { Spinner } from './spinner';
import { cn } from '../../lib/utils';

export interface LoadingStateProps extends React.ComponentProps<'div'> {
    message?: string;
}

export function LoadingState({
    message = 'Loading details...',
    className,
    ...props
}: LoadingStateProps) {
    return (
        <div
            data-slot="loading-state"
            className={cn(
                'animate-in fade-in flex min-h-[400px] flex-col items-center justify-center gap-4 duration-500',
                className,
            )}
            {...props}
        >
            <div className="relative flex items-center justify-center">
                <Spinner className="size-10 text-[#323d8f]" />
                <div className="absolute size-16 animate-pulse rounded-full border-4 border-[#323d8f]/10" />
            </div>
            <p className="text-muted-foreground/80 animate-pulse text-sm font-medium">{message}</p>
        </div>
    );
}
