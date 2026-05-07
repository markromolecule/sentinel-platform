'use client';

import { useMemo, useState } from 'react';
import {
    isPermissionDeniedError,
    useActivePermissions,
    useDebounce,
    useSubjectClassificationsQuery,
} from '@sentinel/hooks';
import {
    Badge,
    Button,
    Card,
    CardContent,
    EmptyState,
    PageHeader,
    PermissionDeniedState,
    SearchBar,
    Separator,
} from '@sentinel/ui';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { SubjectClassification } from '@sentinel/shared/types';
import { SubjectClassificationDialog } from '../dialogs/subject-classification-dialog';
import { useDeleteSubjectClassificationMutation } from '@sentinel/hooks';

function ClassificationCard({
    classification,
    canEdit,
    canDelete,
    onEdit,
    onDelete,
}: {
    classification: SubjectClassification;
    canEdit: boolean;
    canDelete: boolean;
    onEdit: (classification: SubjectClassification) => void;
    onDelete: (classification: SubjectClassification) => void;
}) {
    const previewSubjects = classification.subjects.slice(0, 3);
    const remainingCount = Math.max(classification.subjectCount - previewSubjects.length, 0);

    return (
        <Card className="border-border/70 h-full">
            <CardContent className="flex h-full flex-col gap-4 p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{classification.type}</Badge>
                            <Badge variant="secondary">
                                {classification.subjectCount} subject
                                {classification.subjectCount === 1 ? '' : 's'}
                            </Badge>
                        </div>
                        <div>
                            <h3 className="text-base font-semibold">{classification.name}</h3>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        {canEdit ? (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onEdit(classification)}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                        ) : null}
                        {canDelete ? (
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
                    <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
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
                            <span className="text-muted-foreground text-sm">No subjects assigned</span>
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
    const debouncedSearch = useDebounce(searchTerm, 400);

    const {
        data: classifications = [],
        isLoading,
        isError,
        error,
    } = useSubjectClassificationsQuery(debouncedSearch || undefined);

    const deleteClassification = useDeleteSubjectClassificationMutation();

    const isViewDenied = isPermissionDeniedError(error, 'subjects:view');
    const canCreate = hasPermission('subjects:create');
    const canUpdate = hasPermission('subjects:update');
    const canDelete = hasPermission('subjects:delete');

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
                        <Button onClick={() => setDialogOpen(true)} className="bg-[#323d8f] hover:bg-[#323d8f]/90">
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
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader
                title="Subject Classifications"
                description="Manage institution-level subject groupings that can be inherited by branches."
            >
                {canCreate ? (
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
                ) : null}
            </PageHeader>
            <Separator />

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
                                    canEdit={canUpdate}
                                    canDelete={canDelete}
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
                                            deleteClassification.mutate(nextClassification.id);
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {isError ? (
                        <div className="text-destructive bg-destructive/5 border-destructive/20 flex h-28 items-center justify-center rounded-md border">
                            Error loading subject classifications. Contact support if this continues.
                        </div>
                    ) : null}
                </div>
            )}

            <SubjectClassificationDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                classification={selectedClassification}
            />
        </div>
    );
}
