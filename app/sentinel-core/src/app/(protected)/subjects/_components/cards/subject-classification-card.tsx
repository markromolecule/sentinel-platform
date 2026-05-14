'use client';

import { useState } from 'react';
import Link from 'next/link';
import { type SubjectClassification } from '@sentinel/shared/types';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    Badge,
    Button,
    Card,
    CardDescription,
    CardTitle,
} from '@sentinel/ui';
import { useDeleteSubjectClassificationMutation } from '@sentinel/hooks';
import { Edit2, PackagePlus, Trash2 } from 'lucide-react';
import {
    InheritanceStatusBadge,
    isParentOwnedRecord,
} from '@/components/common/inheritance-status-badge';

interface SubjectClassificationCardProps {
    classification: SubjectClassification;
    onEdit?: (classification: SubjectClassification) => void;
    onOffer?: (classification: SubjectClassification) => void;
    canOffer?: boolean;
    canDelete?: boolean;
}

export function SubjectClassificationCard({
    classification,
    onEdit,
    onOffer,
    canOffer = false,
    canDelete = false,
}: SubjectClassificationCardProps) {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const deleteSubjectClassification = useDeleteSubjectClassificationMutation({
        onSuccess: () => setDeleteOpen(false),
    });
    const isInheritedClassification = isParentOwnedRecord(classification);

    const isGeneral = classification.type === 'GENERAL';
    const toneClassName = isGeneral
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
        : 'border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';

    const previewSubjects = classification.subjects.slice(0, 3);
    const remainingSubjectCount = Math.max(classification.subjectCount - previewSubjects.length, 0);

    return (
        <>
            <div className="group relative h-full min-w-0">
                <Link
                    href={`/subjects/classifications/${classification.id}`}
                    className="focus-visible:ring-ring block h-full min-w-0 transition-all duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                    <Card className="border-border/70 hover:border-primary/50 flex h-full min-h-[112px] min-w-0 flex-col overflow-hidden transition-all hover:shadow-md">
                        <div className="flex min-w-0 flex-1 flex-col px-3 py-2.5">
                            {/* Header: Type and Stats */}
                            <div className="flex min-w-0 items-start justify-between gap-2 pr-18">
                                <div className="flex min-w-0 flex-wrap gap-1">
                                    <Badge
                                        variant="outline"
                                        className={`h-[18px] px-1.5 text-[9px] leading-none font-semibold tracking-wider uppercase ${toneClassName}`}
                                    >
                                        {isGeneral ? 'General' : 'Core'}
                                    </Badge>
                                    <InheritanceStatusBadge record={classification} />
                                    <Badge
                                        variant="secondary"
                                        className="h-[18px] border-[#323d8f]/20 bg-[#323d8f]/5 px-1.5 text-[9px] leading-none font-bold text-[#323d8f]"
                                    >
                                        {classification.subjectCount} Item
                                        {classification.subjectCount === 1 ? '' : 's'}
                                    </Badge>
                                </div>
                            </div>

                            {/* Body: Title and Description */}
                            <div className="mt-1.5 min-w-0 space-y-0 pr-14">
                                <CardTitle className="line-clamp-1 text-[17px] leading-[1.15] font-bold tracking-tight">
                                    {classification.name}
                                </CardTitle>
                                {classification.description && (
                                    <CardDescription className="line-clamp-1 pt-0.5 text-[12px] leading-4">
                                        {classification.description}
                                    </CardDescription>
                                )}
                            </div>

                            {/* Preview: Subjects */}
                            {previewSubjects.length > 0 && (
                                <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-1">
                                    {previewSubjects.map((subject) => (
                                        <span
                                            key={subject.id}
                                            className="bg-muted/50 text-muted-foreground max-w-[80px] truncate rounded px-1.5 py-px text-[10px] leading-4 font-medium"
                                        >
                                            {subject.code}
                                        </span>
                                    ))}
                                    {remainingSubjectCount > 0 && (
                                        <span className="text-muted-foreground text-[10px] leading-4 font-medium italic">
                                            +{remainingSubjectCount} more
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Footer: Scope Info */}
                            <div className="border-border/40 mt-1.5 flex min-w-0 items-center gap-2 border-t pt-1.5">
                                <span className="text-muted-foreground truncate text-[11px] leading-4 font-medium tracking-[0.08em] uppercase">
                                    {isGeneral ? 'Cross-program' : 'Department-linked'}
                                </span>
                            </div>
                        </div>
                    </Card>
                </Link>

                {/* Actions: Floating on top right */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-100 transition-opacity focus-within:opacity-100 md:opacity-0 md:group-hover:opacity-100">
                    {canOffer && onOffer && (
                        <Button
                            variant="secondary"
                            size="icon"
                            className="bg-background/90 border-border/50 hover:bg-background h-6 w-6 border shadow-sm backdrop-blur-sm"
                            disabled={classification.subjectCount === 0}
                            aria-label={`Offer subjects for ${classification.name}`}
                            title="Offer subjects"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onOffer(classification);
                            }}
                        >
                            <PackagePlus className="h-3 w-3" />
                        </Button>
                    )}
                    {onEdit && !isInheritedClassification && (
                        <Button
                            variant="secondary"
                            size="icon"
                            className="bg-background/90 border-border/50 hover:bg-background h-6 w-6 border shadow-sm backdrop-blur-sm"
                            aria-label={`Edit ${classification.name}`}
                            title="Edit classification"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onEdit(classification);
                            }}
                        >
                            <Edit2 className="h-3 w-3" />
                        </Button>
                    )}
                    {canDelete && !isInheritedClassification && (
                        <Button
                            variant="secondary"
                            size="icon"
                            className="bg-background/90 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive h-6 w-6 border shadow-sm backdrop-blur-sm"
                            aria-label={`Delete ${classification.name}`}
                            title="Delete classification"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDeleteOpen(true);
                            }}
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    )}
                </div>
            </div>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete classification group?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove the &quot;{classification.name}&quot; card and unassign
                            its subjects from this classification group.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteSubjectClassification.isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90 text-white"
                            disabled={deleteSubjectClassification.isPending}
                            onClick={(event) => {
                                event.preventDefault();
                                deleteSubjectClassification.mutate({
                                    id: classification.id,
                                    institutionId: classification.institution_id ?? undefined,
                                });
                            }}
                        >
                            {deleteSubjectClassification.isPending ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
