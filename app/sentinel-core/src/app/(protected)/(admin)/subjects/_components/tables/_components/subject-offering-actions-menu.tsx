'use client';

import { type ReactNode } from 'react';
import { Copy, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { type SubjectOffering } from '@sentinel/shared/types';
import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@sentinel/ui';

interface SubjectOfferingActionsMenuProps {
    offering: SubjectOffering;
    statusLabel: string;
    statusIcon: ReactNode;
    statusClassName: string;
    onOfferAgain: () => void;
    onStatusChange: () => void;
    onUnoffer: () => void;
}

export function SubjectOfferingActionsMenu({
    offering,
    statusLabel,
    statusIcon,
    statusClassName,
    onOfferAgain,
    onStatusChange,
    onUnoffer,
}: SubjectOfferingActionsMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() => navigator.clipboard.writeText(offering.subjectCode)}
                >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy subject code
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(offering.id)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy offering ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onOfferAgain}>
                    <Plus className="mr-2 h-4 w-4" />
                    Offer Again
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onStatusChange} className={statusClassName}>
                    {statusIcon}
                    {statusLabel}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onUnoffer} className="text-red-600 focus:text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Unoffer Subject
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
