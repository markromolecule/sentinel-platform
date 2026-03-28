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
import { Loader2, UserCog } from "lucide-react";
import { useAdministratorForm } from "../_hooks/use-administrator-form";
import { UserFormFields } from "@/app/(protected)/(admin)/users/_components/user-form-fields";

export function AddAdminDialog() {
    const [open, setOpen] = useState(false);
    const { form, onSubmit, watchedRole, isInstitutionPreset, isPending } = useAdministratorForm({
        onSuccess: () => setOpen(false),
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[#323d8f] hover:bg-[#323d8f]/90">
                    <UserCog className="mr-2 h-4 w-4" />
                    Add Administrator
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New Administrator</DialogTitle>
                    <DialogDescription>
                        Create a new administrator account with system-level access.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <UserFormFields 
                            form={form} 
                            watchedRole={watchedRole} 
                            isAdministratorForm={true}
                            lockInstitution={isInstitutionPreset}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending Invite...
                                    </>
                                ) : (
                                    "Create Admin Account"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
