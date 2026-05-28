'use client';

import { useMemo, useState } from 'react';
import {
    isPermissionDeniedError,
    useActivePermissions,
    useDebounce,
    useInstitutionsQuery,
    useSubjectClassificationsQuery,
} from '@sentinel/hooks';
import {
    Badge,
    Button,
    Card,
    CardContent,
    EmptyState,
    PermissionDeniedState,
    SearchBar,
} from '@sentinel/ui';
import { SubjectPageShell } from '@/app/(protected)/(support)/subjects/_components/layout';
import { PackagePlus, Pencil, Plus, Trash2 } from 'lucide-react';
import { SubjectClassification } from '@sentinel/shared/types';
import { SubjectClassificationDialog } from '../dialogs/subject-classification-dialog';
import { useDeleteSubjectClassificationMutation } from '@sentinel/hooks';
import {
    OriginStatusBadge,
    getOriginStatusLabel,
} from '@/app/(protected)/(support)/_components/origin-status-badge';
import { OfferClassificationSubjectsDialog } from '../dialogs/offer-classification-subjects-dialog';

function ClassificationCard({
    classification,
    institutionName,
    canOffer,
    canEdit,
    canDelete,
    onOffer,
    onEdit,
    onDelete,
}: {
    classification: SubjectClassification;
    institutionName?: string | null;
    canOffer: boolean;
    canEdit: boolean;
    canDelete: boolean;
    onOffer: (classification: SubjectClassification) => void;
    onEdit: (classification: SubjectClassification) => void;
    onDelete: (classification: SubjectClassification) => void;
}) {
    const previewSubjects = classification.subjects.slice(0, 3);
    const remainingCount = Math.max(classification.subjectCount - previewSubjects.length, 0);
    const isInheritedClassification = getOriginStatusLabel(classification) === 'Inherited';

    return (
        <Card className="border-border/70 h-full">
            <CardContent className="flex h-full flex-col gap-4 p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{classification.type}</Badge>
                            <OriginStatusBadge record={classification} />
                            <Badge variant="secondary">
                                {classification.subjectCount} subject
                                {classification.subjectCount === 1 ? '' : 's'}
                            </Badge>
                        </div>
                        <div>
                            <h3 className="text-base font-semibold">{classification.name}</h3>
                            <p className="text-muted-foreground text-xs">
                                {institutionName ?? 'Unknown institution'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        {canOffer ? (
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={classification.subjectCount === 0}
                                onClick={() => onOffer(classification)}
                            >
                                <PackagePlus className="h-4 w-4" />
                            </Button>
                        ) : null}
                        {canEdit && !isInheritedClassification ? (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onEdit(classification)}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                        ) : null}
                        {canDelete && !isInheritedClassification ? (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onDelete(classification)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        ) : null}
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                        Subjects
                    </p>
                    <div className="flex flex-wrap gap-1">
                        {previewSubjects.length > 0 ? (
                            <>
                                {previewSubjects.map((subject) => (
                                    <Badge key={subject.id} variant="secondary">
                                        {subject.code}
                                    </Badge>
                                ))}
                                {remainingCount > 0 ? (
                                    <span className="text-muted-foreground text-xs">
                                        +{remainingCount} more
                                    </span>
                                ) : null}
                            </>
                        ) : (
                            <span className="text-muted-foreground text-sm">
                                No subjects assigned
                            </span>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function SubjectClassificationsView() {
    const { hasPermission } = useActivePermissions();
    const [searchTerm, setSearchTerm] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedClassification, setSelectedClassification] =
        useState<SubjectClassification | null>(null);
    const [selectedOfferingClassification, setSelectedOfferingClassification] =
        useState<SubjectClassification | null>(null);
    const debouncedSearch = useDebounce(searchTerm, 400);
    const { data: institutions = [] } = useInstitutionsQuery();

    const {
        data: classifications = [],
        isLoading,
        isError,
        error,
    } = useSubjectClassificationsQuery(debouncedSearch || undefined);

    const deleteClassification = useDeleteSubjectClassificationMutation();

    const isViewDenied = isPermissionDeniedError(error, 'subjects:view');
    const canCreate = hasPermission('subjects:create');
    const canOffer = hasPermission('subject_offerings:offer');
    const canUpdate = hasPermission('subjects:update');
    const canDelete = hasPermission('subjects:delete');
    const institutionNameById = useMemo(
        () => new Map(institutions.map((institution) => [institution.id, institution.name])),
        [institutions],
    );

    const emptyState = useMemo(
        () => (
            <EmptyState
                icon="📚"
                title={searchTerm ? 'No classifications found' : 'No classifications created'}
                description={
                    searchTerm
                        ? `No classification matches "${searchTerm}".`
                        : 'Create subject classifications so institution-level groupings can be inherited by branches.'
                }
                action={
                    !searchTerm && canCreate ? (
                        <Button
                            onClick={() => setDialogOpen(true)}
                            className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Create Classification
                        </Button>
                    ) : undefined
                }
            />
        ),
        [canCreate, searchTerm],
    );

    return (
        <SubjectPageShell
            title="Subject Classifications"
            description="Manage institution-level subject groupings that can be inherited by branches."
            actions={
                canCreate ? (
                    <Button
                        onClick={() => {
                            setSelectedClassification(null);
                            setDialogOpen(true);
                        }}
                        className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                    >
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
                    <div className="flex items-center justify-between gap-4">
                        <div className="w-full max-w-sm">
                            <SearchBar
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search classifications..."
                            />
                        </div>
                        {!isLoading && classifications.length > 0 ? (
                            <div className="text-muted-foreground hidden text-sm md:block">
                                {classifications.length} classification
                                {classifications.length === 1 ? '' : 's'}
                            </div>
                        ) : null}
                    </div>

                    {classifications.length === 0 && !isLoading ? (
                        emptyState
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {classifications.map((classification) => (
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
                                    onOffer={(nextClassification) => {
                                        setSelectedOfferingClassification(nextClassification);
                                    }}
                                    onEdit={(nextClassification) => {
                                        setSelectedClassification(nextClassification);
                                        setDialogOpen(true);
                                    }}
                                    onDelete={(nextClassification) => {
                                        if (
                                            window.confirm(
                                                `Delete classification "${nextClassification.name}"?`,
                                            )
                                        ) {
                                            deleteClassification.mutate({
                                                id: nextClassification.id,
                                                institutionId:
                                                    nextClassification.institution_id ?? undefined,
                                            });
                                        }
                                    }}
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
