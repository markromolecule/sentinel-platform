export interface AllocatedSectionsPickerProps {
    watchedDepartment: string | undefined;
    selectedSections: string[];
    toggleSection: (sectionName: string) => void;
}
