'use client';

import { EnrollmentRequest } from '@sentinel/shared/types';
import { Eye } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@sentinel/ui';
import { RequestDetailDialog } from './request-detail-dialog';

/**
 * RequestActions renders action buttons for a single enrollment request row in sentinel-support.
 * Since support staff focuses on processing (approve/reject), it only exposes the "Details" dialog.
 */
export function RequestActions({ request }: { request: EnrollmentRequest }) {
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    return (
        <>
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary bg-primary/5 hover:bg-primary/10 flex items-center gap-2 px-3"
                    onClick={() => setIsDetailOpen(true)}
                >
                    <Eye className="h-4 w-4" />
                    Details
                </Button>
            </div>

            <RequestDetailDialog
                request={request}
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
            />
        </>
    );
}
