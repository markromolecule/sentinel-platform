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
import { ClassificationForm } from './classification-form';

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
            <DialogContent className="lg:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
                <DialogHeader className="p-6 pb-2">
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
