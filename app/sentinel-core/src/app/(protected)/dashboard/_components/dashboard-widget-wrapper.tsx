'use client';

import { ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { DashboardWidgetId } from '@sentinel/shared/types';
import { cn } from '@sentinel/ui';

interface DashboardWidgetWrapperProps {
    id: DashboardWidgetId;
    children: ReactNode;
    className?: string;
}

/**
 * A wrapper component that makes a dashboard widget sortable.
 * Connects with @dnd-kit/sortable and positions a floating drag handle in the top right.
 *
 * @param props.id The unique identifier of the widget.
 * @param props.children The widget content to render.
 * @param props.className Optional additional class names.
 */
export function DashboardWidgetWrapper({ id, children, className }: DashboardWidgetWrapperProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'relative transition-all',
                isDragging ? 'opacity-60 z-50' : '',
                className
            )}
        >
            <div
                {...attributes}
                {...listeners}
                className="absolute top-4 right-4 z-40 flex h-7 w-7 cursor-grab items-center justify-center rounded-md border bg-background/80 hover:bg-accent text-muted-foreground transition-colors active:cursor-grabbing shadow-xs"
                aria-label={`Drag handle for widget ${id}`}
            >
                <GripVertical className="h-3.5 w-3.5" />
            </div>

            {children}
        </div>
    );
}
