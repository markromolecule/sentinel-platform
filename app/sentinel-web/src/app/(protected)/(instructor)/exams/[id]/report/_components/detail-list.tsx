import * as React from 'react';

type DetailListProps = {
    title: string;
    items: Array<{ key: string; label: string; count: number }>;
    emptyMessage: string;
    renderValue?: (count: number) => React.ReactNode;
};

/**
 * Renders a list of detailed items or key-value properties.
 * Displays a structured card layout or an empty message if no data exists.
 */
export function DetailList({ title, items, emptyMessage, renderValue }: DetailListProps) {
    return (
        <div className="space-y-3">
            <h3 className="text-sm font-semibold">{title}</h3>
            {items.length === 0 ? (
                <p className="text-muted-foreground text-sm">{emptyMessage}</p>
            ) : (
                <div className="divide-y rounded-xl border">
                    {items.map((item) => (
                        <div
                            key={item.key}
                            className="flex items-center justify-between gap-3 px-4 py-3"
                        >
                            <span className="text-sm font-medium">{item.label}</span>
                            <span className="text-muted-foreground text-sm">
                                {renderValue ? renderValue(item.count) : item.count}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
