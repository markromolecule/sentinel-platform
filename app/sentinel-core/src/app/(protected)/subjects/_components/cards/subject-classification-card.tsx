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
    CardHeader,
    CardTitle,
} from '@sentinel/ui';
import { useDeleteSubjectClassificationMutation } from '@sentinel/hooks';
import { Edit2, Trash2 } from 'lucide-react';

interface SubjectClassificationCardProps {
    classification: SubjectClassification;
    onEdit?: (classification: SubjectClassification) => void;
    canDelete?: boolean;
}

export function SubjectClassificationCard({
    classification,
    onEdit,
    canDelete = false,
}: SubjectClassificationCardProps) {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const deleteSubjectClassification = useDeleteSubjectClassificationMutation({
        onSuccess: () => setDeleteOpen(false),
    });

    const isGeneral = classification.type === 'GENERAL';
    const toneClassName = isGeneral
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
        : 'border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';

    const previewSubjects = classification.subjects.slice(0, 3);
    const remainingSubjectCount = Math.max(classification.subjectCount - previewSubjects.length, 0);

    return (
        <>
            <div className="group relative h-full">
                <Link
                    href={`/subjects/classifications/${classification.id}`}
                    className="block h-full transition-all duration-200 hover:-translate-y-0.5"
                >
                    <Card className="flex h-full min-h-[140px] flex-col overflow-hidden border-border/70 transition-all hover:border-primary/50 hover:shadow-md">
                        <div className="flex flex-1 flex-col p-4">
                            {/* Header: Type and Stats */}
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex flex-wrap gap-1.5">
                                    <Badge variant="outline" className={`h-5 px-1.5 text-[10px] font-semibold uppercase tracking-wider ${toneClassName}`}>
                                        {isGeneral ? 'General' : 'Core'}
                                    </Badge>
                                    <Badge
                                        variant="secondary"
                                        className="h-5 border-[#323d8f]/20 bg-[#323d8f]/5 px-1.5 text-[10px] font-bold text-[#323d8f]"
                                    >
                                        {classification.subjectCount} Item{classification.subjectCount === 1 ? '' : 's'}
                                    </Badge>
                                </div>
                            </div>

                            {/* Body: Title and Description */}
                            <div className="mt-3 space-y-1">
                                <CardTitle className="line-clamp-1 text-sm font-bold tracking-tight">
                                    {classification.name}
                                </CardTitle>
                                {classification.description && (
                                    <CardDescription className="line-clamp-1 text-[12px] leading-tight">
                                        {classification.description}
                                    </CardDescription>
                                )}
                            </div>

                            {/* Preview: Subjects */}
                            {previewSubjects.length > 0 && (
                                <div className="mt-3 flex flex-wrap items-center gap-1">
                                    {previewSubjects.map((subject) => (
                                        <span
                                            key={subject.id}
                                            className="bg-muted/50 text-muted-foreground max-w-[80px] truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                                        >
                                            {subject.code}
                                        </span>
                                    ))}
                                    {remainingSubjectCount > 0 && (
                                        <span className="text-muted-foreground text-[10px] font-medium italic">
                                            +{remainingSubjectCount} more
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Footer: Scope Info */}
                            <div className="mt-auto pt-3 flex items-center gap-2 border-t border-border/40">
                                <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">
                                    {isGeneral ? 'Cross-program' : 'Department-linked'}
                                </span>
                            </div>
                        </div>
                    </Card>
                </Link>

                {/* Actions: Floating on top right */}
                <div className="absolute right-3 top-3 flex items-center gap-1.5 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                    {onEdit && (
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-7 w-7 bg-background/90 backdrop-blur-sm shadow-sm border border-border/50 hover:bg-background"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onEdit(classification);
                            }}
                        >
                            <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                    )}
                    {canDelete && (
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-7 w-7 bg-background/90 backdrop-blur-sm shadow-sm border border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDeleteOpen(true);
                            }}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>
            </div>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete classification group?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove the &quot;{classification.name}&quot; card and unassign its
                            subjects from this classification group.
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
                                deleteSubjectClassification.mutate(classification.id);
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
