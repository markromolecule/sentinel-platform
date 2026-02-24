export * from './auth/LoginSchema';
export * from './auth/RegisterSchema';
export * from './users/UserSchema';
export * from './subjects/SubjectSchema';
export * from './announcements/AnnouncementSchema';
export * from './assignments/AssignmentSchema';
export * from './exams/ExamConfigSchema';
export * as AdminExamConfigSchema from './admin/exams/configuration/exam-config-schema';
export * as ProctorExamConfigSchema from './proctor/exams/configuration/exam-config-schema';

// Proctor Exams
export { examCreateFormSchema } from './proctor/exams/exam-create-schema';
export type { ExamCreateFormValues } from './proctor/exams/exam-create-schema';

// Backported specific exports
export { announcementFormSchema } from './admin/announcements/announcement-schema';
export type { AnnouncementFormValues } from './admin/announcements/announcement-schema';
export { courseSchema } from './admin/courses/course-schema';
export type { CourseFormValues } from './admin/courses/course-schema';
export { examConfigFormSchema } from './admin/exams/configuration/exam-config-schema';
export type { ExamConfigFormValues } from './admin/exams/configuration/exam-config-schema';
export { subjectFormSchema } from './admin/subjects/subject-schema';
export type { SubjectFormValues } from './admin/subjects/subject-schema';
export { userFormSchema } from './admin/users/user-schema';
export type { UserFormValues } from './admin/users/user-schema';
export { sectionSchema } from './admin/sections/section-schema';
export type { SectionFormValues } from './admin/sections/section-schema';
export { assignmentFormSchema } from './assignments/AssignmentSchema';
export type { AssignmentFormValues } from './assignments/AssignmentSchema';
export { LoginSchema } from './auth/LoginSchema';
export type { LoginSchemaType } from './auth/LoginSchema';
export { RegisterSchema } from './auth/RegisterSchema';
export type { RegisterSchemaType } from './auth/RegisterSchema';
