import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/data/supabase/client';
import { useOnboardingDepartmentsQuery } from '@/hooks/query/onboarding/use-onboarding-departments-query';

export function useOnboardingForm() {
    const router = useRouter();
    const supabase = createSupabaseClient();

    const { data: departments = [] } = useOnboardingDepartmentsQuery();

    const [isLoading, setIsLoading] = useState(false);
    const [studentNumber, setStudentNumber] = useState('');
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [institutionId, setInstitutionId] = useState<string | null>(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();
                if (!session) return;

                // Fetch Institution
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                const instResponse = await fetch(`${apiUrl}/onboarding/institution`, {
                    headers: { Authorization: `Bearer ${session.access_token}` },
                });

                if (instResponse.ok) {
                    const result = await instResponse.json();
                    if (result.data) {
                        setInstitutionId(result.data.institution_id);
                    }
                } else {
                    const errorText = await instResponse.text();
                    console.error('Failed to fetch institution:', instResponse.status, errorText);
                    setError(
                        `Could not load default institution configuration. (${instResponse.status})`,
                    );
                }
            } catch (err) {
                console.error('Initial fetch error', err);
                setError('Could not load form configuration.');
            }
        };
        fetchInitialData();
    }, [supabase]);

    // Handle Student Number Change
    const handleStudentNumberChange = (value: string) => {
        const raw = value.replace(/\D/g, '');
        let formatted = raw;
        if (raw.length > 4) {
            formatted = `${raw.slice(0, 4)}-${raw.slice(4, 11)}`;
        }
        setStudentNumber(formatted);
    };

    // Handle Form Submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!studentNumber.trim()) {
            setError('Student Number is required');
            return;
        }

        if (!institutionId) {
            setError('Institution configuration missing. Please refresh.');
            return;
        }

        if (!selectedDepartmentId) {
            setError('Please select a department.');
            return;
        }

        setIsLoading(true);

        try {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session) {
                throw new Error('No active session found.');
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const response = await fetch(`${apiUrl}/onboarding`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    studentNumber,
                    institutionId,
                    departmentId: selectedDepartmentId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.error || errorData.message || 'Failed to save student details.',
                );
            }

            router.push('/student');
            router.refresh();
        } catch (err: unknown) {
            console.error('Onboarding error:', err);
            const message = err instanceof Error ? err.message : 'Failed to save student details.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        studentNumber,
        departments,
        selectedDepartmentId,
        setSelectedDepartmentId,
        error,
        institutionId,
        handleStudentNumberChange,
        handleSubmit,
    };
}
