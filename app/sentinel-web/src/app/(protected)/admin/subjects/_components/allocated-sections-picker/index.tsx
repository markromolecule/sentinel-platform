import { Checkbox } from "@/components/ui/checkbox";
import { FormLabel } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSectionStore } from "@/stores/use-section-store";
import { useCoursesQuery } from "@/hooks/query/courses/use-courses-query";
import { AllocatedSectionsPickerProps } from "./_types";

export function AllocatedSectionsPicker({
    watchedDepartment,
    selectedSections,
    toggleSection,
}: AllocatedSectionsPickerProps) {
    const sections = useSectionStore((state) => state.sections);
    const { data: courses = [] } = useCoursesQuery();

    return (
        <div className="space-y-2">
            <FormLabel className="text-base">Allocated Sections</FormLabel>
            <ScrollArea className="h-[120px] w-full rounded-md border p-4">
                <div className="space-y-2">
                    {sections
                        .filter((section) => {
                            if (!watchedDepartment) return true;
                            if (watchedDepartment === "General Education") return true;
                            return section.department === watchedDepartment;
                        })
                        .map((section) => {
                            const course = courses.find((c) => c.id === section.courseId);
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
                                        {course ? `${course.code} - ` : ""}
                                        {section.name}
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
                Select sections from {watchedDepartment || "all departments"}.
            </p>
        </div>
    );
}
