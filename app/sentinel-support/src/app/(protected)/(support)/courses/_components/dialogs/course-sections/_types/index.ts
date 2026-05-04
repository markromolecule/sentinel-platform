import * as z from 'zod';

export const bulkSectionsSchema = z.object({
    sections: z
        .array(
            z.object({
                name: z.string().min(1, 'Name is required'),
                year_level: z.number().optional(),
            }),
        )
        .min(1, 'At least one section is required'),
});

export type BulkSectionsFormValues = z.infer<typeof bulkSectionsSchema>;

export interface CourseSectionsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courseId: string;
    courseTitle: string;
    institutionId: string;
}
