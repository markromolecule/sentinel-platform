'use client';

import { useState } from 'react';
import { useActivePermissions, useSubjectOfferingsQuery } from '@sentinel/hooks';
import { Plus } from 'lucide-react';
import { Button } from '@sentinel/ui';
import { RequestOfferedSubjectBuilderDialog } from '@/app/(protected)/(instructor)/subjects/offered/_components/request-offered-subject-builder-dialog';

export function AddSubjectDialog() {
    const { hasPermission } = useActivePermissions();
    const [open, setOpen] = useState(false);
    const { data: subjectOfferings = [], isLoading } = useSubjectOfferingsQuery({
        enabled: open,
        visibility: 'requestable',
    });

    if (!hasPermission('subject_requests:request')) {
        return null;
    }

    return (
        <>
            <Button
                className="bg-[#323d8f] text-white hover:bg-[#323d8f]/90"
                onClick={() => setOpen(true)}
            >
                <Plus className="mr-2 h-4 w-4" />
                Request Offered Subject
            </Button>

            <RequestOfferedSubjectBuilderDialog
                mode="pick-offering"
                open={open}
                onOpenChange={setOpen}
                offerings={subjectOfferings}
                isLoadingOfferings={isLoading}
            />
        </>
    );
}
