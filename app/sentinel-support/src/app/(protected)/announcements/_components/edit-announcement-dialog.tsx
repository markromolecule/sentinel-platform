'use client';

import { useEffect } from 'react';
import { Button } from '@sentinel/ui';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@sentinel/ui';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@sentinel/ui';
import { Input } from '@sentinel/ui';
import { Textarea } from '@sentinel/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@sentinel/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@sentinel/ui';
import { Calendar } from '@sentinel/ui';
import { Popover, PopoverContent, PopoverTrigger } from '@sentinel/ui';
import { announcementFormSchema, AnnouncementFormValues } from '@sentinel/shared/schema';
import { Announcement } from '@sentinel/services';
import { useUpdateAnnouncementMutation } from '@sentinel/hooks';

interface EditAnnouncementDialogProps {
    announcement: Announcement | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * Dialog to edit an existing announcement.
 *
 * @param props Component properties.
 * @returns React element representing the edit announcement dialog.
 */
export function EditAnnouncementDialog({
    announcement,
    open,
    onOpenChange,
}: EditAnnouncementDialogProps) {
    const form = useForm<AnnouncementFormValues>({
        resolver: zodResolver(announcementFormSchema),
        defaultValues: {
            title: '',
            content: '',
            status: 'draft',
            targetAudience: 'all',
            publishedAt: new Date().toISOString(),
        },
    });

    useEffect(() => {
        if (open && announcement) {
            form.reset({
                title: announcement.title,
                content: announcement.content,
                status: announcement.published_at ? 'published' : 'draft',
                targetAudience: 'all',
                publishedAt: announcement.published_at ?? new Date().toISOString(),
            });
        }
    }, [open, announcement, form]);

    const mutation = useUpdateAnnouncementMutation({
        onSuccess: () => {
            onOpenChange(false);
            form.reset();
        },
    });

    if (!announcement) {
        return null;
    }

    function onSubmit(values: AnnouncementFormValues) {
        if (!announcement) return;
        mutation.mutate({
            id: announcement.id,
            payload: {
                title: values.title,
                content: values.content,
                published_at: values.publishedAt ? new Date(values.publishedAt).toISOString() : null,
                unpublished_at: null,
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Announcement</DialogTitle>
                    <DialogDescription>
                        Update the announcement details and publication schedule.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Scheduled Maintenance" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="targetAudience"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Target Audience</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select audience" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="all">All Users</SelectItem>
                                            <SelectItem value="students">Students</SelectItem>
                                            <SelectItem value="proctors">Proctors</SelectItem>
                                            <SelectItem value="instructors">Instructors</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="publishedAt"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date & Time</FormLabel>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={'outline'}
                                                            className={cn(
                                                                'w-full pl-3 text-left font-normal',
                                                                !field.value &&
                                                                    'text-muted-foreground',
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(new Date(field.value), 'PPP')
                                                            ) : (
                                                                <span>Pick a date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    className="w-auto p-0"
                                                    align="start"
                                                >
                                                    <Calendar
                                                        mode="single"
                                                        selected={
                                                            field.value
                                                                ? new Date(field.value)
                                                                : undefined
                                                        }
                                                        onSelect={(date) => {
                                                            if (date) {
                                                                const current = field.value
                                                                    ? new Date(field.value)
                                                                    : new Date();
                                                                date.setHours(current.getHours());
                                                                date.setMinutes(
                                                                    current.getMinutes(),
                                                                );
                                                                field.onChange(date.toISOString());
                                                            }
                                                        }}
                                                        disabled={(date) =>
                                                            date < new Date('1900-01-01')
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="w-[120px]">
                                            <Select
                                                value={
                                                    field.value
                                                        ? format(new Date(field.value), 'HH:mm')
                                                        : ''
                                                }
                                                onValueChange={(time) => {
                                                    if (time) {
                                                        const date = field.value
                                                            ? new Date(field.value)
                                                            : new Date();
                                                        const [hours, minutes] = time
                                                            .split(':')
                                                            .map(Number);
                                                        date.setHours(hours);
                                                        date.setMinutes(minutes);
                                                        field.onChange(date.toISOString());
                                                    }
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Time" />
                                                </SelectTrigger>
                                                <SelectContent
                                                    className="h-[200px]"
                                                    position="popper"
                                                >
                                                    {Array.from({ length: 48 }).map((_, i) => {
                                                        const hour = Math.floor(i / 2)
                                                            .toString()
                                                            .padStart(2, '0');
                                                        const minute = i % 2 === 0 ? '00' : '30';
                                                        const time = `${hour}:${minute}`;
                                                        return (
                                                            <SelectItem key={time} value={time}>
                                                                {time}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Content</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter announcement details..."
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" className="bg-[#323d8f] hover:bg-[#323d8f]/90" disabled={mutation.isPending}>
                                {mutation.isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
