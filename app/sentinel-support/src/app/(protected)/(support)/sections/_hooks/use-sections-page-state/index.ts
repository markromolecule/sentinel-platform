'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
    useCoursesQuery,
    useCreateSectionMutation,
    useDebounce,
    useDeleteSectionMutation,
    useDepartmentsQuery,
    useEffectiveInstitutionNamingConventionsQuery,
    useInstitutionsQuery,
    useSectionsQuery,
    useUpdateSectionMutation,
} from '@sentinel/hooks';
import { sectionSchema, type SectionFormValues } from '@sentinel/shared/schema';
import { Section } from '@sentinel/shared/types';
import { useMemo, useState } from 'react';
import { useForm, type SubmitHandler, type Resolver } from 'react-hook-form';
import { DEFAULT_SECTION_FORM_VALUES } from './_types';

export function useSectionsPageState() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInstitutionId, setSelectedInstitutionId] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
    const [sectionToRevert, setSectionToRevert] = useState<Section | null>(null);

    const form = useForm<SectionFormValues>({
        resolver: zodResolver(sectionSchema) as Resolver<SectionFormValues>,
        defaultValues: DEFAULT_SECTION_FORM_VALUES,
    });

    const { data: namingConvention } = useEffectiveInstitutionNamingConventionsQuery(
        selectedInstitutionId || '',
    );
    const debouncedSearch = useDebounce(searchTerm, 500);
    const { data: institutions = [] } = useInstitutionsQuery();
    const selectedInstitution = institutions.find(
        (institution) => institution.id === selectedInstitutionId,
    );
    const parentInstitutionId = selectedInstitution?.parentInstitutionId ?? '';

    const {
        data: sections = [],
        isLoading,
        isError,
        error,
    } = useSectionsQuery(debouncedSearch, selectedInstitutionId || undefined);

    const { data: parentSections = [] } = useSectionsQuery(
        '',
        parentInstitutionId || undefined,
        undefined,
        Boolean(parentInstitutionId),
    );

    const { data: departments = [] } = useDepartmentsQuery('', selectedInstitutionId || undefined);
    const { data: courses = [] } = useCoursesQuery('', selectedInstitutionId || undefined);

    const createSectionMutation = useCreateSectionMutation({
        onSuccess: () => {
            setFormOpen(false);
            form.reset();
        },
    });

    const updateSectionMutation = useUpdateSectionMutation({
        onSuccess: () => {
            setFormOpen(false);
            setEditingSectionId(null);
            form.reset();
        },
    });

    const deleteSectionMutation = useDeleteSectionMutation();

    const parentSection = useMemo(
        () =>
            sectionToRevert?.sourceRecordId
                ? parentSections.find((section) => section.id === sectionToRevert.sourceRecordId)
                : undefined,
        [parentSections, sectionToRevert],
    );

    const handleEdit = (section: Section) => {
        setEditingSectionId(section.id);
        form.reset({
            name: section.name,
            department_id: section.departmentId ?? '',
            course_id: section.courseId ?? '',
            year_level: section.yearLevel ?? undefined,
        });
        setFormOpen(true);
    };

    const handleDelete = (section: Section) => {
        if (window.confirm(`Delete ${section.name}?`)) {
            deleteSectionMutation.mutate({
                id: section.id,
                institutionId: selectedInstitutionId || undefined,
            });
        }
    };

    const handleRevert = () => {
        if (!sectionToRevert) return;
        deleteSectionMutation.mutate(
            {
                id: sectionToRevert.id,
                institutionId: selectedInstitutionId || undefined,
            },
            {
                onSuccess: () => setSectionToRevert(null),
            },
        );
    };

    const onSubmit: SubmitHandler<SectionFormValues> = (values) => {
        const payload = {
            ...values,
            institution_id: selectedInstitutionId || undefined,
        };

        if (editingSectionId) {
            const section = sections.find((s) => s.id === editingSectionId);
            if (
                section?.isInherited &&
                !window.confirm(
                    'This inherited section will become a local override for the selected branch context.',
                )
            ) {
                return;
            }

            updateSectionMutation.mutate({ id: editingSectionId, payload });
            return;
        }

        createSectionMutation.mutate(payload);
    };

    return {
        searchTerm,
        setSearchTerm,
        selectedInstitutionId,
        setSelectedInstitutionId,
        formOpen,
        setFormOpen,
        editingSectionId,
        setEditingSectionId,
        sectionToRevert,
        setSectionToRevert,
        form,
        namingConvention,
        institutions,
        sections,
        isLoading,
        isError,
        error,
        departments,
        courses,
        parentSection,
        handleEdit,
        handleDelete,
        handleRevert,
        onSubmit,
        createSectionMutation,
        updateSectionMutation,
        deleteSectionMutation,
    };
}
