'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

/**
 * VisuallyHidden is a component that hides its children from the screen
 * but keeps them accessible to screen readers.
 * Uses the Tailwind 'sr-only' utility class.
 */
function VisuallyHidden({
    children,
    className,
    ...props
}: React.ComponentProps<'span'>) {
    return (
        <span className={cn('sr-only', className)} {...props}>
            {children}
        </span>
    );
}

export { VisuallyHidden };
