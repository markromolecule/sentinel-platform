'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@sentinel/ui';
import { Institution } from '@sentinel/shared/types';
import { EditInstitutionForm } from '../forms/edit-institution-form';

interface EditInstitutionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    institutionToEdit: Institution;
}

export function EditInstitutionDialog({
    open,
    onOpenChange,
    institutionToEdit,
}: EditInstitutionDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Institution</DialogTitle>
                    <DialogDescription>
                        Update details for {institutionToEdit.name}.
                    </DialogDescription>
                </DialogHeader>
                <EditInstitutionForm 
                    institution={institutionToEdit} 
                    onSuccess={() => onOpenChange(false)} 
                />
            </DialogContent>
        </Dialog>
    );
}
