'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
    useSubjectClassificationQuery,
    useSubjectsQuery,
    useActivePermissions,
} from '@sentinel/hooks';
import {
    Badge,
    Button,
    PageHeader,
    Separator,
    DataTable,
    DataTableColumnHeader,
    LoadingState,
    EmptyState,
} from '@sentinel/ui';
import { ChevronLeft, Edit2, FolderTree } from 'lucide-react';
import { SubjectClassificationDialog } from '../../_components/dialogs/subject-classification-dialog';
import { SubjectClassificationSubject } from '@sentinel/shared/types';
import { type ColumnDef } from '@tanstack/react-table';

interface PageProps {
    params: Promise<{ id: string }>;
}

const subjectColumns: ColumnDef<SubjectClassificationSubject>[] = [
    {
        accessorKey: 'code',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Subject Code" />
        ),
    },
    {
        accessorKey: 'title',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Subject Title" />
        ),
    },
];

export default function SubjectClassificationDetailsPage({ params }: PageProps) {
    const { id } = use(params);
    const { hasPermission } = useActivePermissions();
    const [dialogOpen, setDialogOpen] = useState(false);

    const {
        data: classification,
        isLoading,
        isError,
    } = useSubjectClassificationQuery(id);
    const { data: allSubjects = [], isLoading: isLoadingSubjects } = useSubjectsQuery();

    const canUpdateClassification = hasPermission('subjects:update');

    const toneClassName =
        classification?.type === 'GENERAL'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
            : 'border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';

    if (isError || (!isLoading && !classification)) {
        return <ErrorState />;
    }

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild className="-ml-2 h-8 text-muted-foreground hover:text-foreground">
                    <Link href="/subjects/classifications">
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Back to Classifications
                    </Link>
                </Button>
            </div>

            <PageHeader
                title={classification?.name || 'Loading classification...'}
                description={classification?.description || 'No description provided for this classification group.'}
            >
                <div className="flex items-center gap-3">
                    {classification && (
                        <Badge variant="outline" className={`${toneClassName} px-3 py-1 text-xs font-medium`}>
                            {classification.type === 'GENERAL' ? 'General Subject' : 'Core Subject'}
                        </Badge>
                    )}
                    {canUpdateClassification && (
                        <Button
                            onClick={() => setDialogOpen(true)}
                            className="bg-[#323d8f] hover:bg-[#323d8f]/90 shadow-sm"
                            disabled={isLoading}
                        >
                            <Edit2 className="mr-2 h-4 w-4" />
                            Manage Group
                        </Button>
                    )}
                </div>
            </PageHeader>

            <Separator />

            <div className="space-y-4">
                <DataTable
                    columns={subjectColumns}
                    data={classification?.subjects || []}
                    isLoading={isLoading}
                    searchKey="title"
                    searchPlaceholder="Search subjects in this group..."
                    emptyContent={
                        <EmptyState
                            className="h-[320px] rounded-xl border-dashed bg-muted/20"
                            icon={<FolderTree className="size-10 text-muted-foreground/50" />}
                            title="No subjects assigned"
                            description="This classification group doesn't have any subjects assigned yet. You can manage assignments using the button above."
                            action={
                                <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
                                    <Edit2 className="mr-2 h-4 w-4" />
                                    Assign subjects now
                                </Button>
                            }
                        />
                    }
                />
            </div>

            {classification && (
                <SubjectClassificationDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    classification={classification}
                    subjects={allSubjects}
                    isLoadingSubjects={isLoadingSubjects}
                />
            )}
        </div>
    );
}

function ErrorState() {
    return (
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-destructive/10 p-4 text-destructive">
                <FolderTree className="h-10 w-10" />
            </div>
            <div className="space-y-2">
                <h3 className="text-xl font-bold">Group Not Found</h3>
                <p className="text-muted-foreground">The classification group you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.</p>
            </div>
            <Button asChild variant="outline">
                <Link href="/subjects/classifications">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to List
                </Link>
            </Button>
        </div>
    );
}
