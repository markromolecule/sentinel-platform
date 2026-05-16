'use client';

import {
    useCreateSubjectMutation,
    useDebounce,
    useDeleteSubjectMutation,
    useInstitutionsQuery,
    useSubjectsQuery,
    useUpdateSubjectMutation,
} from '@sentinel/hooks';
import { MasterSubject } from '@sentinel/shared/types';
import { useMemo, useState } from 'react';
import { EMPTY_SUBJECT_FORM, SubjectFormState, getSubjectId } from './_types';

export function useSubjectsPageState() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInstitutionId, setSelectedInstitutionId] = useState<string | undefined>(
        undefined,
    );
    const [formOpen, setFormOpen] = useState(false);
    const [form, setForm] = useState<SubjectFormState>(EMPTY_SUBJECT_FORM);
    const [subjectToRevert, setSubjectToRevert] = useState<MasterSubject | null>(null);

    const debouncedSearch = useDebounce(searchTerm, 500);

    const { data: institutions = [] } = useInstitutionsQuery();
    const selectedInstitution = institutions.find(
        (institution) => institution.id === selectedInstitutionId,
    );
    const parentInstitutionId = selectedInstitution?.parentInstitutionId ?? '';

    const {
        data: subjects = [],
        isLoading,
        isError,
        error,
    } = useSubjectsQuery({
        search: debouncedSearch,
        institutionId: selectedInstitutionId || undefined,
    });

    const { data: parentSubjects = [] } = useSubjectsQuery({
        search: undefined,
        institutionId: parentInstitutionId || undefined,
        enabled: Boolean(parentInstitutionId),
    });

    const createSubjectMutation = useCreateSubjectMutation({
        onSuccess: () => {
            setFormOpen(false);
            setForm(EMPTY_SUBJECT_FORM);
        },
    });

    const updateSubjectMutation = useUpdateSubjectMutation({
        onSuccess: () => {
            setFormOpen(false);
            setForm(EMPTY_SUBJECT_FORM);
        },
    });

    const deleteSubjectMutation = useDeleteSubjectMutation();

    const parentSubject = useMemo(
        () =>
            subjectToRevert?.sourceRecordId
                ? parentSubjects.find(
                      (subject) => getSubjectId(subject) === subjectToRevert.sourceRecordId,
                  )
                : undefined,
        [parentSubjects, subjectToRevert],
    );

    const handleEdit = (subject: MasterSubject) => {
        const subjectId = getSubjectId(subject);
        setForm({
            id: subjectId,
            code: subject.code,
            title: subject.title,
            isInherited: subject.isInherited,
        });
        setFormOpen(true);
    };

    const handleDelete = (subject: MasterSubject) => {
        const subjectId = getSubjectId(subject);
        if (!subjectId) return;
        if (window.confirm(`Delete ${subject.title}?`)) {
            deleteSubjectMutation.mutate({
                id: subjectId,
                institutionId: selectedInstitutionId || undefined,
            });
        }
    };

    const handleRevert = () => {
        if (!subjectToRevert) return;
        const subjectId = getSubjectId(subjectToRevert);
        if (!subjectId) return;

        deleteSubjectMutation.mutate(
            {
                id: subjectId,
                institutionId: selectedInstitutionId || undefined,
            },
            {
                onSuccess: () => setSubjectToRevert(null),
            },
        );
    };

    const submitForm = () => {
        if (!form.code.trim() || !form.title.trim()) return;

        if (form.id) {
            if (
                form.isInherited &&
                !window.confirm(
                    'This inherited subject will become a local override for the selected branch context.',
                )
            ) {
                return;
            }

            updateSubjectMutation.mutate({
                id: form.id,
                payload: {
                    code: form.code.trim(),
                    title: form.title.trim(),
                    institution_id: selectedInstitutionId || undefined,
                },
            });
            return;
        }

        createSubjectMutation.mutate({
            code: form.code.trim(),
            title: form.title.trim(),
            institution_id: selectedInstitutionId || undefined,
        });
    };

    return {
        searchTerm,
        setSearchTerm,
        selectedInstitutionId,
        setSelectedInstitutionId,
        formOpen,
        setFormOpen,
        form,
        setForm,
        subjectToRevert,
        setSubjectToRevert,
        institutions,
        subjects,
        isLoading,
        isError,
        error,
        parentSubject,
        handleEdit,
        handleDelete,
        handleRevert,
        submitForm,
        createSubjectMutation,
        updateSubjectMutation,
        deleteSubjectMutation,
    };
}
