'use client';

import { useState } from 'react';
import {
    useActivePermissions,
    useDeleteSubjectOfferingMutation,
    useUpdateSubjectOfferingMutation,
} from '@sentinel/hooks';
import { type SubjectOffering } from '@sentinel/shared/types';
import { OfferSubjectDialog } from '../dialogs/offer-subject-dialog';
import { SubjectOfferingActionsMenu } from './_components/subject-offering-actions-menu';
import { SubjectOfferingConfirmationDialog } from './_components/subject-offering-confirmation-dialog';
import {
    buildSubjectOfferingTermLabel,
    getSubjectOfferingStatusAction,
} from './_components/subject-offering-status-action';

interface SubjectOfferingActionsCellProps {
    offering: SubjectOffering;
}

export function SubjectOfferingActionsCell({ offering }: SubjectOfferingActionsCellProps) {
    const { hasPermission } = useActivePermissions();
    const [offerOpen, setOfferOpen] = useState(false);
    const [statusOpen, setStatusOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const updateSubjectOffering = useUpdateSubjectOfferingMutation();
    const deleteSubjectOffering = useDeleteSubjectOfferingMutation();

    const termLabel = buildSubjectOfferingTermLabel(offering);
    const statusAction = getSubjectOfferingStatusAction(offering);
    const canOfferSubject = hasPermission('subject_offerings:offer');
    const canUpdateSubjectOffering = hasPermission('subject_offerings:update');
    const canDeleteSubjectOffering = hasPermission('subject_offerings:delete');

    function handleStatusChange() {
        updateSubjectOffering.mutate(
            {
                id: offering.id,
                payload: {
                    status: statusAction.nextStatus,
                },
            },
            {
                onSuccess: () => setStatusOpen(false),
            },
        );
    }

    function handleUnoffer() {
        deleteSubjectOffering.mutate(offering.id, {
            onSuccess: () => setDeleteOpen(false),
        });
    }

    return (
        <>
            <SubjectOfferingActionsMenu
                offering={offering}
                statusLabel={statusAction.actionLabel}
                statusIcon={statusAction.icon}
                statusClassName={statusAction.menuClassName}
                onOfferAgain={canOfferSubject ? () => setOfferOpen(true) : undefined}
                onStatusChange={canUpdateSubjectOffering ? () => setStatusOpen(true) : undefined}
                onUnoffer={canDeleteSubjectOffering ? () => setDeleteOpen(true) : undefined}
            />

            {canOfferSubject ? (
                <OfferSubjectDialog
                    open={offerOpen}
                    onOpenChange={setOfferOpen}
                    subjectToOffer={{
                        id: offering.subjectId,
                        code: offering.subjectCode,
                        title: offering.subjectTitle,
                    }}
                />
            ) : null}

            {canUpdateSubjectOffering ? (
                <SubjectOfferingConfirmationDialog
                    open={statusOpen}
                    onOpenChange={setStatusOpen}
                    title={statusAction.dialogTitle}
                    description={statusAction.dialogDescription}
                    cancelDisabled={updateSubjectOffering.isPending}
                    confirmDisabled={updateSubjectOffering.isPending}
                    confirmLabel={
                        updateSubjectOffering.isPending
                            ? statusAction.pendingLabel
                            : statusAction.actionLabel
                    }
                    confirmVariant={statusAction.confirmVariant}
                    confirmClassName={statusAction.confirmClassName}
                    onConfirm={handleStatusChange}
                />
            ) : null}

            {canDeleteSubjectOffering ? (
                <SubjectOfferingConfirmationDialog
                    open={deleteOpen}
                    onOpenChange={setDeleteOpen}
                    title="Unoffer Subject?"
                    description={`This will remove the offered subject for "${offering.subjectCode} - ${offering.subjectTitle}" in ${termLabel}.`}
                    cancelDisabled={deleteSubjectOffering.isPending}
                    confirmDisabled={deleteSubjectOffering.isPending}
                    confirmLabel={deleteSubjectOffering.isPending ? 'Removing...' : 'Unoffer'}
                    confirmVariant="destructive"
                    confirmClassName="bg-red-600 hover:bg-red-700"
                    onConfirm={handleUnoffer}
                />
            ) : null}
        </>
    );
}
