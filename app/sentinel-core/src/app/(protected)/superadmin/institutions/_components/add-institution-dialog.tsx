"use client";

import { Button } from "@sentinel/ui";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    code: z.string().min(1, "Code is required"),
});

type FormValues = z.infer<typeof formSchema>;

export function AddInstitutionDialog() {
    const [open, setOpen] = useState(false);
    
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: "", code: "" },
    });

    const onSubmit = (data: FormValues) => {
        toast.success(`Institution "${data.name}" added successfully (Mock)`);
        form.reset();
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[#323d8f] hover:bg-[#323d8f]/90">
                    <Plus className="mr-2 h-4 w-4" /> Add Institution
                </Button>
            </DialogTrigger>
            <DialogContent
                className="sm:max-w-[425px] data-[state=open]:animate-none data-[state=closed]:animate-none"
                overlayClassName="data-[state=open]:animate-none data-[state=closed]:animate-none"
            >
                <DialogHeader>
                    <DialogTitle>Add Institution</DialogTitle>
                    <DialogDescription>
                        Create a new institution.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Institution Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="National University - Manila" {...field} />
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
                                    <FormLabel>Institution Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., NUM" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" className="bg-[#323d8f] hover:bg-[#323d8f]/90">
                                Create Institution
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
