import type { ReactNode } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@sentinel/ui';
import { SectionHeader } from './shared-ui';

export function RowActions({ onRemove, disabled }: { onRemove: () => void; disabled?: boolean }) {
    return (
        <Button type="button" variant="ghost" size="icon" onClick={onRemove} disabled={disabled}>
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Remove row</span>
        </Button>
    );
}

export function RowsSection({
    title,
    countLabel,
    onAdd,
    secondaryAction,
    children,
}: {
    title: string;
    countLabel: string;
    onAdd?: () => void;
    secondaryAction?: ReactNode;
    children: ReactNode;
}) {
    return (
        <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <SectionHeader title={title} countLabel={countLabel} />
                <div className="flex gap-2">
                    {secondaryAction}
                    {onAdd ? (
                        <Button type="button" variant="outline" onClick={onAdd}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Row
                        </Button>
                    ) : null}
                </div>
            </div>
            <div className="space-y-3">{children}</div>
        </section>
    );
}
