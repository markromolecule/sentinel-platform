"use client";

import {
    useCoursesQuery,
    useDepartmentsQuery,
    useInstitutionsQuery,
} from "@sentinel/hooks";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@sentinel/ui";
import { UseFormReturn } from "react-hook-form";
import { useEffect } from "react";
import { StudentWhitelistFormValues } from "@/app/(protected)/(admin)/users/whitelist/_hooks/use-student-whitelist-form";
import { useStudentWhitelistScope } from "@/app/(protected)/(admin)/users/whitelist/_hooks/use-student-whitelist-scope";

interface StudentWhitelistFormFieldsProps {
    form: UseFormReturn<StudentWhitelistFormValues>;
}

export function StudentWhitelistFormFields({
    form,
}: StudentWhitelistFormFieldsProps) {
    const {
        isSuperadmin,
        lockedInstitutionId,
        lockedInstitutionName,
        lockedDepartmentId,
        lockedCourseId,
    } = useStudentWhitelistScope();
    const { data: institutions = [] } = useInstitutionsQuery();
    const selectedInstitutionId = form.watch("institution_id") || lockedInstitutionId;
    const { data: departments = [] } = useDepartmentsQuery(
        undefined,
        selectedInstitutionId || undefined,
    );
    const { data: courses = [] } = useCoursesQuery();

    const selectedDepartmentId = form.watch("department_id") || lockedDepartmentId;

    useEffect(() => {
        if (lockedInstitutionId && !form.getValues("institution_id")) {
            form.setValue("institution_id", lockedInstitutionId);
        }

        if (lockedDepartmentId && !form.getValues("department_id")) {
            form.setValue("department_id", lockedDepartmentId);
        }

        if (lockedCourseId && !form.getValues("course_id")) {
            form.setValue("course_id", lockedCourseId);
        }
    }, [lockedInstitutionId, lockedDepartmentId, lockedCourseId, form]);

    const availableDepartments = lockedDepartmentId
        ? departments.filter((department) => department.id === lockedDepartmentId)
        : departments;

    const availableCourses = courses.filter((course) => {
        const courseInstitutionId = course.institutionId || null;
        const courseDepartmentId = course.departmentId || course.department || null;

        if (
            selectedInstitutionId &&
            courseInstitutionId &&
            courseInstitutionId !== selectedInstitutionId
        ) {
            return false;
        }

        if (lockedCourseId) {
            return course.id === lockedCourseId;
        }

        if (!selectedDepartmentId) {
            return false;
        }

        return courseDepartmentId === selectedDepartmentId;
    });

    return (
        <div className="space-y-4">
            <FormField
                control={form.control}
                name="institution_id"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Institution</FormLabel>
                        {isSuperadmin ? (
                            <Select
                                onValueChange={(value) => {
                                    field.onChange(value);
                                    if (!lockedDepartmentId) {
                                        form.setValue("department_id", "");
                                    }
                                    if (!lockedCourseId) {
                                        form.setValue("course_id", "");
                                    }
                                }}
                                value={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select institution" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {institutions.map((institution) => (
                                        <SelectItem key={institution.id} value={institution.id}>
                                            {institution.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <>
                                <FormControl>
                                    <Input
                                        value={lockedInstitutionName || "Loading institution..."}
                                        disabled
                                        readOnly
                                        className="bg-muted text-muted-foreground"
                                    />
                                </FormControl>
                                <input
                                    type="hidden"
                                    name={field.name}
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            </>
                        )}
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="department_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Department</FormLabel>
                            <Select
                                onValueChange={(value) => {
                                    field.onChange(value);
                                    if (!lockedCourseId) {
                                        form.setValue("course_id", "");
                                    }
                                }}
                                value={field.value}
                                disabled={!!lockedDepartmentId || !selectedInstitutionId}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={
                                                selectedInstitutionId
                                                    ? "Select department"
                                                    : "Select institution first"
                                            }
                                        />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {availableDepartments.map((department) => (
                                        <SelectItem key={department.id} value={department.id}>
                                            {department.code || department.name}
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
                    name="course_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Course</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={!!lockedCourseId || !selectedDepartmentId}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={
                                                selectedDepartmentId
                                                    ? "Select course"
                                                    : "Select department first"
                                            }
                                        />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {availableCourses.map((course) => (
                                        <SelectItem key={course.id} value={course.id}>
                                            {course.code || course.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="student_number"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Student Number</FormLabel>
                            <FormControl>
                                <Input placeholder="2024-00001" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Dela Cruz" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Juan"
                                    {...field}
                                    value={field.value ?? ""}
                                />
                            </FormControl>
                            <p className="text-[0.8rem] text-muted-foreground">
                                Informational only. Not used during whitelist matching.
                            </p>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
}
