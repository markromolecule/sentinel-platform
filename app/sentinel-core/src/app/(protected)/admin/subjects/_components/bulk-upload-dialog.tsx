"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { SUBJECT_QUERY_KEYS } from "@sentinel/shared/constants";
import { createSubject } from "@/data";
import { useCoursesQuery } from "@/hooks/query/courses/use-courses-query";
import { useDepartmentsQuery } from "@/hooks/query/departments/use-departments-query";
import { useSectionsQuery } from "@/hooks/query/sections/use-sections-query";
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
import { Textarea } from "@sentinel/ui";
import { toast } from "sonner";

function parseList(rawValue: string | undefined) {
    if (!rawValue) return [];
    return rawValue
        .split(";")
        .map((entry) => entry.trim())
        .filter(Boolean);
}

function parseYearLevels(rawValue: string | undefined) {
    return parseList(rawValue)
        .map((entry) => Number(entry))
        .filter((entry) => Number.isInteger(entry) && entry > 0);
}

export function BulkUploadDialog() {
    const [open, setOpen] = useState(false);
    const [csvData, setCsvData] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const queryClient = useQueryClient();

    const { data: departments = [] } = useDepartmentsQuery();
    const { data: courses = [] } = useCoursesQuery();
    const { data: sections = [] } = useSectionsQuery();

    function resolveDepartmentIds(rawValue: string | undefined) {
        return parseList(rawValue)
            .map((entry) => {
                const department = departments.find(
                    (item) =>
                        item.id === entry ||
                        item.code?.toLowerCase() === entry.toLowerCase() ||
                        item.name.toLowerCase() === entry.toLowerCase(),
                );
                return department?.id;
            })
            .filter((entry): entry is string => Boolean(entry));
    }

    function resolveCourseIds(rawValue: string | undefined) {
        return parseList(rawValue)
            .map((entry) => {
                const course = courses.find(
                    (item) =>
                        item.id === entry ||
                        item.code?.toLowerCase() === entry.toLowerCase() ||
                        item.title.toLowerCase() === entry.toLowerCase(),
                );
                return course?.id;
            })
            .filter((entry): entry is string => Boolean(entry));
    }

    function resolveSectionIds(rawValue: string | undefined) {
        return parseList(rawValue)
            .map((entry) => {
                const section = sections.find(
                    (item) =>
                        item.id === entry || item.name.toLowerCase() === entry.toLowerCase(),
                );
                return section?.id;
            })
            .filter((entry): entry is string => Boolean(entry));
    }

    async function handleUpload() {
        const lines = csvData
            .trim()
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);

        if (lines.length === 0) {
            toast.error("No valid lines found. Please check the format.");
            return;
        }

        setIsSubmitting(true);

        let addedCount = 0;
        let failedCount = 0;

        for (const line of lines) {
            const parts = line.split(",").map((value) => value.trim());
            if (parts.length < 2) {
                failedCount += 1;
                continue;
            }

            const [code, title, departmentsRaw, coursesRaw, yearLevelsRaw, sectionsRaw] = parts;

            try {
                await createSubject({
                    code,
                    title,
                    department_ids: resolveDepartmentIds(departmentsRaw),
                    course_ids: resolveCourseIds(coursesRaw),
                    year_levels: parseYearLevels(yearLevelsRaw),
                    section_ids: resolveSectionIds(sectionsRaw),
                });
                addedCount += 1;
            } catch {
                failedCount += 1;
            }
        }

        await queryClient.invalidateQueries({ queryKey: SUBJECT_QUERY_KEYS.all });
        setIsSubmitting(false);

        if (addedCount > 0) {
            toast.success(`Successfully added ${addedCount} subject(s).`);
            if (failedCount === 0) {
                setOpen(false);
                setCsvData("");
            }
        }

        if (failedCount > 0) {
            toast.error(`${failedCount} line(s) failed to import.`);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Bulk Upload
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Bulk Upload Subjects</DialogTitle>
                    <DialogDescription>
                        Paste CSV rows using:
                        <code>Code, Title, Departments, Courses, Year Levels, Sections</code>
                        <br />
                        <span className="text-xs text-muted-foreground">
                            Use semicolons (;) for multiple values. Departments/Courses/Sections can
                            be IDs or names/codes.
                        </span>
                        <br />
                        Example:
                        <code>
                            CS101, Intro to CS, SECA, BSIT-MWA, 1;2, INF-231;INF-232
                        </code>
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Textarea
                        placeholder="CS101, Introduction to Computing, SECA, BSIT-MWA, 1;2, INF-231;INF-232"
                        className="min-h-[200px] font-mono text-sm"
                        value={csvData}
                        onChange={(event) => setCsvData(event.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpload}
                        disabled={isSubmitting}
                        className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                    >
                        {isSubmitting ? "Importing..." : "Import Subjects"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
