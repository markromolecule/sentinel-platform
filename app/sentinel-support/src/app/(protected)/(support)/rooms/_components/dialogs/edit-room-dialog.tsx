"use client";

import { useEditRoomForm } from "@/app/(protected)/(support)/rooms/_hooks/use-edit-room-form";
import { useInstitutionsQuery } from "@sentinel/hooks";
import { Institution, Room } from "@sentinel/shared/types";
import { Button } from "@sentinel/ui";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@sentinel/ui';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@sentinel/ui';
import { Input } from '@sentinel/ui';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@sentinel/ui';

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
            <DialogContent className="sm:max-w-[425px] data-[state=open]:animate-none data-[state=closed]:animate-none">
                <DialogHeader>
                    <DialogTitle>Edit Room</DialogTitle>
                    <DialogDescription>
                        Update the room details.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="institution_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Institution</FormLabel>
                                    <Select
                                        disabled={isPending}
                                        onValueChange={field.onChange}
                                        value={field.value ?? ""}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select institution" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {institutions.map((institution: Institution) => (
                                                <SelectItem key={institution.id} value={institution.id}>
                                                    {institution.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Room Name</FormLabel>
                                    <FormControl>
                                        <Input disabled={isPending} placeholder="e.g., Room 101" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Room Code</FormLabel>
                                    <FormControl>
                                        <Input disabled={isPending} placeholder="e.g., R101" {...field} value={field.value ?? ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="room_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Room Type</FormLabel>
                                    <Select
                                        disabled={isPending}
                                        onValueChange={field.onChange}
                                        value={field.value ?? "LECTURE"}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="LECTURE">Lecture Room</SelectItem>
                                            <SelectItem value="LABORATORY">Laboratory Room</SelectItem>
                                            <SelectItem value="VIRTUAL">Virtual Room</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button disabled={isPending} type="submit" className="bg-[#323d8f] hover:bg-[#323d8f]/90">
                                {isPending ? 'Updating...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
