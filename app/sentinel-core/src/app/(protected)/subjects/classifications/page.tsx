'use client';

import Link from 'next/link';
import {
    isPermissionDeniedError,
    useActivePermissions,
    useDebounce,
    useSubjectClassificationsQuery,
    useSubjectsQuery,
} from '@sentinel/hooks';
import { Button, PageHeader, PermissionDeniedState, Separator } from '@sentinel/ui';
import { FolderTree, Plus } from 'lucide-react';
import {
    OfferClassificationSubjectsDialog,
    SubjectClassificationDialog,
    SubjectClassificationsList,
} from '../_components';
import { useSubjectClassificationsManagement } from '../_hooks/use-subject-classifications-management';

export default function SubjectClassificationPage() {
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
    } = useSubjectClassificationsQuery(debouncedSearch || undefined);
    const { data: subjects = [], isLoading: isLoadingSubjects } = useSubjectsQuery();

    const isViewDenied = isPermissionDeniedError(error, 'subjects:view');
    const canCreateClassification = hasPermission('subjects:create');
    const canUpdateClassification = hasPermission('subjects:update');
    const canDeleteClassification = hasPermission('subjects:delete');
    const canOfferSubject = hasPermission('subject_offerings:offer');

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader
                title="Subject Classification"
                description="Create shared grouping cards for the institutional subject catalog, then assign subjects into each classification."
            >
                <Button
                    asChild
                    variant="outline"
                    className="border-[#323d8f]/20 text-[#323d8f] hover:bg-[#323d8f]/5"
                >
                    <Link href="/subjects">
                        <FolderTree className="mr-2 h-4 w-4" />
                        Back to Subject List
                    </Link>
                </Button>
                {canCreateClassification ? (
                    <Button
                        onClick={handleCreateOpen}
                        className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Group
                    </Button>
                ) : null}
            </PageHeader>
            <Separator />

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
                subjects={subjects}
                isLoadingSubjects={isLoadingSubjects}
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
        </div>
    );
}
