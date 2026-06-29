'use client';

import { type ReactNode } from 'react';
import { Copy, Edit2, Eye, MoreHorizontal, Plus, Trash2, UserPlus } from 'lucide-react';
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
    onOfferAgain?: () => void;
    onEdit?: () => void;
    onStatusChange?: () => void;
    onUnoffer?: () => void;
    onAssign?: () => void;
    onViewDetails?: () => void;
}

export function SubjectOfferingActionsMenu({
    offering,
    statusLabel,
    statusIcon,
    statusClassName,
    onOfferAgain,
    onEdit,
    onStatusChange,
    onUnoffer,
    onAssign,
    onViewDetails,
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
                {onViewDetails ? (
                    <DropdownMenuItem onClick={onViewDetails}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                    </DropdownMenuItem>
                ) : null}
                {onEdit ? (
                    <DropdownMenuItem onClick={onEdit}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit Offering
                    </DropdownMenuItem>
                ) : null}
                {onOfferAgain ? (
                    <DropdownMenuItem onClick={onOfferAgain}>
                        <Plus className="mr-2 h-4 w-4" />
                        Offer Again
                    </DropdownMenuItem>
                ) : null}
                {onStatusChange ? (
                    <DropdownMenuItem onClick={onStatusChange} className={statusClassName}>
                        {statusIcon}
                        {statusLabel}
                    </DropdownMenuItem>
                ) : null}
                {onAssign ? (
                    <DropdownMenuItem onClick={onAssign}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Assign to Instructor
                    </DropdownMenuItem>
                ) : null}
                {onUnoffer ? (
                    <DropdownMenuItem
                        onClick={onUnoffer}
                        className="text-red-600 focus:text-red-600"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Unoffer Subject
                    </DropdownMenuItem>
                ) : null}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
