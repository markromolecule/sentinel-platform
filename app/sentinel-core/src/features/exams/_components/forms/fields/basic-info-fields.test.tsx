import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BasicInfoFields } from './basic-info-fields';
import { ScheduleFields } from './schedule-fields';
import { useForm, FormProvider } from 'react-hook-form';
import { Form } from '@sentinel/ui';

vi.mock('@sentinel/hooks', () => ({
    useClassroomsQuery: vi.fn(() => ({ data: [], isLoading: false })),
    useRoomsQuery: vi.fn(() => ({ data: [], isLoading: false })),
    useExamsQuery: vi.fn(() => ({ data: [], isLoading: false })),
    useUsersQuery: vi.fn(() => ({
        data: [{ id: 'inst-1', firstName: 'Jane', lastName: 'Doe', email: 'jane@sentinel.edu' }],
        isLoading: false,
    })),
}));

vi.mock('@sentinel/ui', async (importOriginal) => {
    const actual = (await importOriginal()) as any;
    return {
        ...actual,
        Select: ({ children, value, onValueChange }: any) => (
            <div data-testid="mock-select" onClick={() => onValueChange?.('inst-1')}>
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
    const form = useForm({
        defaultValues: {
            title: '',
            description: '',
            classroomIds: [],
            roomId: undefined,
            startDateTime: '',
            endDateTime: '',
            durationMinutes: 60,
            passingScore: 75,
            shuffleQuestions: true,
            showCorrectAnswers: false,
            allowReview: true,
            randomizeChoices: true,
            instructorId: undefined,
            instructorIds: [],
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

describe('BasicInfoFields with InstructorField', () => {
    it('renders all form fields including the new InstructorField', () => {
        render(<TestFormWrapper />);

        expect(screen.getByText('Exam Title')).toBeDefined();
        expect(screen.getByText('Description')).toBeDefined();
        expect(screen.getByText('Select Classrooms')).toBeDefined();
        expect(
            screen.getByPlaceholderText('Search classrooms, subjects, or sections...'),
        ).toBeDefined();
        expect(screen.getByText('Room')).toBeDefined();

        // Assert new instructor assignment field is rendered
        expect(screen.getByText('Assign Instructors')).toBeDefined();
    });
});
