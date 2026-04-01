"use client";

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@sentinel/ui";
import { Input } from "@sentinel/ui";
import { UseFormReturn } from "react-hook-form";
import { UserFormValues } from "@sentinel/shared/schema";

interface UserFormFieldsProps {
    form: UseFormReturn<UserFormValues>;
}

export function UserFormFields({ form }: UserFormFieldsProps) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                                <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                            <Input placeholder="name@sentinelph.tech" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="rounded-md border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                Superadmin accounts are created with global platform access and are managed from the support portal.
            </div>
        </div>
    );
}
