'use client';

import { useState } from 'react';
import { useBulkRoomUploadForm } from '../../_hooks/use-bulk-room-upload-form';
import { useInstitutionsQuery, useActivePermissions } from '@sentinel/hooks';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@sentinel/ui';
import { Button } from '@sentinel/ui';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@sentinel/ui';
import { Input } from '@sentinel/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@sentinel/ui';
import { Layers, CheckCircle2 } from 'lucide-react';
import { Badge } from '@sentinel/ui';
import { ScrollArea } from '@sentinel/ui';

export function BulkRoomUploadDialog() {
    const { hasPermission } = useActivePermissions();
    const [open, setOpen] = useState(false);
    const { form, generatedRoomsPreview, onSubmit, isPending, namingConvention } =
        useBulkRoomUploadForm(() => setOpen(false));
    const { data: institutions = [] } = useInstitutionsQuery();

    if (!hasPermission('rooms:create')) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[#323d8f] hover:bg-[#323d8f]/90">
                    <Layers className="mr-2 h-4 w-4" /> Bulk Upload
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Bulk Room Upload</DialogTitle>
                    <DialogDescription>
                        Generate multiple rooms at once using institution naming conventions.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="institution_id"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Institution</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select an institution" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {institutions.map((inst) => (
                                                    <SelectItem key={inst.id} value={inst.id}>
                                                        {inst.name}
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
                                name="start_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Number</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="end_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Number</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
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
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select room type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="LECTURE">
                                                    Lecture Room
                                                </SelectItem>
                                                <SelectItem value="LABORATORY">
                                                    Laboratory Room
                                                </SelectItem>
                                                <SelectItem value="VIRTUAL">VR Room</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="padding"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Zero Padding</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                placeholder="e.g. 3 for 001"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {generatedRoomsPreview.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium text-slate-900">
                                        Preview ({generatedRoomsPreview.length} rooms)
                                    </h4>
                                    {namingConvention && (
                                        <Badge variant="secondary" className="font-normal">
                                            Format: {namingConvention.roomCodeFormat || 'Standard'}
                                        </Badge>
                                    )}
                                </div>
                                <ScrollArea className="h-[200px] rounded-md border border-slate-200 bg-slate-50/50 p-4">
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                        {generatedRoomsPreview.map((room, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center text-sm text-slate-600"
                                            >
                                                <CheckCircle2 className="mr-2 h-3 w-3 text-emerald-500" />
                                                <span className="mr-2 font-medium text-slate-900">
                                                    {room.code}
                                                </span>
                                                <span className="text-slate-400">
                                                    ({room.name})
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setOpen(false)}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isPending || generatedRoomsPreview.length === 0}
                                className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                            >
                                {isPending
                                    ? 'Creating...'
                                    : `Create ${generatedRoomsPreview.length} Rooms`}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
