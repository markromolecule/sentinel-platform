import { LoginFormData, LoginFormErrors } from '@sentinel/shared/types';;

export interface LoginFormProps {
    formData: LoginFormData;
    errors: LoginFormErrors;
    authError: string | null;
    isLoading: boolean;
    handleChange: (field: keyof LoginFormData, value: string) => void;
    handleBlur: (field: keyof LoginFormData) => void;
    handleSubmit: () => void;
}