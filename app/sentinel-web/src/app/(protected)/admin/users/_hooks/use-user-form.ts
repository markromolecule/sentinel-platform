'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { userFormSchema, UserFormValues } from '@sentinel/shared/schema';
import { User } from '@sentinel/shared/types';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface UseUserFormProps {
    user?: User | null;
    onSuccess?: () => void;
}

export function useUserForm({ user, onSuccess }: UseUserFormProps = {}) {
    const form = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            role: 'student',
            department: '',
            studentNo: '',
            institution: 'NU Dasmariñas',
        },
    });

    const watchedRole = useWatch({
        control: form.control,
        name: 'role',
    });

    useEffect(() => {
        if (user) {
            form.reset({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email,
                role: user.role,
                department: user.department || '',
                studentNo: (user as User & { studentNo?: string }).studentNo || '',
                institution: user.institution || 'NU Dasmariñas',
            });
        }
    }, [user, form]);

    const onSubmit = (values: UserFormValues) => {
        console.log(user ? 'Updating user:' : 'Creating user:', values);
        const action = user ? 'updated' : 'added';
        toast.success(`User ${values.firstName} ${values.lastName} ${action} successfully`);

        if (!user) {
            form.reset();
        }

        onSuccess?.();
    };

    return {
        form,
        onSubmit,
        watchedRole,
    };
}
