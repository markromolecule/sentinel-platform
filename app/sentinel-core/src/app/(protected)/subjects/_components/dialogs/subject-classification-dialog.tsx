'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@sentinel/ui';
import {
    type MasterSubject,
    type SubjectClassification,
} from '@sentinel/shared/types';
import { ClassificationForm } from '../forms/classification-form';

interface SubjectClassificationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    classification: SubjectClassification | null;
    subjects: MasterSubject[];
    isLoadingSubjects?: boolean;
}

export function SubjectClassificationDialog({
    open,
    onOpenChange,
    classification,
    subjects,
    isLoadingSubjects = false,
}: SubjectClassificationDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-6xl">
                <DialogHeader className="border-b px-5 py-4">
                    <DialogTitle>
                        {classification ? 'Edit Subject Classification' : 'Create Subject Classification'}
                    </DialogTitle>
                    <DialogDescription>
                        Group shared catalog subjects into cards like General Subject or Core
                        Subject so every superadmin sees the same arrangement.
                    </DialogDescription>
                </DialogHeader>

                <ClassificationForm
                    classification={classification}
                    subjects={subjects}
                    isLoadingSubjects={isLoadingSubjects}
                    onOpenChange={onOpenChange}
                    open={open}
                />
            </DialogContent>
        </Dialog>
    );
}
