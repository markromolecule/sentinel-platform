import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BasicInfoFields } from './basic-info-fields';
import { ScheduleFields } from './schedule-fields';
import { useForm, FormProvider } from 'react-hook-form';
import { Form } from '@sentinel/ui';
import type { ExamCreateFormValues } from '@sentinel/shared/schema';

vi.mock('@sentinel/hooks', () => ({
    useSubjectsQuery: vi.fn(() => ({
        data: [{ id: 'sub-1', code: 'CS101', title: 'Introduction to Computer Science' }],
        isLoading: false,
    })),
    useExamsQuery: vi.fn(() => ({ data: [], isLoading: false })),
}));

vi.mock('@sentinel/ui', async (importOriginal) => {
    const actual = (await importOriginal()) as any;
    return {
        ...actual,
        Select: ({ children, value, onValueChange }: any) => (
            <div data-testid="mock-select" onClick={() => onValueChange?.('sub-1')}>
                {children}
            </div>
        ),
        SelectTrigger: ({ children }: any) => <div data-testid="select-trigger">{children}</div>,
        SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
        SelectContent: ({ children }: any) => <div>{children}</div>,
        SelectItem: ({ children, value }: any) => (
            <div data-testid={`select-item-${value}`}>{children}</div>
        ),
    };
});

function TestFormWrapper() {
    const form = useForm<ExamCreateFormValues>({
        defaultValues: {
            title: '',
            description: '',
            subjectId: '',
            startDateTime: '',
            endDateTime: '',
            durationMinutes: 60,
            passingScore: 75,
            shuffleQuestions: true,
            showCorrectAnswers: false,
            allowReview: true,
            randomizeChoices: true,
        },
    });

    return (
        <FormProvider {...form}>
            <Form {...form}>
                <BasicInfoFields control={form.control} />
                <ScheduleFields control={form.control} />
            </Form>
        </FormProvider>
    );
}

describe('BasicInfoFields and ScheduleFields', () => {
    it('renders all form fields including the Subject dropdown', () => {
        render(<TestFormWrapper />);

        expect(screen.getByText('Exam Title')).toBeDefined();
        expect(screen.getByText('Description')).toBeDefined();
        expect(screen.getByText('Select Subject')).toBeDefined();
        expect(screen.getByText('Starts At')).toBeDefined();
        expect(screen.getByText('Ends At')).toBeDefined();
    });
});

