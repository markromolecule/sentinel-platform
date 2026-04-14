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

    const toneClassName =
        classification.type === 'GENERAL'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
            : 'border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';

    return (
        <>
            <div className="relative group">
                <Link
                    href={`/subjects/classifications/${classification.id}`}
                    className="block transition-all duration-200 hover:translate-y-[-2px]"
                >
                    <Card className="overflow-hidden border-border/70 hover:border-primary/50 hover:shadow-lg transition-all">
                        <CardHeader className="gap-4 bg-muted/20">
                            <div className="flex flex-col gap-3">
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <CardTitle className="text-xl">{classification.name}</CardTitle>
                                        <Badge variant="outline" className={toneClassName}>
                                            {classification.type === 'GENERAL'
                                                ? 'General Subject'
                                                : 'Core Subject'}
                                        </Badge>
                                        <Badge variant="secondary" className="bg-[#323d8f]/10 text-[#323d8f] border-[#323d8f]/20">
                                            {classification.subjectCount} subject
                                            {classification.subjectCount === 1 ? '' : 's'}
                                        </Badge>
                                    </div>
                                    <CardDescription className="line-clamp-2 text-sm">
                                        {classification.description ||
                                            'No description provided for this classification group yet.'}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                </Link>

                <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEdit ? (
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 bg-background/80 backdrop-blur-sm shadow-sm"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onEdit(classification);
                            }}
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>
                    ) : null}
                    {canDelete ? (
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 bg-background/80 backdrop-blur-sm shadow-sm border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDeleteOpen(true);
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    ) : null}
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

