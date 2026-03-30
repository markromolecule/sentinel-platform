"use client";

import {
    useCoursesQuery,
    useDepartmentsQuery,
    useInstitutionsQuery,
    useUserQuery
} from "@sentinel/hooks";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@sentinel/ui";
import { Input } from "@sentinel/ui";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@sentinel/ui";
import { UseFormReturn } from "react-hook-form";
import { useUser } from "@/hooks/use-user";
import { useEffect } from "react";
import { UserFormValues } from "@sentinel/shared/schema";
import { Course, Department, Institution } from "@sentinel/shared/types";

interface UserFormFieldsProps {
    form: UseFormReturn<UserFormValues>;
    watchedRole: string;
    isAdministratorForm?: boolean;
    lockInstitution?: boolean;
}

export function UserFormFields({
    form,
    watchedRole,
    isAdministratorForm = false,
    lockInstitution = false,
}: UserFormFieldsProps) {
    const { data: adminAuth } = useUser();
    const { data: adminProfile } = useUserQuery(adminAuth?.id || "");

    const watchedInstitution = form.watch("institution");
    const watchedDepartment = form.watch("department");

    const isSuperadmin = adminAuth?.role === "superadmin";

    const { data: institutions } = useInstitutionsQuery();
    const { data: departments } = useDepartmentsQuery(undefined, watchedInstitution || undefined);
    const { data: courses } = useCoursesQuery();

    // Reset department/course when institution changes
    useEffect(() => {
        if (watchedInstitution && isSuperadmin) {
            // Optional: form.setValue("department", "");
        }
    }, [watchedInstitution, form, isSuperadmin]);

    const filteredCourses = courses?.filter(
        (course: Course) => course.department === watchedDepartment
    );

    // Note: form.getValues('institution') holds the ID
    const institutionName = adminProfile?.institution || (adminAuth?.id ? "Loading..." : "");
    const selectedInstitutionName =
        institutions?.find((inst: Institution) => inst.id === watchedInstitution)?.name ||
        institutionName;
    const shouldLockInstitution = lockInstitution && Boolean(watchedInstitution);
    const roleLabel = watchedRole === "superadmin" ? "Super Admin" : "Administrator";

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

            <FormField
                control={form.control}
                name="institution"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Institution</FormLabel>
                        {isSuperadmin && !shouldLockInstitution ? (
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value ?? ""}
                                value={field.value ?? ""}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select institution" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {institutions?.map((inst: Institution) => (
                                        <SelectItem key={inst.id} value={inst.id}>
                                            {inst.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <>
                                <FormControl>
                                    <Input
                                        value={selectedInstitutionName}
                                        disabled
                                        readOnly
                                        className="bg-muted text-muted-foreground"
                                    />
                                </FormControl>
                                <input type="hidden" {...field} value={field.value ?? ""} />
                            </>
                        )}
                        <p className="text-[0.8rem] text-muted-foreground">
                            {isSuperadmin && !shouldLockInstitution
                                ? "Select the institution for this administrator."
                                : "Automatically assigned based on the current account."}
                        </p>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className={`grid gap-4 ${watchedRole === "student" || watchedRole === "instructor" ? "grid-cols-2" : "grid-cols-1"}`}>
                <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                        <FormItem className="min-w-0">
                            <FormLabel>Department</FormLabel>
                            <Select
                                onValueChange={(val) => {
                                    field.onChange(val);
                                    form.setValue("course", ""); // Clear course on department change
                                }}
                                defaultValue={field.value}
                                value={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select department" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {departments?.map((dept: Department) => (
                                        <SelectItem key={dept.id} value={dept.id}>
                                            {dept.name?.trim()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {(watchedRole === "student" || watchedRole === "instructor") && (
                    <FormField
                        control={form.control}
                        name="course"
                        render={({ field }) => (
                            <FormItem className="min-w-0">
                                <FormLabel>Course</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    value={field.value}
                                    disabled={!watchedDepartment}
                                >
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={watchedDepartment ? "Select course" : "Select department first"} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {filteredCourses?.map((course: Course) => (
                                            <SelectItem key={course.id} value={course.id}>
                                                {course.title?.trim()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
            </div>

            <div className={`grid gap-4 ${(watchedRole === "student" || watchedRole === "instructor") ? "grid-cols-2" : "grid-cols-1"}`}>
                {watchedRole === "student" && (
                    <FormField
                        control={form.control}
                        name="studentNo"
                        render={({ field }) => (
                            <FormItem className="min-w-0">
                                <FormLabel>Student ID</FormLabel>
                                <FormControl>
                                    <Input placeholder="2024-XXXXX" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                {watchedRole === "instructor" && (
                    <FormField
                        control={form.control}
                        name="employeeNo"
                        render={({ field }) => (
                            <FormItem className="min-w-0">
                                <FormLabel>Employee ID</FormLabel>
                                <FormControl>
                                    <Input placeholder="EMP-2024-XXX" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
            </div>

            <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Role</FormLabel>
                        {isAdministratorForm ? (
                            <>
                                <FormControl>
                                    <Input
                                        value={roleLabel}
                                        disabled
                                        readOnly
                                        className="bg-muted text-muted-foreground"
                                    />
                                </FormControl>
                                <input type="hidden" {...field} value={field.value ?? "admin"} />
                            </>
                        ) : (
                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {watchedRole === "admin" && (
                                        <SelectItem value="admin">Administrator</SelectItem>
                                    )}
                                    <SelectItem value="student">Student</SelectItem>
                                    <SelectItem value="instructor">Instructor</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
