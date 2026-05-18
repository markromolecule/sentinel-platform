'use client';

import { useAddRoomForm } from '../../_hooks/use-add-room-form';
import { useActivePermissions, useInstitutionsQuery } from '@sentinel/hooks';
import { Button } from '@sentinel/ui';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@sentinel/ui';
import { Form } from '@sentinel/ui';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import { RoomFormFields } from '../room-form-fields';
import { useEffectiveInstitutionNamingConventionsQuery } from '@sentinel/hooks';

export function AddRoomDialog() {
    const { hasPermission } = useActivePermissions();
    const [open, setOpen] = useState(false);
    const { form, onSubmit, isPending } = useAddRoomForm(() => setOpen(false));
    const { data: institutions = [] } = useInstitutionsQuery();

    const selectedInstitutionId = form.watch('institution_id');
    const { data: namingConvention } = useEffectiveInstitutionNamingConventionsQuery(
        selectedInstitutionId || '',
    );

    if (!hasPermission('rooms:create')) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="border-slate-200 text-slate-700 hover:bg-slate-50">
                    <Plus className="mr-2 h-4 w-4" /> Add Room
                </Button>
            </DialogTrigger>
            <DialogContent
                className="data-[state=closed]:animate-none data-[state=open]:animate-none sm:max-w-[425px]"
                overlayClassName="data-[state=open]:animate-none data-[state=closed]:animate-none"
            >
                <DialogHeader>
                    <DialogTitle>Add Room</DialogTitle>
                    <DialogDescription>Create a new room for the institution.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <RoomFormFields
                            form={form}
                            institutions={institutions}
                            namingConvention={namingConvention}
                            isPending={isPending}
                        />
                        <DialogFooter>
                            <Button
                                disabled={isPending}
                                type="submit"
                                className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                            >
                                {isPending ? 'Creating...' : 'Create Room'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
