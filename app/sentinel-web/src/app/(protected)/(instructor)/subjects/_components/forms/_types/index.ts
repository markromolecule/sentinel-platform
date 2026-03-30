import { UseFormReturn } from 'react-hook-form';
import type { Department, Course, MasterSubject, Section } from '@sentinel/shared/types';
import { type InstructorSubjectEnrollmentFormValues } from '@sentinel/shared/schema';

// Filterable Checkbox Group
export interface FilterableCheckboxOption {
    value: string;
    label: string;
}

export interface FilterableCheckboxGroupProps {
    title: string;
    searchPlaceholder: string;
    emptyMessage: string;
    options: FilterableCheckboxOption[];
    selectedValues: string[];
    onToggle: (value: string) => void;
    onToggleAll?: (values: string[], checked: boolean) => void;
    helperText?: string;
    visibleRows?: number;
}

// Section Selector
export interface SectionSelectorProps {
    sections: Section[];
    selectedSectionIds: string[];
    onToggle: (sectionId: string) => void;
    onSelectAll: (sectionIds: string[], checked: boolean) => void;
}

// Subject Selector
export interface SubjectSelectorProps {
    subjects: MasterSubject[];
    selectedSubjectCode: string;
    onSelect: (value: string) => void;
}

// Subject Metadata Fields
export interface SubjectMetadataFieldsProps {
    form: UseFormReturn<InstructorSubjectEnrollmentFormValues>;
    validDepartments: Department[];
    validCourses: Course[];
    validYearLevels: number[];
    selectedSubjectCode: string | null;
}
