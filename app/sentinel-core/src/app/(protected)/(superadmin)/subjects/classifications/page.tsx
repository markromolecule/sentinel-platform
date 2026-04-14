'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
    isPermissionDeniedError,
    useActivePermissions,
    useDebounce,
    useSubjectClassificationsQuery,
    useSubjectsQuery,
} from '@sentinel/hooks';
import {
    Button,
    Card,
    CardContent,
    PageHeader,
    PermissionDeniedState,
    SearchBar,
    Separator,
} from '@sentinel/ui';
import { FolderTree, Plus } from 'lucide-react';
import { type SubjectClassification } from '@sentinel/shared/types';
import { useAcademicScope } from '@/hooks/use-academic-scope';
import { SubjectClassificationCard } from './_components/subject-classification-card';
import { SubjectClassificationDialog } from './_components/subject-classification-dialog';

export default function SubjectClassificationPage() {
    const { isSuperadmin } = useAcademicScope();
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
    const { data: subjects = [], isLoading: isLoadingSubjects } = useSubjectsQuery();
    const isViewDenied =
        !isSuperadmin || isPermissionDeniedError(error, 'subjects:view');
    const canCreateClassification = isSuperadmin && hasPermission('subjects:create');
    const canUpdateClassification = isSuperadmin && hasPermission('subjects:update');
    const canDeleteClassification = isSuperadmin && hasPermission('subjects:delete');


    function handleCreateOpen() {
        setSelectedClassification(null);
        setDialogOpen(true);
    }

    function handleEditOpen(classification: SubjectClassification) {
        setSelectedClassification(classification);
        setDialogOpen(true);
    }

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
                        Back to Subject Management
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
                <>
                    <div className="flex items-center justify-between gap-4">
                        <div className="w-full max-w-sm">
                            <SearchBar
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search groups..."
                            />
                        </div>
                        {classifications.length > 0 && (
                            <div className="text-muted-foreground hidden text-sm font-medium md:block">
                                Total: {classifications.length} Groups
                            </div>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <Card key={index} className="min-h-[160px] animate-pulse bg-muted/20" />
                            ))}
                        </div>
                    ) : classifications.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {classifications.map((classification) => (
                                <SubjectClassificationCard
                                    key={classification.id}
                                    classification={classification}
                                    onEdit={canUpdateClassification ? handleEditOpen : undefined}
                                    canDelete={canDeleteClassification}
                                />
                            ))}
                        </div>
                    ) : (
                        <Card className="border-dashed bg-muted/20">
                            <CardContent className="flex min-h-[320px] flex-col items-center justify-center gap-4 text-center p-8">
                                <div className="rounded-full bg-[#323d8f]/10 p-4 text-[#323d8f] ring-8 ring-[#323d8f]/5">
                                    <FolderTree className="h-10 w-10" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold tracking-tight">
                                        {searchTerm
                                            ? 'No matching groups'
                                            : 'Organize Your Catalog'}
                                    </h3>
                                    <p className="text-muted-foreground mx-auto max-w-sm text-sm leading-relaxed">
                                        {searchTerm
                                            ? `We couldn't find any subject classification group matching "${searchTerm}".`
                                            : 'Create shared grouping cards for the institutional subject catalog to help students and staff browse subjects easily.'}
                                    </p>
                                </div>
                                {canCreateClassification && !searchTerm ? (
                                    <Button
                                        onClick={handleCreateOpen}
                                        className="mt-2 bg-[#323d8f] hover:bg-[#323d8f]/90 shadow-md"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Your First Group
                                    </Button>
                                ) : null}
                            </CardContent>
                        </Card>
                    )}

                    {isError ? (
                        <div className="text-destructive bg-destructive/5 border-destructive/20 flex h-28 items-center justify-center rounded-xl border">
                            Error loading subject classifications. Contact support if this
                            continues.
                        </div>
                    ) : null}
                </>
            )}

            <SubjectClassificationDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                classification={selectedClassification}
                subjects={subjects}
                isLoadingSubjects={isLoadingSubjects}
            />
        </div>
    );
}
