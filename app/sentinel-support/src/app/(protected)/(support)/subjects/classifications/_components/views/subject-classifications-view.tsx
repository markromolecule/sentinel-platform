'use client';

import { useMemo } from 'react';
import { Button, EmptyState, FacetedFilter, PermissionDeniedState, SearchBar } from '@sentinel/ui';
import { SubjectPageShell } from '@/app/(protected)/(support)/subjects/_components/layout';
import { Plus } from 'lucide-react';
import { SubjectClassificationDialog } from '../dialogs/subject-classification-dialog';
import { OfferClassificationSubjectsDialog } from '../dialogs/offer-classification-subjects-dialog';
import { useSubjectClassificationsPageState } from '../../_hooks/use-subject-classifications-page-state';
import { ClassificationCard } from '../classification-card';

/**
 * SubjectClassificationsView renders the main view page for Subject Classifications,
 * including a search bar, facet filters, grid of classification cards, and dialogs.
 */
export function SubjectClassificationsView() {
    const {
        searchTerm,
        setSearchTerm,
        dialogOpen,
        setDialogOpen,
        selectedClassification,
        selectedOfferingClassification,
        setSelectedOfferingClassification,
        selectedInstitutions,
        selectedTypes,
        selectedOrigins,
        filteredClassifications,
        isLoading,
        isError,
        isViewDenied,
        canCreate,
        canOffer,
        canUpdate,
        canDelete,
        institutionNameById,
        institutionFacetOptions,
        typeOptions,
        originOptions,
        typeCounts,
        originCounts,
        isFiltered,
        handleSelectInstitution,
        handleSelectType,
        handleSelectOrigin,
        handleClearInstitutions,
        handleClearTypes,
        handleClearOrigins,
        handleCreate,
        handleOffer,
        handleEdit,
        handleDelete,
    } = useSubjectClassificationsPageState();

    const emptyState = useMemo(
        () => (
            <EmptyState
                icon="📚"
                title={isFiltered ? 'No classifications found' : 'No classifications created'}
                description={
                    isFiltered
                        ? 'No classifications match the selected filters or search term.'
                        : 'Create subject classifications so institution-level groupings can be inherited by branches.'
                }
                action={
                    !isFiltered && canCreate ? (
                        <Button
                            onClick={handleCreate}
                            className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Create Classification
                        </Button>
                    ) : undefined
                }
            />
        ),
        [canCreate, isFiltered, handleCreate],
    );

    return (
        <SubjectPageShell
            title="Subject Classifications"
            description="Manage institution-level subject groupings that can be inherited by branches."
            actions={
                canCreate ? (
                    <Button onClick={handleCreate} className="bg-[#323d8f] hover:bg-[#323d8f]/90">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Classification
                    </Button>
                ) : null
            }
        >
            {isViewDenied ? (
                <PermissionDeniedState
                    resourceName="subject classifications"
                    className="h-[360px]"
                />
            ) : (
                <div className="space-y-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="w-full max-w-sm">
                                <SearchBar
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    placeholder="Search classifications..."
                                />
                            </div>
                            <FacetedFilter
                                title="Institution"
                                options={institutionFacetOptions}
                                selectedValues={selectedInstitutions}
                                onSelect={handleSelectInstitution}
                                onClear={handleClearInstitutions}
                            />
                            <FacetedFilter
                                title="Type"
                                options={typeOptions}
                                selectedValues={selectedTypes}
                                onSelect={handleSelectType}
                                onClear={handleClearTypes}
                                counts={typeCounts}
                            />
                            <FacetedFilter
                                title="Origin"
                                options={originOptions}
                                selectedValues={selectedOrigins}
                                onSelect={handleSelectOrigin}
                                onClear={handleClearOrigins}
                                counts={originCounts}
                            />
                        </div>
                        {!isLoading && filteredClassifications.length > 0 ? (
                            <div className="text-muted-foreground hidden text-sm font-medium lg:block">
                                {filteredClassifications.length} classification
                                {filteredClassifications.length === 1 ? '' : 's'}
                            </div>
                        ) : null}
                    </div>

                    {isLoading ? (
                        <div className="grid animate-pulse gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="border-border/40 bg-muted/20 h-[210px] rounded-lg border"
                                />
                            ))}
                        </div>
                    ) : filteredClassifications.length === 0 ? (
                        emptyState
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {filteredClassifications.map((classification) => (
                                <ClassificationCard
                                    key={classification.id}
                                    classification={classification}
                                    institutionName={
                                        institutionNameById.get(
                                            classification.originInstitutionId ??
                                                classification.institution_id ??
                                                '',
                                        ) ?? null
                                    }
                                    canOffer={canOffer}
                                    canEdit={canUpdate}
                                    canDelete={canDelete}
                                    onOffer={handleOffer}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}

                    {isError ? (
                        <div className="text-destructive bg-destructive/5 border-destructive/20 flex h-28 items-center justify-center rounded-md border">
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
                institutionName={
                    selectedOfferingClassification
                        ? (institutionNameById.get(
                              selectedOfferingClassification.originInstitutionId ??
                                  selectedOfferingClassification.institution_id ??
                                  '',
                          ) ?? null)
                        : null
                }
            />
        </SubjectPageShell>
    );
}
