import { FilterableCheckboxGroup } from "./filterable-checkbox-group";
import { type SectionSelectorProps } from "@/app/(protected)/(instructor)/subjects/_components/forms/_types";

export function SectionSelector({
     sections,
     selectedSectionIds,
     onToggle,
     onSelectAll,
}: SectionSelectorProps) {
     return (
          <div className="pt-4 animate-in fade-in slide-in-from-top-4 duration-300">
               <FilterableCheckboxGroup
                    title="Available Sections"
                    searchPlaceholder="Filter sections..."
                    emptyMessage={
                         sections.length === 0
                              ? "No sections are available for this offered subject and filter combination."
                              : "No sections match your search."
                    }
                    options={sections.map((section) => ({
                         value: section.id,
                         label: section.name,
                    }))}
                    selectedValues={selectedSectionIds}
                    onToggle={onToggle}
                    onToggleAll={(values, checked) => onSelectAll(values, checked)}
                    helperText="Calculated from the selected offered subject and the department, course, and year-level filters above."
                    visibleRows={4}
               />
          </div>
     );
}
