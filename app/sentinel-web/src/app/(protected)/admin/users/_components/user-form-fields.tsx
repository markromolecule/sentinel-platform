"use client";

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { UserFormValues } from "@sentinel/shared/schema";

interface UserFormFieldsProps {
    form: UseFormReturn<UserFormValues>;
    watchedRole: string;
}

export function UserFormFields({ form, watchedRole }: UserFormFieldsProps) {
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
                            <Input placeholder="john.doe@sentinel.edu" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="student">Student</SelectItem>
                                    <SelectItem value="proctor">Proctor</SelectItem>
                                    <SelectItem value="instructor">Instructor</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Department</FormLabel>
                            <FormControl>
                                <Input placeholder="Engineering" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {watchedRole === "student" && (
                    <FormField
                        control={form.control}
                        name="studentNo"
                        render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel>Student ID</FormLabel>
                                <FormControl>
                                    <Input placeholder="2024-XXXXX" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <FormField
                    control={form.control}
                    name="institution"
                    render={({ field }) => (
                        <FormItem className="col-span-2">
                            <FormLabel>Institution</FormLabel>
                            <FormControl>
                                <Input {...field} disabled readOnly />
                            </FormControl>
                            <p className="text-[0.8rem] text-muted-foreground">Default institution for this admin account.</p>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
}
