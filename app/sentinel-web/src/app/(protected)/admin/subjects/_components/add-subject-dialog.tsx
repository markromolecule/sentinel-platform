"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useSubjectStore } from "@/stores/use-subject-store";
import { subjectFormSchema, SubjectFormValues } from '@sentinel/shared/schema';;
import { DEPARTMENTS, DEPARTMENTS_ABBR, YEAR_LEVELS } from "@sentinel/shared/constants";
import { useSectionStore } from "@/stores/use-section-store";
import { useCourseStore } from "@/stores/use-course-store";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AddSubjectDialog() {
    const [open, setOpen] = useState(false);
    const addMasterSubject = useSubjectStore((state) => state.addMasterSubject);
    const sections = useSectionStore((state) => state.sections);
    const courses = useCourseStore((state) => state.courses);

    const [selectedSections, setSelectedSections] = useState<string[]>([]);

    const toggleSection = (sectionName: string) => {
        setSelectedSections(prev =>
            prev.includes(sectionName)
                ? prev.filter(s => s !== sectionName)
                : [...prev, sectionName]
        );
    };

    const form = useForm<SubjectFormValues>({
        resolver: zodResolver(subjectFormSchema),
        defaultValues: {
            code: "",
            title: "",
            section: "N/A", // Default or hidden
            department: "",
            yearLevel: "1st Year",
        },
    });

    function onSubmit(values: SubjectFormValues) {
        addMasterSubject({
            code: values.code,
            title: values.title,
            department: values.department,
            yearLevel: values.yearLevel,
            sections: selectedSections
        });
        setSelectedSections([]);
        toast.success(`Subject ${values.code} added to Master Catalog`);
        setOpen(false);
        form.reset();
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[#323d8f] hover:bg-[#323d8f]/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Master Subject
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] !animate-none !duration-0 data-[state=open]:!animate-none data-[state=closed]:!animate-none">
                <DialogHeader>
                    <DialogTitle>Add Master Subject</DialogTitle>
                    <DialogDescription>
                        Add a new subject to the central catalog.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Course Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="CS101" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descriptive Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Introduction to Computer Science" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="department"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Department</FormLabel>
                                        <Select onValueChange={(val) => {
                                            field.onChange(val);
                                            setSelectedSections([]);
                                        }} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select Dept" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {DEPARTMENTS.map((dept) => (
                                                    <SelectItem key={dept} value={dept}>
                                                        {DEPARTMENTS_ABBR[dept] || dept}
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
                                name="yearLevel"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Year Level</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select Year" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {YEAR_LEVELS.map((year) => (
                                                    <SelectItem key={year} value={year}>
                                                        {year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <FormLabel className="text-base">Allocated Sections</FormLabel>
                            <ScrollArea className="h-[120px] w-full rounded-md border p-4">
                                <div className="space-y-2">
                                    {sections
                                        .filter(section => {
                                            const dept = form.watch("department");
                                            if (!dept) return true;
                                            if (dept === "General Education") return true;
                                            return section.department === dept;
                                        })
                                        .map((section) => {
                                            const course = courses.find(c => c.id === section.courseId);
                                            return (
                                                <div key={section.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={section.id}
                                                        checked={selectedSections.includes(section.name)}
                                                        onCheckedChange={() => toggleSection(section.name)}
                                                    />
                                                    <label
                                                        htmlFor={section.id}
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        {course ? `${course.code} - ` : ""}{section.name}
                                                    </label>
                                                </div>
                                            );
                                        })}
                                    {sections.length === 0 && (
                                        <p className="text-sm text-muted-foreground">No active sections found.</p>
                                    )}
                                </div>
                            </ScrollArea>
                            <p className="text-[0.8rem] text-muted-foreground">
                                Select sections from {form.watch("department") || "all departments"}.
                            </p>
                        </div>

                        <DialogFooter>
                            <Button type="submit" className="bg-[#323d8f] hover:bg-[#323d8f]/90">Add to Catalog</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
