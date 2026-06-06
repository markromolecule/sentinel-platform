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
    const typeBadgeClassName = isGeneral
        ? 'border-indigo-200/60 bg-indigo-50/50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/40'
        : 'border-violet-200/60 bg-violet-50/50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-900/40';

    const previewSubjects = classification.subjects.slice(0, 3);
    const remainingSubjectCount = Math.max(classification.subjectCount - previewSubjects.length, 0);

    return (
        <>
            <div className="group relative h-full min-w-0">
                <Link
                    href={`/subjects/classifications/${classification.id}`}
                    className="focus-visible:ring-ring block h-full min-w-0 transition-all duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                    <Card className="border-border/60 hover:border-border/80 flex h-full min-h-[120px] min-w-0 flex-col overflow-hidden shadow-xs transition-all duration-200 hover:shadow-md py-0">
                        <div className="flex min-w-0 flex-1 flex-col pt-3.5 pb-3.5 px-4">
                            {/* Header: Title and Description */}
                            <div className="min-w-0 space-y-1 pr-20">
                                <CardTitle className="text-base font-bold leading-tight tracking-tight text-foreground line-clamp-1">
                                    {classification.name}
                                </CardTitle>
                                {classification.description && (
                                    <CardDescription className="line-clamp-1 text-[11px] leading-none pt-0.5">
                                        {classification.description}
                                    </CardDescription>
                                )}
                            </div>

                            {/* Metadata badges (Type & Inheritance) */}
                            <div className="mt-3 flex flex-wrap gap-1.5">
                                <Badge
                                    variant="outline"
                                    className={`h-5 px-2 text-[9px] font-semibold tracking-wider uppercase ${typeBadgeClassName}`}
                                >
                                    {isGeneral ? 'General' : 'Core'}
                                </Badge>
                                <InheritanceStatusBadge record={classification} />
                            </div>

                            <hr className="border-border/30 my-3" />

                            {/* Preview: Subjects */}
                            {previewSubjects.length > 0 ? (
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {previewSubjects.map((subject) => (
                                        <span
                                            key={subject.id}
                                            className="bg-secondary/60 text-foreground max-w-[90px] truncate rounded border border-border/20 px-2 text-[11px] font-medium h-[22px] flex items-center justify-center leading-none"
                                        >
                                            {subject.code}
                                        </span>
                                    ))}
                                    {remainingSubjectCount > 0 && (
                                        <span className="border border-dashed border-border text-muted-foreground rounded px-2 text-[11px] font-normal h-[22px] flex items-center justify-center bg-transparent leading-none">
                                            + {remainingSubjectCount} more
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <div className="text-[10px] text-muted-foreground/60 italic">
                                    No subjects assigned
                                </div>
                            )}

                            {/* Footer: Scope Info & Count */}
                            <div className="border-border/30 mt-3.5 flex min-w-0 items-center justify-between border-t pt-2.5">
                                <span className="text-muted-foreground truncate text-[10px] font-semibold tracking-wider uppercase leading-none">
                                    {classification.subjectCount} Subject{classification.subjectCount === 1 ? '' : 's'}
                                </span>
                                <span className="text-muted-foreground/80 truncate text-[9px] font-medium tracking-wider uppercase leading-none">
                                    {isGeneral ? 'Cross-program' : 'Department-linked'}
                                </span>
                            </div>
                        </div>
                    </Card>
                </Link>

                {/* Actions: Floating on top right */}
                <div className="absolute top-3 right-3 flex items-center gap-1 rounded-lg border border-border/40 bg-muted/20 p-0.5 opacity-100 transition-opacity focus-within:opacity-100 md:opacity-0 md:group-hover:opacity-100">
                    {canOffer && onOffer && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="bg-background/95 hover:bg-background h-7 w-7 rounded-md shadow-xs backdrop-blur-xs text-muted-foreground hover:text-foreground"
                            disabled={classification.subjectCount === 0}
                            aria-label={`Offer subjects for ${classification.name}`}
                            title="Offer subjects"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onOffer(classification);
                            }}
                        >
                            <PackagePlus className="h-3.5 w-3.5" />
                        </Button>
                    )}
                    {onEdit && !isInheritedClassification && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="bg-background/95 hover:bg-background h-7 w-7 rounded-md shadow-xs backdrop-blur-xs text-muted-foreground hover:text-foreground"
                            aria-label={`Edit ${classification.name}`}
                            title="Edit classification"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onEdit(classification);
                            }}
                        >
                            <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                    )}
                    {canDelete && !isInheritedClassification && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="bg-background/95 hover:bg-destructive/10 text-destructive/90 hover:text-destructive h-7 w-7 rounded-md shadow-xs backdrop-blur-xs border-transparent"
                            aria-label={`Delete ${classification.name}`}
                            title="Delete classification"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDeleteOpen(true);
                            }}
                        >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
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
