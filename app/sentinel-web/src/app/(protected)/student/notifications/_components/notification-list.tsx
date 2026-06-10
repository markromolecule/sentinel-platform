'use client';

import { DataTable } from '@sentinel/ui';
import { Button } from '@sentinel/ui';
import { columns } from './columns';
import { Notification } from '@sentinel/shared/types';
import { Trash2 } from 'lucide-react';

interface NotificationListProps {
    notifications: Notification[];
    rowSelection: Record<string, boolean>;
    onRowSelectionChange: (selection: Record<string, boolean>) => void;
    onDeleteSelected: () => void;
    isDeleting?: boolean;
    isLoading?: boolean;
}

export function NotificationList({
    notifications,
    rowSelection,
    onRowSelectionChange,
    onDeleteSelected,
    isDeleting = false,
    isLoading = false,
}: NotificationListProps) {
    const selectedCount = Object.values(rowSelection).filter(Boolean).length;

    return (
        <div className="space-y-4">
            <DataTable
                columns={columns}
                data={notifications}
                searchKey="title"
                searchPlaceholder="Search notifications..."
                rowSelection={rowSelection}
                onRowSelectionChange={onRowSelectionChange}
                isLoading={isLoading}
                emptyContent="No notifications yet."
            />

            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
                <div className="text-muted-foreground text-sm">
                    {selectedCount > 0
                        ? `${selectedCount} selected`
                        : 'Select notifications to remove them in bulk.'}
                </div>
                <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={onDeleteSelected}
                    disabled={selectedCount === 0 || isDeleting}
                    aria-label="Remove selected notifications"
                >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">
                        {isDeleting ? 'Removing selected notifications' : 'Remove selected notifications'}
                    </span>
                </Button>
            </div>
        </div>
    );
}
