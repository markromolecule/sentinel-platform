'use client';

import { useEditRoomForm } from '../../_hooks/use-edit-room-form';
import { useInstitutionsQuery } from '@sentinel/hooks';
import { Room } from '@sentinel/shared/types';
import { Button } from '@sentinel/ui';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@sentinel/ui';
import { Form } from '@sentinel/ui';

import { RoomFormFields } from '../room-form-fields';

interface EditRoomDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    roomToEdit: Room;
}

export function EditRoomDialog({ open, onOpenChange, roomToEdit }: EditRoomDialogProps) {
    const { form, onSubmit, isPending } = useEditRoomForm(roomToEdit, () => onOpenChange(false));
    const { data: institutions = [] } = useInstitutionsQuery();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="data-[state=closed]:animate-none data-[state=open]:animate-none sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Room</DialogTitle>
                    <DialogDescription>Update the room details.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <RoomFormFields
                            form={form}
                            institutions={institutions}
                            isPending={isPending}
                            mode="edit"
                            showInstitutionSelect={false}
                        />
                        <DialogFooter>
                            <Button
                                disabled={isPending}
                                type="submit"
                                className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                            >
                                {isPending ? 'Updating...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
