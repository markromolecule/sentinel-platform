import * as z from "zod";
export declare const announcementFormSchema: z.ZodObject<{
    title: z.ZodString;
    content: z.ZodString;
    targetAudience: z.ZodString;
    status: z.ZodEnum<{
        draft: "draft";
        published: "published";
    }>;
    publishedAt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;
//# sourceMappingURL=AnnouncementSchema.d.ts.map