'use client';

import { useState } from 'react';
import { Copy, MoreHorizontal, Plus } from 'lucide-react';
import { type SubjectOffering } from '@sentinel/shared/types';
import { OfferSubjectDialog } from '@/app/(protected)/(admin)/subjects/_components/dialogs/offer-subject-dialog';
import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@sentinel/ui';

interface SubjectOfferingActionsCellProps {
    offering: SubjectOffering;
}

export function SubjectOfferingActionsCell({
    offering,
}: SubjectOfferingActionsCellProps) {
    const [offerOpen, setOfferOpen] = useState(false);

    return (
        <>
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
                    <DropdownMenuItem
                        onClick={() => navigator.clipboard.writeText(offering.id)}
                    >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy offering ID
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setOfferOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Offer Again
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <OfferSubjectDialog
                open={offerOpen}
                onOpenChange={setOfferOpen}
                subjectToOffer={{
                    id: offering.subjectId,
                    code: offering.subjectCode,
                    title: offering.subjectTitle,
                }}
            />
        </>
    );
}
