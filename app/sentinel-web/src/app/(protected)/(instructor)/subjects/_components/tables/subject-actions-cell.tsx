'use client';

import { useState, useMemo } from 'react';
import { MoreHorizontal, Trash2, Copy, Eye, Pencil } from 'lucide-react';
import { type Subject } from '@sentinel/shared/types';
import { buildEnrollmentRequestFormValues } from '@sentinel/shared';
import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@sentinel/ui';
import { toast } from 'sonner';
import { useUnenrollment } from '@/app/(protected)/(instructor)/subjects/_hooks/use-unenrollment';
import { UnenrollSubjectDialog } from '@/app/(protected)/(instructor)/subjects/_components/dialogs/unenroll-subject-dialog';
import { SubjectDetailDialog } from '@/app/(protected)/(instructor)/subjects/_components/dialogs/subject-detail-dialog';
import { RequestOfferedSubjectBuilderDialog } from '@/app/(protected)/(instructor)/subjects/offered/_components/request-offered-subject-builder-dialog';

interface SubjectActionsCellProps {
    subject: Subject;
}

export function SubjectActionsCell({ subject }: SubjectActionsCellProps) {
    const [detailOpen, setDetailOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const subjectOfferingId = subject.subjectOfferingId;
    const canEditRequest = Boolean(subject.status && subject.requestIds?.length);

    const {
        open,
        allSections,
        selectedSectionIds,
        isPending,
        toggleSection,
        toggleAll,
        handleUnenroll,
        handleOpenChange,
    } = useUnenrollment({ subject });

    const initialValues = useMemo(
        () =>
            buildEnrollmentRequestFormValues({
                subjectOfferingId: subject.subjectOfferingId,
                departmentIds: subject.departmentIds,
                courseIds: subject.courseIds,
                yearLevels: subject.yearLevelsNumeric,
                sectionIds: subject.sectionIds,
            }),
        [
            subject.subjectOfferingId,
            subject.departmentIds,
            subject.courseIds,
            subject.yearLevelsNumeric,
            subject.sectionIds,
        ],
    );

    const copyToClipboard = (text: string, description: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${description} copied to clipboard`);
    };

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
                    <DropdownMenuItem onClick={() => setDetailOpen(true)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View details
                    </DropdownMenuItem>
                    {canEditRequest ? (
                        <DropdownMenuItem onClick={() => setEditOpen(true)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit request
                        </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => copyToClipboard(subject.code, 'Subject code')}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy subject code
                    </DropdownMenuItem>
                    {subjectOfferingId && (
                        <DropdownMenuItem
                            onClick={() => copyToClipboard(subjectOfferingId, 'Offered subject ID')}
                        >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy offered subject ID
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => handleOpenChange(true)}
                        className="text-red-600 focus:text-red-600"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Unenroll Subject
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <SubjectDetailDialog open={detailOpen} onOpenChange={setDetailOpen} subject={subject} />

            {canEditRequest ? (
                <RequestOfferedSubjectBuilderDialog
                    intent="edit"
                    mode="pick-offering"
                    open={editOpen}
                    onOpenChange={setEditOpen}
                    requestIds={subject.requestIds}
                    initialValues={initialValues}
                />
            ) : null}

            <UnenrollSubjectDialog
                open={open}
                onOpenChange={handleOpenChange}
                subject={subject}
                allSections={allSections}
                selectedSectionIds={selectedSectionIds}
                onToggleSection={toggleSection}
                onToggleAll={toggleAll}
                onUnenroll={handleUnenroll}
                isPending={isPending}
            />
        </>
    );
}
