'use client';

import {
    isPermissionDeniedError,
    useActivePermissions,
    useDebounce,
    useSubjectClassificationsQuery,
} from '@sentinel/hooks';
import { Button, PermissionDeniedState } from '@sentinel/ui';
import { Plus } from 'lucide-react';
import {
    OfferClassificationSubjectsDialog,
    SubjectClassificationDialog,
    SubjectClassificationsList,
} from '../_components';
import { useSubjectClassificationsManagement } from '../_hooks/use-subject-classifications-management';
import { useAcademicScope } from '@/hooks/use-academic-scope';
import { SubjectPageShell } from '../_components/layout';

/**
 * SubjectClassificationPage renders the subject classifications page for sentinel-core,
 * wrapped in the SubjectPageShell layout.
 */
export default function SubjectClassificationPage() {
    const { institutionId } = useAcademicScope();
    const { hasPermission } = useActivePermissions();
    const {
        searchTerm,
        setSearchTerm,
        dialogOpen,
        setDialogOpen,
        selectedClassification,
        selectedOfferingClassification,
        handleCreateOpen,
        handleEditOpen,
        handleOfferOpen,
        setSelectedOfferingClassification,
    } = useSubjectClassificationsManagement();

    const debouncedSearch = useDebounce(searchTerm, 400);

    const {
        data: classifications = [],
        isLoading,
        isError,
        error,
    } = useSubjectClassificationsQuery(debouncedSearch || undefined, institutionId || undefined);

    const isViewDenied = isPermissionDeniedError(error, 'subjects:view');
    const canCreateClassification = hasPermission('subjects:create');
    const canUpdateClassification = hasPermission('subjects:update');
    const canDeleteClassification = hasPermission('subjects:delete');
    const canOfferSubject = hasPermission('subject_offerings:offer');

    const actions = (
        <div className="flex items-center gap-2">
            {canCreateClassification ? (
                <Button onClick={handleCreateOpen} className="bg-[#323d8f] hover:bg-[#323d8f]/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Group
                </Button>
            ) : null}
        </div>
    );

    return (
        <SubjectPageShell
            title="Subject Classifications"
            description="Create shared grouping cards for the institutional subject catalog, then assign subjects into each classification."
            actions={actions}
        >
            {isViewDenied ? (
                <PermissionDeniedState
                    resourceName="subject classifications"
                    className="h-[360px]"
                />
            ) : (
                <div className="relative">
                    <SubjectClassificationsList
                        classifications={classifications}
                        isLoading={isLoading}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        onEdit={canUpdateClassification ? handleEditOpen : undefined}
                        onOffer={canOfferSubject ? handleOfferOpen : undefined}
                        canCreate={canCreateClassification}
                        onCreate={handleCreateOpen}
                        canOffer={canOfferSubject}
                        canDelete={canDeleteClassification}
                    />

                    {isError ? (
                        <div className="text-destructive bg-destructive/5 border-destructive/20 mt-4 flex h-28 items-center justify-center rounded-xl border">
                            Error loading subject classifications. Contact support if this
                            continues.
                        </div>
                    ) : null}
                </div>
            )}

            <SubjectClassificationDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                classification={selectedClassification}
            />
            <OfferClassificationSubjectsDialog
                open={Boolean(selectedOfferingClassification)}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedOfferingClassification(null);
                    }
                }}
                classification={selectedOfferingClassification}
            />
        </SubjectPageShell>
    );
}
