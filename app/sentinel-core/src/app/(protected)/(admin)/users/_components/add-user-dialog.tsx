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
} from "@sentinel/ui";
import { Form } from "@sentinel/ui";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useUserForm } from "../_hooks/use-user-form";
import { UserFormFields } from "./user-form-fields";

export function AddUserDialog() {
    const [open, setOpen] = useState(false);
    const { form, onSubmit, watchedRole } = useUserForm({
        onSuccess: () => setOpen(false),
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[#323d8f] hover:bg-[#323d8f]/90">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>
                        Create a new account for a student, proctor, or staff member.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <UserFormFields form={form} watchedRole={watchedRole} />
                        <DialogFooter>
                            <Button type="submit">Create Account</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
