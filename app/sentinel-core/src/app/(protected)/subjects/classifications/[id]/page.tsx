'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useSubjectClassificationQuery, useActivePermissions } from '@sentinel/hooks';
import {
    Badge,
    Button,
    PageHeader,
    Separator,
    DataTable,
    DataTableColumnHeader,
    EmptyState,
} from '@sentinel/ui';
import { ChevronLeft, Edit2, FolderTree, PackagePlus } from 'lucide-react';
import { SubjectClassificationDialog } from '../../_components/dialogs/subject-classification-dialog';
import { OfferClassificationSubjectsDialog } from '../../_components/dialogs/offer-classification-subjects-dialog';
import { SubjectClassificationSubject } from '@sentinel/shared/types';
import { type ColumnDef } from '@tanstack/react-table';
import {
    getInheritanceStatusLabel,
    isParentOwnedRecord,
} from '@/components/common/inheritance-status-badge';

interface PageProps {
    params: Promise<{ id: string }>;
}

const subjectColumns: ColumnDef<SubjectClassificationSubject>[] = [
    {
        accessorKey: 'code',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Subject Code" />,
    },
    {
        accessorKey: 'title',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Subject Title" />,
    },
];

export default function SubjectClassificationDetailsPage({ params }: PageProps) {
    const { id } = use(params);
    const { hasPermission } = useActivePermissions();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [offerDialogOpen, setOfferDialogOpen] = useState(false);

    const { data: classification, isLoading, isError } = useSubjectClassificationQuery(id);
    const isInheritedClassification = classification ? isParentOwnedRecord(classification) : false;
    const inheritanceLabel = classification ? getInheritanceStatusLabel(classification) : 'Local';

    const canUpdateClassification = hasPermission('subjects:update');
    const canOfferSubject = hasPermission('subject_offerings:offer');

    const toneClassName =
        classification?.type === 'GENERAL'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
            : 'border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';
    const inheritanceToneClassName = isInheritedClassification
        ? 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300'
        : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-400';
    const handleManageGroup = () => {
        if (isInheritedClassification) {
            return;
        }

        setDialogOpen(true);
    };

    if (isError || (!isLoading && !classification)) {
        return <ErrorState />;
    }

    return (
        <div className="animate-in fade-in flex flex-col gap-6 p-4 duration-500 md:p-6">
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-muted-foreground hover:text-foreground -ml-2 h-8"
                >
                    <Link href="/subjects/classifications">
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Back to Classifications
                    </Link>
                </Button>
            </div>

            <PageHeader
                title={classification?.name || 'Loading classification...'}
                description={
                    classification?.description ||
                    'No description provided for this classification group.'
                }
            >
                <div className="flex items-center gap-3">
                    {classification && (
                        <div className="flex items-center gap-3">
                            <Badge
                                variant="outline"
                                className={`${toneClassName} px-3 py-1 text-xs font-medium`}
                            >
                                {classification.type === 'GENERAL'
                                    ? 'General Subject'
                                    : 'Core Subject'}
                            </Badge>
                            <Badge
                                variant="outline"
                                className={`${inheritanceToneClassName} px-3 py-1 text-xs font-medium`}
                            >
                                {inheritanceLabel}
                            </Badge>
                        </div>
                    )}
                    {classification && canOfferSubject && (
                        <Button
                            onClick={() => setOfferDialogOpen(true)}
                            variant="outline"
                            className="border-[#323d8f]/20 text-[#323d8f] hover:bg-[#323d8f]/5"
                            disabled={isLoading || classification.subjectCount === 0}
                        >
                            <PackagePlus className="mr-2 h-4 w-4" />
                            Offer Subjects
                        </Button>
                    )}
                    {canUpdateClassification && (
                        <Button
                            onClick={handleManageGroup}
                            className="bg-[#323d8f] shadow-sm hover:bg-[#323d8f]/90"
                            disabled={isLoading || isInheritedClassification}
                            title={
                                isInheritedClassification
                                    ? 'Inherited classifications must be updated from the parent institution.'
                                    : undefined
                            }
                        >
                            <Edit2 className="mr-2 h-4 w-4" />
                            {isInheritedClassification ? 'Parent Managed' : 'Manage Group'}
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
                            className="bg-muted/20 h-[320px] rounded-xl border-dashed"
                            icon={<FolderTree className="text-muted-foreground/50 size-10" />}
                            title="No subjects assigned"
                            description="This classification group doesn't have any subjects assigned yet. You can manage assignments using the button above."
                            action={
                                canUpdateClassification && !isInheritedClassification ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleManageGroup}
                                    >
                                        <Edit2 className="mr-2 h-4 w-4" />
                                        Assign subjects now
                                    </Button>
                                ) : undefined
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
                />
            )}
            {classification && (
                <OfferClassificationSubjectsDialog
                    open={offerDialogOpen}
                    onOpenChange={setOfferDialogOpen}
                    classification={classification}
                />
            )}
        </div>
    );
}

function ErrorState() {
    return (
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
            <div className="bg-destructive/10 text-destructive rounded-full p-4">
                <FolderTree className="h-10 w-10" />
            </div>
            <div className="space-y-2">
                <h3 className="text-xl font-bold">Group Not Found</h3>
                <p className="text-muted-foreground">
                    The classification group you&apos;re looking for doesn&apos;t exist or you
                    don&apos;t have access.
                </p>
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
