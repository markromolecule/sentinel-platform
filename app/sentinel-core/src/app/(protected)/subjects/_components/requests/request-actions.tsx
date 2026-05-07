import { EnrollmentRequest } from '@sentinel/shared/types';
import { Eye, Pencil } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@sentinel/ui';
import { useActivePermissions } from '@sentinel/hooks';
import { RequestDetailDialog } from './request-detail-dialog';
import { EditEnrollmentRequestDialog } from './edit-enrollment-request-dialog';

export function RequestActions({ request }: { request: EnrollmentRequest }) {
    const { hasPermission } = useActivePermissions();
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const canEditRequest = hasPermission('subject_requests:approve');

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
                {canEditRequest ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2 px-3"
                        onClick={() => setIsEditOpen(true)}
                    >
                        <Pencil className="h-4 w-4" />
                        Edit
                    </Button>
                ) : null}
            </div>

            <RequestDetailDialog
                request={request}
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
            />
            <EditEnrollmentRequestDialog
                request={request}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
            />
        </>
    );
}
